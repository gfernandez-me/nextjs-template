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

export type GearWithRelations = GearRow;

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
      const n = r.hero?.name?.trim();
      if (n) set.add(n);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  function computeFribbelsLikeScore(row: GearRow): number {
    // Basic additive score using stat type weights if present; fallback naive weights
    // Business rules recommend weight-based scoring; do not persist
    let score = 0;
    for (const s of row.substats) {
      const isPercent = s.statType.statCategory === "percentage";
      const weight =
        typeof s.statType.weight === "number" ? s.statType.weight : 1;
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
    for (const s of row.substats) {
      const name = s.statType.statName;
      const w = weights[name] ?? 1;
      score += Number(s.statValue) * w;
    }
    return Math.round(score * 100) / 100;
  }

  function stripPercent(label: string): string {
    return label.replace(/\s*%$/, "");
  }

  function getGearAbbrev(type: string): string {
    switch (type) {
      case "Weapon":
        return "WPN";
      case "Helmet":
        return "HELM";
      case "Armor":
        return "ARM";
      case "Necklace":
        return "NECK";
      case "Ring":
        return "RING";
      case "Boots":
        return "BOOT";
      default:
        return type.slice(0, 4).toUpperCase();
    }
  }

  function getSpeedTierBadge(
    value: number,
    enhance: number
  ): {
    label: string;
    className: string;
    icon?: "low" | "high";
  } | null {
    // Only rate +15 and +0 explicitly; others return null (neutral)
    if (enhance === 15) {
      if (value <= 0)
        return { label: "0", className: "bg-gray-400 text-white" };
      if (value >= 1 && value <= 4)
        return {
          label: String(value),
          className: "bg-red-500 text-white",
          icon: "low",
        };
      if (value >= 5 && value <= 8)
        return { label: String(value), className: "bg-amber-500 text-black" };
      if (value >= 9 && value <= 12)
        return { label: String(value), className: "bg-sky-500 text-white" };
      if (value >= 13 && value <= 18)
        return { label: String(value), className: "bg-violet-600 text-white" };
      if (value > 18)
        return {
          label: String(value),
          className: "bg-yellow-500 text-black",
          icon: "high",
        };
      return { label: String(value), className: "bg-gray-400 text-white" };
    }
    if (enhance === 0) {
      if (value <= 1)
        return {
          label: String(value),
          className: "bg-red-500 text-white",
          icon: "low",
        };
      if (value <= 3)
        return { label: String(value), className: "bg-amber-500 text-black" };
      if (value <= 5)
        return { label: String(value), className: "bg-sky-500 text-white" };
      if (value <= 8)
        return { label: String(value), className: "bg-violet-600 text-white" };
      return {
        label: String(value),
        className: "bg-yellow-500 text-black",
        icon: "high",
      };
    }
    return null;
  }

  const columns = React.useMemo(
    () =>
      [
        {
          accessorKey: "gear",
          header: () => <span>Type</span>,
          cell: ({ row }) => {
            const iconSymbol = getGearIcon(row.original.gear);
            const rankClass = getRankColor(String(row.original.rank));
            const abbrev = getGearAbbrev(row.original.gear);
            return (
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{iconSymbol}</span>
                {/* Keep color indicator without duplicating text */}
                <span className={`text-xs font-semibold ${rankClass}`}>●</span>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-foreground text-background">
                  {abbrev}
                </span>
              </div>
            );
          },
          enableSorting: true,
          enableColumnFilter: false,
        },
        {
          id: "fscore",
          header: () => <span>F Score</span>,
          cell: ({ row }) => {
            const r = row.original as GearRow & { fScore?: number | null };
            const val =
              typeof r.fScore === "number"
                ? r.fScore
                : computeFribbelsLikeScore(r);
            return <span className="font-mono text-xs">{val}</span>;
          },
          enableSorting: true,
          sortingFn: (a, b) => {
            const ra = a.original as GearRow & { fScore?: number | null };
            const rb = b.original as GearRow & { fScore?: number | null };
            const va =
              typeof ra.fScore === "number"
                ? ra.fScore
                : computeFribbelsLikeScore(ra);
            const vb =
              typeof rb.fScore === "number"
                ? rb.fScore
                : computeFribbelsLikeScore(rb);
            return va - vb;
          },
        },
        {
          id: "score",
          header: () => <span>Score</span>,
          cell: ({ row }) => {
            const r = row.original as GearRow & { score?: number | null };
            const val =
              typeof r.score === "number" ? r.score : computeCustomScore(r);
            return <span className="font-mono text-xs">{val}</span>;
          },
          enableSorting: true,
          sortingFn: (a, b) => {
            const ra = a.original as GearRow & { score?: number | null };
            const rb = b.original as GearRow & { score?: number | null };
            const va =
              typeof ra.score === "number" ? ra.score : computeCustomScore(ra);
            const vb =
              typeof rb.score === "number" ? rb.score : computeCustomScore(rb);
            return va - vb;
          },
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
              const s = row.original.substats[idx];
              if (!s) return <span className="text-muted-foreground">-</span>;
              const isSpeed = s.statType.statName === "Speed";
              const speedBadge = isSpeed
                ? getSpeedTierBadge(Number(s.statValue), row.original.enhance)
                : null;
              return (
                <div className="flex items-center gap-2 text-[11px] leading-4">
                  <span className="text-muted-foreground">
                    {stripPercent(abbreviateSubstatLabel(s.statType.statName))}
                  </span>
                  {isSpeed && speedBadge ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${speedBadge.className}`}
                    >
                      {speedBadge.icon === "low" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {speedBadge.icon === "high" && (
                        <Trophy className="h-3 w-3" />
                      )}
                      {speedBadge.label}
                    </span>
                  ) : (
                    <span className="font-mono tabular-nums">
                      {s.statValue.toString()}
                      {s.statType.statCategory === "percentage" ? "%" : ""}
                    </span>
                  )}
                </div>
              );
            },
            enableSorting: true,
            sortingFn: (a, b) => {
              const sa = a.original.substats[idx]?.statValue ?? -Infinity;
              const sb = b.original.substats[idx]?.statValue ?? -Infinity;
              return Number(sa) - Number(sb);
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
          sortingFn: (a, b) => {
            const na = a.original.hero?.name || "";
            const nb = b.original.hero?.name || "";
            return na.localeCompare(nb);
          },
          enableColumnFilter: true,
          filterFn: (row, _columnId, value) => {
            if (!value) return true;
            const name = row.original.hero?.name || "";
            return name === value;
          },
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
          fscore: "fscore",
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
      fscore: "fscore",
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
