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
import type { GearRow } from "@/lib/data-access";
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
// Lightweight inline combobox using basic UI primitives to avoid missing shadcn modules
import { ChevronsUpDown, X, AlertTriangle, Trophy } from "lucide-react";
import {
  abbreviateSubstatLabel,
  formatMainStatLabel,
  formatMainStatValue,
} from "@/lib/stats";
import { getGearIcon, getRankColor } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";
// Using native <img> for hero portraits to allow simple onError fallback
import type { GearWithRelations } from "@/lib/data-access";

export function GearTable({ rows }: { rows: GearWithRelations[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [heroOpen, setHeroOpen] = React.useState(false);
  const [heroFilter, setHeroFilter] = React.useState<string | null>(null);
  const [heroQuery, setHeroQuery] = React.useState<string>("");
  const [heroResults, setHeroResults] = React.useState<string[]>([]);

  // Initialize hero filter from URL (?hero=...)
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get("hero");
      if (q) {
        setHeroFilter(q);
        setHeroQuery(q);
      }
    } catch {
      // no-op
    }
  }, []);

  // Fetch hero options as the user types inside the combobox
  React.useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const run = async () => {
      try {
        const params = new URLSearchParams();
        if (heroQuery) params.set("q", heroQuery);
        params.set("limit", "50");
        const res = await fetch(`/api/heroes?${params.toString()}` as string, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { names?: string[] };
        if (!ignore) setHeroResults(data.names ?? []);
      } catch {
        // ignore
      }
    };
    if (heroOpen) run();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [heroQuery, heroOpen]);

  const heroOptions = React.useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const r of rows) {
      const n = r.Hero?.name?.trim();
      if (n) set.add(n);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  function computeFribbelsLikeScore(row: GearRow): number {
    // Basic additive score using stat type weights if present; fallback naive weights
    // Business rules recommend weight-based scoring; do not persist
    let score = 0;
    for (const s of row.GearSubStats) {
      const isPercent = s.StatType.statCategory === "PERCENTAGE";
      const weight =
        typeof s.StatType.weight === "number" ? s.StatType.weight : 1;
      const value = isPercent ? Number(s.statValue) : Number(s.statValue);
      score += value * weight;
    }
    return Math.round(score * 100) / 100;
  }

  function computeCustomScore(row: GearRow): number {
    // Example: emphasize speed/crit/crit dmg/atk% as typical DPS weights
    const weights: Record<string, number> = {
      Speed: 2.0,
      "Crit %": 1.5,
      "Crit Dmg %": 1.3,
      "Attack %": 1.2,
      "Defense %": 0.8,
      "Health %": 0.8,
      "Effectiveness %": 0.7,
      "Effect Resist %": 0.6,
      Attack: 0.3,
      Defense: 0.2,
      Health: 0.2,
    };
    let score = 0;
    for (const s of row.GearSubStats) {
      const name = s.StatType.statName;
      const w = weights[name] ?? 1;
      score += Number(s.statValue) * w;
    }
    return Math.round(score * 100) / 100;
  }

  function stripPercent(label: string): string {
    return label.replace(/\s*%$/, "");
  }

  const [thresholds, setThresholds] = React.useState<Record<string, number[]>>(
    {}
  );

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          substatThresholds?: Record<string, { plus15?: number[] }>;
        } | null;
        const t: Record<string, number[]> = {};
        const raw = data?.substatThresholds ?? {};
        for (const [k, v] of Object.entries(raw)) {
          const arr = Array.isArray(v?.plus15) ? (v?.plus15 as number[]) : [];
          if (arr.length) t[k] = arr;
        }
        // Fallbacks
        if (!t["Speed"]) t["Speed"] = [4, 8, 12, 18];
        if (!t["Crit %"]) t["Crit %"] = [4, 8, 12, 16];
        if (!t["Crit Dmg %"]) t["Crit Dmg %"] = [4, 8, 12, 20];
        if (!t["Attack %"]) t["Attack %"] = [4, 8, 12, 16];
        if (!t["Defense %"]) t["Defense %"] = [4, 8, 12, 16];
        if (!t["Health %"]) t["Health %"] = [4, 8, 12, 16];
        if (!t["Effectiveness %"]) t["Effectiveness %"] = [4, 8, 12, 16];
        if (!t["Effect Resist %"]) t["Effect Resist %"] = [4, 8, 12, 16];
        if (!t["Attack"]) t["Attack"] = [20, 40, 60, 90];
        if (!t["Defense"]) t["Defense"] = [10, 20, 30, 45];
        if (!t["Health"]) t["Health"] = [50, 100, 150, 220];
        setThresholds(t);
      } catch {
        // ignore
      }
    })();
  }, []);

  const getStatBadge = React.useCallback(
    (
      name: string,
      value: number,
      enhance: number
    ): { label: string; className: string; icon?: "low" | "high" } | null => {
      const th = thresholds[name];
      if (!th || enhance !== 15) return null;
      const [t1, t2, t3, t4] = th;
      if (value <= 0)
        return { label: "0", className: "bg-gray-400 text-white" };
      if (value <= t1)
        return {
          label: String(value),
          className: "bg-red-500 text-white",
          icon: "low",
        };
      if (value <= t2)
        return { label: String(value), className: "bg-amber-500 text-black" };
      if (value <= t3)
        return { label: String(value), className: "bg-sky-500 text-white" };
      if (value <= t4)
        return { label: String(value), className: "bg-violet-600 text-white" };
      return {
        label: String(value),
        className: "bg-yellow-500 text-black",
        icon: "high",
      };
    },
    [thresholds]
  );

  const columns = React.useMemo(
    () =>
      [
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
          id: "fScore",
          header: () => <span>F Score</span>,
          accessorFn: (row: GearRow) =>
            typeof (row as GearRow & { fScore?: number | null }).fScore ===
            "number"
              ? (row as GearRow & { fScore?: number | null }).fScore
              : computeFribbelsLikeScore(row),
          cell: ({ getValue }) => (
            <span className="font-mono text-xs">{getValue<number>()}</span>
          ),
          enableSorting: true,
          sortingFn: "basic",
        },
        {
          id: "score",
          header: () => <span>Score</span>,
          accessorFn: (row: GearRow) =>
            typeof (row as GearRow & { score?: number | null }).score ===
            "number"
              ? (row as GearRow & { score?: number | null }).score
              : computeCustomScore(row),
          cell: ({ getValue }) => (
            <span className="font-mono text-xs">{getValue<number>()}</span>
          ),
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
          cell: ({ row }) => (
            <div className="flex items-center gap-2 text-[11px] leading-4">
              <span className="text-muted-foreground capitalize">
                {stripPercent(formatMainStatLabel(row.original.mainStatType))}
              </span>
              <span className="font-mono">
                {formatMainStatValue(
                  row.original.mainStatType,
                  row.original.mainStatValue
                )}
              </span>
            </div>
          ),
          enableSorting: true,
          sortingFn: (a, b) =>
            Number(a.original.mainStatValue) - Number(b.original.mainStatValue),
        },
        ...[0, 1, 2, 3].map(
          (idx): ColumnDef<GearRow> => ({
            id: `substat_${idx + 1}`,
            header: () => <span>{`Substat ${idx + 1}`}</span>,
            cell: ({ row }: { row: { original: GearRow } }) => {
              const s = row.original.GearSubStats[idx];
              if (!s) return <span className="text-muted-foreground">-</span>;
              const badge = getStatBadge(
                s.StatType.statName,
                Number(s.statValue),
                row.original.enhance
              );
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
                      {s.statValue.toString()}
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
              return Number(sa) - Number(sb);
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
      ] as ColumnDef<GearRow>[],
    [getStatBadge]
  );

  const table = useReactTable({
    data: rows,
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
        <div className="relative">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={heroOpen}
            className="h-8 w-[240px] justify-between text-xs"
            onClick={() => setHeroOpen((v) => !v)}
          >
            {heroFilter || "Filter by hero..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          {heroOpen && (
            <div className="absolute z-10 mt-1 w-[280px] rounded-md border bg-background shadow">
              <div className="p-2">
                <Input
                  placeholder="Search hero..."
                  className="h-8 text-xs"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const q = heroQuery.trim();
                      const url = new URL(window.location.href);
                      if (q) url.searchParams.set("hero", q);
                      else url.searchParams.delete("hero");
                      window.location.href = url.toString();
                    }
                  }}
                />
              </div>
              <div className="max-h-64 overflow-auto p-1">
                <div id="hero-list">
                  {(heroResults.length ? heroResults : heroOptions).map((h) => (
                    <button
                      key={h}
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded"
                      data-hero-item
                      data-value={h}
                      onClick={() => {
                        setHeroFilter(h);
                        setHeroQuery(h);
                        const url = new URL(window.location.href);
                        url.searchParams.set("hero", h);
                        window.location.href = url.toString();
                      }}
                    >
                      {h}
                    </button>
                  ))}
                  {(heroResults.length ? heroResults : heroOptions).length ===
                    0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      No heroes found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => {
            setHeroFilter(null);
            const url = new URL(window.location.href);
            url.searchParams.delete("hero");
            window.location.href = url.toString();
          }}
          disabled={!heroFilter}
        >
          <X className="h-4 w-4" />
        </Button>
        {/* Removed generic text filter */}
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
    </div>
  );
}
