import type { Prisma } from "#prisma";
import { GearType, GearRank } from "#prisma";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Basic gear with essential relations for table display
export type GearForTable = Prisma.GearsGetPayload<{
  include: {
    Hero: true;
    GearSubStats: { include: { StatType: true } };
    User: true;
  };
}>;

// Gear with all possible relations for detailed views
export type GearWithFullRelations = Prisma.GearsGetPayload<{
  include: {
    Hero: true;
    GearSubStats: { include: { StatType: true } };
    User: true;
  };
}>;

// Gear for optimization calculations (includes scoring data)
export type GearForOptimization = {
  id: number;
  mainStatType: string;
  mainStatValue: number;
  fScore: number | null;
  score: number | null;
  GearSubStats: Array<{
    statValue: number | string | bigint | { constructor: { name: string } };
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
    orderBy?: Prisma.GearsOrderByWithRelationInput[];
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ rows: GearForTable[]; total: number }> {
    const { page, perPage, where = {}, orderBy, sortBy, sortDir } = params;

    // Always scope to current user
    const userScopedWhere = { ...where, userId: this.userId };

    // Build orderBy from sortBy and sortDir if not provided
    let finalOrderBy = orderBy;
    if (!finalOrderBy && sortBy && sortDir) {
      finalOrderBy = [
        { [sortBy]: sortDir } as Prisma.GearsOrderByWithRelationInput,
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.gears.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: userScopedWhere,
        orderBy: finalOrderBy?.length ? finalOrderBy : [{ createdAt: "desc" }],
        include: {
          Hero: true,
          GearSubStats: { include: { StatType: true } },
          User: true,
        },
      }),
      prisma.gears.count({ where: userScopedWhere }),
    ]);

    return { rows, total };
  }

  /**
   * Get single gear with full relations
   */
  async getGearById(id: number): Promise<GearWithFullRelations | null> {
    return prisma.gears.findFirst({
      where: { id, userId: this.userId },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
    });
  }

  /**
   * Get gears for optimization calculations
   */
  async getGearsForOptimization(): Promise<GearForOptimization[]> {
    const gears = await prisma.gears.findMany({
      where: { userId: this.userId },
      include: {
        GearSubStats: { include: { StatType: true } },
      },
    });

    return gears.map((gear) => ({
      id: gear.id,
      mainStatType: gear.mainStatType,
      mainStatValue: gear.mainStatValue,
      fScore: gear.fScore,
      score: gear.score,
      GearSubStats: gear.GearSubStats,
    }));
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
   * Get gears by type for filtering
   */
  async getGearsByType(gearType: GearType): Promise<GearForTable[]> {
    return prisma.gears.findMany({
      where: { userId: this.userId, type: gearType },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get gears by set for set management
   */
  async getGearsBySet(setName: string): Promise<GearForTable[]> {
    return prisma.gears.findMany({
      where: { userId: this.userId, set: setName },
      include: {
        Hero: true,
        GearSubStats: { include: { StatType: true } },
        User: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update gear equipment status
   */
  async updateGearEquipment(
    gearId: number,
    heroIngameId: bigint | null
  ): Promise<void> {
    await prisma.gears.update({
      where: { id: gearId, userId: this.userId },
      data: { equipped: !!heroIngameId, equippedBy: heroIngameId },
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
