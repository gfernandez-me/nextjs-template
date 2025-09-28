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
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import type { GearForTable } from "@/lib/dal/gears";
import { HeroFilter } from "./gear-table/hero-filter";
import { Pagination } from "./gear-table/pagination";
import { createGearTableColumns } from "./gear-table/columns";

// Client-side component for showing sort indicators
function SortIndicator({ columnId }: { columnId: string }) {
  const [sortInfo, setSortInfo] = React.useState<{
    sort: string | null;
    dir: string | null;
  }>({ sort: null, dir: null });

  React.useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      const currentSort = currentUrl.searchParams.get("sort");
      const currentDir = currentUrl.searchParams.get("dir");
      setSortInfo({ sort: currentSort, dir: currentDir });
    }
  }, []);

  if (sortInfo.sort === columnId) {
    return <span>{sortInfo.dir === "asc" ? " ▲" : " ▼"}</span>;
  }
  return null;
}
import { type StatThresholds } from "@/lib/gear-thresholds";
import { useGearSearchParams } from "@/lib/url-hooks";

export function GearTable({
  gears,
  totalCount,
  pageCount,
  currentPage,
  pageSize,
  thresholds,
  scoreThresholds,
}: {
  gears: GearForTable[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  thresholds?: StatThresholds;
  scoreThresholds?: {
    minScore: number;
    maxScore: number;
    minFScore: number;
    maxFScore: number;
  };
}) {
  const { updateSearchParams } = useGearSearchParams();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Create columns with thresholds
  const columns = React.useMemo(
    () => createGearTableColumns({ thresholds, scoreThresholds }),
    [thresholds, scoreThresholds]
  );

  const table = useReactTable({
    data: gears,
    columns,
    state: {
      columnFilters,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // no global text filter
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // No client-side sorting - all sorting is handled server-side

  // Handle page change
  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

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
                    className="whitespace-nowrap p-2 cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => {
                      // Only run in browser
                      if (typeof window !== "undefined") {
                        const currentUrl = new URL(window.location.href);
                        const currentSort = currentUrl.searchParams.get("sort");
                        const currentDir = currentUrl.searchParams.get("dir");

                        // Toggle sorting direction if same column, otherwise start with asc
                        let newDir = "asc";
                        if (currentSort === header.id) {
                          newDir = currentDir === "asc" ? "desc" : "asc";
                        }

                        currentUrl.searchParams.set("sort", header.id);
                        currentUrl.searchParams.set("dir", newDir);
                        currentUrl.searchParams.set("page", "1"); // Reset to first page when sorting

                        window.location.href = currentUrl.toString();
                      }
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* Show current sort indicator */}
                    <SortIndicator columnId={header.id} />
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
        onPageChange={handlePageChange}
      />
    </div>
  );
}
