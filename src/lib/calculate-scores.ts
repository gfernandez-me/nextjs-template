/**
 * Utility to calculate scores for existing gear data
 * This should be run after import or when settings change
 */

import type { Gears, GearSubStats } from "#prisma";
import prisma from "@/lib/prisma";
import {
  DEFAULT_SUBSTAT_WEIGHTS,
  DEFAULT_MAIN_STAT_WEIGHTS,
} from "./gear-scoring";

// Extended interface for gear with substats
export interface GearForOptimization extends Omit<Gears, "GearSubStats"> {
  GearSubStats: Array<
    Omit<GearSubStats, "StatType"> & {
      StatType: {
        statName: string;
        statCategory: "FLAT" | "PERCENTAGE";
      } | null;
    }
  >;
}

/**
 * Calculate and update scores for all gear in the database
 */
export async function calculateAllGearScores() {
  console.log("Starting score calculation for all gear...");

  // Get all gear with substats
  const gears = await prisma.gears.findMany({
    include: {
      GearSubStats: {
        include: {
          StatType: true,
        },
      },
    },
  });

  console.log(`Found ${gears.length} gears to process`);

  let updated = 0;
  let errors = 0;

  for (const gear of gears) {
    try {
      const fScore = calculateFScore(gear);
      const score = calculateScore(gear);

      await prisma.gears.update({
        where: { id: gear.id },
        data: {
          fScore,
          score,
        },
      });

      updated++;

      if (updated % 100 === 0) {
        console.log(`Processed ${updated}/${gears.length} gears...`);
      }
    } catch (error) {
      console.error(`Error calculating scores for gear ${gear.id}:`, error);
      errors++;
    }
  }

  console.log(
    `Score calculation complete. Updated: ${updated}, Errors: ${errors}`
  );
  return { updated, errors };
}

/**
 * Calculate F-Score for a gear item
 * This score includes main stats and uses standardized weights
 */
export function calculateFScore(
  gear: GearForOptimization,
  settings?: {
    fScoreSubstatWeights?: Record<string, number>;
    fScoreMainStatWeights?: Record<string, number>;
    fScoreIncludeMainStat?: boolean;
  } | null
): number {
  let score = 0;

  // Use provided settings or fallback to defaults
  const substatWeights =
    settings?.fScoreSubstatWeights ?? DEFAULT_SUBSTAT_WEIGHTS;
  const mainStatWeights =
    settings?.fScoreMainStatWeights ?? DEFAULT_MAIN_STAT_WEIGHTS;
  const includeMainStat = settings?.fScoreIncludeMainStat ?? true;

  // Add substat scores
  for (const substat of gear.GearSubStats) {
    if (!substat?.StatType?.statName || substat.statValue === null) continue;

    const statName = substat.StatType.statName;
    const isPercentage = substat.StatType.statCategory === "PERCENTAGE";

    // Apply standardized weights
    let weight = substatWeights[statName];
    if (weight === undefined) {
      // Default weights based on stat category
      weight = isPercentage ? 1.0 : 0.15;

      // Further adjust weights based on stat name pattern
      if (isPercentage) {
        if (statName.includes("Crit")) weight = 1.6;
        else if (statName.includes("Speed")) weight = 2.0;
        else if (
          statName.includes("Attack") ||
          statName.includes("Health") ||
          statName.includes("Defense")
        )
          weight = 1.0;
        else weight = 0.8; // Effectiveness, Effect Resist, etc.
      } else {
        if (statName.includes("Speed")) weight = 2.0;
        else if (statName.includes("Attack")) weight = 0.15;
        else weight = 0.1; // Defense, Health
      }
    }

    // Convert Decimal to number if needed
    const value = Number(substat.statValue.toString());

    if (!isNaN(value) && !isNaN(weight)) {
      score += value * weight;
    }
  }

  // Add main stat score if enabled
  if (includeMainStat) {
    const mainStatType = gear.mainStatType;
    const mainStatValue = Number(gear.mainStatValue);
    const mainWeight =
      mainStatWeights[mainStatType] ??
      DEFAULT_MAIN_STAT_WEIGHTS[mainStatType] ??
      0;

    if (!isNaN(mainStatValue) && !isNaN(mainWeight)) {
      score += mainStatValue * mainWeight;
    }
  }

  return Math.round(score * 100) / 100;
}

/**
 * Calculate Score for a gear item (substats only)
 * Uses flat stat weights that are relative to percentage weights
 */
export function calculateScore(gear: GearForOptimization): number {
  let score = 0;

  // Add substat scores using default weights
  for (const substat of gear.GearSubStats) {
    if (
      !substat?.StatType?.statName ||
      substat.statValue === null ||
      substat.statValue === undefined
    )
      continue;

    const statName = substat.StatType.statName;
    const isPercentage = substat.StatType.statCategory === "PERCENTAGE";

    // Apply weights based on stat type
    let weight = DEFAULT_SUBSTAT_WEIGHTS[statName];
    if (weight === undefined) {
      // Default weights based on stat category
      weight = isPercentage ? 1.0 : 0.15;

      // Further adjust weights based on stat name pattern
      if (isPercentage) {
        if (statName.includes("Crit")) weight = 1.6;
        else if (statName.includes("Speed")) weight = 2.0;
        else if (
          statName.includes("Attack") ||
          statName.includes("Health") ||
          statName.includes("Defense")
        )
          weight = 1.0;
        else weight = 0.8; // Effectiveness, Effect Resist, etc.
      } else {
        if (statName.includes("Speed")) weight = 2.0;
        else if (statName.includes("Attack")) weight = 0.15;
        else weight = 0.1; // Defense, Health
      }
    }

    // Convert Decimal to number if needed
    const value = Number(substat.statValue.toString());

    if (!isNaN(value) && !isNaN(weight)) {
      score += value * weight;
    }
  }

  console.log("Final score:", score);

  return Math.round(score * 100) / 100;
}

/**
 * Calculate scores for a specific user's gear
 */
export async function calculateUserGearScores(userId: string) {
  console.log(`Starting score calculation for user ${userId}...`);

  const gears = await prisma.gears.findMany({
    where: { userId },
    include: {
      GearSubStats: {
        include: {
          StatType: true,
        },
      },
    },
  });

  console.log(`Found ${gears.length} gears for user`);

  let updated = 0;
  let errors = 0;

  for (const gear of gears) {
    try {
      const fScore = calculateFScore(gear);
      const score = calculateScore(gear);

      await prisma.gears.update({
        where: { id: gear.id },
        data: {
          fScore,
          score,
        },
      });

      updated++;
    } catch (error) {
      console.error(`Error calculating scores for gear ${gear.id}:`, error);
      errors++;
    }
  }

  console.log(
    `User score calculation complete. Updated: ${updated}, Errors: ${errors}`
  );
  return { updated, errors };
}
