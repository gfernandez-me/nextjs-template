/**
 * Table columns definition for the gear table
 */

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { GearForTable } from "@/dashboard/gears/data/gears";
import {
  formatMainStatLabel,
  formatMainStatValue,
  abbreviateSubstatLabel,
} from "@/lib/stats";
import { stripPercent } from "@/lib/string-utils";
import { type StatThresholds } from "@/lib/gear-thresholds";
import {
  formatScoreWithColor,
  getGearTypeIcon,
  getGearRankClasses,
  formatSubstatWithColor,
} from "@/lib/score-colors";

interface CreateColumnsOptions {
  thresholds?: StatThresholds;
  scoreThresholds?: {
    minScore: number;
    maxScore: number;
    minFScore: number;
    maxFScore: number;
  };
}

export function createGearTableColumns({
  thresholds,
  scoreThresholds,
}: CreateColumnsOptions): ColumnDef<GearForTable>[] {
  return [
    {
      accessorKey: "gear",
      header: () => <span>Type</span>,
      cell: ({ row }) => {
        const iconSymbol = getGearTypeIcon(row.original.type);
        const rankClasses = getGearRankClasses(String(row.original.rank));
        const displayName = row.original.type;
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{iconSymbol}</span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${rankClasses}`}
            >
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
        const scoreData = formatScoreWithColor(value);

        return (
          <div className="flex items-center justify-center">
            <span
              className={`font-mono text-xs px-2 py-1 rounded border ${scoreData.className}`}
              style={scoreData.style}
            >
              {scoreData.value}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (a, b) => {
        const aVal = a.original.fScore;
        const bVal = b.original.fScore;
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        return aVal - bVal;
      },
    },
    {
      accessorKey: "score",
      header: () => <span>Score</span>,
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        const scoreData = formatScoreWithColor(value);

        return (
          <div className="flex items-center justify-center">
            <span
              className={`font-mono text-xs px-2 py-1 rounded border ${scoreData.className}`}
              style={scoreData.style}
            >
              {scoreData.value}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (a, b) => {
        const aVal = a.original.score;
        const bVal = b.original.score;
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        return aVal - bVal;
      },
    },
    {
      accessorKey: "level",
      header: () => <span>Level</span>,
      enableSorting: true,
      sortingFn: (a, b) => {
        const aVal = Number(a.original.level);
        const bVal = Number(b.original.level);
        if (!aVal || !bVal) return 0;
        return aVal - bVal;
      },
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
        const enhance = row.original.enhance;

        if (!mainStatType || !mainStatValue) {
          return <span className="text-muted-foreground">-</span>;
        }

        console.log(`[DEBUG] MAIN: ${mainStatType}=${mainStatValue}`);
        const mainStatData = formatSubstatWithColor(
          mainStatType,
          mainStatValue,
          enhance
        );

        return (
          <div className="flex items-center gap-2 text-[11px] leading-4">
            <span className="text-muted-foreground capitalize">
              {stripPercent(formatMainStatLabel(mainStatType))}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${mainStatData.className}`}
              style={mainStatData.style}
            >
              <span className="tabular-nums">
                {formatMainStatValue(mainStatType, mainStatValue)}
              </span>
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

          const statValue = Number(s.statValue);
          const substatData = formatSubstatWithColor(
            s.StatType.statName,
            statValue,
            row.original.enhance
          );

          return (
            <div className="flex items-center gap-2 text-[11px] leading-4">
              <span className="text-muted-foreground">
                {stripPercent(abbreviateSubstatLabel(s.StatType.statName))}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${substatData.className}`}
                style={substatData.style}
              >
                <span className="tabular-nums">
                  {substatData.value}
                  {s.StatType.statCategory === "PERCENTAGE" ? "%" : ""}
                </span>
              </span>
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
