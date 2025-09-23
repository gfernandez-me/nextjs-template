"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";
import { uploadSchema } from "../schema";
import type { SettingsWithUser } from "@/app/(dashboard)/settings/data/settings";

interface UploadFormProps {
  userSettings: SettingsWithUser | null;
}

export function UploadForm({ userSettings }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [summary, setSummary] = useState<{
    count: number;
    gearCount: number;
    heroCount: number;
    durationMs: number;
    message: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

    // Validate file using schema
    try {
      uploadSchema.parse({ file });
    } catch (error) {
      if (error instanceof Error) {
        setUploadStatus(`Validation error: ${error.message}`);
      }
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading and processing gear data...");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const result = (await response.json()) as {
          count?: number;
          gearCount?: number;
          heroCount?: number;
          durationMs?: number;
          message?: string;
        };
        const imported = result.count || 0;
        setSummary({
          count: imported,
          gearCount: result.gearCount || imported,
          heroCount: result.heroCount || 0,
          durationMs: result.durationMs || 0,
          message: result.message || "Upload completed",
        });
        setUploadStatus(
          `Success! Imported ${imported} items. A detailed summary is shown below. Log files were written to upload-gear-log.txt and upload-hero-log.txt.`
        );
      } else {
        const error = await response.json();
        setUploadStatus(`Error: ${error.message || "Upload failed"}`);
      }
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : "Upload failed"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const subWeights = useMemo(
    () =>
      ({
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
        ...(userSettings?.fScoreSubstatWeights &&
        typeof userSettings.fScoreSubstatWeights === "object"
          ? (userSettings.fScoreSubstatWeights as Record<string, number>)
          : {}),
      } as Record<string, number>),
    [userSettings]
  );

  const includeMain = Boolean(userSettings?.fScoreIncludeMainStat ?? true);
  const mainWeights = useMemo(
    () =>
      ({
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
        ...(userSettings?.fScoreMainStatWeights &&
        typeof userSettings.fScoreMainStatWeights === "object"
          ? (userSettings.fScoreMainStatWeights as Record<string, number>)
          : {}),
      } as Record<string, number>),
    [userSettings]
  );

  const fFormula = useMemo(() => {
    const parts = Object.entries(subWeights).map(([k, v]) => `${v}·${k}`);
    const base = parts.join(" + ");
    return includeMain
      ? `${base} + mainWeight(${Object.entries(mainWeights)
          .map(([k, v]) => `${k}:${v}`)
          .join(", ")}) · mainStatValue`
      : base;
  }, [subWeights, includeMain, mainWeights]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📤 Upload Gear Data
              </CardTitle>
              <CardDescription>
                Upload your gear.txt file from Fribbels Epic 7 Optimizer to
                import gear data
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Help">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>How to upload</DialogTitle>
                  <DialogDescription>
                    Follow these steps to export and upload your data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <h4 className="font-medium">
                      1. Export from Fribbels Optimizer
                    </h4>
                    <p>
                      Open Fribbels, go to Importer, and use "Save/Load all
                      optimizer data" to export a .txt file.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">2. Upload the file</h4>
                    <p>
                      Select the exported .txt file using the picker below. The
                      file must contain JSON.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">3. Results</h4>
                    <p>
                      When finished, a summary is shown on this page. Detailed
                      logs are written to upload-gear-log.txt and
                      upload-hero-log.txt.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Gear Data File</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".txt"
                className="cursor-pointer"
                required
              />
              <p className="text-sm text-muted-foreground">
                Select the gear.txt file exported from Fribbels Epic 7 Optimizer
              </p>
            </div>

            {uploadStatus && (
              <div
                className={`p-4 rounded-lg ${
                  uploadStatus.startsWith("Error")
                    ? "bg-destructive/10 text-destructive"
                    : uploadStatus.startsWith("Success")
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {uploadStatus}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Processing...
                </span>
              ) : (
                "Upload and Import Gear Data"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
            <CardDescription>
              Results for the last upload operation
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <span className="font-medium">Imported gears:</span>{" "}
              {summary.count}
            </div>
            <div>
              <span className="font-medium">Total gears processed:</span>{" "}
              {summary.gearCount}
            </div>
            <div>
              <span className="font-medium">Heroes processed:</span>{" "}
              {summary.heroCount}
            </div>
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {Math.round(summary.durationMs / 1000)}s
            </div>
            <div className="md:col-span-2">
              <span className="font-medium">Status:</span> {summary.message}
            </div>
            <div className="md:col-span-2 text-muted-foreground">
              Detailed logs saved to <code>upload-gear-log.txt</code> and
              <code> upload-hero-log.txt</code> in the project root.
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How scores are calculated</CardTitle>
          <CardDescription>
            These reflect your current configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">
              Custom Score (configurable)
            </h4>
            <p>
              Weighted sum of substats{includeMain ? " + main stat" : ""},
              rounded to 2 decimals.
            </p>
            <p className="font-mono text-foreground break-words">
              Custom Score = {fFormula}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">
              Score (fixed weighted)
            </h4>
            <p>Weighted sum of substats only, rounded to 2 decimals.</p>
            <p className="font-mono text-foreground">
              score = 2.0·Speed + 1.5·Crit% + 1.3·Crit Dmg% + 1.2·Atk% +
              0.8·Def% + 0.8·HP% + 0.7·Eff% + 0.6·ER% + 0.3·Atk + 0.2·Def +
              0.2·HP
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
