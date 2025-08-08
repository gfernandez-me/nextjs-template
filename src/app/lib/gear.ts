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
    hero: { select: { name: true; ingameId: true } };
    substats: {
      select: {
        statValue: true;
        statType: { select: { statName: true; statCategory: true } };
      };
    };
  };
}>;

export async function getGearsPage(params: {
  page: number;
  perPage: number;
  orderBy?: Prisma.GearsOrderByWithRelationInput[];
  where?: Prisma.GearsWhereInput;
}): Promise<{ rows: GearRow[]; total: number }> {
  const { page, perPage, orderBy, where } = params;
  const skip = Math.max(0, (page - 1) * perPage);
  const [rows, total] = await Promise.all([
    db.gears.findMany({
      skip,
      take: perPage,
      where,
      orderBy:
        orderBy && orderBy.length > 0 ? orderBy : [{ createdAt: "desc" }],
      select: {
        id: true,
        gear: true,
        rank: true,
        level: true,
        enhance: true,
        mainStatType: true,
        mainStatValue: true,
        equipped: true,
        hero: { select: { name: true, ingameId: true } },
        substats: {
          select: {
            statValue: true,
            statType: { select: { statName: true, statCategory: true } },
          },
        },
      },
    }),
    db.gears.count({ where }),
  ]);
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
