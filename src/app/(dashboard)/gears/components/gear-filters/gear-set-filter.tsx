"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { getGearSetFilterOptions } from "@/lib/gear-sets";
import { useDebouncedGearSearchParams } from "@/lib/url-hooks";

interface GearSetFilterProps {
  className?: string;
}

export function GearSetFilter({ className }: GearSetFilterProps) {
  const searchParams = useSearchParams();
  const updateFilters = useDebouncedGearSearchParams(150); // Reduced debounce for better UX

  const handleSetChange = useCallback(
    (selected: string[]) => {
      console.log("[GEAR SET FILTER DEBUG] Selection changed:", selected);
      updateFilters({
        filters: { set: selected },
        page: 1, // Reset to first page when filters change
      });
    },
    [updateFilters]
  );

  const currentSelection = (searchParams.get("set") || "")
    .split("|")
    .filter(Boolean);

  return (
    <div className={`flex items-center gap-4 ${className || ""}`}>
      <Label className="text-sm whitespace-nowrap">Gear Sets</Label>
      <MultiSelect
        options={getGearSetFilterOptions()}
        selected={currentSelection}
        onSelectionChange={handleSetChange}
        placeholder="Select gear sets"
        searchable={true}
      />
    </div>
  );
}
