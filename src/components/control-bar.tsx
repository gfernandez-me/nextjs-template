"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const gearTypes = [
  "All",
  "Weapon",
  "Helmet",
  "Armor",
  "Necklace",
  "Ring",
  "Boots",
];
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

type ControlState = {
  type?: string;
  ranks: Set<"Epic" | "Heroic">;
  onlyMaxed: boolean;
  main?: string;
};

export default function ControlBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Initialize from URL so the control is controlled from first render
  const [type, setType] = useState<string>(sp.get("type") ?? "");
  const [enhance, setEnhance] = useState<string>(sp.get("enhance") ?? "");
  const [ranks, setRanks] = useState<Set<"Epic" | "Heroic">>(() => {
    const raw = sp.get("rank");
    const set = new Set<"Epic" | "Heroic">();
    if (raw)
      raw
        .split("|")
        .forEach((r) => (r === "Epic" || r === "Heroic") && set.add(r));
    return set;
  });
  const [main, setMain] = useState<string>(sp.get("main") ?? "");
  // no more expandable panel; all filters visible

  const payload = useMemo<ControlState>(
    () => ({ type, onlyMaxed: false, ranks, main }),
    [type, ranks, main]
  );

  const applyToUrl = (next: ControlState) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", "1");
    if (next.type) params.set("type", next.type);
    else params.delete("type");
    const ranksStr = Array.from(next.ranks).join("|");
    if (ranksStr) params.set("rank", ranksStr);
    else params.delete("rank");
    const e = enhance.trim();
    if (e !== "" && /^\d+$/.test(e)) {
      const n = Math.min(15, Math.max(0, parseInt(e, 10)));
      params.set("enhance", String(n));
    } else {
      params.delete("enhance");
    }
    if (next.main) params.set("main", next.main);
    else params.delete("main");
    const url = `${pathname}?${params.toString()}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Gear Type</Label>
          <Select
            value={type || undefined}
            onValueChange={(v) => {
              const nextType = v === "All" ? "" : v;
              setType(nextType);
              applyToUrl({ ...payload, type: nextType });
            }}
          >
            <SelectTrigger className="h-8 w-40">
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

        <div className="flex items-center gap-2">
          <Label className="text-xs">Rank</Label>
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

        <div className="flex items-center gap-2">
          <Label className="text-xs" htmlFor="enhance-input">
            Enhance
          </Label>
          <input
            id="enhance-input"
            type="number"
            min={0}
            max={15}
            value={enhance}
            onChange={(e) => {
              setEnhance(e.target.value);
              applyToUrl(payload);
            }}
            className="h-8 w-20 border rounded px-2"
            placeholder="0-15"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs">Main Stat</Label>
          <Select
            value={main || undefined}
            onValueChange={(v) => {
              setMain(v);
              applyToUrl({ ...payload, main: v });
            }}
          >
            <SelectTrigger className="h-8 w-48">
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
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs">Substats</Label>
        {[0, 1, 2, 3].map((idx) => (
          <Select
            key={idx}
            value={(sp.get("subs") ?? "").split("|")[idx] || undefined}
            onValueChange={(v) => {
              const parts = (sp.get("subs") ?? "").split("|").filter(Boolean);
              parts[idx] = v;
              const params = new URLSearchParams(sp.toString());
              params.set("subs", parts.slice(0, 4).filter(Boolean).join("|"));
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
            }}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder={`Any`} />
            </SelectTrigger>
            <SelectContent>
              {mainStats.map((s) => (
                <SelectItem key={`${idx}-${s}`} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
