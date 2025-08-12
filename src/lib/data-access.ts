import { db } from "./db";
import type { Prisma } from "#prisma";
import type { MainStatType, GearType } from "#prisma";

export type GearWithRelations = Prisma.GearsGetPayload<{
  include: {
    hero: true;
    substats: { include: { statType: true } };
    user: true;
  };
}>;

export type SettingsWithUser = Prisma.SettingsGetPayload<{
  include: { user: true };
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
      db.gears.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: userScopedWhere,
        orderBy: finalOrderBy?.length ? finalOrderBy : [{ createdAt: "desc" }],
        include: {
          hero: true,
          substats: { include: { statType: true } },
          user: true,
        },
      }),
      db.gears.count({ where: userScopedWhere }),
    ]);

    // Convert Decimal types to regular numbers
    return { rows: convertDecimals(rows), total };
  }

  // Gear Priorities
  async listGearPriorities() {
    const rows = await db.gearPriorities.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: "desc" },
      include: {
        gearSet: true,
        prioritySub1: true,
        prioritySub2: true,
        prioritySub3: true,
        prioritySub4: true,
        targetHero: true,
        heroes: { include: { hero: true } },
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
    const created = await db.gearPriorities.create({
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
      updateData.prioritySub1 =
        data.prioritySub1Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub1Id } };
    if (data.prioritySub2Id !== undefined)
      updateData.prioritySub2 =
        data.prioritySub2Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub2Id } };
    if (data.prioritySub3Id !== undefined)
      updateData.prioritySub3 =
        data.prioritySub3Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub3Id } };
    if (data.prioritySub4Id !== undefined)
      updateData.prioritySub4 =
        data.prioritySub4Id === null
          ? { disconnect: true }
          : { connect: { id: data.prioritySub4Id } };
    if (data.heroIngameId !== undefined)
      updateData.targetHero =
        data.heroIngameId === null
          ? { disconnect: true }
          : { connect: { ingameId: data.heroIngameId } };
    if (data.heroName !== undefined) updateData.heroName = data.heroName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await db.gearPriorities.update({
      where: { id },
      data: updateData,
    });
    return convertDecimals(updated);
  }

  async deleteGearPriority(id: number) {
    await db.gearPriorities.delete({ where: { id } });
    return true;
  }
  async getGearStats() {
    const [total, equipped, epicPlus, maxEnhanced] = await Promise.all([
      db.gears.count({ where: { userId: this.userId } }),
      db.gears.count({ where: { userId: this.userId, equipped: true } }),
      db.gears.count({
        where: {
          userId: this.userId,
          OR: [{ rank: "Epic" }, { rank: "Heroic" }],
        },
      }),
      db.gears.count({ where: { userId: this.userId, enhance: 15 } }),
    ]);

    return { total, equipped, epicPlus, maxEnhanced };
  }

  // Settings
  async getSettings(): Promise<SettingsWithUser | null> {
    const settings = await db.settings.findUnique({
      where: { userId: this.userId },
      include: { user: true },
    });

    return settings ? convertDecimals(settings) : null;
  }

  async createOrUpdateSettings(data: Omit<Prisma.SettingsCreateInput, "user">) {
    await db.settings.upsert({
      where: { userId: this.userId },
      update: data,
      create: { ...data, userId: this.userId },
    });

    // Fetch the settings with user relation separately
    const settingsWithUser = await db.settings.findUnique({
      where: { userId: this.userId },
      include: { user: true },
    });

    return convertDecimals(settingsWithUser);
  }

  // Utility methods
  async getUser() {
    const user = await db.user.findUnique({
      where: { id: this.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return convertDecimals(user);
  }
}

// Factory function to create DAL instance
export function createDataAccess(userId: string): DataAccessLayer {
  return new DataAccessLayer(userId);
}
