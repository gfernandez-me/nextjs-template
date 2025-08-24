/**
 * Gear stat threshold utilities for Epic 7 gear optimization
 */

export interface StatBadge {
  label: string;
  className: string;
  icon: "low" | "high" | null;
}

export interface StatThresholds {
  [statName: string]: number[];
}

/**
 * Default stat thresholds for +15 gear
 */
export const DEFAULT_STAT_THRESHOLDS: StatThresholds = {
  Speed: [4, 8, 12, 18],
  "Crit %": [4, 8, 12, 16],
  "Crit Dmg %": [4, 8, 12, 20],
  "Attack %": [4, 8, 12, 16],
  "Defense %": [4, 8, 12, 16],
  "Health %": [4, 8, 12, 16],
  "Effectiveness %": [4, 8, 12, 16],
  "Effect Resist %": [4, 8, 12, 16],
  Attack: [20, 40, 60, 90],
  Defense: [10, 20, 30, 45],
  Health: [50, 100, 150, 220],
};

/**
 * Fetch stat thresholds from server settings
 */
export async function fetchStatThresholds(): Promise<StatThresholds> {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return DEFAULT_STAT_THRESHOLDS;

    const data = (await res.json()) as {
      substatThresholds?: Record<string, { plus15?: number[] }>;
    } | null;

    const thresholds: StatThresholds = {};
    const raw = data?.substatThresholds ?? {};

    for (const [k, v] of Object.entries(raw)) {
      const arr = Array.isArray(v?.plus15) ? (v?.plus15 as number[]) : [];
      if (arr.length) thresholds[k] = arr;
    }

    // Apply fallbacks for missing thresholds
    return { ...DEFAULT_STAT_THRESHOLDS, ...thresholds };
  } catch {
    return DEFAULT_STAT_THRESHOLDS;
  }
}

/**
 * Get stat badge based on value and thresholds
 */
export function getStatBadge(
  statName: string,
  statValue: number,
  enhance: number,
  thresholds: StatThresholds
): StatBadge | null {
  const t = thresholds[statName];
  if (!t || t.length !== 4) return null;

  const [t1, t2, t3, t4] = t;

  // Scale down value for lower enhancement levels
  let scaledValue = statValue;
  if (enhance < 15) {
    // Simple approximation: scale linearly with enhancement level
    const enhanceRatio = (enhance + 3) / 18; // +3 for starting enhancement level
    scaledValue = statValue / enhanceRatio;
  }

  if (scaledValue >= t4) {
    return {
      label: "Max",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: "high",
    };
  } else if (scaledValue >= t3) {
    return {
      label: "High",
      className: "bg-green-100 text-green-800 border-green-300",
      icon: "high",
    };
  } else if (scaledValue >= t2) {
    return {
      label: "Med",
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: null,
    };
  } else if (scaledValue >= t1) {
    return {
      label: "Low",
      className: "bg-orange-100 text-orange-800 border-orange-300",
      icon: "low",
    };
  }

  return null;
}
