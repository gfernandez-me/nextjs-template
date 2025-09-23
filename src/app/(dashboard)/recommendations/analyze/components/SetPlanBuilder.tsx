"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { piecesFor, shouldShowThird, totalPieces } from "../utils";

export function SetPlanBuilder({
  sets,
  setA,
  setB,
  setC,
  onChange,
}: {
  sets: string[];
  setA: string;
  setB: string;
  setC: string;
  onChange: (next: { setA: string; setB: string; setC: string }) => void;
}) {
  const useThird = shouldShowThird(setA, setB);
  const total = totalPieces(setA, setB, setC, useThird);

  return (
    <div className="space-y-2">
      <Label>Set Plan</Label>
      <div className="grid grid-cols-3 gap-2">
        <select
          className="h-9 rounded-md border px-2"
          value={setA}
          onChange={(e) => onChange({ setA: e.target.value, setB, setC })}
        >
          {sets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border px-2"
          value={setB}
          onChange={(e) => onChange({ setA, setB: e.target.value, setC })}
        >
          {sets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {useThird ? (
          <select
            className="h-9 rounded-md border px-2"
            value={setC}
            onChange={(e) => onChange({ setA, setB, setC: e.target.value })}
          >
            <option value="">None</option>
            {sets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-muted-foreground self-center">
            Third set not needed (4+2)
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Total pieces: {total} (must be 6)
      </div>
    </div>
  );
}
