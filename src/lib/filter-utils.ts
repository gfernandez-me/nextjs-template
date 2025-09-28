/**
 * Centralized filter utilities for consistent filter handling
 */

import type { GearFilters } from "./url";

/**
 * Apply filter updates to current filters with proper undefined handling
 * This ensures consistent behavior across all filter types
 */
export function applyFilterUpdates(
  currentFilters: GearFilters,
  updates: Partial<GearFilters>
): GearFilters {
  const mergedFilters = { ...currentFilters };

  // List of all filter properties that can be arrays (multi-select)
  const arrayFilters: (keyof GearFilters)[] = [
    "type",
    "rank",
    "mainStatType",
    "subStats",
    "set",
    "fScoreGrade",
    "scoreGrade",
    "substatGrade",
  ];

  // List of all filter properties that can be strings
  const stringFilters: (keyof GearFilters)[] = ["name", "hero"];

  // List of all filter properties that can be numbers
  const numberFilters: (keyof GearFilters)[] = [
    "level",
    "enhance",
    "substatGradeCount",
  ];

  // Apply updates with consistent logic
  Object.entries(updates).forEach(([key, value]) => {
    const filterKey = key as keyof GearFilters;

    if (value === undefined) {
      // Remove the filter completely
      delete mergedFilters[filterKey];
    } else {
      // Set the new value
      (mergedFilters as any)[filterKey] = value;
    }
  });

  return mergedFilters;
}

/**
 * Check if a filter value is empty (should be removed)
 */
export function isFilterEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return false; // 0 is a valid value
  return false;
}

/**
 * Clean filters by removing empty values
 */
export function cleanFilters(filters: GearFilters): Partial<GearFilters> {
  const cleaned: Partial<GearFilters> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (!isFilterEmpty(value)) {
      cleaned[key as keyof GearFilters] = value;
    }
  });

  return cleaned;
}
