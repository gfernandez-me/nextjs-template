/**
 * Settings form component - refactored for better maintainability
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import type { SettingsWithUser } from "@/dashboard/settings/data/settings";
import { WeightEditor } from "./weight-editor";
import { ThresholdEditor } from "./threshold-editor";
// WeightEditor and ThresholdEditor components will be implemented later

interface SettingsFormProps {
  initialSettings: SettingsWithUser | null;
}

type SettingsDto = {
  id?: number;
  fScoreIncludeMainStat: boolean;
  fScoreSubstatWeights?: Record<string, number> | null;
  fScoreMainStatWeights?: Record<string, number> | null;
  substatThresholds?: Record<string, { plus15?: number[] }> | null;
  minScore: number;
  maxScore: number;
  minFScore: number;
  maxFScore: number;
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

const DEFAULT_THRESHOLDS: Record<string, { plus15: number[] }> = {
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
  const [thresholds, setThresholds] =
    useState<Record<string, { plus15: number[] }>>(DEFAULT_THRESHOLDS);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [minFScore, setMinFScore] = useState(0);
  const [maxFScore, setMaxFScore] = useState(100);

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
        const next: Record<string, { plus15: number[] }> = {
          ...DEFAULT_THRESHOLDS,
        };
        for (const [k, v] of Object.entries(
          initialSettings.substatThresholds
        )) {
          if (v?.plus15 && Array.isArray(v.plus15)) {
            next[k] = { plus15: v.plus15 as number[] };
          }
        }
        setThresholds(next);
      }

      // Load score thresholds
      if (initialSettings.minScore !== null)
        setMinScore(initialSettings.minScore);
      if (initialSettings.maxScore !== null)
        setMaxScore(initialSettings.maxScore);
      if (initialSettings.minFScore !== null)
        setMinFScore(initialSettings.minFScore);
      if (initialSettings.maxFScore !== null)
        setMaxFScore(initialSettings.maxFScore);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setStatus("");

    try {
      const settingsData: SettingsDto = {
        id: initialSettings?.id,
        fScoreIncludeMainStat: includeMain,
        fScoreSubstatWeights: subWeights,
        fScoreMainStatWeights: mainWeights,
        substatThresholds: thresholds,
        minScore,
        maxScore,
        minFScore,
        maxFScore,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setStatus("Settings saved successfully!");
    } catch (error) {
      setStatus(
        `Error saving settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculateScores = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scores/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to recalculate scores");
      }

      const result = await response.json();
      setStatus("Scores recalculated successfully!");
      console.log("Score calculation result:", result);
    } catch (error) {
      setStatus(
        `Error recalculating scores: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scoring Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeMain"
              checked={includeMain}
              onChange={(e) => setIncludeMain(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="includeMain">
              Include main stat in F-Score calculation
            </Label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="weights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weights">Weights</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="score-thresholds">Score Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="weights" className="space-y-4">
          <WeightEditor
            title="Substat Weights"
            weights={subWeights}
            onWeightsChange={setSubWeights}
          />

          <WeightEditor
            title="Main Stat Weights"
            weights={mainWeights}
            onWeightsChange={setMainWeights}
          />
        </TabsContent>

        <TabsContent value="thresholds">
          <ThresholdEditor
            thresholds={thresholds}
            onThresholdsChange={setThresholds}
          />
        </TabsContent>

        <TabsContent value="score-thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minScore">Minimum Score</Label>
                  <input
                    type="number"
                    id="minScore"
                    value={minScore}
                    onChange={(e) =>
                      setMinScore(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxScore">Expected Score</Label>
                  <input
                    type="number"
                    id="maxScore"
                    value={maxScore}
                    onChange={(e) =>
                      setMaxScore(parseFloat(e.target.value) || 100)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minFScore">Minimum F-Score</Label>
                  <input
                    type="number"
                    id="minFScore"
                    value={minFScore}
                    onChange={(e) =>
                      setMinFScore(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFScore">Expected F-Score</Label>
                  <input
                    type="number"
                    id="maxFScore"
                    value={maxFScore}
                    onChange={(e) =>
                      setMaxFScore(parseFloat(e.target.value) || 100)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>

        <Button
          onClick={handleRecalculateScores}
          disabled={loading}
          variant="outline"
        >
          {loading ? "Recalculating..." : "Recalculate Scores"}
        </Button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-md ${
            status.includes("Error")
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status}
        </div>
      )}
    </div>
  );
}
