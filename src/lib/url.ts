/**
 * URL parameter management utilities for gear table filtering and URL-driven state
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

import {
  GearType,
  GearRank,
  MainStatType,
  HeroElement,
  HeroRarity,
  HeroClass,
  ScoreGrade,
} from "#prisma";

// Types for gear table state
export interface GearTableState {
  page: number;
  size: number;
  sort: Array<{ id: string; desc: boolean }>;
  filters: GearFilters;
}

export interface GearFilters {
  name?: string;
  type?: GearType[];
  rank?: GearRank[];
  level?: number;
  enhance?: number;
  mainStatType?: MainStatType[];
  subStats?: string[];
  hero?: string;
  set?: string[];
  fScoreGrade?: ScoreGrade[];
  scoreGrade?: ScoreGrade[];
  substatGrade?: ScoreGrade[];
  substatGradeCount?: number; // Number of substats that must match the grade
}

// Types for hero table state
export interface HeroTableState {
  page: number;
  size: number;
  sort: Array<{ id: string; desc: boolean }>;
  filters: HeroFilters;
}

export interface HeroFilters {
  name?: string;
  element?: HeroElement[];
  rarity?: HeroRarity[];
  class?: HeroClass[];
}

/**
 * Parse search parameters from URL into structured gear filters
 */
export function parseGearSearchParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
    sort: searchParams.get("sort") || "",
    dir: searchParams.get("dir") || "",
    filters: parseGearFilters(searchParams),
  };
}

/**
 * Parse gear filters from URL search parameters
 */
export function parseGearFilters(searchParams: URLSearchParams): GearFilters {
  return {
    type: (searchParams.get("type")?.split("|").filter(Boolean) ||
      []) as GearType[],
    rank: (searchParams.get("rank")?.split("|").filter(Boolean) ||
      []) as GearRank[],
    level: searchParams.get("level")
      ? parseInt(searchParams.get("level")!, 10)
      : undefined,
    enhance: searchParams.get("enhance")
      ? parseInt(searchParams.get("enhance")!, 10)
      : 15, // Default to enhance=15 if not specified
    mainStatType: (searchParams
      .get("mainStatType")
      ?.split("|")
      .filter(Boolean) || []) as MainStatType[],
    subStats: searchParams.get("subStats")?.split("|").filter(Boolean) || [],
    hero: searchParams.get("hero") || undefined,
    set: searchParams.get("set")?.split("|").filter(Boolean) || [],
    fScoreGrade: (searchParams.get("fScoreGrade")?.split("|").filter(Boolean) ||
      []) as ScoreGrade[],
    scoreGrade: (searchParams.get("scoreGrade")?.split("|").filter(Boolean) ||
      []) as ScoreGrade[],
    substatGrade: (searchParams
      .get("substatGrade")
      ?.split("|")
      .filter(Boolean) || []) as ScoreGrade[],
    substatGradeCount: searchParams.get("substatGradeCount")
      ? parseInt(searchParams.get("substatGradeCount")!, 10)
      : 1, // Default to 1 if not specified
  };
}

/**
 * Build search parameters from gear table state updates
 */
export function buildGearSearchParams(updates: Partial<GearTableState>) {
  const params = new URLSearchParams();

  if (updates.page && updates.page > 1) {
    params.set("page", String(updates.page));
  }

  if (updates.size && updates.size !== 10) {
    params.set("size", String(updates.size));
  }

  if (updates.sort && updates.sort.length > 0) {
    const sortString = updates.sort
      .map((sort) => `${sort.id}:${sort.desc ? "desc" : "asc"}`)
      .join(",");
    params.set("sort", sortString);
  }

  if (updates.filters) {
    Object.entries(updates.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join("|"));
          }
        } else {
          params.set(key, String(value));
        }
      }
    });
  }

  return params;
}

/**
 * Utility to merge current gear filters with new ones
 */
export function mergeGearFilters(
  current: GearFilters,
  updates: Partial<GearFilters>
): GearFilters {
  return {
    ...current,
    ...updates,
    // Handle array filters properly
    rank: updates.rank !== undefined ? updates.rank : current.rank,
    subStats:
      updates.subStats !== undefined ? updates.subStats : current.subStats,
  };
}

/**
 * Utility to check if gear filters have changed
 */
export function hasGearFilterChanges(
  current: GearFilters,
  previous: GearFilters
): boolean {
  const keys = Object.keys(current) as (keyof GearFilters)[];

  return keys.some((key) => {
    const currentValue = current[key];
    const previousValue = previous[key];

    if (Array.isArray(currentValue) && Array.isArray(previousValue)) {
      return (
        currentValue.length !== previousValue.length ||
        currentValue.some((val, index) => val !== previousValue[index])
      );
    }

    return currentValue !== previousValue;
  });
}

/**
 * Utility to reset gear filters to default values
 */
export function getDefaultGearFilters(): GearFilters {
  return {
    name: undefined,
    type: undefined,
    rank: [],
    level: undefined,
    enhance: undefined,
    mainStatType: undefined,
    subStats: [],
    hero: undefined,
    set: [],
    fScoreGrade: [],
    scoreGrade: [],
    substatGrade: [],
    substatGradeCount: 1,
  };
}

/**
 * Parse search parameters from URL into structured hero filters
 */
export function parseHeroSearchParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
    sort: searchParams.get("sort") || "",
    dir: searchParams.get("dir") || "",
    filters: parseHeroFilters(searchParams),
  };
}

/**
 * Parse hero filters from URL search parameters
 */
export function parseHeroFilters(searchParams: URLSearchParams): HeroFilters {
  return {
    name: searchParams.get("name") || undefined,
    element: (searchParams.get("element")?.split("|").filter(Boolean) ||
      []) as HeroElement[],
    rarity: (searchParams.get("rarity")?.split("|").filter(Boolean) ||
      []) as HeroRarity[],
    class: (searchParams.get("class")?.split("|").filter(Boolean) ||
      []) as HeroClass[],
  };
}

/**
 * Utility to reset hero filters to default values
 */
export function getDefaultHeroFilters(): HeroFilters {
  return {
    name: undefined,
    element: [],
    rarity: [],
    class: [],
  };
}
