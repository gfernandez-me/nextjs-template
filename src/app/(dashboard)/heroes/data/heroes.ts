import type { Prisma } from "#prisma";
import { HeroElement, HeroRarity, HeroClass } from "#prisma";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HeroForTable = {
  id: number;
  ingameId: string; // Serialized BigInt as string
  name: string;
  duplicateCount: number;
  element: HeroElement | null;
  rarity: HeroRarity | null;
  class: HeroClass | null;
  attack: number | null;
  defense: number | null;
  health: number | null;
  speed: number | null;
  criticalHitChance: number | null;
  criticalHitDamage: number | null;
  effectiveness: number | null;
  effectResistance: number | null;
  createdAt: Date;
  updatedAt: Date;
  gearCount: number; // Number of gear pieces equipped
};

// ============================================================================
// DATA ACCESS CLASS
// ============================================================================

export class HeroesDataAccess {
  constructor(private userId: string) {}

  /**
   * Get paginated heroes for table display
   */
  async getHeroesPage(params: {
    page: number;
    perPage: number;
    where?: Prisma.HeroesWhereInput;
    sortField?: string;
    sortDirection?: string;
  }): Promise<{ rows: HeroForTable[]; total: number }> {
    const { page, perPage, where = {}, sortField, sortDirection } = params;

    // Always scope to current user
    const userScopedWhere = { ...where, userId: this.userId };

    // Build orderBy from sortField and sortDirection
    let orderBy: Prisma.HeroesOrderByWithRelationInput[] | undefined;
    if (sortField && sortDirection) {
      const direction = sortDirection.toLowerCase() === "desc" ? "desc" : "asc";
      orderBy = [
        { [sortField]: direction } as Prisma.HeroesOrderByWithRelationInput,
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.heroes.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: userScopedWhere,
        orderBy: orderBy || [{ createdAt: "desc" }],
        include: {
          _count: {
            select: {
              Gears: true,
            },
          },
        },
      }),
      prisma.heroes.count({ where: userScopedWhere }),
    ]);

    // Transform to include gear count from the included _count
    const transformedRows: HeroForTable[] = rows.map((hero) => ({
      id: hero.id,
      ingameId: hero.ingameId.toString(), // Serialize BigInt to string
      name: hero.name,
      duplicateCount: hero.duplicateCount,
      element: hero.element,
      rarity: hero.rarity,
      class: hero.class,
      attack: hero.attack,
      defense: hero.defense,
      health: hero.health,
      speed: hero.speed,
      criticalHitChance: hero.criticalHitChance,
      criticalHitDamage: hero.criticalHitDamage,
      effectiveness: hero.effectiveness,
      effectResistance: hero.effectResistance,
      createdAt: hero.createdAt,
      updatedAt: hero.updatedAt,
      gearCount: hero._count.Gears, // Use actual gear count from database
    }));

    return { rows: transformedRows, total };
  }

  /**
   * Get hero statistics for dashboard
   */
  async getHeroStats(): Promise<{
    total: number;
    withGear: number;
    byElement: Record<string, number>;
    byClass: Record<string, number>;
  }> {
    const [total, withGear, byElement, byClass] = await Promise.all([
      prisma.heroes.count({ where: { userId: this.userId } }),
      prisma.heroes.count({
        where: {
          userId: this.userId,
          Gears: { some: {} },
        },
      }),
      prisma.heroes.groupBy({
        by: ["element"],
        where: { userId: this.userId },
        _count: { element: true },
      }),
      prisma.heroes.groupBy({
        by: ["class"],
        where: { userId: this.userId },
        _count: { class: true },
      }),
    ]);

    const elementStats: Record<string, number> = {};
    byElement.forEach((group) => {
      const element = group.element || "Unknown";
      elementStats[element] = group._count.element;
    });

    const classStats: Record<string, number> = {};
    byClass.forEach((group) => {
      const heroClass = group.class || "Unknown";
      classStats[heroClass] = group._count.class;
    });

    return { total, withGear, byElement: elementStats, byClass: classStats };
  }

  /**
   * Delete hero and all related data
   */
  async deleteHero(heroId: number): Promise<void> {
    await prisma.heroes.delete({
      where: { id: heroId, userId: this.userId },
    });
  }
}
