/**
 * Fribbels-style color coding for gear scores
 * Based on the visual system from Fribbels Epic 7 Optimizer
 */

import { ScoreGrade } from "#prisma";

export interface ScoreColorConfig {
  // Score thresholds for different quality levels
  excellent: number; // Light green - best scores
  good: number; // Dark green - good scores
  average: number; // Yellow/neutral - average scores
  poor: number; // Red - poor scores
  terrible: number; // Dark red - worst scores
}

// Default score thresholds (can be customized per user)
// Adjusted based on Epic 7 gear score ranges (typically 0-100+)
export const DEFAULT_SCORE_THRESHOLDS: ScoreColorConfig = {
  excellent: 85, // Light green background - top tier gear
  good: 65, // Dark green background - high quality gear
  average: 50, // Yellow/neutral background - decent gear
  poor: 45, // Red background - low quality gear
  terrible: 0, // Dark red background - worst gear
};

// Use Prisma enum for consistency
export type ScoreQuality = ScoreGrade;

/**
 * Get the quality level for a given score
 */
export function getScoreQuality(
  score: number,
  thresholds: ScoreColorConfig = DEFAULT_SCORE_THRESHOLDS
): ScoreGrade {
  if (score >= thresholds.excellent) return ScoreGrade.EXCELLENT;
  if (score >= thresholds.good) return ScoreGrade.GOOD;
  if (score >= thresholds.average) return ScoreGrade.AVERAGE;
  if (score >= thresholds.poor) return ScoreGrade.POOR;
  return ScoreGrade.TERRIBLE;
}

/**
 * Get the grade for a substat value
 */
export function getSubstatGrade(
  statValue: number,
  statName: string,
  thresholds: ScoreColorConfig = DEFAULT_SCORE_THRESHOLDS
): ScoreGrade {
  const substatThresholds = getBaseSubstatThresholds(statName);

  // Convert decimal values to percentages for main stats
  let adjustedValue = statValue;
  if (
    (statName.includes("_RATE") ||
      statName === "CRI_DMG" ||
      statName === "ACC" ||
      statName === "RES") &&
    !statName.includes("%")
  ) {
    adjustedValue = statValue * 100;
  }

  if (adjustedValue >= substatThresholds.excellent) return ScoreGrade.EXCELLENT;
  if (adjustedValue >= substatThresholds.good) return ScoreGrade.GOOD;
  if (adjustedValue >= substatThresholds.average) return ScoreGrade.AVERAGE;
  if (adjustedValue >= substatThresholds.poor) return ScoreGrade.POOR;
  return ScoreGrade.TERRIBLE;
}

/**
 * Get the CSS classes for score background color
 * Based on Fribbels' color scheme: light green > dark green > yellow > red > dark red
 */
export function getScoreColorClasses(
  score: number,
  thresholds: ScoreColorConfig = DEFAULT_SCORE_THRESHOLDS
): string {
  const quality = getScoreQuality(score, thresholds);

  switch (quality) {
    case ScoreGrade.EXCELLENT:
      return "bg-green-600 text-white font-semibold border border-green-700"; // Dark green - best
    case ScoreGrade.GOOD:
      return "bg-green-400 text-black font-semibold border border-green-500"; // Light green - good
    case ScoreGrade.AVERAGE:
      return "bg-yellow-200 text-black font-medium border border-yellow-300"; // Yellow - mid
    case ScoreGrade.POOR:
      return "bg-red-300 text-black font-medium border border-red-400"; // Light red - between mid and bad
    case ScoreGrade.TERRIBLE:
      return "bg-red-600 text-white font-semibold border border-red-700"; // Red - bad
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"; // Fallback
  }
}

/**
 * Get the CSS classes for score background color (lighter version for better readability)
 * Uses high-contrast colors for maximum visibility
 */
export function getScoreColorClassesLight(
  score: number,
  thresholds: ScoreColorConfig = DEFAULT_SCORE_THRESHOLDS
): string {
  const quality = getScoreQuality(score, thresholds);

  switch (quality) {
    case ScoreGrade.EXCELLENT:
      return "bg-green-600 text-white font-semibold border border-green-700"; // Dark green - best
    case ScoreGrade.GOOD:
      return "bg-green-400 text-black font-semibold border border-green-500"; // Light green - good
    case ScoreGrade.AVERAGE:
      return "bg-yellow-200 text-black font-medium border border-yellow-300"; // Yellow - mid
    case ScoreGrade.POOR:
      return "bg-red-300 text-black font-medium border border-red-400"; // Light red - between mid and bad
    case ScoreGrade.TERRIBLE:
      return "bg-red-600 text-white font-semibold border border-red-700"; // Red - bad
    default:
      return "bg-gray-50 text-gray-600 border border-gray-200"; // Fallback
  }
}

/**
 * Format a score with color coding
 */
export function formatScoreWithColor(
  score: number | null,
  thresholds: ScoreColorConfig = DEFAULT_SCORE_THRESHOLDS,
  precision: number = 1
): {
  value: string;
  className: string;
  quality: ScoreQuality;
  style?: React.CSSProperties;
} {
  if (score === null || score === undefined) {
    return {
      value: "-",
      className: "text-muted-foreground",
      quality: ScoreGrade.AVERAGE,
    };
  }

  const quality = getScoreQuality(score, thresholds);
  const className = getScoreColorClassesLight(score, thresholds);

  let style: React.CSSProperties = {};

  if (score >= thresholds.excellent) {
    style = {
      backgroundColor: "#16a34a", // Dark green - best
      color: "#000000", // Always black text
      borderColor: "#15803d",
    };
  } else if (score >= thresholds.good) {
    style = {
      backgroundColor: "#22c55e", // Light green - good
      color: "#000000", // Always black text
      borderColor: "#16a34a",
    };
  } else if (score >= thresholds.average) {
    style = {
      backgroundColor: "#fef08a", // Yellow - mid
      color: "#000000", // Always black text
      borderColor: "#fde047",
    };
  } else if (score >= thresholds.poor) {
    style = {
      backgroundColor: "#fca5a5", // Light red - between mid and bad
      color: "#000000", // Always black text
      borderColor: "#f87171",
    };
  } else {
    style = {
      backgroundColor: "#dc2626", // Red - bad
      color: "#000000", // Always black text
      borderColor: "#b91c1c",
    };
  }

  return {
    value: score.toFixed(precision),
    className,
    quality,
    style,
  };
}

/**
 * Get gear type icon (copying from Fribbels)
 * These are the same icons used in Fribbels Epic 7 Optimizer
 */
export function getGearTypeIcon(gearType: string): string {
  if (!gearType) return "❓";

  switch (gearType.toLowerCase()) {
    case "weapon":
      return "⚔️";
    case "armor":
      return "🛡️";
    case "helmet":
    case "helm":
      return "🪖";
    case "necklace":
    case "neck":
      return "📿";
    case "ring":
      return "💍";
    case "boots":
    case "boot":
      return "🥾";
    default:
      return "❓";
  }
}

/**
 * Get gear rank color classes
 */
export function getGearRankClasses(rank: string): string {
  switch (rank.toLowerCase()) {
    case "common":
      return "text-gray-500 bg-gray-50";
    case "uncommon":
      return "text-green-600 bg-green-50";
    case "rare":
      return "text-blue-600 bg-blue-50";
    case "epic":
      return "text-purple-600 bg-purple-50";
    case "heroic":
      return "text-orange-600 bg-orange-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
}

/**
 * Get substat color classes based on value and stat type
 * Based on Fribbels' substat color coding system
 * Uses high-contrast colors for maximum visibility
 */
export function getSubstatColorClasses(
  statName: string,
  statValue: number,
  enhance: number
): string {
  // Define thresholds for different stat types
  const thresholds = getSubstatThresholds(statName, enhance);

  let className: string;
  let tier: string;

  if (statValue >= thresholds.excellent) {
    className = "font-semibold border rounded px-2 py-1";
    tier = "excellent";
  } else if (statValue >= thresholds.good) {
    className = "font-semibold border rounded px-2 py-1";
    tier = "good";
  } else if (statValue >= thresholds.average) {
    className = "font-semibold border rounded px-2 py-1";
    tier = "average";
  } else if (statValue >= thresholds.poor) {
    className = "font-medium border rounded px-2 py-1";
    tier = "poor";
  } else {
    className = "font-semibold border rounded px-2 py-1";
    tier = "terrible";
  }

  return className;
}

/**
 * Get substat thresholds based on stat type and enhancement level
 * These thresholds are based on Epic 7's stat roll ranges
 */
function getSubstatThresholds(
  statName: string,
  enhance: number
): {
  excellent: number;
  good: number;
  average: number;
  poor: number;
} {
  const baseThresholds = getBaseSubstatThresholds(statName);

  // Adjust thresholds based on enhancement level
  // Higher enhancement = higher possible rolls
  const enhanceMultiplier =
    enhance >= 12 ? 1.0 : enhance >= 9 ? 0.9 : enhance >= 6 ? 0.8 : 0.7;

  return {
    excellent: baseThresholds.excellent * enhanceMultiplier,
    good: baseThresholds.good * enhanceMultiplier,
    average: baseThresholds.average * enhanceMultiplier,
    poor: baseThresholds.poor * enhanceMultiplier,
  };
}

/**
 * Base thresholds for different stat types
 * Based on Epic 7's maximum possible rolls
 */
function getBaseSubstatThresholds(statName: string): {
  excellent: number;
  good: number;
  average: number;
  poor: number;
} {
  // Use exact stat names from database
  switch (statName) {
    // Substat names (from database)
    case "Attack %":
      return { excellent: 20, good: 16, average: 12, poor: 8 };
    case "Defense %":
      return { excellent: 20, good: 16, average: 12, poor: 8 };
    case "Health %":
      return { excellent: 20, good: 16, average: 12, poor: 9.5 }; // 9% HP is bad (red)
    case "Crit %":
      return { excellent: 12, good: 10, average: 8, poor: 6.5 }; // 6% CC is bad (red)
    case "Crit Dmg %":
      return { excellent: 20, good: 15, average: 10, poor: 6 };
    case "Effectiveness %":
      return { excellent: 20, good: 16, average: 12, poor: 8 };
    case "Effect Resist %":
      return { excellent: 20, good: 16, average: 12, poor: 8 };
    case "Speed":
      return { excellent: 20, good: 17, average: 15, poor: 9 }; // 8 speed is yellow (poor)
    case "Attack":
      return { excellent: 120, good: 100, average: 80, poor: 70 }; // 50 flat atk is bad (red)
    case "Defense":
      return { excellent: 100, good: 80, average: 60, poor: 75 }; // 71 flat def is bad (red)
    case "Health":
      return { excellent: 700, good: 400, average: 300, poor: 250 }; // 239 flat HP is bad (red)

    // Main stat names (from mainStatType enum) - These have MUCH higher ranges than substats!
    case "ATT_RATE":
      return { excellent: 65, good: 55, average: 45, poor: 35 }; // Attack % main stat (max ~65%)
    case "DEF_RATE":
      return { excellent: 65, good: 55, average: 45, poor: 35 }; // Defense % main stat (max ~65%)
    case "MAX_HP_RATE":
      return { excellent: 65, good: 55, average: 45, poor: 35 }; // Health % main stat (max ~65%)
    case "CRI":
      return { excellent: 12, good: 10, average: 8, poor: 6.5 }; // Crit % main stat (max ~12%)
    case "CRI_DMG":
    case "Crit Dmg %": // Handle display name for main stat
      return { excellent: 70, good: 60, average: 50, poor: 40 }; // Crit Dmg % main stat (max ~70%)
    case "ACC":
      return { excellent: 65, good: 55, average: 45, poor: 35 }; // Effectiveness % main stat (max ~65%)
    case "RES":
      return { excellent: 65, good: 55, average: 45, poor: 35 }; // Effect Resist % main stat (max ~65%)
    case "SPEED":
      return { excellent: 20, good: 17, average: 15, poor: 9 }; // Speed main stat (max ~20%)
    case "ATT":
      return { excellent: 120, good: 100, average: 80, poor: 70 }; // Flat Attack main stat
    case "DEF":
      return { excellent: 100, good: 80, average: 60, poor: 75 }; // Flat Defense main stat
    case "MAX_HP":
      return { excellent: 700, good: 400, average: 300, poor: 250 }; // Flat Health main stat

    default:
      // Default thresholds for unknown stats - conservative
      return { excellent: 15, good: 10, average: 6, poor: 3 };
  }
}

/**
 * Format a substat value with color coding
 */
export function formatSubstatWithColor(
  statName: string,
  statValue: number | null,
  enhance: number,
  precision: number = 0
): { value: string; className: string; style?: React.CSSProperties } {
  if (statValue === null || statValue === undefined) {
    return {
      value: "-",
      className: "text-muted-foreground",
    };
  }

  const className = getSubstatColorClasses(statName, statValue, enhance);
  const thresholds = getSubstatThresholds(statName, enhance);

  // Convert decimal values to percentages ONLY for main stats (not substats)
  let adjustedValue = statValue;
  if (
    (statName.includes("_RATE") ||
      statName === "CRI_DMG" ||
      statName === "ACC" ||
      statName === "RES") &&
    !statName.includes("%")
  ) {
    // Only convert main stat types like "ATT_RATE", "DEF_RATE", "CRI_DMG", etc. (not substats like "Attack %")
    adjustedValue = statValue * 100;
  }

  let style: React.CSSProperties = {};

  if (adjustedValue >= thresholds.excellent) {
    style = {
      backgroundColor: "#16a34a", // Dark green - best
      color: "#000000", // Always black text
      borderColor: "#15803d",
    };
  } else if (adjustedValue >= thresholds.good) {
    style = {
      backgroundColor: "#22c55e", // Light green - good
      color: "#000000", // Always black text
      borderColor: "#16a34a",
    };
  } else if (adjustedValue >= thresholds.average) {
    style = {
      backgroundColor: "#fef08a", // Yellow - mid
      color: "#000000", // Always black text
      borderColor: "#fde047",
    };
  } else if (adjustedValue >= thresholds.poor) {
    style = {
      backgroundColor: "#fca5a5", // Light red - between mid and bad
      color: "#000000", // Always black text
      borderColor: "#f87171",
    };
  } else {
    style = {
      backgroundColor: "#dc2626", // Red - bad
      color: "#000000", // Always black text
      borderColor: "#b91c1c",
    };
  }

  const result = {
    value: adjustedValue.toFixed(precision),
    className,
    style,
  };
  return result;
}
