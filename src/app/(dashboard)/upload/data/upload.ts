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
} from "@/lib/epic7-validation";

// ============================================================================
// DATA ACCESS CLASS
// ============================================================================

export class UploadDataAccess {
  constructor(private userId: string) {}

  /**
   * Process Fribbels export data and import to database
   */
  async processFribbelsExport(data: FribbelsExport): Promise<{
    success: boolean;
    count: number;
    errors?: string[];
    message: string;
  }> {
    let importedCount = 0;
    const errors: string[] = [];

    try {
      // STEP 1: Import heroes first if present
      const heroMap: Map<bigint, number> = new Map(); // ingameId -> database id mapping

      if (data.heroes && Array.isArray(data.heroes)) {
        for (const hero of data.heroes) {
          try {
            const heroObj = hero as Record<string, unknown>;
            // Validate and cast hero data
            const validatedHeroData = this.validateHeroData(heroObj);
            const heroData = {
              ...validatedHeroData,
              userId: this.userId,
            };

            const createdHero = await prisma.heroes.create({ data: heroData });
            heroMap.set(validatedHeroData.ingameId, createdHero.id);
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
      // get all stat types once to minimize DB calls
      const statTypes = await prisma.statTypes.findMany();
      const statTypeMap: Map<string, number> = new Map();
      for (const statType of statTypes) {
        statTypeMap.set(statType.originalStatName, statType.id);
      }

      for (const item of data.items) {
        try {
          const itemObj = item as unknown as Record<string, unknown>;
          const mainStat = itemObj.main as { type: string };

          // Validate and cast gear data
          const validatedGearData = this.validateGearData(itemObj);
          const gearData = {
            ...validatedGearData,
            mainStatType: this.validateMainStatType(mainStat.type),
            equipped: validatedGearData.ingameEquippedId !== null,
            heroId: validatedGearData.ingameEquippedId
              ? heroMap.get(validatedGearData.ingameEquippedId)
              : null,
            userId: this.userId,
          };

          // Create gear
          const gear = await prisma.gears.create({ data: gearData });

          // Process substats
          const fribbelsItem = item as FribbelsItem;
          if (fribbelsItem.substats && Array.isArray(fribbelsItem.substats)) {
            for (const substat of fribbelsItem.substats) {
              const substatObj = substat as unknown as Record<string, unknown>;
              const statTypeId = statTypeMap.get(substatObj.type as string);
              if (statTypeId) {
                // Validate and cast substat data
                const validatedSubstatData =
                  this.validateSubstatData(substatObj);
                const substatData = {
                  ...validatedSubstatData,
                  gearId: gear.id,
                  statTypeId: statTypeId,
                  userId: this.userId,
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
                // Import score calculation functions
                const { calculateFScore, calculateScore } = await import(
                  "@/lib/calculate-scores"
                );

                fScore = calculateFScore(gearWithSubstats, scoreSettings);
                score = calculateScore(gearWithSubstats);

                // If either score is NaN, set to 0 instead of null
                if (isNaN(fScore) || fScore === null) fScore = 0;
                if (isNaN(score) || score === null) score = 0;

                // Single update with validated scores
                await prisma.gears.update({
                  where: { id: gear.id },
                  data: {
                    fScore,
                    score,
                  },
                });
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
            (item as unknown as { id?: unknown; ingameId?: unknown })?.id ??
            (item as unknown as { id?: unknown; ingameId?: unknown })?.ingameId;
          errors.push(
            `Failed to import item ${String(badId ?? "unknown")}: ${error}`
          );
        }
      }

      return {
        success: true,
        count: importedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: "Upload successful",
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        count: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        message: "Internal server error",
      };
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateHeroData(hero: Record<string, unknown>) {
    return validateHeroData(hero);
  }

  private validateGearData(item: Record<string, unknown>) {
    return validateGearData(item);
  }

  private validateSubstatData(substat: Record<string, unknown>) {
    return validateSubstatData(substat);
  }

  private validateMainStatType(type: string) {
    return validateMainStatType(type);
  }
}
