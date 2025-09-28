/**
 * Client-side URL hooks for updating gear table search parameters
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useEffect } from "react";
import { buildGearSearchParams, GearTableState } from "./url";

/**
 * Hook for debounced gear search parameter updates
 */
export function useDebouncedGearSearchParams(delay: number = 300) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const updateSearchParams = useCallback(
    (updates: Partial<GearTableState>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Get current URL parameters
        const currentUrl = new URL(window.location.href);
        const currentParams = new URLSearchParams(currentUrl.search);

        // Build new parameters from updates (filters are already merged in GearFilters)
        const newParams = buildGearSearchParams(updates);

        // Preserve non-filter parameters from current URL
        const filterKeys = [
          "name",
          "type",
          "rank",
          "level",
          "enhance",
          "mainStatType",
          "subStats",
          "hero",
          "set",
          "fScoreGrade",
          "scoreGrade",
          "substatGrade",
          "substatGradeCount",
        ];

        for (const [key, value] of currentParams.entries()) {
          // Only preserve non-filter parameters
          if (!filterKeys.includes(key) && !newParams.has(key)) {
            newParams.set(key, value);
          }
        }

        // Update URL with new parameters
        router.replace(`?${newParams.toString()}`, { scroll: false });
      }, delay);
    },
    [router, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return updateSearchParams;
}

/**
 * Hook for immediate URL search parameter updates for gear table
 */
export function useGearSearchParams() {
  const router = useRouter();

  const updateSearchParams = useCallback(
    (updates: Partial<GearTableState>) => {
      // Get current URL parameters
      const currentUrl = new URL(window.location.href);
      const currentParams = new URLSearchParams(currentUrl.search);

      // Build new parameters, preserving existing ones
      const newParams = buildGearSearchParams(updates);

      // Merge current and new parameters
      for (const [key, value] of currentParams.entries()) {
        if (!newParams.has(key)) {
          newParams.set(key, value);
        }
      }

      // Update URL with merged parameters
      router.replace(`?${newParams.toString()}`, { scroll: false });
    },
    [router]
  );

  return { updateSearchParams };
}

/**
 * Utility to clear all gear filters
 */
export function clearAllGearFilters(
  updateSearchParams: (updates: Partial<GearTableState>) => void
) {
  updateSearchParams({
    filters: {
      name: undefined,
      type: undefined,
      rank: [],
      level: undefined,
      enhance: undefined,
      mainStatType: undefined,
      subStats: [],
    },
    page: 1, // Reset to first page
  });
}
