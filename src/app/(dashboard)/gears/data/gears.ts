import type { Prisma } from "#prisma";
import { GearType, GearRank } from "#prisma";
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
