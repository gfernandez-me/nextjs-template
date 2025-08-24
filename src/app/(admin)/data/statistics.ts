import {
  HeroElement,
  HeroClass,
  HeroRarity,
  GearRank,
  GearType,
} from "#prisma";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Dashboard statistics overview
export type DashboardStats = {
  gears: {
    total: number;
    equipped: number;
    epicPlus: number;
    maxEnhanced: number;
  };
  heroes: {
    total: number;
    byElement: Record<HeroElement, number>;
    byClass: Record<HeroClass, number>;
    byRarity: Record<HeroRarity, number>;
  };
  gearSets: {
    total: number;
    byPieces: Record<number, number>;
    topSets: Array<{
      setName: string;
      piecesRequired: number;
      totalCount: number;
      equippedCount: number;
    }>;
  };
  recentActivity: {
    lastUpload: Date | null;
    lastGearUpdate: Date | null;
    lastHeroUpdate: Date | null;
  };
};

// Gear set statistics
export type GearSetStats = {
  setName: string;
  piecesRequired: number;
  totalCount: number;
  equippedCount: number;
  completionRate: number;
};

// Gear rank distribution
export type GearRankDistribution = {
  rank: GearRank;
  count: number;
  percentage: number;
};

// Gear type distribution
export type GearTypeDistribution = {
  type: GearType;
  count: number;
  percentage: number;
  displayName: string;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export class StatisticsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [gears, heroes, gearSets, recentActivity] = await Promise.all([
      this.getGearStats(),
      this.getHeroStats(),
      this.getGearSetStats(),
      this.getRecentActivity(),
    ]);

    return {
      gears,
      heroes,
      gearSets,
      recentActivity,
    };
  }

  /**
   * Get gear statistics
   */
  async getGearStats(): Promise<DashboardStats["gears"]> {
    const [total, equipped, epicPlus, maxEnhanced] = await Promise.all([
      prisma.gears.count({ where: { userId: this.userId } }),
      prisma.gears.count({ where: { userId: this.userId, equipped: true } }),
      prisma.gears.count({
        where: {
          userId: this.userId,
          OR: [{ rank: GearRank.EPIC }, { rank: GearRank.HEROIC }],
        },
      }),
      prisma.gears.count({ where: { userId: this.userId, enhance: 15 } }),
    ]);

    return { total, equipped, epicPlus, maxEnhanced };
  }

  /**
   * Get hero statistics
   */
  async getHeroStats(): Promise<DashboardStats["heroes"]> {
    const heroes = await prisma.heroes.findMany({
      where: { userId: this.userId },
      select: {
        element: true,
        class: true,
        rarity: true,
      },
    });

    const byElement: Record<HeroElement, number> = {
      FIRE: 0,
      ICE: 0,
      EARTH: 0,
      LIGHT: 0,
      DARK: 0,
    };

    const byClass: Record<HeroClass, number> = {
      WARRIOR: 0,
      KNIGHT: 0,
      RANGER: 0,
      MAGE: 0,
      SOUL_WEAVER: 0,
      THIEF: 0,
    };

    const byRarity: Record<HeroRarity, number> = {
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
  async getGearSetStats(): Promise<DashboardStats["gearSets"]> {
    // Get gear sets with counts
    const gearSetStats = await prisma.$queryRaw<GearSetStats[]>`
      SELECT 
        gs."setName" as "setName",
        gs."piecesRequired" as "piecesRequired",
        COUNT(g.id) as "totalCount",
        COUNT(CASE WHEN g.equipped = true THEN 1 END) as "equippedCount"
      FROM "gear_sets" gs
      LEFT JOIN "gears" g ON g.set = gs."setName" AND g."userId" = ${this.userId}
      WHERE gs."isActive" = true
      GROUP BY gs."setName", gs."piecesRequired"
      HAVING COUNT(g.id) > 0
      ORDER BY gs."piecesRequired" DESC, gs."setName" ASC
    `;

    // Calculate completion rates
    const gearSetsWithCompletion = gearSetStats.map((stat) => ({
      ...stat,
      completionRate:
        stat.totalCount >= stat.piecesRequired
          ? Math.min(100, (stat.equippedCount / stat.piecesRequired) * 100)
          : 0,
    }));

    // Group by pieces required
    const byPieces: Record<number, number> = {};
    for (const stat of gearSetStats) {
      byPieces[stat.piecesRequired] =
        (byPieces[stat.piecesRequired] || 0) + stat.totalCount;
    }

    // Get top sets (most pieces)
    const topSets = gearSetsWithCompletion
      .sort((a, b) => b.piecesRequired - a.piecesRequired)
      .slice(0, 5);

    return {
      total: gearSetStats.length,
      byPieces,
      topSets,
    };
  }

  /**
   * Get recent activity timestamps
   */
  async getRecentActivity(): Promise<DashboardStats["recentActivity"]> {
    const [lastUpload, lastGearUpdate, lastHeroUpdate] = await Promise.all([
      prisma.gears.findFirst({
        where: { userId: this.userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.gears.findFirst({
        where: { userId: this.userId },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.heroes.findFirst({
        where: { userId: this.userId },
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
  async getGearRankDistribution(): Promise<GearRankDistribution[]> {
    const ranks = await prisma.gears.groupBy({
      by: ["rank"],
      where: { userId: this.userId },
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
  async getGearTypeDistribution(): Promise<GearTypeDistribution[]> {
    const types = await prisma.gears.groupBy({
      by: ["type"],
      where: { userId: this.userId },
      _count: { type: true },
    });

    const total = types.reduce((sum, type) => sum + type._count.type, 0);

    const typeDisplayNames: Record<GearType, string> = {
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
  async getGearEnhancementDistribution(): Promise<
    Array<{
      enhance: number;
      count: number;
      percentage: number;
    }>
  > {
    const enhancements = await prisma.gears.groupBy({
      by: ["enhance"],
      where: { userId: this.userId },
      _count: {
        enhance: true,
      },
    });

    const total = enhancements.reduce(
      (sum, enh) => sum + enh._count.enhance,
      0
    );

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
  async getGearScoreStats(): Promise<{
    totalScored: number;
    averageFScore: number;
    averageScore: number;
    topScores: Array<{
      id: number;
      fScore: number;
      score: number;
    }>;
  }> {
    const scoredGears = await prisma.gears.findMany({
      where: {
        userId: this.userId,
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

    const topScores = scoredGears
      .sort((a, b) => (b.fScore || 0) - (a.fScore || 0))
      .slice(0, 10)
      .map((gear) => ({
        id: gear.id,
        fScore: gear.fScore || 0,
        score: gear.score || 0,
      }));

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
  async listGearSets() {
    const gearSets = await prisma.gearSets.findMany({
      where: { isActive: true },
      orderBy: { setName: "asc" },
    });
    return gearSets;
  }

  /**
   * List all stat types for reference
   */
  async listStatTypes() {
    const statTypes = await prisma.statTypes.findMany({
      orderBy: { statName: "asc" },
    });
    return statTypes;
  }

  /**
   * Get gear set stats in the old format for backward compatibility
   */
  async getGearSetStatsLegacy(): Promise<{
    totalGears: number;
    totalEquipped: number;
    totalGearsWithSets: number;
    gearSetStats: Array<{
      setName: string;
      piecesRequired: number;
      totalCount: number;
      equippedCount: number;
    }>;
  }> {
    // Get total counts for percentage calculations
    const [totalGears, totalEquipped] = await Promise.all([
      prisma.gears.count({ where: { userId: this.userId } }),
      prisma.gears.count({ where: { userId: this.userId, equipped: true } }),
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
      LEFT JOIN "gears" g ON g.set = gs."setName" AND g."userId" = ${this.userId}
      WHERE gs."isActive" = true
      GROUP BY gs."setName", gs."piecesRequired"
      HAVING COUNT(g.id) > 0
      ORDER BY gs."piecesRequired" DESC, gs."setName" ASC
    `;

    // Get total gears with sets for percentage calculation
    const totalGearsWithSets = await prisma.gears.count({
      where: {
        userId: this.userId,
        set: { not: null },
      },
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
}
