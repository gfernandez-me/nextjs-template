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
import type { GearRow } from "@/app/lib/gear";
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
import {
  abbreviateSubstatLabel,
  formatMainStatLabel,
  formatMainStatValue,
} from "@/lib/stats";
import { getGearIcon, getRankColor } from "@/components/icons";
// Using native <img> for hero portraits to allow simple onError fallback

export type GearWithRelations = GearRow;

export function GearTable({ rows }: { rows: GearWithRelations[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo(
    () =>
      [
        {
          id: "type",
          header: () => <span>Type</span>,
          cell: ({ row }) => {
            const iconSymbol = getGearIcon(row.original.gear);
            return (
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{iconSymbol}</span>
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
        ...[0, 1, 2, 3].map(
          (idx): ColumnDef<GearRow> => ({
            id: `substat_${idx + 1}`,
            header: () => <span>{`Substat ${idx + 1}`}</span>,
            cell: ({ row }: { row: { original: GearRow } }) => {
              const s = row.original.substats[idx];
              if (!s) return <span className="text-muted-foreground">-</span>;
              return (
                <div className="flex items-center gap-2 text-[11px] leading-4">
                  <span className="text-muted-foreground">
                    {abbreviateSubstatLabel(s.statType.statName)}
                  </span>
                  <span className="font-mono tabular-nums">
                    {s.statValue.toString()}
                    {s.statType.statCategory === "percentage" ? "%" : ""}
                  </span>
                </div>
              );
            },
          })
        ),
        {
          id: "equipped",
          header: () => <span>Equipped</span>,
          cell: ({ row }) => {
            const hero = row.original.hero;
            if (!hero?.name) return <span className="text-xs" />;
            const slug = hero.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/-+/, "-")
              .replace(/(^-|-$)/g, "");
            const icon = `/images/heroes/portraits/${slug}.png`;
            return (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={icon}
                    alt={hero.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      t.onerror = null;
                      t.src = "/images/gears/unknown.svg";
                    }}
                  />
                </div>
                <span className="text-xs font-medium truncate max-w-[160px]">
                  {hero.name}
                </span>
              </div>
            );
          },
          enableSorting: true,
        },
      ] as ColumnDef<GearRow>[],
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
    </div>
  );
}
