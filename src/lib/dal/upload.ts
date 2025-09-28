import prisma from "@/lib/prisma";
import {
  type FribbelsExport,
  type FribbelsItem,
} from "@/lib/validation/uploadSchemas";
import {
  validateHeroData,
  validateGearData,
  validateSubstatData,
  validateMainStatType,
  extractHeroMetadata,
} from "@/lib/epic7-validation";
import { calculateFScore, calculateScore } from "@/lib/calculate-scores";
import { getScoreQuality, getSubstatGrade } from "@/lib/score-colors";
import { ScoreGrade } from "#prisma";
import { writeFileSync } from "fs";
import { join } from "path";

// ============================================================================
// DATA ACCESS CLASS
// ============================================================================

export class UploadDataAccess {
  private gearLog: string[] = [];
  private heroLog: string[] = [];
  private gearCount = 0;
  private heroCount = 0;

  constructor(private userId: string) {}

  private logGear(
    gearId: number,
    fScore: number | null,
    score: number | null,
    fScoreGrade: ScoreGrade | null,
    scoreGrade: ScoreGrade | null
  ) {
    this.gearCount++;
    if (this.gearCount <= 5) {
      this.gearLog.push(
        `Gear ${gearId}: fScore=${fScore?.toFixed(
          1
        )} (${fScoreGrade}), score=${score?.toFixed(1)} (${scoreGrade})`
      );
    }
  }

  private logSubstat(
    substatId: number,
    statName: string,
    statValue: number,
    grade: ScoreGrade
  ) {
    if (this.gearCount <= 5) {
      this.gearLog.push(
        `  Substat ${substatId}: ${statName}=${statValue} (${grade})`
      );
    }
  }

  private logHero(
    heroId: number,
    name: string,
    element: string,
    rarity: string,
    heroClass: string
  ) {
    this.heroCount++;
    if (this.heroCount <= 5) {
      this.heroLog.push(
        `Hero ${heroId}: ${name} (${element} ${rarity} ${heroClass})`
      );
    }
  }

  private writeLogFiles() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Write gear log
    const gearLogContent = [
      `=== GEAR UPLOAD LOG - ${new Date().toISOString()} ===`,
      `Total gears processed: ${this.gearCount}`,
      `Showing first 5 gears with their scores and grades:`,
      ``,
      ...this.gearLog,
      ``,
      `=== SUMMARY ===`,
      `✅ Successfully processed ${this.gearCount} gear items`,
      `📊 Grade distribution:`,
      `   - EXCELLENT: ${
        this.gearLog.filter((line) => line.includes("EXCELLENT")).length
      } gears`,
      `   - GOOD: ${
        this.gearLog.filter((line) => line.includes("GOOD")).length
      } gears`,
      `   - AVERAGE: ${
        this.gearLog.filter((line) => line.includes("AVERAGE")).length
      } gears`,
      `   - POOR: ${
        this.gearLog.filter((line) => line.includes("POOR")).length
      } gears`,
      `   - TERRIBLE: ${
        this.gearLog.filter((line) => line.includes("TERRIBLE")).length
      } gears`,
      ``,
      `🔧 New gear sets detected:`,
      `   - ReversalSet: ${
        this.gearLog.filter((line) => line.includes("ReversalSet")).length
      } gears`,
      `   - RiposteSet: ${
        this.gearLog.filter((line) => line.includes("RiposteSet")).length
      } gears`,
      `   - RevengeSet: ${
        this.gearLog.filter((line) => line.includes("RevengeSet")).length
      } gears`,
    ].join("\n");

    writeFileSync(join(process.cwd(), "upload-gear-log.txt"), gearLogContent);

    // Write hero log
    const heroLogContent = [
      `=== HERO UPLOAD LOG - ${new Date().toISOString()} ===`,
      `Total heroes processed: ${this.heroCount}`,
      `Showing first 5 heroes with their metadata:`,
      ``,
      ...this.heroLog,
      ``,
      `=== SUMMARY ===`,
      `✅ Successfully processed ${this.heroCount} heroes`,
      `📊 Hero distribution by element:`,
      `   - FIRE: ${
        this.heroLog.filter((line) => line.includes("FIRE")).length
      } heroes`,
      `   - ICE: ${
        this.heroLog.filter((line) => line.includes("ICE")).length
      } heroes`,
      `   - EARTH: ${
        this.heroLog.filter((line) => line.includes("EARTH")).length
      } heroes`,
      `   - LIGHT: ${
        this.heroLog.filter((line) => line.includes("LIGHT")).length
      } heroes`,
      `   - DARK: ${
        this.heroLog.filter((line) => line.includes("DARK")).length
      } heroes`,
      ``,
      `📊 Hero distribution by class:`,
      `   - WARRIOR: ${
        this.heroLog.filter((line) => line.includes("WARRIOR")).length
      } heroes`,
      `   - KNIGHT: ${
        this.heroLog.filter((line) => line.includes("KNIGHT")).length
      } heroes`,
      `   - RANGER: ${
        this.heroLog.filter((line) => line.includes("RANGER")).length
      } heroes`,
      `   - MAGE: ${
        this.heroLog.filter((line) => line.includes("MAGE")).length
      } heroes`,
      `   - SOUL_WEAVER: ${
        this.heroLog.filter((line) => line.includes("SOUL_WEAVER")).length
      } heroes`,
      `   - THIEF: ${
        this.heroLog.filter((line) => line.includes("THIEF")).length
      } heroes`,
    ].join("\n");

    writeFileSync(join(process.cwd(), "upload-hero-log.txt"), heroLogContent);

    console.log(
      `[UPLOAD DEBUG] Logged ${this.gearCount} gears and ${this.heroCount} heroes to files`
    );
  }

  /**
   * Process Fribbels export data and import to database
   */
  async processFribbelsExport(data: FribbelsExport): Promise<{
    success: boolean;
    count: number; // gears imported
    gearCount: number; // total gears processed
    heroCount: number; // total heroes processed
    durationMs: number;
    errors?: string[];
    message: string;
  }> {
    const startedAt = Date.now();
    let importedCount = 0;
    const errors: string[] = [];

    console.log(
      `[UPLOAD DEBUG] Starting upload process - Items: ${
        data.items?.length || 0
      }, Heroes: ${data.heroes?.length || 0}`
    );

    try {
      // STEP 1: Import heroes first if present
      const heroMap: Map<bigint, number> = new Map(); // ingameId -> database id mapping

      if (data.heroes && Array.isArray(data.heroes)) {
        console.log(`[UPLOAD DEBUG] Processing ${data.heroes.length} heroes`);
        // Seed per-name counters from existing DB state to ensure stable numbering
        const existingNameCounts = await prisma.heroes.groupBy({
          by: ["name"],
          where: { userId: this.userId },
          _count: { name: true },
        });
        const nameToCount: Map<string, number> = new Map(
          existingNameCounts.map((g) => [g.name as string, g._count.name])
        );
        for (const hero of data.heroes) {
          try {
            const heroObj = hero as Record<string, unknown>;

            // Extract hero metadata from Fribbels API
            const heroMetadata = await extractHeroMetadata(heroObj);

            const validatedHeroData = validateHeroData(heroObj);

            // Determine duplicate count using per-name map (consistent within batch)
            const currentCount = nameToCount.get(validatedHeroData.name) || 0;
            const count = currentCount + 1;
            nameToCount.set(validatedHeroData.name, count);

            const heroData = {
              ...validatedHeroData,
              duplicateCount: count,
              element: heroMetadata.element || validatedHeroData.element,
              rarity: heroMetadata.rarity || validatedHeroData.rarity,
              class: heroMetadata.class || validatedHeroData.class,
              userId: this.userId,
            };

            const createdHero = await prisma.heroes.upsert({
              where: {
                ingameId_userId: {
                  ingameId: validatedHeroData.ingameId,
                  userId: this.userId,
                },
              },
              update: heroData,
              create: heroData,
            });
            heroMap.set(validatedHeroData.ingameId, createdHero.id);

            this.logHero(
              createdHero.id,
              heroData.name,
              heroData.element || "Unknown",
              heroData.rarity || "Unknown",
              heroData.class || "Unknown"
            );
          } catch (error) {
            console.log(`[UPLOAD DEBUG] Hero import error: ${error}`);
            errors.push(
              `Failed to import hero ${
                (hero as Record<string, unknown>).id
              }: ${error}`
            );
          }
        }
      }

      // STEP 2: Process each gear item
      // get all stat types once to minimize DB calls
      const statTypes = await prisma.statTypes.findMany();
      const statTypeMap: Map<string, { id: number; statName: string }> =
        new Map();
      for (const statType of statTypes) {
        statTypeMap.set(statType.originalStatName, {
          id: statType.id,
          statName: statType.statName,
        });
      }

      console.log(`[UPLOAD DEBUG] Processing ${data.items.length} gear items`);
      for (const item of data.items) {
        try {
          const itemObj = item as Record<string, unknown>;
          const mainStat = itemObj.main as { type: string };

          // Validate and cast gear data
          const validatedGearData = validateGearData(itemObj);
          const gearData = {
            ...validatedGearData,
            mainStatType: validateMainStatType(mainStat.type),
            equipped: validatedGearData.ingameEquippedId !== null,
            heroId: validatedGearData.ingameEquippedId
              ? heroMap.get(validatedGearData.ingameEquippedId)
              : null,
            userId: this.userId,
          };

          // Create or update gear
          const gear = await prisma.gears.upsert({
            where: {
              ingameId_userId: {
                ingameId: gearData.ingameId,
                userId: gearData.userId,
              },
            },
            update: gearData,
            create: gearData,
          });

          // Process substats in bulk: delete existing, then createMany with grades precomputed
          const fribbelsItem = item as FribbelsItem;
          if (fribbelsItem.substats && Array.isArray(fribbelsItem.substats)) {
            // Ensure idempotency when re-uploading same gear
            await prisma.gearSubStats.deleteMany({
              where: { gearId: gear.id },
            });

            const substatsData = fribbelsItem.substats
              .map((substat) => substat as unknown as Record<string, unknown>)
              .map((substatObj) => {
                const mapping = statTypeMap.get(substatObj.type as string);
                if (!mapping) return null;
                const validatedSubstatData = validateSubstatData(substatObj);
                const statValueNum = Number(validatedSubstatData.statValue);
                const substatGrade = getSubstatGrade(
                  statValueNum,
                  mapping.statName
                );
                return {
                  ...validatedSubstatData,
                  gearId: gear.id,
                  statTypeId: mapping.id,
                  userId: this.userId,
                  grade: substatGrade,
                };
              })
              .filter((v): v is NonNullable<typeof v> => v !== null);

            if (substatsData.length > 0) {
              await prisma.gearSubStats.createMany({ data: substatsData });
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
              // Get user settings for score calculation
              const userSettings = await prisma.settings.findUnique({
                where: { userId: this.userId },
              });

              // Prepare settings for score calculation
              const scoreSettings = userSettings
                ? {
                    fScoreIncludeMainStat: userSettings.fScoreIncludeMainStat,
                    fScoreSubstatWeights:
                      userSettings.fScoreSubstatWeights as Record<
                        string,
                        number
                      >,
                    fScoreMainStatWeights:
                      userSettings.fScoreMainStatWeights as Record<
                        string,
                        number
                      >,
                  }
                : null;

              // Calculate scores with proper validation
              let fScore: number | null = null;
              let score: number | null = null;

              try {
                fScore = calculateFScore(gearWithSubstats, scoreSettings);
                score = calculateScore(gearWithSubstats);

                // If either score is NaN, set to 0 instead of null
                if (isNaN(fScore) || fScore === null) fScore = 0;
                if (isNaN(score) || score === null) score = 0;

                // Calculate grades
                const fScoreGrade = fScore > 0 ? getScoreQuality(fScore) : null;
                const scoreGrade = score > 0 ? getScoreQuality(score) : null;

                this.logGear(gear.id, fScore, score, fScoreGrade, scoreGrade);

                // Update gear with scores and grades
                await prisma.gears.update({
                  where: { id: gear.id },
                  data: {
                    fScore,
                    score,
                    fScoreGrade,
                    scoreGrade,
                  },
                });

                // Log first few substats for the first 5 gears only (already graded on insert)
                for (const substat of gearWithSubstats.GearSubStats) {
                  const gradeLogged =
                    substat.grade ??
                    getSubstatGrade(
                      Number(substat.statValue),
                      substat.StatType.statName
                    );
                  this.logSubstat(
                    substat.id,
                    substat.StatType.statName,
                    Number(substat.statValue),
                    gradeLogged
                  );
                }
              } catch (error) {
                console.error(
                  "Error calculating scores:",
                  error,
                  gearWithSubstats
                );
              }
            }
          } catch (scoreError) {
            console.error(`Error saving substats ${gear.id}:`, scoreError);
          }

          importedCount++;
        } catch (error) {
          const badId =
            (item as { id?: string; ingameId?: string })?.id ??
            (item as { id?: string; ingameId?: string })?.ingameId;
          console.log(`[UPLOAD DEBUG] Gear import error: ${error}`);
          errors.push(
            `Failed to import item ${String(badId ?? "unknown")}: ${error}`
          );
        }
      }

      // Write log files
      this.writeLogFiles();

      return {
        success: true,
        count: importedCount,
        gearCount: this.gearCount,
        heroCount: this.heroCount,
        durationMs: Date.now() - startedAt,
        errors: errors.length > 0 ? errors : undefined,
        message: "Upload successful",
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        count: 0,
        gearCount: 0,
        heroCount: 0,
        durationMs: Date.now() - startedAt,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        message: "Internal server error",
      };
    }
  }
}
