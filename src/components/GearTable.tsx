"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Prisma } from "#prisma";
import type { GearRow } from "@/features/gears/server/queries";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  abbreviateSubstatLabel,
  formatMainStatLabel,
  formatMainStatValue,
} from "@/lib/stats";

// Using the narrowed select shape from server queries
export type GearWithRelations = GearRow;

function getGearIcon(gearType: string) {
  switch (gearType.toLowerCase()) {
    case "weapon":
      return "/images/gears/weapon.svg";
    case "armor":
      return "/images/gears/armor.svg";
    case "helmet":
    case "helm":
      return "/images/gears/helmet.svg";
    case "necklace":
    case "neck":
      return "/images/gears/necklace.svg";
    case "ring":
      return "/images/gears/ring.svg";
    case "boots":
    case "boot":
      return "/images/gears/boots.svg";
    default:
      return "/images/gears/unknown.svg";
  }
}

function getRankColor(rank: string) {
  switch (rank.toLowerCase()) {
    case "common":
      return "text-gray-500";
    case "uncommon":
      return "text-green-600";
    case "rare":
      return "text-blue-600";
    case "epic":
      return "text-purple-600";
    case "heroic":
      return "text-orange-600";
    default:
      return "text-gray-500";
  }
}

export function GearTable({ rows }: { rows: GearWithRelations[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<GearRow>[]>(
    () => [
      {
        id: "type",
        header: () => <span>Type</span>,
        cell: ({ row }) => {
          const iconSrc = getGearIcon(row.original.gear);
          return (
            <div className="flex items-center gap-2">
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt={String(row.original.gear)}
                  className="w-5 h-5"
                  onError={(e) => {
                    (
                      e.currentTarget as HTMLImageElement
                    ).outerHTML = `<span class='text-xl'>${
                      row.original.gear === "Weapon"
                        ? "⚔️"
                        : row.original.gear === "Armor"
                        ? "🛡️"
                        : row.original.gear === "Helmet"
                        ? "🪖"
                        : row.original.gear === "Necklace"
                        ? "📿"
                        : row.original.gear === "Ring"
                        ? "💍"
                        : row.original.gear === "Boots"
                        ? "🥾"
                        : "❓"
                    }`;
                  }}
                />
              ) : (
                <span className="text-xl">❓</span>
              )}
              <span className="text-xs">{row.original.gear}</span>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "rank",
        header: () => <span>Rank</span>,
        cell: ({ row }) => (
          <span
            className={`font-medium ${getRankColor(
              String(row.getValue("rank"))
            )}`}
          >
            {String(row.getValue("rank"))}
          </span>
        ),
        enableSorting: true,
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
        id: "mainStat",
        header: () => <span>Main Stat</span>,
        cell: ({ row }) => (
          <span className="text-xs capitalize">
            {formatMainStatLabel(row.original.mainStatType)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: "mainValue",
        header: () => <span>Main Value</span>,
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {formatMainStatValue(
              row.original.mainStatType,
              row.original.mainStatValue
            )}
          </span>
        ),
        enableSorting: true,
      },
      ...[0, 1, 2, 3].map<ColumnDef<GearRow>>((idx) => ({
        id: `substat_${idx + 1}`,
        header: () => <span>{`Substat ${idx + 1}`}</span>,
        cell: ({ row }) => {
          const s = row.original.substats[idx];
          if (!s) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center justify-between text-[11px] leading-4">
              <span className="text-muted-foreground">
                {abbreviateSubstatLabel(s.statType.statName)}
              </span>
              <span className="font-mono">
                {s.statValue.toString()}
                {s.statType.statCategory === "percentage" ? "%" : ""}
              </span>
            </div>
          );
        },
      })),
      {
        id: "equipped",
        header: () => <span>Equipped</span>,
        cell: ({ row }) => {
          const hero = row.original.hero;
          if (!hero?.name) return <span className="text-xs" />;
          const base = "/images/heroes";
          const safeName = hero.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const icon = `${base}/icons/${safeName}.svg`;
          return (
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={icon}
                  alt={hero.name}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    (
                      e.currentTarget as HTMLImageElement
                    ).src = `${base}/icons/placeholder.svg`;
                  }}
                />
              </div>
              <span className="text-xs font-medium">{hero.name}</span>
            </div>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-8"
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap p-2 cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getIsSorted() === "asc" ? " ▲" : ""}
                    {header.column.getIsSorted() === "desc" ? " ▼" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="text-xs">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination handled at page-level via URL controls */}
    </div>
  );
}
