"use client";

import React, { useState, useMemo } from "react";
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
import { useRouter } from "next/navigation";
import type { SettingsWithUser } from "@/app/(dashboard)/settings/data/settings";

interface UploadFormProps {
  userSettings: SettingsWithUser | null;
}

export function UploadForm({ userSettings }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".txt")) {
      setFile(selectedFile);
      setUploadStatus("");
    } else {
      setUploadStatus("Please select a valid .txt file");
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading and processing gear data...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`Success! Imported ${result.count || 0} gear items.`);
        setTimeout(() => {
          router.push("/");
        }, 2000);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📤 Upload Gear Data
          </CardTitle>
          <CardDescription>
            Upload your gear.txt file from Fribbels Epic 7 Optimizer to import
            gear data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Gear Data File</Label>
              <Input
                id="file"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Select the gear.txt file exported from Fribbels Epic 7 Optimizer
              </p>
            </div>

            {file && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Selected File:</h4>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

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

            <Button
              type="submit"
              disabled={!file || isUploading}
              className="w-full"
            >
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

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Export from Fribbels Optimizer</h4>
            <p className="text-sm text-muted-foreground">
              Open Fribbels Epic 7 Optimizer, go to the Importer tab, and use
              &quot;Save/Load all optimizer data&quot; to export your gear data
              as a .txt file.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Upload the File</h4>
            <p className="text-sm text-muted-foreground">
              Select the exported .txt file using the file picker above. The
              file should contain JSON data with your gear information.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Import Process</h4>
            <p className="text-sm text-muted-foreground">
              The system will automatically parse the gear data, validate it
              against Epic 7 standards, and import it into your gear database.
              You&apos;ll be redirected to the home page to view your gear.
            </p>
          </div>
        </CardContent>
      </Card>

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
