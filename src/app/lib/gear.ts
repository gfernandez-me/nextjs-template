import { db } from "@/lib/db";
import type { Prisma } from "#prisma";
import { convertDecimals } from "@/lib/decimal";

export type GearRow = Prisma.GearsGetPayload<{
  select: {
    id: true;
    gear: true;
    rank: true;
    level: true;
    enhance: true;
    mainStatType: true;
    mainStatValue: true;
    equipped: true;
    fScore: true;
    score: true;
    hero: { select: { name: true; ingameId: true } };
    substats: {
      select: {
        statValue: true;
        statType: {
          select: { statName: true; statCategory: true; weight: true };
        };
      };
    };
  };
}>;

export async function getGearsPage(params: {
  page: number;
  perPage: number;
  where?: Prisma.GearsWhereInput;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}): Promise<{ rows: GearRow[]; total: number }> {
  const { page, perPage, where, sortBy, sortDir } = params;
  const skip = Math.max(0, (page - 1) * perPage);

  const total = await db.gears.count({ where });

  // Score-based sorts: compute in memory then paginate
  if (sortBy === "fscore" || sortBy === "score") {
    const rowsAll = await db.gears.findMany({
      where,
      select: {
        id: true,
        gear: true,
        rank: true,
        level: true,
        enhance: true,
        mainStatType: true,
        mainStatValue: true,
        equipped: true,
        fScore: true,
        score: true,
        hero: { select: { name: true, ingameId: true } },
        substats: {
          select: {
            statValue: true,
            statType: {
              select: { statName: true, statCategory: true, weight: true },
            },
          },
        },
      },
    });
    const rowsWithScore = convertDecimals(rowsAll).map((r) => {
      const f =
        typeof r.fScore === "number"
          ? r.fScore
          : r.substats.reduce((acc, s) => {
              const w =
                typeof s.statType.weight === "number" ? s.statType.weight : 1;
              return acc + Number(s.statValue) * w;
            }, 0);
      const customWeights: Record<string, number> = {
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
      const my =
        typeof r.score === "number"
          ? r.score
          : r.substats.reduce((acc, s) => {
              const w = customWeights[s.statType.statName] ?? 1;
              return acc + Number(s.statValue) * w;
            }, 0);
      return {
        r,
        fscore: Math.round(f * 100) / 100,
        score: Math.round(my * 100) / 100,
      };
    });
    const dir = sortDir === "asc" ? 1 : -1;
    rowsWithScore.sort((a, b) => {
      const key = sortBy as "fscore" | "score";
      return (a[key] - b[key]) * dir;
    });
    const sliced = rowsWithScore.slice(skip, skip + perPage).map((x) => x.r);
    return { rows: sliced, total };
  }

  // Column-based sorts via Prisma
  const dirFinal: "asc" | "desc" = sortDir === "asc" ? "asc" : "desc";
  let orderBy: Prisma.GearsOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  const orderMap: Record<string, Prisma.GearsOrderByWithRelationInput> = {
    gear: { gear: dirFinal },
    level: { level: dirFinal },
    enhance: { enhance: dirFinal },
    mainStatType: { mainStatType: dirFinal },
    mainStatValue: { mainStatValue: dirFinal },
    rank: { rank: dirFinal },
    createdAt: { createdAt: dirFinal },
    heroName: { hero: { name: dirFinal } },
  };
  if (sortBy && orderMap[sortBy]) orderBy = [orderMap[sortBy]];

  const rows = await db.gears.findMany({
    skip,
    take: perPage,
    where,
    orderBy,
    select: {
      id: true,
      gear: true,
      rank: true,
      level: true,
      enhance: true,
      mainStatType: true,
      mainStatValue: true,
      equipped: true,
      fScore: true,
      score: true,
      hero: { select: { name: true, ingameId: true } },
      substats: {
        select: {
          statValue: true,
          statType: {
            select: { statName: true, statCategory: true, weight: true },
          },
        },
      },
    },
  });
  return { rows: convertDecimals(rows), total };
}

export async function getGearStats(): Promise<{
  total: number;
  equipped: number;
  epicPlus: number;
  maxEnhanced: number;
}> {
  const [total, equipped, epicPlus, maxEnhanced] = await Promise.all([
    db.gears.count(),
    db.gears.count({ where: { equipped: true } }),
    db.gears.count({ where: { OR: [{ rank: "Epic" }, { rank: "Heroic" }] } }),
    db.gears.count({ where: { enhance: 15 } }),
  ]);
  return { total, equipped, epicPlus, maxEnhanced };
}

export async function getAggregates(where?: Prisma.GearsWhereInput) {
  const [byRank, enhance, main] = await Promise.all([
    db.gears.groupBy({ by: ["rank"], _count: { _all: true }, where }),
    db.gears.groupBy({ by: ["enhance"], _count: { _all: true }, where }),
    db.gears.groupBy({ by: ["mainStatType"], _count: { _all: true }, where }),
  ]);
  return {
    gearByRank: byRank.map((r) => ({ name: r.rank, value: r._count._all })),
    enhanceBreakdown: enhance.map((e) => ({
      level: `+${e.enhance}`,
      count: e._count._all,
    })),
    mainStatDistribution: main.map((m) => ({
      name: m.mainStatType,
      value: m._count._all,
    })),
  };
}
