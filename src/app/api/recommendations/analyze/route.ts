import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { MainStatType, GearType, Prisma } from "#prisma";

// =====================
// Shared Types (reused)
// =====================
type StatTargets = Partial<
  Record<"speed" | "atk" | "hp" | "def" | "eff" | "res", number>
>;

type SlotExample = {
  id: number;
  set: string;
  type: GearType;
  mainStatType: MainStatType;
  fScore: number | null;
  score: number | null;
  terribleCount: number;
};

type SlotSummary = {
  count: number;
  examples: SlotExample[];
  speedGoodCount: number;
};

type BestSlotPick = {
  id: number;
  set: string;
  type: GearType;
  mainStatType: MainStatType;
  fScore: number | null;
  score: number | null;
  mainStatValue?: number | null;
};

type EstimatedStats = {
  speed: number;
  atk: number;
  hp: number;
  def: number;
};

type AnalyzeBody = {
  heroName?: string;
  targetSpeed?: number;
  targetAtk?: number;
  setPlan: string; // e.g., "Speed4+HP2"
  bootsMain: MainStatType | "ANY";
  spec?: BuildSpec;
};

type BuildSpec = {
  setPlans: Array<Array<{ set: string; pieces: number }>>;
  slotConstraints?: Partial<
    Record<
      GearType,
      {
        mainStats: MainStatType[] | "ANY";
      }
    >
  >;
  targets?: StatTargets;
  substatPriorities?: Array<{
    statName: string;
    minGrade: "TERRIBLE" | "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";
  }>;
  minGoodSubsPerPiece?: number;
};

function parseSetPlan(plan: string): { set: string; pieces: number }[] {
  // Speed4+HP2 => [{set:"SpeedSet", pieces:4},{set:"HealthSet",pieces:2}]
  const mapping: Record<string, string> = {
    Speed4: "SpeedSet",
    HP2: "HealthSet",
    Health2: "HealthSet",
    Hit2: "HitSet",
  };
  return plan.split("+").map((part) => {
    const m = part.match(/([A-Za-z]+)(\d)/);
    if (!m) return { set: part, pieces: 2 };
    const key = `${m[1]}${m[2]}`;
    const pieces = Number(m[2]);
    return { set: mapping[key] ?? part, pieces };
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AnalyzeBody;
  const legacyPlan = parseSetPlan(body.setPlan || "Speed4+HP2");
  const defaultSpec: BuildSpec = {
    setPlans: [legacyPlan],
    slotConstraints: {
      BOOTS:
        body.bootsMain !== "ANY"
          ? { mainStats: [body.bootsMain] }
          : { mainStats: "ANY" },
    },
  };
  const spec: BuildSpec = body.spec ?? defaultSpec;
  const setPlan = spec.setPlans[0] ?? legacyPlan;

  try {
    // For step 2: perform per-slot counts of viable items under simple constraints
    const bootsMain = body.bootsMain;
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch boots candidates
    const bootsConstraint = spec.slotConstraints?.BOOTS;
    const bootsWhere: Prisma.GearsWhereInput =
      bootsConstraint && bootsConstraint.mainStats !== "ANY"
        ? {
            type: "BOOTS",
            mainStatType: { in: bootsConstraint.mainStats as MainStatType[] },
          }
        : { type: "BOOTS" };
    const bootsCount = await prisma.gears.count({ where: bootsWhere });

    // Fetch counts by set for plan
    const sets = setPlan.map((s) => s.set);
    const setCounts: Record<string, number> = {};
    for (const s of setPlan) {
      setCounts[s.set] = await prisma.gears.count({
        where: { set: s.set, userId },
      });
    }

    // Per-slot candidate filtering (basic): only pieces from plan sets
    const baseWhere: Prisma.GearsWhereInput = { set: { in: sets }, userId };

    async function slotSummary(type: GearType) {
      const constraint = spec.slotConstraints?.[type];
      const extra: Prisma.GearsWhereInput =
        constraint && constraint.mainStats !== "ANY"
          ? { mainStatType: { in: constraint.mainStats as MainStatType[] } }
          : {};
      const where: Prisma.GearsWhereInput = { ...baseWhere, type, ...extra };
      const count = await prisma.gears.count({ where });
      const examplesRaw = await prisma.gears.findMany({
        where,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          set: true,
          type: true,
          mainStatType: true,
          fScore: true,
          score: true,
          GearSubStats: {
            select: { grade: true, StatType: { select: { statName: true } } },
          },
        },
      });
      const examples = examplesRaw.map((g) => ({
        ...g,
        terribleCount: g.GearSubStats.filter((s) => s.grade === "TERRIBLE")
          .length,
      }));
      // Sample for speed-good subs count (AVERAGE+)
      const sampleForSpeed = await prisma.gears.findMany({
        where,
        take: 200,
        select: {
          GearSubStats: {
            select: { grade: true, StatType: { select: { statName: true } } },
          },
        },
      });
      let speedGoodCount = 0;
      for (const g of sampleForSpeed) {
        for (const s of g.GearSubStats) {
          if (
            s.StatType?.statName === "Speed" &&
            (s.grade === "AVERAGE" ||
              s.grade === "GOOD" ||
              s.grade === "EXCELLENT")
          ) {
            speedGoodCount++;
          }
        }
      }
      return { count, examples, speedGoodCount };
    }

    const slots = {
      BOOTS: await slotSummary("BOOTS"),
      WEAPON: await slotSummary("WEAPON"),
      HELM: await slotSummary("HELM"),
      ARMOR: await slotSummary("ARMOR"),
      NECK: await slotSummary("NECK"),
      RING: await slotSummary("RING"),
    };

    // Build an initial shopping list from empty slots under constraints
    const missing: Array<{
      slot: GearType;
      requiredMainStats: MainStatType[] | "ANY";
      sets: string[];
    }> = [];
    (Object.keys(slots) as Array<keyof typeof slots>).forEach((key) => {
      const slot = key as GearType;
      const s = slots[slot];
      if (s.count === 0) {
        const constraint = spec.slotConstraints?.[slot];
        missing.push({
          slot,
          requiredMainStats: constraint?.mainStats ?? "ANY",
          sets,
        });
      }
    });

    // Pick naive best per slot (fewest TERRIBLE subs, then highest score)
    function gradeMeets(min: string, actual: string): boolean {
      const order = ["TERRIBLE", "POOR", "AVERAGE", "GOOD", "EXCELLENT"];
      return order.indexOf(actual) >= order.indexOf(min);
    }

    async function bestPerSlot(type: GearType) {
      const constraint = spec.slotConstraints?.[type];
      const extra: Prisma.GearsWhereInput =
        constraint && constraint.mainStats !== "ANY"
          ? { mainStatType: { in: constraint.mainStats as MainStatType[] } }
          : {};
      const where: Prisma.GearsWhereInput = { ...baseWhere, type, ...extra };
      const candidates = await prisma.gears.findMany({
        where,
        take: 50,
        orderBy: [{ score: "desc" }],
        select: {
          id: true,
          set: true,
          type: true,
          mainStatType: true,
          mainStatValue: true,
          fScore: true,
          score: true,
          GearSubStats: {
            select: { grade: true, StatType: { select: { statName: true } } },
          },
        },
      });
      const priorities = spec.substatPriorities ?? [];
      const minGood = spec.minGoodSubsPerPiece ?? 0;
      const filtered = candidates.filter((g) => {
        if (!priorities.length && !minGood) return true;
        const goodCount = g.GearSubStats.filter((s) => {
          const name: string = s.StatType?.statName ?? "";
          const p = priorities.find(
            (pp: { statName: string; minGrade: string }) => pp.statName === name
          );
          if (p) return gradeMeets(p.minGrade, s.grade ?? "TERRIBLE");
          return minGood ? gradeMeets("AVERAGE", s.grade ?? "TERRIBLE") : false;
        }).length;
        return goodCount >= minGood;
      });
      const withTerrible = filtered.map((g) => ({
        ...g,
        terribleCount: g.GearSubStats.filter((s) => s.grade === "TERRIBLE")
          .length,
      }));
      withTerrible.sort(
        (a, b) =>
          a.terribleCount - b.terribleCount || (b.score ?? 0) - (a.score ?? 0)
      );
      const best = withTerrible[0] ?? null;
      if (!best) return null;
      const { GearSubStats, ...rest } = best as {
        id: number;
        set: string;
        type: GearType;
        mainStatType: MainStatType;
        fScore: number | null;
        score: number | null;
      } & { GearSubStats: Array<{ grade: string }> };
      return rest;
    }

    const best: Record<GearType, BestSlotPick | null> = {
      BOOTS: await bestPerSlot("BOOTS"),
      WEAPON: await bestPerSlot("WEAPON"),
      HELM: await bestPerSlot("HELM"),
      ARMOR: await bestPerSlot("ARMOR"),
      NECK: await bestPerSlot("NECK"),
      RING: await bestPerSlot("RING"),
    };

    // Simple evaluation heuristics
    const hasSpeedBoots =
      bootsMain === "SPEED"
        ? slots.BOOTS.count > 0
        : Boolean(best.BOOTS && best.BOOTS.mainStatType === "SPEED");
    const totalSpeedGoodSubs =
      slots.WEAPON.speedGoodCount +
      slots.HELM.speedGoodCount +
      slots.ARMOR.speedGoodCount +
      slots.NECK.speedGoodCount +
      slots.RING.speedGoodCount +
      slots.BOOTS.speedGoodCount;
    const speedHeuristicPass = hasSpeedBoots && totalSpeedGoodSubs >= 3;

    // Estimate stats from best picks (gear-only, coarse): use mainStatValue where available
    const estimated: EstimatedStats = { speed: 0, atk: 0, hp: 0, def: 0 };
    const addMain = (p: BestSlotPick | null) => {
      if (!p || p.mainStatValue == null) return;
      switch (p.mainStatType) {
        case "SPEED":
          estimated.speed += Number(p.mainStatValue || 0);
          break;
        case "ATT":
        case "ATT_RATE":
          estimated.atk += Number(p.mainStatValue || 0);
          break;
        case "MAX_HP":
        case "MAX_HP_RATE":
          estimated.hp += Number(p.mainStatValue || 0);
          break;
        case "DEF":
        case "DEF_RATE":
          estimated.def += Number(p.mainStatValue || 0);
          break;
        default:
          break;
      }
    };
    Object.values(best).forEach(addMain);

    const targets: StatTargets = spec.targets ?? {};
    const deltas = {
      speed:
        targets.speed != null ? targets.speed - estimated.speed : undefined,
      atk: targets.atk != null ? targets.atk - estimated.atk : undefined,
      hp: targets.hp != null ? targets.hp - estimated.hp : undefined,
      def: targets.def != null ? targets.def - estimated.def : undefined,
    };

    return NextResponse.json({
      ok: true,
      plan: setPlan,
      counts: { boots: bootsCount, sets: setCounts },
      slots,
      best,
      missing,
      evaluation: {
        hasSpeedBoots,
        totalSpeedGoodSubs,
        speedHeuristicPass,
      },
      estimation: {
        estimated,
        targets,
        deltas,
      },
    });
  } catch (err) {
    console.error("Analyze error", err);
    return NextResponse.json(
      { ok: false, error: "Analyze failed" },
      { status: 500 }
    );
  }
}
