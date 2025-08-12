"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMainStatLabel } from "@/lib/stats";

type GearSet = { id: number; setName: string };
type StatType = { id: number; statName: string };
const GEAR_TYPES = ["weapon", "helm", "armor", "neck", "ring", "boot"] as const;
const MAIN_BY_TYPE: Record<string, string[]> = {
  weapon: ["att"],
  helm: ["max_hp"],
  armor: ["def"],
  neck: [
    "att",
    "def",
    "max_hp",
    "att_rate",
    "def_rate",
    "max_hp_rate",
    "cri",
    "cri_dmg",
  ],
  ring: [
    "att",
    "def",
    "max_hp",
    "att_rate",
    "def_rate",
    "max_hp_rate",
    "acc",
    "res",
  ],
  boot: [
    "att",
    "def",
    "max_hp",
    "att_rate",
    "def_rate",
    "max_hp_rate",
    "speed",
  ],
};

export function GearPrioritiesForm({
  gearSets,
  substats,
  mainStatTypes,
}: {
  gearSets: GearSet[];
  substats: StatType[];
  mainStatTypes: string[];
}) {
  const [form, setForm] = useState({
    name: "",
    gearType: "",
    gearSetIds: [] as string[],
    mainStatTypes: [] as string[],
    prioritySub1Id: "",
    prioritySub2Id: "",
    prioritySub3Id: "",
    prioritySub4Id: "",
    heroIngameIds: [] as string[],
    isActive: "true",
  });

  const [heroOptions, setHeroOptions] = useState<
    Array<{ name: string; ingameId: string }>
  >([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/heroes?full=1&limit=500", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          heroes: { name: string; ingameId: string }[];
        };
        setHeroOptions(data.heroes ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      gearType: form.gearType || null,
      gearSetIds: form.gearSetIds.map((v) => Number(v)),
      mainStatTypes: form.mainStatTypes,
      prioritySub1Id: form.prioritySub1Id ? Number(form.prioritySub1Id) : null,
      prioritySub2Id: form.prioritySub2Id ? Number(form.prioritySub2Id) : null,
      prioritySub3Id: form.prioritySub3Id ? Number(form.prioritySub3Id) : null,
      prioritySub4Id: form.prioritySub4Id ? Number(form.prioritySub4Id) : null,
      heroIngameIds: form.heroIngameIds,
      isActive: form.isActive === "true",
    };
    const res = await fetch("/api/gear-priorities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      window.location.reload();
    }
  }

  const SubSelect = ({
    value,
    onChange,
    name,
  }: {
    value: string;
    onChange: (val: string) => void;
    name: string;
  }) => (
    <div className="space-y-1">
      <Label htmlFor={name}>{name}</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select substat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {substats.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.statName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g., ML Ken DPS, Generic Speed Setter"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="gearType">Gear Type</Label>
        <Select
          value={form.gearType}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, gearType: v === "__none__" ? "" : v }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {/* no Any option, required */}
            {GEAR_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "neck" ? "necklace" : t === "boot" ? "boots" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="gearSet">Gear Set(s)</Label>
        <select
          multiple
          className="w-full h-24 border rounded p-2 text-sm"
          value={form.gearSetIds}
          onChange={(e) => {
            const el = e.target as HTMLSelectElement | null;
            const values = el
              ? Array.from(el.selectedOptions).map((o) => o.value)
              : [];
            setForm((f) => ({ ...f, gearSetIds: values }));
          }}
          required
        >
          {gearSets.map((g) => (
            <option key={g.id} value={String(g.id)}>
              {g.setName.replace(/Set$/, "")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="mainStatType">Main Stat(s)</Label>
        <select
          multiple
          className="w-full h-24 border rounded p-2 text-sm"
          value={form.mainStatTypes}
          onChange={(e) => {
            const el = e.target as HTMLSelectElement | null;
            const values = el
              ? Array.from(el.selectedOptions).map((o) => o.value)
              : [];
            setForm((f) => ({ ...f, mainStatTypes: values }));
          }}
          required
        >
          {(form.gearType ? MAIN_BY_TYPE[form.gearType] : mainStatTypes).map(
            (m) => (
              <option key={m} value={m}>
                {formatMainStatLabel(m)}
              </option>
            )
          )}
        </select>
      </div>

      <SubSelect
        name="Priority Sub 1"
        value={form.prioritySub1Id}
        onChange={(v) => setForm((f) => ({ ...f, prioritySub1Id: v }))}
      />
      <SubSelect
        name="Priority Sub 2"
        value={form.prioritySub2Id}
        onChange={(v) => setForm((f) => ({ ...f, prioritySub2Id: v }))}
      />
      <SubSelect
        name="Priority Sub 3"
        value={form.prioritySub3Id}
        onChange={(v) => setForm((f) => ({ ...f, prioritySub3Id: v }))}
      />
      <SubSelect
        name="Priority Sub 4"
        value={form.prioritySub4Id}
        onChange={(v) => setForm((f) => ({ ...f, prioritySub4Id: v }))}
      />

      <div className="space-y-1">
        <Label htmlFor="heroSearch">Heroes (optional)</Label>
        <div className="border rounded p-2 space-y-2">
          <Input
            id="heroSearch"
            placeholder="Type to filter heroes"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              const list = heroOptions.filter((h) =>
                (h.name || "").toLowerCase().includes(q)
              );
              // We do not mutate the original; show filtered options only
              const selectEl = document.getElementById(
                "hero-multiselect"
              ) as HTMLSelectElement | null;
              if (selectEl) {
                const values = Array.from(selectEl.selectedOptions).map(
                  (o) => o.value
                );
                selectEl.innerHTML = list
                  .map(
                    (h) =>
                      `<option value="${String(h.ingameId)}">${h.name}</option>`
                  )
                  .join("");
                for (const v of values) {
                  const opt = Array.from(selectEl.options).find(
                    (o) => o.value === v
                  );
                  if (opt) opt.selected = true;
                }
              }
            }}
          />
          <select
            id="hero-multiselect"
            multiple
            className="w-full h-40 border rounded p-2 text-sm"
            value={form.heroIngameIds}
            onChange={(e) => {
              const el = e.target as HTMLSelectElement | null;
              const values = el
                ? Array.from(el.selectedOptions).map((o) => o.value)
                : [];
              setForm((f) => ({ ...f, heroIngameIds: values }));
            }}
          >
            {heroOptions.map((h) => (
              <option key={h.ingameId} value={String(h.ingameId)}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="isActive">Active</Label>
        <Select
          value={form.isActive}
          onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-3">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
