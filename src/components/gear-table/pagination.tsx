/**
 * Gear table specific pagination wrapper
 */

import { Pagination as GenericPagination } from "@/components/ui/pagination";

interface GearTablePaginationProps {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export function Pagination({
  totalCount,
  pageCount,
  currentPage,
  pageSize,
}: GearTablePaginationProps) {
  return (
    <GenericPagination
      totalCount={totalCount}
      pageCount={pageCount}
      currentPage={currentPage}
      pageSize={pageSize}
      className="text-xs"
    />
  );
}
