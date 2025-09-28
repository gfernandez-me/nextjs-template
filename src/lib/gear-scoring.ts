/**
 * Gear scoring utilities for Epic 7 gear optimization
 */

import type { GearForTable } from "@/lib/dal/gears";

/**
 * Default substat weights for scoring
 */
export const DEFAULT_SUBSTAT_WEIGHTS: Record<string, number> = {
  Speed: 2.0,
  "Crit %": 1.6,
  "Crit Dmg %": 1.4,
  "Attack %": 1.0,
  "Defense %": 1.0,
  "Health %": 1.0,
  "Effectiveness %": 0.8,
  "Effect Resist %": 0.8,
  Attack: 0.15,
  Defense: 0.1,
  Health: 0.1,
};

/**
 * Default main stat weights for scoring
 * Note: These values are relative to substat weights
 * A weight of 1.0 means it contributes the same as a substat roll
 */
export const DEFAULT_MAIN_STAT_WEIGHTS: Record<string, number> = {
  att: 0.15, // Flat Attack
  def: 0.1, // Flat Defense
  max_hp: 0.1, // Flat Health
  att_rate: 1.0, // Attack %
  def_rate: 1.0, // Defense %
  max_hp_rate: 1.0, // Health %
  cri: 1.6, // Crit %
  cri_dmg: 1.4, // Crit Damage %
  speed: 2.0, // Speed
  acc: 0.8, // Effectiveness %
  res: 0.8, // Effect Resistance %
};

/**
 * Fetch scoring weights from server settings
 */
export async function fetchScoringWeights(): Promise<{
  substatWeights: Record<string, number>;
  mainStatWeights: Record<string, number>;
  includeMainStat: boolean;
}> {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) {
      return {
        substatWeights: DEFAULT_SUBSTAT_WEIGHTS,
        mainStatWeights: DEFAULT_MAIN_STAT_WEIGHTS,
        includeMainStat: false,
      };
    }

    const data = await res.json();
    return {
      substatWeights:
        (data?.fScoreSubstatWeights as Record<string, number>) ??
        DEFAULT_SUBSTAT_WEIGHTS,
      mainStatWeights:
        (data?.fScoreMainStatWeights as Record<string, number>) ??
        DEFAULT_MAIN_STAT_WEIGHTS,
      includeMainStat: data?.fScoreIncludeMainStat ?? false,
    };
  } catch {
    return {
      substatWeights: DEFAULT_SUBSTAT_WEIGHTS,
      mainStatWeights: DEFAULT_MAIN_STAT_WEIGHTS,
      includeMainStat: false,
    };
  }
}

/**
 * Compute Fribbels-like score using stat type weights from settings
 */
export async function computeFribbelsLikeScore(
  row: GearForTable
): Promise<number> {
  const { mainStatWeights, includeMainStat } = await fetchScoringWeights();

  let score = 0;

  // Add substat scores
  for (const s of row.GearSubStats) {
    if (!s || !s.StatType || s.statValue === null || s.statValue === undefined)
      continue;

    const weight = s.StatType.weight ? Number(s.StatType.weight) : 1;
    const value = Number(s.statValue);

    // Skip invalid values
    if (isNaN(value) || isNaN(weight)) continue;

    score += value * weight;
  }

  // Add main stat score if enabled
  if (includeMainStat) {
    const mainStatType = row.mainStatType;
    const mainStatValue = Number(row.mainStatValue);
    const mainWeight = mainStatWeights[mainStatType] ?? 0;

    if (!isNaN(mainStatValue) && !isNaN(mainWeight)) {
      score += mainStatValue * mainWeight;
    }
  }

  return Math.round(score * 100) / 100;
}

/**
 * Compute custom score using configured weights from settings
 */
export async function computeCustomScore(row: GearForTable): Promise<number> {
  const { substatWeights, mainStatWeights, includeMainStat } =
    await fetchScoringWeights();

  let score = 0;

  // Add substat scores using configured weights
  for (const s of row.GearSubStats) {
    if (!s || !s.StatType || s.statValue === null || s.statValue === undefined)
      continue;

    const name = s.StatType.statName;
    const weight = substatWeights[name] ?? 1;
    const value = Number(s.statValue);

    // Skip invalid values
    if (isNaN(value) || isNaN(weight)) continue;

    score += value * weight;
  }

  // Add main stat score if enabled
  if (includeMainStat) {
    const mainStatType = row.mainStatType;
    const mainStatValue = Number(row.mainStatValue);
    const mainWeight = mainStatWeights[mainStatType] ?? 0;

    if (!isNaN(mainStatValue) && !isNaN(mainWeight)) {
      score += mainStatValue * mainWeight;
    }
  }

  return Math.round(score * 100) / 100;
}
