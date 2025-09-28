/**
 * Gear filters component that updates URL parameters for server-side filtering
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

"use client";

import { useTransition, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedGearSearchParams } from "@/lib/url-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MultiSelect } from "@/components/ui/multi-select";
import {
  GearTableState,
  type GearFilters,
  parseGearSearchParams,
} from "@/lib/url";
import { applyFilterUpdates } from "@/lib/filter-utils";
import {
  GearType,
  MainStatType,
  GearRank,
  StatTypes,
  ScoreGrade,
} from "#prisma";
import { getGearSetFilterOptions } from "@/lib/gear-sets";

// Use Prisma enums instead of hardcoded strings
const gearTypes = [
  { value: GearType.WEAPON, label: "Weapon" },
  { value: GearType.HELM, label: "Helm" },
  { value: GearType.ARMOR, label: "Armor" },
  { value: GearType.NECK, label: "Necklace" },
  { value: GearType.RING, label: "Ring" },
  { value: GearType.BOOTS, label: "Boots" },
];

const mainStats = [
  { value: MainStatType.ATT, label: "Attack" },
  { value: MainStatType.DEF, label: "Defense" },
  { value: MainStatType.MAX_HP, label: "Health" },
  { value: MainStatType.ATT_RATE, label: "Attack%" },
  { value: MainStatType.DEF_RATE, label: "Defense%" },
  { value: MainStatType.MAX_HP_RATE, label: "Health%" },
  { value: MainStatType.SPEED, label: "Speed" },
  { value: MainStatType.CRI, label: "Crit Rate" },
  { value: MainStatType.CRI_DMG, label: "Crit Damage" },
  { value: MainStatType.ACC, label: "Effectiveness" },
  { value: MainStatType.RES, label: "Effect Resistance" },
];

const scoreGrades = [
  { value: ScoreGrade.EXCELLENT, label: "Excellent" },
  { value: ScoreGrade.GOOD, label: "Good" },
  { value: ScoreGrade.AVERAGE, label: "Average" },
  { value: ScoreGrade.POOR, label: "Poor" },
  { value: ScoreGrade.TERRIBLE, label: "Terrible" },
];

export function GearFilters() {
  const [isPending, startTransition] = useTransition();
  const [substatTypes, setSubstatTypes] = useState<StatTypes[]>([]);
  const updateFilters = useDebouncedGearSearchParams(300);
  const searchParams = useSearchParams();

  // Fetch substat types from database
  useEffect(() => {
    const fetchSubstatTypes = async () => {
      try {
        const response = await fetch("/api/stat-types");
        if (response.ok) {
          const data = await response.json();
          setSubstatTypes(data);
        }
      } catch (error) {
        console.error("Failed to fetch substat types:", error);
      }
    };

    fetchSubstatTypes();
  }, []);

  const handleFilterUpdate = useCallback(
    (updates: Partial<GearFilters>) => {
      console.log(
        "[GEAR FILTERS DEBUG] handleFilterUpdate called with:",
        updates
      );
      startTransition(() => {
        // Get current filters from URL to merge with updates
        const currentUrl = new URL(window.location.href);
        const currentParams = new URLSearchParams(currentUrl.search);
        const currentState = parseGearSearchParams(currentParams);
        const currentFilters = currentState.filters;

        // Apply updates to current filters using centralized utility
        console.log("[GEAR FILTERS DEBUG] Updates:", updates);
        const mergedFilters = applyFilterUpdates(currentFilters, updates);
        console.log("[GEAR FILTERS DEBUG] Merged filters:", mergedFilters);

        // Convert to GearTableState format
        const tableStateUpdates: Partial<GearTableState> = {
          filters: mergedFilters,
          page: 1, // Reset to first page when filters change
        };

        console.log(
          "[GEAR FILTERS DEBUG] Final tableStateUpdates:",
          tableStateUpdates
        );
        updateFilters(tableStateUpdates);
      });
    },
    [updateFilters]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="type-filter" className="text-sm whitespace-nowrap">
            Gear Type
          </Label>
          <MultiSelect
            options={gearTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            selected={String(searchParams.get("type") || "")
              .split("|")
              .filter(Boolean)}
            onSelectionChange={(selected) => {
              handleFilterUpdate({
                type:
                  selected.length > 0 ? (selected as GearType[]) : undefined,
              });
            }}
            placeholder="Select gear types"
            searchable={true}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Rank</Label>
          {[GearRank.EPIC, GearRank.HEROIC].map((rank) => {
            const currentRanks = String(searchParams.get("rank") || "")
              .split("|")
              .filter(Boolean);
            const isActive = currentRanks.includes(rank);

            return (
              <Button
                key={rank}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={isActive ? "bg-e7-primary" : ""}
                onClick={() => {
                  const newRanks = isActive
                    ? currentRanks.filter((r) => r !== rank)
                    : [...currentRanks, rank];
                  // If all ranks are deselected, show all ranks (no filter)
                  handleFilterUpdate({
                    rank:
                      newRanks.length > 0
                        ? (newRanks as GearRank[])
                        : undefined,
                  });
                }}
              >
                {rank}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="enhance-filter" className="text-sm whitespace-nowrap">
            Enhance
          </Label>
          <Input
            id="enhance-filter"
            type="number"
            min={0}
            max={15}
            value={String(searchParams.get("enhance") || "15")}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                  handleFilterUpdate({ enhance: numValue });
                }
              } else {
                handleFilterUpdate({ enhance: 15 }); // Default to 15
              }
            }}
            className="h-8 w-20"
            placeholder="0-15"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="main-filter" className="text-sm whitespace-nowrap">
            Main Stat
          </Label>
          <MultiSelect
            options={mainStats.map((stat) => ({
              value: stat.value,
              label: stat.label,
            }))}
            selected={String(searchParams.get("mainStatType") || "")
              .split("|")
              .filter(Boolean)}
            onSelectionChange={(selected) => {
              handleFilterUpdate({
                mainStatType:
                  selected.length > 0
                    ? (selected as MainStatType[])
                    : undefined,
              });
            }}
            placeholder="Select main stats"
            searchable={true}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm whitespace-nowrap">Gear Sets</Label>
        <MultiSelect
          options={getGearSetFilterOptions()}
          selected={String(searchParams.get("set") || "")
            .split("|")
            .filter(Boolean)}
          onSelectionChange={(selected) => {
            handleFilterUpdate({ set: selected });
          }}
          placeholder="Select gear sets"
          searchable={true}
        />
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm whitespace-nowrap">Substats</Label>
        <MultiSelect
          options={substatTypes.map((stat) => ({
            value: stat.statName,
            label: stat.statName,
          }))}
          selected={String(searchParams.get("subStats") || "")
            .split("|")
            .filter(Boolean)}
          onSelectionChange={(selected) => {
            handleFilterUpdate({ subStats: selected });
          }}
          placeholder="Select substats"
          searchable={true}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="fscore-grade-filter"
            className="text-sm whitespace-nowrap"
          >
            F Score Grade
          </Label>
          <MultiSelect
            options={scoreGrades.map((grade) => ({
              value: grade.value,
              label: grade.label,
            }))}
            selected={String(searchParams.get("fScoreGrade") || "")
              .split("|")
              .filter(Boolean)}
            onSelectionChange={(selected) => {
              handleFilterUpdate({
                fScoreGrade:
                  selected.length > 0 ? (selected as ScoreGrade[]) : [],
              });
            }}
            placeholder="Select F Score grade"
            searchable={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor="score-grade-filter"
            className="text-sm whitespace-nowrap"
          >
            Score Grade
          </Label>
          <MultiSelect
            options={scoreGrades.map((grade) => ({
              value: grade.value,
              label: grade.label,
            }))}
            selected={String(searchParams.get("scoreGrade") || "")
              .split("|")
              .filter(Boolean)}
            onSelectionChange={(selected) => {
              handleFilterUpdate({
                scoreGrade:
                  selected.length > 0 ? (selected as ScoreGrade[]) : [],
              });
            }}
            placeholder="Select Score grade"
            searchable={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor="substat-grade-filter"
            className="text-sm whitespace-nowrap"
          >
            Substat Grade
          </Label>
          <MultiSelect
            options={scoreGrades.map((grade) => ({
              value: grade.value,
              label: grade.label,
            }))}
            selected={String(searchParams.get("substatGrade") || "")
              .split("|")
              .filter(Boolean)}
            onSelectionChange={(selected) => {
              handleFilterUpdate({
                substatGrade:
                  selected.length > 0 ? (selected as ScoreGrade[]) : [],
              });
            }}
            placeholder="Select substat grade"
            searchable={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label
            htmlFor="substat-count-filter"
            className="text-sm whitespace-nowrap"
          >
            Min Count
          </Label>
          <Input
            id="substat-count-filter"
            type="number"
            min={1}
            max={4}
            value={String(searchParams.get("substatGradeCount") || "1")}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 4) {
                  handleFilterUpdate({ substatGradeCount: numValue });
                }
              } else {
                handleFilterUpdate({ substatGradeCount: 1 });
              }
            }}
            className="h-8 w-16"
            placeholder="1-4"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isPending && (
          <div className="text-sm text-muted-foreground">
            Updating filters...
          </div>
        )}

        {/* Clear all filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Clear all filters by navigating to the base URL
            const url = new URL(window.location.href);
            url.search = "";
            window.location.href = url.toString();
          }}
          className="ml-auto"
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
