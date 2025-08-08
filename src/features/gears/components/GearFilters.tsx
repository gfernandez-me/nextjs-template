"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
// Using a simple checkbox to avoid missing dependency on Switch

const gearTypes = ["Weapon", "Helmet", "Armor", "Necklace", "Ring", "Boots"];
const mainStats = [
  "Atk %",
  "Atk",
  "Def %",
  "Def",
  "HP %",
  "HP",
  "Speed",
  "Crit %",
  "Crit Dmg %",
  "Effectiveness %",
  "Effect Resist %",
];

export type GearFiltersState = {
  q: string;
  type?: string;
  ranks: Set<"Epic" | "Heroic">;
  onlyMaxed: boolean;
  main?: string;
};

export default function GearFilters({
  initial,
  onChange,
}: {
  initial?: Partial<GearFiltersState>;
  onChange?: (next: GearFiltersState) => void;
}) {
  const [q, setQ] = useState(initial?.q ?? "");
  const [type, setType] = useState<string | undefined>(initial?.type);
  const [main, setMain] = useState<string | undefined>(initial?.main);
  const [onlyMaxed, setOnlyMaxed] = useState<boolean>(
    initial?.onlyMaxed ?? false
  );
  const [ranks, setRanks] = useState<Set<"Epic" | "Heroic">>(
    () =>
      new Set((Array.from(initial?.ranks ?? []) as ("Epic" | "Heroic")[]) || [])
  );

  const payload = useMemo<GearFiltersState>(
    () => ({ q, type, main, onlyMaxed, ranks }),
    [q, type, main, onlyMaxed, ranks]
  );

  // Push filters to URL so server can read searchParams
  const applyToUrl = (next: GearFiltersState) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    if (next.type) params.set("type", next.type);
    else params.delete("type");
    const ranksStr = Array.from(next.ranks).join("|");
    if (ranksStr) params.set("rank", ranksStr);
    else params.delete("rank");
    if (next.onlyMaxed) params.set("maxed", "true");
    else params.delete("maxed");
    if (next.main) params.set("main", next.main);
    else params.delete("main");
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", url);
    onChange?.(next);
  };

  return (
    <div className="space-y-4 p-3 border rounded-md bg-[color:var(--card)]">
      <div className="space-y-1">
        <Label>Search</Label>
        <Input
          placeholder="Hero / ingameId..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => applyToUrl(payload)}
        />
      </div>

      <div className="space-y-1">
        <Label>Gear Type</Label>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v);
            applyToUrl({ ...payload, type: v });
          }}
        >
          <SelectTrigger className="w-full h-8">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {gearTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rank</Label>
        <div className="flex gap-2">
          {["Epic", "Heroic"].map((r) => {
            const active = ranks.has(r as "Epic" | "Heroic");
            return (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className={active ? "bg-e7-primary" : ""}
                onClick={() => {
                  const next = new Set(ranks);
                  if (next.has(r as "Epic" | "Heroic"))
                    next.delete(r as "Epic" | "Heroic");
                  else next.add(r as "Epic" | "Heroic");
                  setRanks(next);
                  applyToUrl({ ...payload, ranks: next });
                }}
              >
                {r}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="maxed">Only +15</Label>
        <input
          id="maxed"
          type="checkbox"
          className="h-4 w-4 accent-e7-primary"
          checked={onlyMaxed}
          onChange={(e) => {
            const value = e.target.checked;
            setOnlyMaxed(value);
            applyToUrl({ ...payload, onlyMaxed: value });
          }}
        />
      </div>

      <div className="space-y-1">
        <Label>Main Stat</Label>
        <Select
          value={main}
          onValueChange={(v) => {
            setMain(v);
            applyToUrl({ ...payload, main: v });
          }}
        >
          <SelectTrigger className="w-full h-8">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {mainStats.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-2 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setQ("");
            setType(undefined);
            setMain(undefined);
            setOnlyMaxed(false);
            setRanks(new Set());
            applyToUrl({
              q: "",
              type: undefined,
              main: undefined,
              onlyMaxed: false,
              ranks: new Set(),
            });
          }}
        >
          Reset
        </Button>
        <Button type="button" size="sm" onClick={() => applyToUrl(payload)}>
          Apply
        </Button>
      </div>
    </div>
  );
}
