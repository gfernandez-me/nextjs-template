import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  validateHeroData,
  validateGearData,
  validateSubstatData,
  mapStatName,
} from "@/lib/epic7-validation";
import { calculateFScore, calculateScore } from "@/lib/calculate-scores";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get current user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });
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
    // Strongly typed Fribbels export (subset)
    interface FribbelsSubstat {
      type: string;
      value: number | string;
      rolls?: number;
    }
    interface FribbelsItem {
      id: number | string;
      ingameId?: number | string;
      type: string; // "ring", "weapon", etc.
      gear: string; // "Ring", "Weapon", etc.
      rank: string; // "Epic", etc.
      level?: number;
      enhance?: number;
      mainStatType: string; // e.g. "att_rate"
      mainStatValue: number | string;
      mainStatBaseValue?: number | string;
      statMultiplier?: number | string;
      tierMultiplier?: number | string;
      storage?: boolean;
      code?: string;
      substats?: FribbelsSubstat[];
      equippedBy?: number | string | null;
      ingameEquippedId?: number | string | null;
    }
    interface FribbelsHero {
      id?: number | string;
      ingameId?: number | string;
      name?: string;
      element?: string;
      rarity?: string | number;
      class?: string;
      attack?: number;
      defense?: number;
      health?: number;
      speed?: number;
      criticalHitChance?: number;
      criticalHitDamage?: number;
      effectiveness?: number;
      effectResistance?: number;
      weaponId?: number;
      armorId?: number;
      helmetId?: number;
      necklaceId?: number;
      ringId?: number;
      bootId?: number;
    }
    interface FribbelsExport {
      items: FribbelsItem[];
      heroes?: FribbelsHero[];
    }

    let data: FribbelsExport;

    try {
      data = JSON.parse(fileContent);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON file" },
        { status: 400 }
      );
    }

    if (!data || !data.items || !Array.isArray(data.items)) {
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
          // Validate and cast hero data
          const validatedHeroData = validateHeroData(heroObj);
          const heroData = {
            ...validatedHeroData,
            userId: session.user.id,
          };

          const createdHero = await prisma.heroes.create({ data: heroData });
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
        const itemObj = item as unknown as Record<string, unknown>;
        // Determine which hero this gear is equipped by (support multiple fields)
        let equippedBy: bigint | null = null;
        const rawEquipped =
          (itemObj.equippedBy as unknown) ??
          (itemObj.ingameEquippedId as unknown);
        if (
          rawEquipped !== undefined &&
          rawEquipped !== null &&
          String(rawEquipped) !== "undefined" &&
          String(rawEquipped) !== "null" &&
          String(rawEquipped) !== "0"
        ) {
          const heroIngameId = String(rawEquipped);
          if (heroMap.has(heroIngameId)) {
            equippedBy = heroMap.get(heroIngameId)!;
          }
        }

        // Validate and cast gear data
        const validatedGearData = validateGearData(itemObj);
        const gearData = {
          ...validatedGearData,
          equipped: equippedBy !== null, // Set equipped based on whether we have a hero
          equippedBy: equippedBy,
          userId: session.user.id,
        };

        // Create gear
        const gear = await prisma.gears.create({ data: gearData });

        // Process substats
        if (
          (item as FribbelsItem).substats &&
          Array.isArray((item as FribbelsItem).substats)
        ) {
          for (const substat of (item as FribbelsItem).substats!) {
            const substatObj = substat as unknown as Record<string, unknown>;
            const statTypeId = await getStatTypeId(substatObj.type as string);
            if (statTypeId) {
              // Validate and cast substat data
              const validatedSubstatData = validateSubstatData(substatObj);
              const substatData = {
                ...validatedSubstatData,
                gearId: gear.id,
                statTypeId: statTypeId,
                userId: session.user.id,
              };

              await prisma.gearSubStats.create({ data: substatData });
            }
          }
        }

        // Calculate and save scores after gear and substats are created
        try {
          const gearWithSubstats = await prisma.gears.findUnique({
            where: { id: gear.id },
            include: {
              GearSubStats: {
                include: {
                  StatType: true,
                },
              },
            },
          });

          if (gearWithSubstats) {
            const fScore = calculateFScore(gearWithSubstats);
            const score = calculateScore(gearWithSubstats);

            await prisma.gears.update({
              where: { id: gear.id },
              data: {
                fScore,
                score,
              },
            });
          }
        } catch (scoreError) {
          console.error(
            `Error calculating scores for gear ${gear.id}:`,
            scoreError
          );
          // Don't fail the import if score calculation fails
        }

        importedCount++;
      } catch (error) {
        const badId =
          (item as unknown as { id?: unknown; ingameId?: unknown })?.id ??
          (item as unknown as { id?: unknown; ingameId?: unknown })?.ingameId;
        errors.push(
          `Failed to import item ${String(badId ?? "unknown")}: ${error}`
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

// Helper functions moved to @/lib/epic7-mapping.ts

// Mapping functions moved to @/lib/epic7-mapping.ts

async function getStatTypeId(statName: string): Promise<number | null> {
  try {
    // Use the validation utility for stat name mapping
    const mappedName = mapStatName(statName);

    // Find the stat type in the database
    const statType = await prisma.statTypes.findFirst({
      where: { statName: mappedName },
      select: { id: true },
    });

    return statType?.id || null;
  } catch (error) {
    console.error(`Error finding stat type for ${statName}:`, error);
    return null;
  }
}
