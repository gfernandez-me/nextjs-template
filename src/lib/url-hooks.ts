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
        const params = buildGearSearchParams(updates);
        router.replace(`?${params.toString()}`, { scroll: false });
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
      const params = buildGearSearchParams(updates);
      router.replace(`?${params.toString()}`, { scroll: false });
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
