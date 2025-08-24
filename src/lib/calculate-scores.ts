/**
 * Utility to calculate scores for existing gear data
 * This should be run after import or when settings change
 */

import prisma from "@/lib/prisma";
import {
  DEFAULT_SUBSTAT_WEIGHTS,
  DEFAULT_MAIN_STAT_WEIGHTS,
} from "./gear-scoring";
import type { GearForOptimization } from "@/dashboard/gears/data/gears";

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
 */
export function calculateFScore(gear: GearForOptimization): number {
  let score = 0;

  // Add substat scores using default weights
  for (const substat of gear.GearSubStats) {
    if (!substat?.StatType?.statName || substat.statValue === null) continue;

    const statName = substat.StatType.statName;
    const weight = DEFAULT_SUBSTAT_WEIGHTS[statName] ?? 1.0;
    const value = Number(substat.statValue);

    if (!isNaN(value) && !isNaN(weight)) {
      score += value * weight;
    }
  }

  // Add main stat score (enabled by default)
  const mainStatType = gear.mainStatType;
  const mainStatValue = Number(gear.mainStatValue);
  const mainWeight = DEFAULT_MAIN_STAT_WEIGHTS[mainStatType] ?? 0;

  if (!isNaN(mainStatValue) && !isNaN(mainWeight)) {
    score += mainStatValue * mainWeight;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Calculate Score for a gear item (substats only)
 */
export function calculateScore(gear: GearForOptimization): number {
  let score = 0;

  // Add substat scores using default weights
  for (const substat of gear.GearSubStats) {
    if (!substat?.StatType?.statName || substat.statValue === null) continue;

    const statName = substat.StatType.statName;
    const weight = DEFAULT_SUBSTAT_WEIGHTS[statName] ?? 1.0;
    const value = Number(substat.statValue);

    if (!isNaN(value) && !isNaN(weight)) {
      score += value * weight;
    }
  }

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
