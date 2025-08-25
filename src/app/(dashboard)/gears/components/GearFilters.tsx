/**
 * Gear filters component that updates URL parameters for server-side filtering
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */

"use client";

import { useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedGearSearchParams } from "@/lib/url-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GearTableState, type GearFilters } from "@/lib/url";
import { GearType, MainStatType, GearRank } from "#prisma";

// Use Prisma enums instead of hardcoded strings
const gearTypes = [
  { value: "All", label: "Any" },
  { value: GearType.WEAPON, label: "Weapon" },
  { value: GearType.HELM, label: "Helm" },
  { value: GearType.ARMOR, label: "Armor" },
  { value: GearType.NECK, label: "Necklace" },
  { value: GearType.RING, label: "Ring" },
  { value: GearType.BOOTS, label: "Boots" },
];

const mainStats = [
  { value: "All", label: "Any" },
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

export function GearFilters() {
  const [isPending, startTransition] = useTransition();
  const updateFilters = useDebouncedGearSearchParams(300);
  const searchParams = useSearchParams();

  const handleFilterUpdate = useCallback(
    (updates: Partial<GearFilters>) => {
      startTransition(() => {
        // Convert to GearTableState format
        const tableStateUpdates: Partial<GearTableState> = {
          filters: {},
          page: 1, // Reset to first page when filters change
        };

        // Type-safe filter updates
        if (updates.name !== undefined)
          tableStateUpdates.filters!.name = updates.name;
        if (updates.type !== undefined)
          tableStateUpdates.filters!.type = updates.type;
        if (updates.rank !== undefined)
          tableStateUpdates.filters!.rank = updates.rank;
        if (updates.level !== undefined)
          tableStateUpdates.filters!.level = updates.level;
        if (updates.enhance !== undefined)
          tableStateUpdates.filters!.enhance = updates.enhance;
        if (updates.mainStatType !== undefined)
          tableStateUpdates.filters!.mainStatType = updates.mainStatType;
        if (updates.subStats !== undefined)
          tableStateUpdates.filters!.subStats = updates.subStats;

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
          <Select
            value={searchParams.get("type") || "All"}
            onValueChange={(value) =>
              handleFilterUpdate({
                type: value === "All" ? undefined : (value as GearType),
              })
            }
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gearTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Rank</Label>
          {[GearRank.EPIC, GearRank.HEROIC].map((rank) => {
            const currentRanks = searchParams.get("rank")?.split("|") || [];
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
                  handleFilterUpdate({ rank: newRanks as GearRank[] });
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
            defaultValue={searchParams.get("enhance") || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const numValue = parseInt(value, 10);
                if (!isNaN(numValue)) {
                  handleFilterUpdate({ enhance: numValue });
                }
              } else {
                handleFilterUpdate({ enhance: undefined });
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
          <Select
            value={searchParams.get("mainStatType") || "All"}
            onValueChange={(value) =>
              handleFilterUpdate({ mainStatType: value as MainStatType })
            }
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mainStats.map((stat) => (
                <SelectItem key={stat.value} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm whitespace-nowrap">Substats</Label>
        {[0, 1, 2, 3].map((idx) => (
          <Select
            key={idx}
            value={
              (searchParams.get("subStats") || "").split("|")[idx] || "All"
            }
            onValueChange={(value) => {
              const parts = (searchParams.get("subStats") || "")
                .split("|")
                .filter(Boolean);
              if (value !== "All") {
                parts[idx] = value;
              } else {
                parts.splice(idx, 1);
              }
              handleFilterUpdate({ subStats: parts });
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mainStats.map((stat) => (
                <SelectItem key={`${idx}-${stat.value}`} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground">Updating filters...</div>
      )}
    </div>
  );
}
