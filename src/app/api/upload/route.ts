import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get current user
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".txt")) {
      return NextResponse.json(
        { message: "Only .txt files are supported" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    let data: { items?: unknown[]; heroes?: unknown[] };

    try {
      data = JSON.parse(fileContent);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON file" },
        { status: 400 }
      );
    }

    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { message: "Invalid file format. Expected 'items' array." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    const errors: string[] = [];

    // STEP 1: Import heroes first if present
    const heroMap: Map<string, bigint> = new Map(); // ingameId -> database id mapping

    if (data.heroes && Array.isArray(data.heroes)) {
      for (const hero of data.heroes) {
        try {
          const heroObj = hero as Record<string, unknown>;
          const heroData = {
            ingameId: BigInt(String(heroObj.id || heroObj.ingameId || 0)),
            name: (heroObj.name as string) || "Unknown Hero",
            element: mapHeroElement(heroObj.element as string),
            rarity: mapHeroRarity(heroObj.rarity as string),
            class: mapHeroClass(heroObj.class as string),
            attack: typeof heroObj.attack === "number" ? heroObj.attack : null,
            defense:
              typeof heroObj.defense === "number" ? heroObj.defense : null,
            health: typeof heroObj.health === "number" ? heroObj.health : null,
            speed: typeof heroObj.speed === "number" ? heroObj.speed : null,
            criticalHitChance:
              typeof heroObj.criticalHitChance === "number"
                ? heroObj.criticalHitChance
                : null,
            criticalHitDamage:
              typeof heroObj.criticalHitDamage === "number"
                ? heroObj.criticalHitDamage
                : null,
            effectiveness:
              typeof heroObj.effectiveness === "number"
                ? heroObj.effectiveness
                : null,
            effectResistance:
              typeof heroObj.effectResistance === "number"
                ? heroObj.effectResistance
                : null,
            weaponId:
              typeof heroObj.weaponId === "number" ? heroObj.weaponId : null,
            armorId:
              typeof heroObj.armorId === "number" ? heroObj.armorId : null,
            helmetId:
              typeof heroObj.helmetId === "number" ? heroObj.helmetId : null,
            necklaceId:
              typeof heroObj.necklaceId === "number"
                ? heroObj.necklaceId
                : null,
            ringId: typeof heroObj.ringId === "number" ? heroObj.ringId : null,
            bootId: typeof heroObj.bootId === "number" ? heroObj.bootId : null,
            userId: session.user.id,
          };

          const createdHero = await db.heroes.create({ data: heroData });
          heroMap.set(createdHero.ingameId.toString(), createdHero.ingameId);
        } catch (error) {
          errors.push(
            `Failed to import hero ${
              (hero as Record<string, unknown>).id
            }: ${error}`
          );
        }
      }
    }

    // STEP 2: Process each gear item
    for (const item of data.items) {
      try {
        const itemObj = item as Record<string, unknown>;
        // Determine which hero this gear is equipped by
        let equippedBy: bigint | null = null;
        if (itemObj.equippedBy && itemObj.equippedBy !== "undefined") {
          const heroIngameId = itemObj.equippedBy.toString();
          if (heroMap.has(heroIngameId)) {
            equippedBy = heroMap.get(heroIngameId)!;
          }
        }

        // Map Fribbels fields to our schema
        const gearData = {
          ingameId: BigInt(String(itemObj.id || itemObj.ingameId || 0)),
          code: (itemObj.code as string) || "",
          type: mapGearType(itemObj.type as string),
          gear: mapGearDisplayName(itemObj.gear as string),
          rank: mapGearRank(itemObj.rank as string),
          level: typeof itemObj.level === "number" ? itemObj.level : 1,
          enhance: typeof itemObj.enhance === "number" ? itemObj.enhance : 0,
          mainStatType: mapMainStatType(itemObj.mainStatType as string),
          mainStatValue: parseFloat(String(itemObj.mainStatValue)) || 0,
          mainStatBaseValue: parseFloat(String(itemObj.mainStatBaseValue)) || 0,
          statMultiplier: parseFloat(String(itemObj.statMultiplier)) || 1,
          tierMultiplier: parseFloat(String(itemObj.tierMultiplier)) || 1,
          storage: itemObj.storage !== false,
          equipped: equippedBy !== null, // Set equipped based on whether we have a hero
          equippedBy: equippedBy,
          ingameEquippedId:
            typeof itemObj.ingameEquippedId === "string"
              ? itemObj.ingameEquippedId
              : null,
          fScore: null, // Will be calculated later
          score: null, // Will be calculated later
          userId: session.user.id,
        };

        // Create gear
        const gear = await db.gears.create({ data: gearData });

        // Process substats
        if (itemObj.substats && Array.isArray(itemObj.substats)) {
          for (const substat of itemObj.substats) {
            const substatObj = substat as Record<string, unknown>;
            const statTypeId = await getStatTypeId(substatObj.type as string);
            if (statTypeId) {
              const substatData = {
                gearId: gear.id,
                statTypeId: statTypeId,
                statValue: parseFloat(String(substatObj.value)) || 0,
                rolls:
                  typeof substatObj.rolls === "number" ? substatObj.rolls : 1,
                weight: 1.0, // Default weight
                isModified: false,
                userId: session.user.id,
              };

              await db.gearSubStats.create({ data: substatData });
            }
          }
        }

        importedCount++;
      } catch (error) {
        errors.push(
          `Failed to import item ${
            (item as Record<string, unknown>).id
          }: ${error}`
        );
      }
    }

    return NextResponse.json({
      message: "Upload successful",
      count: importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions for mapping Fribbels data to our schema
function mapGearType(
  type: string
): "weapon" | "armor" | "helm" | "neck" | "ring" | "boot" {
  const typeMap: Record<
    string,
    "weapon" | "armor" | "helm" | "neck" | "ring" | "boot"
  > = {
    weapon: "weapon",
    armor: "armor",
    helm: "helm",
    neck: "neck",
    ring: "ring",
    boot: "boot",
  };
  return typeMap[type.toLowerCase()] || "weapon";
}

function mapGearDisplayName(
  gear: string
): "Weapon" | "Armor" | "Helmet" | "Necklace" | "Ring" | "Boots" {
  const gearMap: Record<
    string,
    "Weapon" | "Armor" | "Helmet" | "Necklace" | "Ring" | "Boots"
  > = {
    Weapon: "Weapon",
    Armor: "Armor",
    Helmet: "Helmet",
    Necklace: "Necklace",
    Ring: "Ring",
    Boots: "Boots",
  };
  return gearMap[gear] || "Weapon";
}

function mapGearRank(
  rank: string
): "Common" | "Uncommon" | "Rare" | "Epic" | "Heroic" {
  const rankMap: Record<
    string,
    "Common" | "Uncommon" | "Rare" | "Epic" | "Heroic"
  > = {
    Common: "Common",
    Uncommon: "Uncommon",
    Rare: "Rare",
    Epic: "Epic",
    Heroic: "Heroic",
  };
  return rankMap[rank] || "Common";
}

function mapMainStatType(
  statType: string
):
  | "att"
  | "def"
  | "max_hp"
  | "att_rate"
  | "def_rate"
  | "max_hp_rate"
  | "cri"
  | "cri_dmg"
  | "speed"
  | "acc"
  | "res" {
  const statMap: Record<
    string,
    | "att"
    | "def"
    | "max_hp"
    | "att_rate"
    | "def_rate"
    | "max_hp_rate"
    | "cri"
    | "cri_dmg"
    | "speed"
    | "acc"
    | "res"
  > = {
    att: "att",
    def: "def",
    max_hp: "max_hp",
    att_rate: "att_rate",
    def_rate: "def_rate",
    max_hp_rate: "max_hp_rate",
    cri: "cri",
    cri_dmg: "cri_dmg",
    speed: "speed",
    acc: "acc",
    res: "res",
  };
  return statMap[statType] || "att";
}

function mapHeroElement(
  element: string
): "Fire" | "Ice" | "Earth" | "Light" | "Dark" | null {
  const elementMap: Record<
    string,
    "Fire" | "Ice" | "Earth" | "Light" | "Dark"
  > = {
    Fire: "Fire",
    Ice: "Ice",
    Earth: "Earth",
    Light: "Light",
    Dark: "Dark",
  };
  return elementMap[element] || null;
}

function mapHeroRarity(
  rarity: string
): "THREE_STAR" | "FOUR_STAR" | "FIVE_STAR" | null {
  const rarityMap: Record<string, "THREE_STAR" | "FOUR_STAR" | "FIVE_STAR"> = {
    "3": "THREE_STAR",
    "4": "FOUR_STAR",
    "5": "FIVE_STAR",
    THREE_STAR: "THREE_STAR",
    FOUR_STAR: "FOUR_STAR",
    FIVE_STAR: "FIVE_STAR",
  };
  return rarityMap[rarity] || null;
}

function mapHeroClass(
  heroClass: string
): "Warrior" | "Knight" | "Ranger" | "Mage" | "SoulWeaver" | "Thief" | null {
  const classMap: Record<
    string,
    "Warrior" | "Knight" | "Ranger" | "Mage" | "SoulWeaver" | "Thief"
  > = {
    Warrior: "Warrior",
    Knight: "Knight",
    Ranger: "Ranger",
    Mage: "Mage",
    SoulWeaver: "SoulWeaver",
    Thief: "Thief",
  };
  return classMap[heroClass] || null;
}

async function getStatTypeId(statName: string): Promise<number | null> {
  try {
    // Map Fribbels stat names to our database stat names
    const statNameMap: Record<string, string> = {
      CriticalHitChancePercent: "Crit %",
      CriticalHitDamagePercent: "Crit Dmg %",
      AttackPercent: "Attack %",
      DefensePercent: "Defense %",
      HealthPercent: "Health %",
      EffectivenessPercent: "Effectiveness %",
      EffectResistancePercent: "Effect Resist %",
      Speed: "Speed",
      Attack: "Attack",
      Defense: "Defense",
      Health: "Health",
    };

    const mappedName = statNameMap[statName] || statName;

    // Find the stat type in the database
    const statType = await db.statTypes.findFirst({
      where: { statName: mappedName },
      select: { id: true },
    });

    return statType?.id || null;
  } catch (error) {
    console.error(`Error finding stat type for ${statName}:`, error);
    return null;
  }
}
