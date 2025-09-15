/**
 * Hero filter component for the gear table
 */

"use client";

import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";
import type { GearWithFullRelations } from "@/dashboard/gears/data/gears";

interface HeroFilterProps {
  gears: GearWithFullRelations[];
}

interface HeroOption {
  id: number;
  name: string;
  count: number;
  element?: string | null;
  class?: string | null;
}

export function HeroFilter({ gears }: HeroFilterProps) {
  const [heroOpen, setHeroOpen] = React.useState(false);
  const [heroQuery, setHeroQuery] = React.useState<string>("");
  const [heroResults, setHeroResults] = React.useState<HeroOption[]>([]);
  const [selectedHero, setSelectedHero] = React.useState<HeroOption | null>(
    null
  );

  // Initialize hero filter from URL (?hero=...)
  React.useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const heroId = url.searchParams.get("hero");
      if (heroId) {
        const parsedId = parseInt(heroId, 10);
        if (!isNaN(parsedId)) {
          // Fetch hero information from API instead of relying on current gear data
          const fetchHeroInfo = async () => {
            try {
              const res = await fetch(`/api/heroes/search?limit=1000`);
              if (res.ok) {
                const data = await res.json();
                const hero = data.heroes?.find(
                  (h: HeroOption) => h.id === parsedId
                );
                if (hero) {
                  setHeroQuery(hero.name);
                  setSelectedHero(hero);
                } else {
                  // Hero not found, clear the invalid parameter
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.delete("hero");
                  window.history.replaceState({}, "", newUrl.toString());
                  toast.error(
                    `Hero with ID ${parsedId} not found. Filter cleared.`
                  );
                }
              }
            } catch (error) {
              console.error("Error fetching hero info:", error);
              // Fallback: try to find in current gear data
              const hero = gears.find((g) => g.Hero?.id === parsedId)?.Hero;
              if (hero) {
                setHeroQuery(hero.name);
                setSelectedHero({
                  id: hero.id,
                  name: hero.name,
                  count: hero.duplicateCount || 1,
                  element: hero.element,
                  class: hero.class,
                });
              } else {
                // Hero not found, clear the invalid parameter
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("hero");
                window.history.replaceState({}, "", newUrl.toString());
                toast.error(
                  `Hero with ID ${parsedId} not found. Filter cleared.`
                );
              }
            }
          };
          fetchHeroInfo();
        } else {
          // Invalid hero ID, clear the parameter
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("hero");
          window.history.replaceState({}, "", newUrl.toString());
          toast.error(
            `Invalid hero ID: "${heroId}". Please select a hero from the dropdown.`
          );
        }
      }
    } catch {
      // no-op
    }
  }, [gears]);

  // Fetch hero options as the user types inside the combobox
  React.useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const run = async () => {
      try {
        const params = new URLSearchParams();
        if (heroQuery) params.set("q", heroQuery);
        params.set("limit", "50");
        const res = await fetch(
          `/api/heroes/search?${params.toString()}` as string,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { heroes?: HeroOption[] };
        if (!ignore) setHeroResults(data.heroes ?? []);
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

  const heroOptions = React.useMemo<HeroOption[]>(() => {
    const heroMap = new Map<number, HeroOption>();
    for (const gear of gears) {
      if (gear.Hero) {
        const hero = gear.Hero;
        if (!heroMap.has(hero.id)) {
          heroMap.set(hero.id, {
            id: hero.id,
            name: hero.name.trim(),
            count: hero.duplicateCount || 1,
            element: hero.element,
            class: hero.class,
          });
        }
      }
    }
    return Array.from(heroMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [gears]);

  const handleHeroSelect = (hero: HeroOption) => {
    setHeroQuery(hero.name);
    setSelectedHero(hero);
    const url = new URL(window.location.href);
    url.searchParams.set("hero", hero.id.toString());
    window.location.href = url.toString();
  };

  const handleClearHero = () => {
    setHeroQuery("");
    setSelectedHero(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("hero");
    window.location.href = url.toString();
  };

  const handleHeroQueryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const q = heroQuery.trim();
      if (q) {
        // Find the first hero matching the query
        const matchingHero = heroOptions.find((hero) =>
          hero.name.toLowerCase().includes(q.toLowerCase())
        );
        if (matchingHero) {
          const url = new URL(window.location.href);
          url.searchParams.set("hero", matchingHero.id.toString());
          window.location.href = url.toString();
        }
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("hero");
        window.location.href = url.toString();
      }
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
          {selectedHero
            ? `${selectedHero.name}${
                selectedHero.count > 1 ? ` (${selectedHero.count})` : ""
              }`
            : "Filter by hero..."}
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
                {(heroResults.length ? heroResults : heroOptions).map(
                  (hero) => (
                    <button
                      key={hero.id}
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded"
                      data-hero-item
                      data-value={hero.name}
                      onClick={() => handleHeroSelect(hero)}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {hero.name}
                          {hero.count > 1 ? ` (${hero.count})` : ""}
                        </span>
                        {hero.element && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {hero.element} • {hero.class}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                )}
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
        disabled={!selectedHero}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
