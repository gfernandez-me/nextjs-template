// ============================================================================
// UTILITY FUNCTIONS FOR STATISTICS
// ============================================================================

/**
 * Calculate percentage with safety check for division by zero
 */
export function calculatePercentage(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

/**
 * Calculate completion rate for gear sets
 */
export function calculateCompletionRate(
  totalCount: number,
  equippedCount: number,
  piecesRequired: number
): number {
  if (totalCount < piecesRequired) return 0;
  return Math.min(100, (equippedCount / piecesRequired) * 100);
}

/**
 * Group counts by a specific field and calculate percentages
 */
export function groupAndCalculatePercentages<T extends Record<string, unknown>>(
  items: T[],
  groupBy: keyof T,
  countField: keyof T
): Array<
  {
    [K in keyof T]: T[K];
  } & { count: number; percentage: number }
> {
  const grouped = items.reduce((acc, item) => {
    const key = String(item[groupBy]);
    if (!acc[key]) {
      acc[key] = { count: 0, total: 0 };
    }
    acc[key].count += Number(item[countField]) || 0;
    acc[key].total += 1;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const total = Object.values(grouped).reduce(
    (sum, group) => sum + group.count,
    0
  );

  return Object.entries(grouped).map(([key, group]) => ({
    [groupBy]: key as T[keyof T],
    count: group.count,
    percentage: calculatePercentage(group.count, total),
  })) as Array<
    {
      [K in keyof T]: T[K];
    } & { count: number; percentage: number }
  >;
}

/**
 * Sort items by a numeric field in descending order and limit results
 */
export function sortAndLimit<T>(
  items: T[],
  sortField: keyof T,
  limit: number
): T[] {
  return items
    .sort((a, b) => Number(b[sortField]) - Number(a[sortField]))
    .slice(0, limit);
}
