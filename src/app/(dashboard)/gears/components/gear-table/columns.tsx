/**
 * Table columns definition for the gear table
 */

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Trophy } from "lucide-react";
import type { GearForTable } from "@/dashboard/gears/data/gears";
import { getGearIcon, getRankColor } from "@/components/icons";
import {
  formatMainStatLabel,
  formatMainStatValue,
  abbreviateSubstatLabel,
} from "@/lib/stats";
import { stripPercent } from "@/lib/string-utils";
import { getStatBadge, type StatThresholds } from "@/lib/gear-thresholds";

interface CreateColumnsOptions {
  thresholds: StatThresholds;
}

export function createGearTableColumns({
  thresholds,
}: CreateColumnsOptions): ColumnDef<GearForTable>[] {
  const getStatBadgeWithThresholds = (
    statName: string,
    statValue: number,
    enhance: number
  ) => getStatBadge(statName, statValue, enhance, thresholds);

  return [
    {
      accessorKey: "gear",
      header: () => <span>Type</span>,
      cell: ({ row }) => {
        const iconSymbol = getGearIcon(row.original.type);
        const rankClass = getRankColor(String(row.original.rank));
        const displayName = row.original.type;
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{iconSymbol}</span>
            <span className={`text-xs font-semibold ${rankClass}`}>
              {displayName}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "fScore",
      header: () => <span>F Score</span>,
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        if (value === null) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="font-mono text-xs">{value}</span>;
      },
      enableSorting: true,
      sortingFn: "basic",
    },
    {
      accessorKey: "score",
      header: () => <span>Score</span>,
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        if (value === null) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="font-mono text-xs">{value}</span>;
      },
      enableSorting: true,
      sortingFn: "basic",
    },
    {
      accessorKey: "level",
      header: () => <span>Level</span>,
      enableSorting: true,
    },
    {
      accessorKey: "enhance",
      header: () => <span>Enhance</span>,
      cell: ({ row }) => (
        <span className="text-xs">+{row.getValue<number>("enhance")}</span>
      ),
      enableSorting: true,
    },
    {
      id: "mainStatValue",
      header: () => <span>Main</span>,
      cell: ({ row }) => {
        const mainStatType = row.original.mainStatType;
        const mainStatValue = Number(row.original.mainStatValue);

        if (!mainStatType || !mainStatValue) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <div className="flex items-center gap-2 text-[11px] leading-4">
            <span className="text-muted-foreground capitalize">
              {stripPercent(formatMainStatLabel(mainStatType))}
            </span>
            <span className="font-mono">
              {formatMainStatValue(mainStatType, mainStatValue)}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (a, b) => {
        const aVal = Number(a.original.mainStatValue);
        const bVal = Number(b.original.mainStatValue);
        if (!aVal || !bVal) return 0;
        return aVal - bVal;
      },
    },
    ...[0, 1, 2, 3].map(
      (idx): ColumnDef<GearForTable> => ({
        id: `substat_${idx + 1}`,
        header: () => <span>{`Substat ${idx + 1}`}</span>,
        cell: ({ row }: { row: { original: GearForTable } }) => {
          const s = row.original.GearSubStats[idx];
          if (
            !s ||
            !s.StatType ||
            s.statValue === null ||
            s.statValue === undefined
          ) {
            return <span className="text-muted-foreground">-</span>;
          }

          const badge = getStatBadgeWithThresholds(
            s.StatType.statName,
            Number(s.statValue),
            row.original.enhance
          );

          const statValue = Number(s.statValue);

          return (
            <div className="flex items-center gap-2 text-[11px] leading-4">
                              <span className="text-muted-foreground">
                  {stripPercent(abbreviateSubstatLabel(s.StatType.statName))}
                </span>
              {badge ? (
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${badge.className}`}
                >
                  {badge.icon === "low" && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {badge.icon === "high" && <Trophy className="h-3 w-3" />}
                  {badge.label}
                </span>
              ) : (
                <span className="font-mono tabular-nums">
                  {statValue.toString()}
                  {s.StatType.statCategory === "PERCENTAGE" ? "%" : ""}
                </span>
              )}
            </div>
          );
        },
        enableSorting: true,
        sortingFn: (a, b) => {
          const sa = a.original.GearSubStats[idx]?.statValue ?? -Infinity;
          const sb = b.original.GearSubStats[idx]?.statValue ?? -Infinity;
          const saNum = Number(sa);
          const sbNum = Number(sb);
          if (!saNum || !sbNum) return 0;
          return saNum - sbNum;
        },
      })
    ),
    {
      id: "equipped",
      header: () => <span>Equipped</span>,
      cell: ({ row }) => {
        const hero = row.original.Hero;
        if (!hero?.name) return <span className="text-xs" />;
        return (
          <span className="text-xs font-medium truncate max-w-[160px]">
            {hero.name}
          </span>
        );
      },
      enableSorting: true,
      sortingFn: (a, b) => {
        const na = a.original.Hero?.name || "";
        const nb = b.original.Hero?.name || "";
        return na.localeCompare(nb);
      },
      enableColumnFilter: true,
      filterFn: (row, _columnId, value) => {
        if (!value) return true;
        const name = row.original.Hero?.name || "";
        return name === value;
      },
    },
  ] as ColumnDef<GearForTable>[];
}
