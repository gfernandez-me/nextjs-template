/**
 * Gear scoring utilities for Epic 7 gear optimization
 */

import type { GearForTable } from "@/dashboard/gears/data/gears";

/**
 * Default substat weights for scoring
 */
export const DEFAULT_SUBSTAT_WEIGHTS: Record<string, number> = {
  Speed: 2.0,
  "Crit %": 1.5,
  "Crit Dmg %": 1.3,
  "Attack %": 1.2,
  "Defense %": 0.8,
  "Health %": 0.8,
  "Effectiveness %": 0.7,
  "Effect Resist %": 0.6,
  Attack: 0.3,
  Defense: 0.2,
  Health: 0.2,
};

/**
 * Default main stat weights for scoring
 */
export const DEFAULT_MAIN_STAT_WEIGHTS: Record<string, number> = {
  att: 0,
  def: 0,
  max_hp: 0,
  att_rate: 0.5,
  def_rate: 0.3,
  max_hp_rate: 0.3,
  cri: 0.6,
  cri_dmg: 0.6,
  speed: 1.0,
  acc: 0.4,
  res: 0.4,
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

/**
 * Generic utility to strip percentage sign from any string
 */
export function stripPercent(label: string): string {
  return label.replace(/\s*%$/, "");
}
