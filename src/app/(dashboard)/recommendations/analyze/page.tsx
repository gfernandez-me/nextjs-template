"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainStatType } from "#prisma";
import { GEAR_SETS } from "@/lib/gear-sets";
import { HeroSelect, type HeroOption } from "@/components/hero-select";
import { SetPlanBuilder } from "./components/SetPlanBuilder";
import { buildPlanFromSelectors, shouldShowThird, totalPieces } from "./utils";

type MinimalBuildSpec = {
  heroId?: number;
  heroName: string;
  targetSpeed?: number;
  targetAtk?: number;
  targetHp?: number;
  targetDef?: number;
  targetEff?: number;
  targetRes?: number;
  setPlan: string; // e.g., "Speed4+HP2"
  bootsMain: MainStatType | "ANY";
};

export default function AnalyzeRecommendationsPage() {
  const [spec, setSpec] = React.useState<MinimalBuildSpec>({
    heroId: undefined,
    heroName: "",
    targetSpeed: undefined,
    targetAtk: undefined,
    targetHp: undefined,
    targetDef: undefined,
    targetEff: undefined,
    targetRes: undefined,
    setPlan: "Speed4+HP2",
    bootsMain: "SPEED" as unknown as MainStatType,
  });
  const [submitted, setSubmitted] = React.useState<MinimalBuildSpec | null>(
    null
  );
  const [serverResult, setServerResult] = React.useState<any>(null);
  const [heroOptions, setHeroOptions] = React.useState<
    Array<{ id: number; name: string }>
  >([]);
  const [sets, setSets] = React.useState<string[]>([]);
  const [setA, setSetA] = React.useState<string>("SpeedSet");
  const [setB, setSetB] = React.useState<string>("HealthSet");
  const [setC, setSetC] = React.useState<string>("");

  React.useEffect(() => {
    try {
      const names = Object.keys(GEAR_SETS ?? {});
      setSets(names);
    } catch (e) {
      console.log("[ANALYZE DEBUG] failed to load GEAR_SETS", e);
    }
  }, []);

  const piecesFor = (setName: string): number => {
    try {
      return (GEAR_SETS as any)[setName]?.pieces ?? 2;
    } catch {
      return 2;
    }
  };

  const showThird = shouldShowThird(setA, setB);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(spec);
    // Build structured spec for API from selectors
    const setPlans = [buildPlanFromSelectors(setA, setB, setC, showThird)];
    const apiSpec = {
      setPlans,
      slotConstraints: {
        BOOTS:
          spec.bootsMain !== ("ANY" as any)
            ? { mainStats: [spec.bootsMain] }
            : { mainStats: "ANY" },
      },
      targets: {
        speed: spec.targetSpeed,
        atk: spec.targetAtk,
      },
    };
    // Call analyze API
    fetch("/api/recommendations/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setPlan: spec.setPlan,
        bootsMain: spec.bootsMain,
        spec: apiSpec,
      }),
    })
      .then((r) => r.json())
      .then((data) => setServerResult(data))
      .catch(() => setServerResult({ ok: false }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Quick Build Check</h1>

      <Card>
        <CardHeader>
          <CardTitle>Target Build</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Hero</Label>
              <HeroSelect
                value={
                  spec.heroId ? { id: spec.heroId, name: spec.heroName } : null
                }
                onChange={(h: HeroOption | null) =>
                  setSpec({ ...spec, heroId: h?.id, heroName: h?.name || "" })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Target Speed</Label>
              <Input
                id="speed"
                type="number"
                placeholder="300"
                value={spec.targetSpeed ?? ""}
                onChange={(e) =>
                  setSpec({ ...spec, targetSpeed: Number(e.target.value || 0) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="atk">Target Atk</Label>
              <Input
                id="atk"
                type="number"
                placeholder="2500"
                value={spec.targetAtk ?? ""}
                onChange={(e) =>
                  setSpec({ ...spec, targetAtk: Number(e.target.value || 0) })
                }
              />
            </div>
            <SetPlanBuilder
              sets={sets}
              setA={setA}
              setB={setB}
              setC={setC}
              onChange={({ setA: a, setB: b, setC: c }) => {
                setSetA(a);
                setSetB(b);
                setSetC(c);
              }}
            />
            <div className="space-y-2">
              <Label>Boots Main Stat</Label>
              <select
                className="h-9 rounded-md border px-2"
                value={spec.bootsMain}
                onChange={(e) =>
                  setSpec({
                    ...spec,
                    bootsMain: e.target.value as unknown as MainStatType,
                  })
                }
              >
                <option value="SPEED">Speed</option>
                <option value="ATT_RATE">Atk%</option>
                <option value="MAX_HP_RATE">HP%</option>
                <option value="DEF_RATE">Def%</option>
                <option value="ANY">Any</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Analyze</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {submitted && (
        <Card>
          <CardHeader>
            <CardTitle>Result (Step 2 will fill this)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(submitted, null, 2)}
            </pre>
            {serverResult && (
              <>
                <div className="mt-4 font-medium">
                  Server analysis (preview)
                </div>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(serverResult, null, 2)}
                </pre>
                {serverResult?.estimation && (
                  <div className="mt-4">
                    <div className="font-medium">Estimation</div>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold">Speed:</span>{" "}
                        {serverResult.estimation.estimated.speed} /{" "}
                        {serverResult.estimation.targets?.speed ?? "-"} (
                        {serverResult.estimation.deltas?.speed ?? "-"})
                      </div>
                      <div>
                        <span className="font-semibold">Atk:</span>{" "}
                        {serverResult.estimation.estimated.atk} /{" "}
                        {serverResult.estimation.targets?.atk ?? "-"} (
                        {serverResult.estimation.deltas?.atk ?? "-"})
                      </div>
                    </div>
                  </div>
                )}
                {serverResult?.missing?.length ? (
                  <div className="mt-4">
                    <div className="font-medium">
                      Missing (shopping list draft)
                    </div>
                    <ul className="list-disc pl-5 text-sm">
                      {serverResult.missing.map((m: any, i: number) => (
                        <li key={i}>
                          {m.slot}: main{" "}
                          {Array.isArray(m.requiredMainStats)
                            ? m.requiredMainStats.join(", ")
                            : m.requiredMainStats}{" "}
                          in sets [{m.sets.join(", ")}]
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
