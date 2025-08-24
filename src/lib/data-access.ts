import type { Prisma, MainStatType, GearType } from "#prisma";
import { GearRank } from "#prisma";
import prisma from "@/lib/prisma";

// Type definitions for data access layer
export type GearWithRelations = Prisma.GearsGetPayload<{
  include: {
    Hero: true;
    GearSubStats: { include: { StatType: true } };
    User: true;
  };
}>;

export type SettingsWithUser = Prisma.SettingsGetPayload<{
  include: { User: true };
}>;

// Gear table row type for the UI
export type GearRow = Prisma.GearsGetPayload<{
  include: {
    Hero: true;
    GearSubStats: { include: { StatType: true } };
    User: true;
  };
}>;

// Helper function to convert Prisma Decimal types to regular numbers
function convertDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(convertDecimals) as T;
    }

    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        value &&
        typeof value === "object" &&
        "constructor" in value &&
        value.constructor.name === "Decimal"
      ) {
        converted[key] = Number(value);
      } else if (typeof value === "object") {
        converted[key] = convertDecimals(value);
      } else {
        converted[key] = value;
      }
    }
    return converted as T;
  }

  return obj;
}

// Helper function to serialize Prisma objects for client components
function serializeForClient<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map(serializeForClient) as T;
    }

    // Handle BigInt values
    if (typeof obj === "bigint") {
      return Number(obj) as unknown as T;
    }

    const serialized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip Prisma methods and internal properties
      if (
        key.startsWith("_") ||
        key.startsWith("$") ||
        typeof value === "function"
      ) {
        continue;
      }

      if (typeof value === "bigint") {
        serialized[key] = Number(value);
      } else if (
        value &&
        typeof value === "object" &&
        "constructor" in value &&
        value.constructor.name === "Decimal"
      ) {
        // Handle Prisma Decimal types
        serialized[key] = Number(value);
      } else if (value && typeof value === "object") {
        serialized[key] = serializeForClient(value);
      } else {
        serialized[key] = value;
      }
    }
    return serialized as T;
  }

  return obj;
}

export class DataAccessLayer {
  constructor(private userId: string) {}

  // Gears
  async getGearsPage(params: {
    page: number;
    perPage: number;
    where?: Prisma.GearsWhereInput;
    orderBy?: Prisma.GearsOrderByWithRelationInput[];
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<{ rows: GearWithRelations[]; total: number }> {
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

    // Convert Decimal types to regular numbers
    return { rows: serializeForClient(rows), total };
  }

  // Gear Priorities
  async listGearPriorities() {
    const rows = await prisma.gearPriorities.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: "desc" },
      include: {
        gearSet: true,
        PrioritySub1: true,
        PrioritySub2: true,
        PrioritySub3: true,
        PrioritySub4: true,
        TargetHero: true,
        Heroes: { include: { Hero: true } },
      },
    });
    return convertDecimals(rows);
  }

  async createGearPriority(data: {
    name: string;
    gearType?: GearType | null;
    gearSetId?: number | null;
    mainStatType?: MainStatType | null;
    prioritySub1Id?: number | null;
    prioritySub2Id?: number | null;
    prioritySub3Id?: number | null;
    prioritySub4Id?: number | null;
    heroIngameId?: bigint | null;
    heroName?: string | null;
    isActive?: boolean;
  }) {
    const created = await prisma.gearPriorities.create({
      data: { ...data, userId: this.userId },
    });
    return convertDecimals(created);
  }

  async updateGearPriority(
    id: number,
    data: Partial<{
      name: string;
      gearType: "weapon" | "armor" | "helm" | "neck" | "ring" | "boot" | null;
      gearSetId?: number | null;
      mainStatType: MainStatType | null;
      prioritySub1Id: number | null;
      prioritySub2Id: number | null;
      prioritySub3Id: number | null;
      prioritySub4Id: number | null;
      heroIngameId: bigint | null;
      heroName: string | null;
      isActive: boolean;
    }>
  ) {
    // Narrow update payload to match Prisma client expectations
    const updateData: Prisma.GearPrioritiesUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.gearType !== undefined)
      updateData.gearType = data.gearType as GearType | null;
    if (data.gearSetId !== undefined)
      updateData.gearSet =
        data.gearSetId === null
          ? { disconnect: true }
          : { connect: { id: data.gearSetId } };
    if (data.mainStatType !== undefined)
      updateData.mainStatType = data.mainStatType as MainStatType | null;
    if (data.prioritySub1Id !== undefined)
      updateData.PrioritySub1 =
        data.prioritySub1Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub1Id } };
    if (data.prioritySub2Id !== undefined)
      updateData.PrioritySub2 =
        data.prioritySub2Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub2Id } };
    if (data.prioritySub3Id !== undefined)
      updateData.PrioritySub3 =
        data.prioritySub3Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub3Id } };
    if (data.prioritySub4Id !== undefined)
      updateData.PrioritySub4 =
        data.prioritySub4Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub4Id } };
    if (data.heroIngameId !== undefined)
      updateData.TargetHero =
        data.heroIngameId === null
          ? { disconnect: true }
          : { connect: { ingameId: data.heroIngameId } };
    if (data.heroName !== undefined) updateData.heroName = data.heroName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.gearPriorities.update({
      where: { id },
      data: updateData,
    });
    return convertDecimals(updated);
  }

  async deleteGearPriority(id: number) {
    await prisma.gearPriorities.delete({ where: { id } });
    return true;
  }
  async getGearStats() {
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

  async getGearSetStats() {
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
        gs.setName,
        gs.piecesRequired,
        COUNT(g.id) as totalCount,
        COUNT(CASE WHEN g.equipped = true THEN 1 END) as equippedCount
      FROM gear_sets gs
      LEFT JOIN gears g ON g.set = gs.setName AND g.userId = ${this.userId}
      WHERE gs.isActive = true
      GROUP BY gs.setName, gs.piecesRequired
      HAVING COUNT(g.id) > 0
      ORDER BY gs.piecesRequired DESC, gs.setName ASC
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

  // Settings
  async getSettings(): Promise<SettingsWithUser | null> {
    const settings = await prisma.settings.findUnique({
      where: { userId: this.userId },
      include: { User: true },
    });

    return settings ? convertDecimals(settings) : null;
  }

  async createOrUpdateSettings(data: Omit<Prisma.SettingsCreateInput, "user">) {
    await prisma.settings.upsert({
      where: { userId: this.userId },
      update: data,
      create: {
        ...data,
        User: { connect: { id: this.userId } },
      },
    });

    // Fetch the settings with user relation separately
    const settingsWithUser = await prisma.settings.findUnique({
      where: { userId: this.userId },
      include: { User: true },
    });

    return convertDecimals(settingsWithUser);
  }

  // Utility methods
  async getUser() {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return convertDecimals(user);
  }

  // Reference data methods
  async listGearSets() {
    const gearSets = await prisma.gearSets.findMany({
      where: { isActive: true },
      orderBy: { setName: "asc" },
    });
    return convertDecimals(gearSets);
  }

  async listStatTypes() {
    const statTypes = await prisma.statTypes.findMany({
      orderBy: { statName: "asc" },
    });
    return convertDecimals(statTypes);
  }
}

// Factory function to create DAL instance
export function createDataAccess(userId: string): DataAccessLayer {
  return new DataAccessLayer(userId);
}
