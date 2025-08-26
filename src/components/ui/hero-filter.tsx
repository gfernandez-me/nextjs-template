"use client";

import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { ChevronsUpDown, X } from "lucide-react";

interface HeroFilterProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

interface HeroNameWithIndex {
  name: string;
  key: string;
  hero: {
    id: number;
    name: string;
    element: string | null;
    class: string | null;
  };
}

export function HeroFilter({
  value,
  onValueChange,
  placeholder = "Select a hero...",
  className = "",
}: HeroFilterProps) {
  const [heroOpen, setHeroOpen] = React.useState(false);
  const [heroQuery, setHeroQuery] = React.useState<string>(value || "");
  const [heroResults, setHeroResults] = React.useState<HeroNameWithIndex[]>([]);

  // Fetch hero options as the user types inside the combobox
  React.useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const run = async () => {
      try {
        const params = new URLSearchParams();
        if (heroQuery) params.set("q", heroQuery);
        params.set("limit", "50");
        const res = await fetch(`/api/heroes?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          heroNamesWithIndex?: HeroNameWithIndex[];
        };
        if (!ignore) setHeroResults(data.heroNamesWithIndex ?? []);
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

  const handleHeroSelect = (heroName: string) => {
    onValueChange(heroName);
    setHeroQuery(heroName);
    setHeroOpen(false);
  };

  const handleClearHero = () => {
    onValueChange(null);
    setHeroQuery("");
  };

  const handleHeroQueryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const q = heroQuery.trim();
      if (q) {
        onValueChange(q);
        setHeroOpen(false);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={heroOpen}
          className="h-10 w-[240px] justify-between"
          onClick={() => setHeroOpen((v) => !v)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        {heroOpen && (
          <div className="absolute z-10 mt-1 w-[280px] rounded-md border bg-background shadow">
            <div className="p-2">
              <Input
                placeholder="Search hero..."
                className="h-8"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                onKeyDown={handleHeroQueryKeyDown}
              />
            </div>
            <div className="max-h-64 overflow-auto p-1">
              <div id="hero-list">
                {heroResults.map((h) => (
                  <button
                    key={h.key}
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded"
                    data-hero-item
                    data-value={h.name}
                    onClick={() => handleHeroSelect(h.name)}
                  >
                    {h.name}
                  </button>
                ))}
                {heroResults.length === 0 && (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    No heroes found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-10"
          onClick={handleClearHero}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
