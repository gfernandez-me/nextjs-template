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

  // Score-based sorts now handled by DB columns

  // Column-based sorts via Prisma
  const dirFinal: "asc" | "desc" = sortDir === "asc" ? "asc" : "desc";
  let orderBy: Prisma.GearsOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  const orderMap: Record<string, Prisma.GearsOrderByWithRelationInput> = {
    gear: { gear: dirFinal },
    level: { level: dirFinal },
    enhance: { enhance: dirFinal },
    mainStatType: { mainStatType: dirFinal },
    mainStatValue: { mainStatValue: dirFinal },
    fScore: { fScore: dirFinal },
    score: { score: dirFinal },
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

export async function getSettings() {
  return db.settings.findFirst();
}
