/**
 * URL parameter management utilities for gear table filtering and URL-driven state
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

import { GearType, GearRank, MainStatType } from "#prisma";

// Types for gear table state
export interface GearTableState {
  page: number;
  size: number;
  sort: Array<{ id: string; desc: boolean }>;
  filters: GearFilters;
}

export interface GearFilters {
  name?: string;
  type?: GearType;
  rank?: GearRank[];
  level?: number;
  enhance?: number;
  mainStatType?: MainStatType;
  subStats?: string[];
}

/**
 * Parse search parameters from URL into structured gear filters
 */
export function parseGearSearchParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get("page") || "1", 10),
    size: parseInt(searchParams.get("size") || "10", 10),
    sort: parseGearSorting(searchParams.get("sort") || ""),
    filters: parseGearFilters(searchParams),
  };
}

/**
 * Parse sorting string from URL into array format for gear table
 */
export function parseGearSorting(sortString: string) {
  if (!sortString) return [];

  return sortString.split(",").map((sort) => {
    const [id, direction] = sort.split(":");
    return {
      id,
      desc: direction === "desc",
    };
  });
}

/**
 * Parse gear filters from URL search parameters
 */
export function parseGearFilters(searchParams: URLSearchParams): GearFilters {
  return {
    name: searchParams.get("name") || undefined,
    type: (searchParams.get("type") as GearType) || undefined,
    rank: (searchParams.get("rank")?.split("|").filter(Boolean) ||
      []) as GearRank[],
    level: searchParams.get("level")
      ? parseInt(searchParams.get("level")!, 10)
      : undefined,
    enhance: searchParams.get("enhance")
      ? parseInt(searchParams.get("enhance")!, 10)
      : undefined,
    mainStatType:
      (searchParams.get("mainStatType") as MainStatType) || undefined,
    subStats: searchParams.get("subs")?.split("|").filter(Boolean) || [],
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
  };
}
