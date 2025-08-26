/**
 * Gear table specific pagination wrapper
 */

import { Pagination as GenericPagination } from "@/components/ui/pagination";

interface GearTablePaginationProps {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  totalCount,
  pageCount,
  currentPage,
  pageSize,
  onPageChange,
}: GearTablePaginationProps) {
  return (
    <GenericPagination
      totalCount={totalCount}
      pageCount={pageCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={onPageChange}
      className="text-xs"
    />
  );
}
