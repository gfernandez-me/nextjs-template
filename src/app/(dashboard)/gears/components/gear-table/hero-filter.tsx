/**
 * Hero filter component for the gear table
 */

"use client";

import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { ChevronsUpDown, X } from "lucide-react";
import type { GearWithFullRelations } from "@/dashboard/gears/data/gears";

interface HeroFilterProps {
  gears: GearWithFullRelations[];
}

export function HeroFilter({ gears }: HeroFilterProps) {
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
    for (const r of gears) {
      const n = r.Hero?.name?.trim();
      if (n) set.add(n);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [gears]);

  const handleHeroSelect = (heroName: string) => {
    setHeroFilter(heroName);
    setHeroQuery(heroName);
    const url = new URL(window.location.href);
    url.searchParams.set("hero", heroName);
    window.location.href = url.toString();
  };

  const handleClearHero = () => {
    setHeroFilter(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("hero");
    window.location.href = url.toString();
  };

  const handleHeroQueryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const q = heroQuery.trim();
      const url = new URL(window.location.href);
      if (q) url.searchParams.set("hero", q);
      else url.searchParams.delete("hero");
      window.location.href = url.toString();
    }
  };

  return (
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
                onKeyDown={handleHeroQueryKeyDown}
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
                    onClick={() => handleHeroSelect(h)}
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
        onClick={handleClearHero}
        disabled={!heroFilter}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
