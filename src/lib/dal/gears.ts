import type { Prisma } from "#prisma";
import { GearType, GearRank, ScoreGrade } from "#prisma";
import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Raw types from Prisma
type BaseGearSubStats = Prisma.GearSubStatsGetPayload<{
  include: { StatType: true };
}>;

type RawGear = Prisma.GearsGetPayload<{
  include: {
    Hero: true;
    GearSubStats: { include: { StatType: true } };
    User: true;
  };
}>;

// Serialized types for client components
export type SerializedGearSubStats = Omit<
  BaseGearSubStats,
  "statValue" | "weight"
> & {
  statValue: number;
  weight: number;
};

export type GearForTable = Omit<RawGear, "GearSubStats"> & {
  GearSubStats: SerializedGearSubStats[];
};

// Type aliases
export type GearWithFullRelations = GearForTable;

// Gear for optimization calculations
export type GearForOptimization = {
  id: number;
  mainStatType: string;
  mainStatValue: number;
  fScore: number | null;
  score: number | null;
  GearSubStats: Array<{
    statValue: number;
    StatType: {
      statName: string;
    } | null;
  }>;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export class GearsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get paginated gears for table display
   */
  async getGearsPage(params: {
    page: number;
    perPage: number;
    where?: Prisma.GearsWhereInput;
    sortField?: string;
    sortDirection?: string;
    // Optional relational filter: require at least N substats with given grades
    substatGradeIn?: ScoreGrade[];
    substatMinCount?: number;
  }): Promise<{ rows: GearForTable[]; total: number }> {
    const {
      page,
      perPage,
      where = {},
      sortField,
      sortDirection,
      substatGradeIn,
      substatMinCount,
    } = params;

    // Always scope to current user
    let userScopedWhere: Prisma.GearsWhereInput = {
      ...where,
      userId: this.userId,
    };

    // If we need a minimum count of substats by grade, compute matching gear IDs in-memory
    if (
      substatGradeIn &&
      Array.isArray(substatGradeIn) &&
      substatGradeIn.length > 0 &&
      substatMinCount &&
      substatMinCount > 1
    ) {
      const rows = await prisma.gearSubStats.findMany({
        where: {
          userId: this.userId,
          grade: { in: substatGradeIn },
        },
        select: { gearId: true },
      });
      const counts = new Map<number, number>();
      for (const row of rows) {
        counts.set(row.gearId, (counts.get(row.gearId) || 0) + 1);
      }
      const gearIds = Array.from(counts.entries())
        .filter(([, c]) => c >= substatMinCount)
        .map(([id]) => id);
      // If none matched, force an impossible condition to yield empty
      userScopedWhere = {
        ...userScopedWhere,
        id: gearIds.length ? { in: gearIds } : -1,
      } as unknown as Prisma.GearsWhereInput;
    }

    // Build orderBy from sortField and sortDirection
    let orderBy;
    if (sortField && sortDirection) {
      orderBy = [{ [sortField]: sortDirection }];
    }

    const [rows, total] = await Promise.all([
      prisma.gears.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: userScopedWhere,
        orderBy,
        include: {
          Hero: true,
          GearSubStats: { include: { StatType: true } },
          User: true,
        },
      }),
      prisma.gears.count({ where: userScopedWhere }),
    ]);

    return { rows: convertDecimals(rows) as unknown as GearForTable[], total };
  }

  /**
   * Get single gear with full relations
   */
  async getGearById(id: number): Promise<GearWithFullRelations | null> {
    const gear = await prisma.gears.findFirst({
      where: { id, userId: this.userId },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
    });
    return convertDecimals(gear) as unknown as GearWithFullRelations;
  }

  /**
   * Get gears for optimization calculations
   */
  async getGearsForOptimization(): Promise<GearForOptimization[]> {
    const gears = await prisma.gears.findMany({
      where: { userId: this.userId },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
    });

    return convertDecimals(gears) as unknown as GearForOptimization[];
  }

  /**
   * Get gear statistics for dashboard
   */
  async getGearStats(): Promise<{
    total: number;
    equipped: number;
    epicPlus: number;
    maxEnhanced: number;
  }> {
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
   * Debug method to test database queries without filters
   */
  async debugDatabaseQuery() {
    // Test 1: Get all gears for user without any filters
    const allGears = await prisma.gears.findMany({
      where: { userId: this.userId },
      take: 5,
      orderBy: { fScore: "desc" },
      select: {
        id: true,
        fScore: true,
        score: true,
        type: true,
        rank: true,
        level: true,
        enhance: true,
        userId: true,
      },
    });

    console.log("All gears (top 5 by fScore):", allGears);

    // Test 2: Get gears with enhance=15 filter
    const enhancedGears = await prisma.gears.findMany({
      where: {
        userId: this.userId,
        enhance: 15,
      },
      take: 5,
      orderBy: { fScore: "desc" },
      select: {
        id: true,
        fScore: true,
        score: true,
        type: true,
        rank: true,
        level: true,
        enhance: true,
        userId: true,
      },
    });

    console.log("Enhanced gears (top 5 by fScore):", enhancedGears);

    // Test 3: Get gears with rank filter (EPIC + HEROIC only)
    const rankFilteredGears = await prisma.gears.findMany({
      where: {
        userId: this.userId,
        enhance: 15,
        rank: { in: ["EPIC", "HEROIC"] },
      },
      take: 5,
      orderBy: { fScore: "desc" },
      select: {
        id: true,
        fScore: true,
        score: true,
        type: true,
        rank: true,
        level: true,
        enhance: true,
        userId: true,
      },
    });

    console.log(
      "Rank filtered gears (EPIC+HEROIC, top 5 by fScore):",
      rankFilteredGears
    );

    // Test 4: Get total counts
    const totalCount = await prisma.gears.count({
      where: { userId: this.userId },
    });
    const enhancedCount = await prisma.gears.count({
      where: { userId: this.userId, enhance: 15 },
    });
    const rankFilteredCount = await prisma.gears.count({
      where: {
        userId: this.userId,
        enhance: 15,
        rank: { in: ["EPIC", "HEROIC"] },
      },
    });

    console.log("Total gears:", totalCount);
    console.log("Enhanced gears:", enhancedCount);
    console.log("Rank filtered gears (EPIC+HEROIC):", rankFilteredCount);
    console.log("=== END DEBUG ===");
  }

  /**
   * Get gears by type for filtering
   */
  async getGearsByType(gearType: GearType): Promise<GearForTable[]> {
    const gears = await prisma.gears.findMany({
      where: { userId: this.userId, type: gearType },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return convertDecimals(gears) as unknown as GearForTable[];
  }

  /**
   * Get gears by set for set management
   */
  async getGearsBySet(setName: string): Promise<GearForTable[]> {
    const gears = await prisma.gears.findMany({
      where: { userId: this.userId, set: setName },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return convertDecimals(gears) as unknown as GearForTable[];
  }

  /**
   * Update gear equipment status
   */
  async updateGearEquipment(
    gearId: number,
    heroId: number | null
  ): Promise<void> {
    await prisma.gears.update({
      where: { id: gearId, userId: this.userId },
      data: {
        equipped: !!heroId,
        heroId,
      },
    });
  }

  /**
   * Delete gear and all related data
   */
  async deleteGear(gearId: number): Promise<void> {
    await prisma.gears.delete({
      where: { id: gearId, userId: this.userId },
    });
  }
}
