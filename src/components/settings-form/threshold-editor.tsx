/**
 * Component for editing stat thresholds in settings
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThresholdEditorProps {
  thresholds: Record<string, { plus15: number[] }>;
  onThresholdsChange: (thresholds: Record<string, { plus15: number[] }>) => void;
  className?: string;
}

export function ThresholdEditor({
  thresholds,
  onThresholdsChange,
  className = "",
}: ThresholdEditorProps) {
  const handleThresholdChange = (statName: string, index: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const newThresholds = { ...thresholds };
      if (!newThresholds[statName]) {
        newThresholds[statName] = { plus15: [0, 0, 0, 0] };
      }
      newThresholds[statName].plus15[index] = numValue;
      onThresholdsChange(newThresholds);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Stat Thresholds (+15)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(thresholds).map(([statName, threshold]) => (
          <div key={statName} className="space-y-2">
            <Label className="text-sm font-medium">{statName}</Label>
            <div className="grid grid-cols-4 gap-2">
              {threshold.plus15.map((value, index) => (
                <Input
                  key={index}
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => handleThresholdChange(statName, index, e.target.value)}
                  className="h-8 text-center"
                  placeholder={`T${index + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
