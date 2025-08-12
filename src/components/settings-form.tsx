"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMainStatLabel } from "@/lib/stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsWithUser } from "@/lib/data-access";

interface SettingsFormProps {
  initialSettings: SettingsWithUser | null;
}

type SettingsDto = {
  id?: number;
  fScoreIncludeMainStat: boolean;
  fScoreSubstatWeights?: Record<string, number> | null;
  fScoreMainStatWeights?: Record<string, number> | null;
  substatThresholds?: Record<string, { plus15?: number[] }> | null;
};

const DEFAULT_SUB_WEIGHTS: Record<string, number> = {
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

const DEFAULT_MAIN_WEIGHTS: Record<string, number> = {
  // mainStatType enum keys
  att: 0,
  def: 0,
  max_hp: 0,
  att_rate: 0.5,
  def_rate: 0.3,
  max_hp_rate: 0.3,
  cri: 0.6,
  cri_dmg: 0.6,
  speed: 1.0,
  acc: 0.4,
  res: 0.4,
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [includeMain, setIncludeMain] = useState(true);
  const [subWeights, setSubWeights] =
    useState<Record<string, number>>(DEFAULT_SUB_WEIGHTS);
  const [mainWeights, setMainWeights] =
    useState<Record<string, number>>(DEFAULT_MAIN_WEIGHTS);
  const [thresholds, setThresholds] = useState<
    Record<string, { plus15: number[] }>
  >({
    Speed: { plus15: [4, 8, 12, 18] },
    "Crit %": { plus15: [4, 8, 12, 16] },
    "Crit Dmg %": { plus15: [4, 8, 12, 20] },
    "Attack %": { plus15: [4, 8, 12, 16] },
    "Defense %": { plus15: [4, 8, 12, 16] },
    "Health %": { plus15: [4, 8, 12, 16] },
    "Effectiveness %": { plus15: [4, 8, 12, 16] },
    "Effect Resist %": { plus15: [4, 8, 12, 16] },
    Attack: { plus15: [20, 40, 60, 90] },
    Defense: { plus15: [10, 20, 30, 45] },
    Health: { plus15: [50, 100, 150, 220] },
  });

  useEffect(() => {
    if (initialSettings) {
      setIncludeMain(Boolean(initialSettings.fScoreIncludeMainStat));
      if (
        initialSettings.fScoreSubstatWeights &&
        typeof initialSettings.fScoreSubstatWeights === "object"
      )
        setSubWeights({
          ...DEFAULT_SUB_WEIGHTS,
          ...(initialSettings.fScoreSubstatWeights as Record<string, number>),
        });
      if (
        initialSettings.fScoreMainStatWeights &&
        typeof initialSettings.fScoreMainStatWeights === "object"
      )
        setMainWeights({
          ...DEFAULT_MAIN_WEIGHTS,
          ...(initialSettings.fScoreMainStatWeights as Record<string, number>),
        });
      if (initialSettings.substatThresholds) {
        const merged: Record<string, { plus15: number[] }> = {
          ...thresholds,
        };
        for (const [k, v] of Object.entries(
          initialSettings.substatThresholds
        )) {
          if (v?.plus15 && Array.isArray(v.plus15) && v.plus15.length === 4) {
            merged[k] = { plus15: v.plus15 as number[] };
          }
        }
        setThresholds(merged);
      }
    }
    setLoading(false);
  }, [initialSettings, thresholds]);

  const formula = useMemo(() => {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(subWeights)) {
      parts.push(`${v}·${k}`);
    }
    const sub = parts.join(" + ");
    const main = includeMain
      ? " + mainStatWeight(mainStatType) · mainStatValue"
      : "";
    return `Custom Score = ${sub}${main}`;
  }, [subWeights, includeMain]);

  async function handleSave() {
    setSaving(true);
    setStatus("Saving...");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fScoreIncludeMainStat: includeMain,
          fScoreSubstatWeights: subWeights,
          fScoreMainStatWeights: mainWeights,
          substatThresholds: thresholds,
        } satisfies SettingsDto),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to save");
      }
      setStatus("Saved. Recalculating...");
      // trigger recalculation
      await fetch("/api/settings/recalculate", { method: "POST" });
      setStatus("All gears recalculated.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(""), 3000);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          aria-label="Save settings and recalculate scores"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Tabs defaultValue="weights">
        <TabsList className="mb-3">
          <TabsTrigger value="weights">Custom Score</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Score configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeMain}
                    onChange={(e) => setIncludeMain(e.target.checked)}
                  />
                  Include main stat in Custom Score
                </Label>
              </div>
              <div>
                <h4 className="font-medium mb-2">Substat weights</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Weights applied to substats like Speed, Crit %, etc.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(subWeights).map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <Label>{name} weight</Label>
                    <Input
                      inputMode="decimal"
                      value={String(value)}
                      onChange={(e) =>
                        setSubWeights((prev) => ({
                          ...prev,
                          [name]: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Main stat weights</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Weights applied to the main stat (Atk %, HP %, Speed, etc.) if
                  included.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mainWeights).map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <Label>{formatMainStatLabel(name)} main weight</Label>
                    <Input
                      inputMode="decimal"
                      value={String(value)}
                      onChange={(e) =>
                        setMainWeights((prev) => ({
                          ...prev,
                          [name]: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thresholds (badge colors, +15)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(thresholds).map(([name, obj]) => (
                  <div key={name} className="space-y-2">
                    <Label>{name}</Label>
                    <div className="grid grid-cols-4 gap-2 items-end">
                      {obj.plus15.map((val, idx) => (
                        <div key={idx} className="space-y-1">
                          <div
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                              idx === 0
                                ? "bg-red-500 text-white"
                                : idx === 1
                                ? "bg-amber-500 text-black"
                                : idx === 2
                                ? "bg-sky-500 text-white"
                                : "bg-violet-600 text-white"
                            }`}
                          >
                            {idx === 0 && "Low"}
                            {idx === 1 && "OK"}
                            {idx === 2 && "Good"}
                            {idx === 3 && "Great"}
                          </div>
                          <Input
                            inputMode="decimal"
                            value={String(val)}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              setThresholds((prev) => {
                                const next = { ...prev } as typeof thresholds;
                                const arr = [
                                  ...(next[name]?.plus15 ?? [0, 0, 0, 0]),
                                ];
                                arr[idx] = v;
                                next[name] = { plus15: arr };
                                return next;
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≤ Low → Red, ≤ OK → Amber, ≤ Good → Sky, ≤ Great → Violet,
                      &gt; Great → Yellow (trophy)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas">
          <Card>
            <CardHeader>
              <CardTitle>Current Custom Score formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="font-mono text-sm break-words">{formula}</div>
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  Fixed Score (Fribbels-style, substats only):
                </div>
                <div className="font-mono">
                  score = 2.0·Speed + 1.5·Crit% + 1.3·Crit Dmg% + 1.2·Atk% +
                  0.8·Def% + 0.8·HP% + 0.7·Eff% + 0.6·ER% + 0.3·Atk + 0.2·Def +
                  0.2·HP
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        {status && (
          <span className="text-sm text-muted-foreground">{status}</span>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          aria-label="Save settings and recalculate scores"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
