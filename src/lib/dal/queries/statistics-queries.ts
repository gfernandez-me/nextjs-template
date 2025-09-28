import { GearRank } from "#prisma";
import prisma from "@/lib/prisma";
import type {
  GearSetStats,
  GearRankDistribution,
  GearTypeDistribution,
  GearEnhancementDistribution,
  GearScoreStats,
  LegacyGearSetStats,
} from "../types/statistics";
import {
  calculateCompletionRate,
  sortAndLimit,
} from "../utils/statistics-utils";
import {
  TOP_SCORES_LIMIT,
  TOP_SETS_LIMIT,
} from "../constants/statistics-constants";

// ============================================================================
// DATABASE QUERY FUNCTIONS
// ============================================================================

/**
 * Get gear statistics
 */
export async function getGearStats(userId: string) {
  const [total, equipped, epicPlus, maxEnhanced] = await Promise.all([
    prisma.gears.count({ where: { userId } }),
    prisma.gears.count({ where: { userId, equipped: true } }),
    prisma.gears.count({
      where: {
        userId,
        OR: [{ rank: GearRank.EPIC }, { rank: GearRank.HEROIC }],
      },
    }),
    prisma.gears.count({ where: { userId, enhance: 15 } }),
  ]);

  return { total, equipped, epicPlus, maxEnhanced };
}

/**
 * Get hero statistics
 */
export async function getHeroStats(userId: string) {
  const heroes = await prisma.heroes.findMany({
    where: { userId },
    select: {
      element: true,
      class: true,
      rarity: true,
    },
  });

  const byElement = { FIRE: 0, ICE: 0, EARTH: 0, LIGHT: 0, DARK: 0 };
  const byClass = {
    WARRIOR: 0,
    KNIGHT: 0,
    RANGER: 0,
    MAGE: 0,
    SOUL_WEAVER: 0,
    THIEF: 0,
  };
  const byRarity = {
    THREE_STAR: 0,
    FOUR_STAR: 0,
    FIVE_STAR: 0,
    SIX_STAR: 0,
  };

  for (const hero of heroes) {
    if (hero.element) byElement[hero.element]++;
    if (hero.class) byClass[hero.class]++;
    if (hero.rarity) byRarity[hero.rarity]++;
  }

  return {
    total: heroes.length,
    byElement,
    byClass,
    byRarity,
  };
}

/**
 * Get gear set statistics
 */
export async function getGearSetStats(userId: string): Promise<{
  total: number;
  byPieces: Record<number, number>;
  topSets: Array<{
    setName: string;
    piecesRequired: number;
    totalCount: number;
    equippedCount: number;
  }>;
}> {
  // Get gear sets with counts
  const gearSetStats = await prisma.$queryRaw<GearSetStats[]>`
    SELECT 
      gs."setName" as "setName",
      gs."piecesRequired" as "piecesRequired",
      COUNT(g.id) as "totalCount",
      COUNT(CASE WHEN g.equipped = true THEN 1 END) as "equippedCount"
    FROM "gear_sets" gs
    LEFT JOIN "gears" g ON g.set = gs."setName" AND g."userId" = ${userId}
    WHERE gs."isActive" = true
    GROUP BY gs."setName", gs."piecesRequired"
    HAVING COUNT(g.id) > 0
    ORDER BY gs."piecesRequired" DESC, gs."setName" ASC
  `;

  // Calculate completion rates
  const gearSetsWithCompletion = gearSetStats.map((stat) => ({
    ...stat,
    completionRate: calculateCompletionRate(
      stat.totalCount,
      stat.equippedCount,
      stat.piecesRequired
    ),
  }));

  // Group by pieces required
  const byPieces: Record<number, number> = {};
  for (const stat of gearSetStats) {
    byPieces[stat.piecesRequired] =
      (byPieces[stat.piecesRequired] || 0) + stat.totalCount;
  }

  // Get top sets (most pieces)
  const topSets = sortAndLimit(
    gearSetsWithCompletion,
    "piecesRequired",
    TOP_SETS_LIMIT
  );

  return {
    total: gearSetStats.length,
    byPieces,
    topSets,
  };
}

/**
 * Get recent activity timestamps
 */
export async function getRecentActivity(userId: string) {
  const [lastUpload, lastGearUpdate, lastHeroUpdate] = await Promise.all([
    prisma.gears.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.gears.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.heroes.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  return {
    lastUpload: lastUpload?.createdAt || null,
    lastGearUpdate: lastGearUpdate?.updatedAt || null,
    lastHeroUpdate: lastHeroUpdate?.updatedAt || null,
  };
}

/**
 * Get gear rank distribution
 */
export async function getGearRankDistribution(
  userId: string
): Promise<GearRankDistribution[]> {
  const ranks = await prisma.gears.groupBy({
    by: ["rank"],
    where: { userId },
    _count: { rank: true },
  });

  const total = ranks.reduce((sum, rank) => sum + rank._count.rank, 0);

  return ranks.map((rank) => ({
    rank: rank.rank,
    count: rank._count.rank,
    percentage: total > 0 ? (rank._count.rank / total) * 100 : 0,
  }));
}

/**
 * Get gear type distribution
 */
export async function getGearTypeDistribution(
  userId: string
): Promise<GearTypeDistribution[]> {
  const types = await prisma.gears.groupBy({
    by: ["type"],
    where: { userId },
    _count: { type: true },
  });

  const total = types.reduce((sum, type) => sum + type._count.type, 0);

  const typeDisplayNames = {
    WEAPON: "Weapon",
    ARMOR: "Armor",
    HELM: "Helmet",
    NECK: "Necklace",
    RING: "Ring",
    BOOTS: "Boots",
  };

  return types.map((type) => ({
    type: type.type,
    count: type._count.type,
    percentage: total > 0 ? (type._count.type / total) * 100 : 0,
    displayName: typeDisplayNames[type.type],
  }));
}

/**
 * Get gear enhancement distribution
 */
export async function getGearEnhancementDistribution(
  userId: string
): Promise<GearEnhancementDistribution[]> {
  const enhancements = await prisma.gears.groupBy({
    by: ["enhance"],
    where: { userId },
    _count: { enhance: true },
  });

  const total = enhancements.reduce((sum, enh) => sum + enh._count.enhance, 0);

  return enhancements
    .sort((a, b) => a.enhance - b.enhance)
    .map((enh) => ({
      enhance: enh.enhance,
      count: enh._count.enhance,
      percentage: total > 0 ? (enh._count.enhance / total) * 100 : 0,
    }));
}

/**
 * Get gear score statistics
 */
export async function getGearScoreStats(
  userId: string
): Promise<GearScoreStats> {
  const scoredGears = await prisma.gears.findMany({
    where: {
      userId,
      OR: [{ fScore: { not: null } }, { score: { not: null } }],
    },
    select: {
      id: true,
      fScore: true,
      score: true,
    },
  });

  if (scoredGears.length === 0) {
    return {
      totalScored: 0,
      averageFScore: 0,
      averageScore: 0,
      topScores: [],
    };
  }

  const totalFScore = scoredGears.reduce(
    (sum, gear) => sum + (gear.fScore || 0),
    0
  );
  const totalScore = scoredGears.reduce(
    (sum, gear) => sum + (gear.score || 0),
    0
  );

  const topScores = sortAndLimit(
    scoredGears.map((gear) => ({
      id: gear.id,
      fScore: gear.fScore || 0,
      score: gear.score || 0,
    })),
    "fScore",
    TOP_SCORES_LIMIT
  );

  return {
    totalScored: scoredGears.length,
    averageFScore: totalFScore / scoredGears.length,
    averageScore: totalScore / scoredGears.length,
    topScores,
  };
}

/**
 * List all gear sets for management
 */
export async function listGearSets() {
  return await prisma.gearSets.findMany({
    where: { isActive: true },
    orderBy: { setName: "asc" },
  });
}

/**
 * List all stat types for reference
 */
export async function listStatTypes() {
  return await prisma.statTypes.findMany({
    orderBy: { statName: "asc" },
  });
}

/**
 * Get gear set stats in the old format for backward compatibility
 */
export async function getGearSetStatsLegacy(
  userId: string
): Promise<LegacyGearSetStats> {
  // Get total counts for percentage calculations
  const [totalGears, totalEquipped] = await Promise.all([
    prisma.gears.count({ where: { userId } }),
    prisma.gears.count({ where: { userId, equipped: true } }),
  ]);

  // Get gear set statistics with counts
  const gearSetStats = await prisma.$queryRaw<
    Array<{
      setName: string;
      piecesRequired: number;
      totalCount: number;
      equippedCount: number;
    }>
  >`
    SELECT 
      gs."setName" as "setName",
      gs."piecesRequired" as "piecesRequired",
      COUNT(g.id) as "totalCount",
      COUNT(CASE WHEN g.equipped = true THEN 1 END) as "equippedCount"
    FROM "gear_sets" gs
    LEFT JOIN "gears" g ON g.set = gs."setName" AND g."userId" = ${userId}
    WHERE gs."isActive" = true
    GROUP BY gs."setName", gs."piecesRequired"
    HAVING COUNT(g.id) > 0
    ORDER BY gs."piecesRequired" DESC, gs."setName" ASC
  `;

  // Get total gears with sets for percentage calculation
  const totalGearsWithSets = await prisma.gears.count({
    where: { userId },
  });

  return {
    totalGears,
    totalEquipped,
    totalGearsWithSets,
    gearSetStats: gearSetStats.map((stat) => ({
      ...stat,
      totalCount: Number(stat.totalCount),
      equippedCount: Number(stat.equippedCount),
    })),
  };
}
