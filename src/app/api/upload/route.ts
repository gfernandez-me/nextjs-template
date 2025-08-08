import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  GearType,
  GearDisplayName,
  GearRank,
  MainStatType,
  Prisma,
} from "#prisma";

// Fribbels gear data interface based on our schema analysis
interface FribbelsGearItem {
  id: number;
  ingameId: number;
  code: string;
  name?: string;
  type: string;
  gear: string;
  rank: string;
  level: number;
  enhance: number;
  mainStatType: string;
  mainStatValue: number;
  mainStatBaseValue: number;
  statMultiplier: number;
  tierMultiplier: number;
  storage: boolean;
  ingameEquippedId?: string;
  substats?: Array<{
    type: string;
    value: number;
    rolls: number;
  }>;
  op?: Array<[string, number]>;
}

interface FribbelsData {
  items: FribbelsGearItem[];
  heroes?: unknown[];
}

// Mapping functions
function mapGearType(fribbelsType: string): GearType {
  const mapping: Record<string, GearType> = {
    weapon: GearType.weapon,
    armor: GearType.armor,
    helm: GearType.helm,
    helmet: GearType.helm,
    neck: GearType.neck,
    necklace: GearType.neck,
    ring: GearType.ring,
    boot: GearType.boot,
    boots: GearType.boot,
  };
  return mapping[fribbelsType.toLowerCase()] || GearType.weapon;
}

function mapGearDisplayName(fribbelsGear: string): GearDisplayName {
  const mapping: Record<string, GearDisplayName> = {
    Weapon: GearDisplayName.Weapon,
    Armor: GearDisplayName.Armor,
    Helmet: GearDisplayName.Helmet,
    Necklace: GearDisplayName.Necklace,
    Ring: GearDisplayName.Ring,
    Boots: GearDisplayName.Boots,
  };
  return mapping[fribbelsGear] || GearDisplayName.Weapon;
}

function mapGearRank(fribbelsRank: string): GearRank {
  const mapping: Record<string, GearRank> = {
    Common: GearRank.Common,
    Uncommon: GearRank.Uncommon,
    Rare: GearRank.Rare,
    Epic: GearRank.Epic,
    Heroic: GearRank.Heroic,
  };
  return mapping[fribbelsRank] || GearRank.Common;
}

function mapMainStatType(fribbelsStatType: string): MainStatType {
  const mapping: Record<string, MainStatType> = {
    att: MainStatType.att,
    def: MainStatType.def,
    max_hp: MainStatType.max_hp,
    att_rate: MainStatType.att_rate,
    def_rate: MainStatType.def_rate,
    max_hp_rate: MainStatType.max_hp_rate,
    cri: MainStatType.cri,
    cri_dmg: MainStatType.cri_dmg,
    speed: MainStatType.speed,
    acc: MainStatType.acc,
    res: MainStatType.res,
  };
  return mapping[fribbelsStatType] || MainStatType.att;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // allow longer processing for large files
// Note: body size limit for Server Actions is configured in next.config.ts (serverActions.bodySizeLimit)

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured (missing DATABASE_URL)" },
        { status: 500 }
      );
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".txt")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a .txt file" },
        { status: 400 }
      );
    }

    const content = await file.text();

    // Parse the JSON content
    let gearData: FribbelsData;
    try {
      gearData = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    if (!gearData.items || !Array.isArray(gearData.items)) {
      return NextResponse.json(
        { error: "Invalid gear data format. Expected items array" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Full replace strategy: wipe existing data before import
    // Delete order matters due to FK: Gears (FK to Heroes) first, then Heroes
    await db.gears.deleteMany();
    await db.heroes.deleteMany();

    // Create heroes first (so equippedBy FKs are valid). Build a set of valid hero ids
    const heroIdSet = new Set<bigint>();
    if (
      gearData.heroes &&
      Array.isArray(gearData.heroes) &&
      gearData.heroes.length > 0
    ) {
      const nameCount = new Map<string, number>();
      const heroesMapped = gearData.heroes
        .map((h: unknown) => {
          const hero = h as {
            ingameId?: number | string;
            id?: number | string;
            name?: string;
          };
          const rawId = hero?.ingameId ?? hero?.id;
          if (rawId === undefined || rawId === null) return null;
          const idBig = BigInt(rawId);
          heroIdSet.add(idBig);
          const baseName = hero?.name || "Unknown";
          const current = nameCount.get(baseName) ?? 0;
          nameCount.set(baseName, current + 1);
          const finalName =
            current === 0 ? baseName : `${baseName} ${current + 1}`;
          return {
            ingameId: idBig,
            name: finalName,
          } as { ingameId: bigint; name: string };
        })
        .filter(Boolean) as Array<{ ingameId: bigint; name: string }>;

      const HERO_CHUNK = 1000;
      for (let i = 0; i < heroesMapped.length; i += HERO_CHUNK) {
        const chunk = heroesMapped.slice(i, i + HERO_CHUNK);
        if (chunk.length > 0) {
          await db.heroes.createMany({ data: chunk });
        }
      }
    }

    // Ensure required StatTypes exist and build a cache map
    const statTypeDefs: Array<{
      name: string;
      category: "flat" | "percentage";
    }> = [
      { name: "Speed", category: "flat" },
      { name: "Attack", category: "flat" },
      { name: "Attack %", category: "percentage" },
      { name: "Defense", category: "flat" },
      { name: "Defense %", category: "percentage" },
      { name: "Health", category: "flat" },
      { name: "Health %", category: "percentage" },
      { name: "Crit %", category: "percentage" },
      { name: "Crit Dmg %", category: "percentage" },
      { name: "Effectiveness %", category: "percentage" },
      { name: "Effect Resist %", category: "percentage" },
    ];

    for (const def of statTypeDefs) {
      await db.statTypes.upsert({
        where: { statName: def.name },
        create: {
          statName: def.name,
          statCategory: def.category,
          weight: 1,
          isMainStat: false,
          isSubstat: true,
        },
        update: { statCategory: def.category },
      });
    }

    const statTypeRows = await db.statTypes.findMany({
      where: { statName: { in: statTypeDefs.map((d) => d.name) } },
      select: { id: true, statName: true },
    });
    const statTypeNameToId = new Map<string, number>(
      statTypeRows.map((r) => [r.statName, r.id])
    );

    // Validate and map all items to Prisma createMany payload (scalars only)
    const filteredItems = gearData.items
      // Only import Epic and Heroic
      .filter((item) => item.rank === "Epic" || item.rank === "Heroic")
      .filter((item: FribbelsGearItem) => {
        const valid =
          !!item.ingameId &&
          !!item.type &&
          !!item.gear &&
          !!item.rank &&
          item.level !== undefined &&
          item.enhance !== undefined &&
          !!item.mainStatType &&
          item.mainStatValue !== undefined;
        if (!valid) {
          errorCount++;
          errors.push(
            `Item ${item.ingameId || "unknown"}: Missing required fields`
          );
        }
        return valid;
      });

    const mapped = filteredItems.map((item: FribbelsGearItem) => ({
      ingameId: BigInt(item.ingameId),
      code: item.code || "",
      type: mapGearType(item.type),
      gear: mapGearDisplayName(item.gear),
      rank: mapGearRank(item.rank),
      level: item.level,
      enhance: item.enhance,
      mainStatType: mapMainStatType(item.mainStatType),
      mainStatValue: item.mainStatValue,
      mainStatBaseValue: item.mainStatBaseValue || item.mainStatValue,
      statMultiplier: item.statMultiplier || 1,
      tierMultiplier: item.tierMultiplier || 1,
      storage: item.storage !== false,
      equipped: !item.storage,
      equippedBy:
        item.ingameEquippedId && item.ingameEquippedId !== "undefined"
          ? (() => {
              const hid = BigInt(parseInt(item.ingameEquippedId));
              return heroIdSet.has(hid) ? hid : null;
            })()
          : null,
      ingameEquippedId: item.ingameEquippedId,
    }));

    // Bulk insert in chunks to avoid oversized queries; skip duplicates by ingameId
    const CHUNK_SIZE = 500;
    for (let i = 0; i < mapped.length; i += CHUNK_SIZE) {
      const chunk = mapped.slice(i, i + CHUNK_SIZE);
      const result = await db.gears.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      importedCount += result.count;

      // Insert substats for this chunk
      const sourceChunk = filteredItems.slice(i, i + CHUNK_SIZE);
      const ingameIds = sourceChunk.map((it) => BigInt(it.ingameId));
      const gearsInDb = await db.gears.findMany({
        where: { ingameId: { in: ingameIds } },
        select: { id: true, ingameId: true },
      });
      const ingameToId = new Map<string, number>(
        gearsInDb.map((g) => [g.ingameId.toString(), g.id])
      );

      const substatInserts: Array<Prisma.SubStatsCreateManyInput> = [];

      function mapSubstatType(
        t: string
      ): { statName: string; category: "flat" | "percentage" } | null {
        switch (t) {
          case "CriticalHitChancePercent":
            return { statName: "Crit %", category: "percentage" };
          case "CriticalHitDamagePercent":
            return { statName: "Crit Dmg %", category: "percentage" };
          case "AttackPercent":
            return { statName: "Attack %", category: "percentage" };
          case "DefensePercent":
            return { statName: "Defense %", category: "percentage" };
          case "HealthPercent":
            return { statName: "Health %", category: "percentage" };
          case "EffectivenessPercent":
            return { statName: "Effectiveness %", category: "percentage" };
          case "EffectResistancePercent":
            return { statName: "Effect Resist %", category: "percentage" };
          case "Speed":
            return { statName: "Speed", category: "flat" };
          case "Attack":
            return { statName: "Attack", category: "flat" };
          case "Defense":
            return { statName: "Defense", category: "flat" };
          case "Health":
            return { statName: "Health", category: "flat" };
          default:
            return null;
        }
      }

      for (const src of sourceChunk) {
        const gearId = ingameToId.get(BigInt(src.ingameId).toString());
        if (!gearId) continue;
        if (!src.substats || !Array.isArray(src.substats)) continue;
        for (const s of src.substats) {
          const mappedType = mapSubstatType(s.type);
          if (!mappedType) continue;
          const statTypeId = statTypeNameToId.get(mappedType.statName);
          if (!statTypeId) continue;
          substatInserts.push({
            gearId,
            statTypeId,
            statValue: s.value,
            rolls: s.rolls ?? 0,
            weight: 1,
            isModified: false,
          });
        }
      }

      if (substatInserts.length > 0) {
        const SUB_CHUNK = 1000;
        for (let j = 0; j < substatInserts.length; j += SUB_CHUNK) {
          const sChunk = substatInserts.slice(j, j + SUB_CHUNK);
          await db.subStats.createMany({ data: sChunk });
        }
      }
    }

    const response = {
      success: true,
      count: importedCount,
      errors: errorCount,
      message: `Successfully imported ${importedCount} gear items${
        errorCount > 0 ? ` with ${errorCount} errors` : ""
      }`,
    };

    if (errors.length > 0 && errors.length <= 10) {
      response.message += `. First few errors: ${errors
        .slice(0, 5)
        .join(", ")}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
