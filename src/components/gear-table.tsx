/**
 * Main gear table component - refactored for better maintainability
 */

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
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import type { GearWithRelations } from "@/lib/data-access";
import { HeroFilter } from "./gear-table/hero-filter";
import { Pagination } from "./gear-table/pagination";
import { createGearTableColumns } from "./gear-table/columns";
import {
  fetchStatThresholds,
  type StatThresholds,
} from "@/lib/gear-thresholds";

export function GearTable({
  gears,
  totalCount,
  pageCount,
  currentPage,
  pageSize,
}: {
  gears: GearWithRelations[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [thresholds, setThresholds] = React.useState<StatThresholds>({});

  // Load stat thresholds from server
  React.useEffect(() => {
    fetchStatThresholds().then(setThresholds);
  }, []);

  // Create columns with thresholds
  const columns = React.useMemo(
    () => createGearTableColumns({ thresholds }),
    [thresholds]
  );

  const table = useReactTable({
    data: gears,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // no global text filter
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Initialize sorting from URL on mount
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const sort = url.searchParams.get("sort");
      const dir = url.searchParams.get("dir");
      if (sort) {
        const reverseMap: Record<string, string> = {
          gear: "type",
          heroName: "equipped",
          score: "score",
          fScore: "fScore",
        };
        const id = reverseMap[sort] ?? sort;
        setSorting([{ id, desc: dir !== "asc" }]);
      }
    } catch {}
  }, []);

  // Sync sorting to URL for server-side sorting (including score columns)
  React.useEffect(() => {
    const s = sorting[0];
    const url = new URL(window.location.href);
    if (!s) {
      url.searchParams.delete("sort");
      url.searchParams.delete("dir");
      router.replace(`${pathname}?${url.searchParams.toString()}`);
      return;
    }
    const map: Record<string, string> = {
      gear: "gear",
      level: "level",
      enhance: "enhance",
      mainStatValue: "mainStatValue",
      fScore: "fScore",
      score: "score",
      equipped: "heroName",
    };
    const sortBy = map[s.id] || s.id;
    if (!sortBy) return;
    url.searchParams.set("sort", sortBy);
    url.searchParams.set("dir", s.desc ? "desc" : "asc");
    router.replace(`${pathname}?${url.searchParams.toString()}`);
  }, [sorting, router, pathname]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <HeroFilter gears={gears} />
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="p-4 text-center text-muted-foreground"
                >
                  No gears found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="text-xs">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        totalCount={totalCount}
        pageCount={pageCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
