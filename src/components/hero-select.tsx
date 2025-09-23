"use client";

import React from "react";
import { Input } from "@/components/ui/input";

export type HeroOption = { id: number; name: string };

interface HeroSelectProps {
  value?: HeroOption | null;
  onChange: (hero: HeroOption | null) => void;
}

export function HeroSelect({ value, onChange }: HeroSelectProps) {
  const [query, setQuery] = React.useState<string>(value?.name ?? "");
  const [options, setOptions] = React.useState<HeroOption[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("limit", "50");
        console.log("[HERO SELECT DEBUG] fetch", params.toString());
        const res = await fetch(`/api/heroes/search?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { heroes?: HeroOption[] };
        console.log("[HERO SELECT DEBUG] results", data.heroes?.length ?? 0);
        setOptions(data.heroes ?? []);
      } catch {
        /* ignore */
      }
    };
    run();
    return () => controller.abort();
  }, [query]);

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Search hero by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        className="h-9 rounded-md border px-2"
        value={value?.id ?? ""}
        onChange={(e) => {
          const id = Number(e.target.value || 0);
          const found = options.find((h) => h.id === id) || null;
          onChange(found);
        }}
      >
        <option value="">Select hero</option>
        {options.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </select>
    </div>
  );
}
