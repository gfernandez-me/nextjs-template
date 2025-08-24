/**
 * Component for editing scoring weights in settings
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightEditorProps {
  title: string;
  weights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
  className?: string;
}

export function WeightEditor({
  title,
  weights,
  onWeightsChange,
  className = "",
}: WeightEditorProps) {
  const handleWeightChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onWeightsChange({
        ...weights,
        [key]: numValue,
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm font-medium">
                {key}
              </Label>
              <Input
                id={key}
                type="number"
                step="0.1"
                min="0"
                value={value}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                className="h-8"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
