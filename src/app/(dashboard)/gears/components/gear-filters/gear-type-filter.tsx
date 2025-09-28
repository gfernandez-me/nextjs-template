"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { GearType } from "#prisma";
import { useDebouncedGearSearchParams } from "@/lib/url-hooks";

interface GearTypeFilterProps {
  className?: string;
}

const gearTypes = [
  { value: GearType.WEAPON, label: "Weapon" },
  { value: GearType.HELM, label: "Helm" },
  { value: GearType.ARMOR, label: "Armor" },
  { value: GearType.NECK, label: "Necklace" },
  { value: GearType.RING, label: "Ring" },
  { value: GearType.BOOTS, label: "Boots" },
];

export function GearTypeFilter({ className }: GearTypeFilterProps) {
  const searchParams = useSearchParams();
  const updateFilters = useDebouncedGearSearchParams(150);

  const handleTypeChange = useCallback(
    (selected: string[]) => {
      console.log("[GEAR TYPE FILTER DEBUG] Selection changed:", selected);
      updateFilters({
        filters: {
          type: selected.length > 0 ? (selected as GearType[]) : undefined,
        },
        page: 1,
      });
    },
    [updateFilters]
  );

  const currentSelection = (searchParams.get("type") || "")
    .split("|")
    .filter(Boolean);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Label htmlFor="type-filter" className="text-sm whitespace-nowrap">
        Type
      </Label>
      <MultiSelect
        options={gearTypes}
        selected={currentSelection}
        onSelectionChange={handleTypeChange}
        placeholder="Select gear types"
        searchable={true}
      />
    </div>
  );
}
