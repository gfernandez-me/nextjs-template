"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GearSetFilter, GearTypeFilter } from "./gear-filters";
import { useDebouncedGearSearchParams } from "@/lib/url-hooks";

export function GearFiltersSimplified() {
  const searchParams = useSearchParams();
  const updateFilters = useDebouncedGearSearchParams(150);
  const [nameFilter, setNameFilter] = useState("");

  // Initialize name filter from URL
  useEffect(() => {
    const urlName = searchParams.get("name") || "";
    setNameFilter(urlName);
  }, [searchParams]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameFilter(value);

    // Debounced update will handle the actual URL update
    updateFilters({
      filters: { name: value || undefined },
      page: 1,
    });
  };

  const clearAllFilters = () => {
    setNameFilter("");
    updateFilters({
      filters: {
        name: undefined,
        type: undefined,
        set: [],
      },
      page: 1,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gear Filters</h3>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="name-filter" className="text-sm whitespace-nowrap">
            Name
          </Label>
          <Input
            id="name-filter"
            value={nameFilter}
            onChange={handleNameChange}
            placeholder="Search by gear name..."
            className="h-8 w-48"
          />
        </div>

        <GearTypeFilter />
        <GearSetFilter />
      </div>
    </div>
  );
}
