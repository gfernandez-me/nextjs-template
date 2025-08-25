import type { Prisma } from "#prisma";
import { HeroElement, HeroClass, HeroRarity } from "#prisma";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Hero with basic information for list display
export type HeroForList = Prisma.HeroesGetPayload<{
  include: {
    User: true;
    GearRecommendations: true;
  };
}>;

// Hero with full equipment and gear details
export type HeroWithEquipment = Prisma.HeroesGetPayload<{
  include: {
    User: true;
    GearRecommendations: true;
    Gears: true;
  };
}>;

// Hero with gear recommendations
export type HeroWithRecommendations = Prisma.HeroesGetPayload<{
  include: {
    User: true;
    GearRecommendations: true;
  };
}>;

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export class HeroesDataAccess {
  constructor(private userId: string) {}

  /**
   * Get all heroes for the current user
   */
  async getAllHeroes(): Promise<HeroForList[]> {
    return prisma.heroes.findMany({
      where: { userId: this.userId },
      include: {
        User: true,
        GearRecommendations: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get hero by ID with full equipment details
   */
  async getHeroById(id: number): Promise<HeroWithEquipment | null> {
    return prisma.heroes.findFirst({
      where: { id, userId: this.userId },
      include: {
        User: true,
        GearRecommendations: true,
        Gears: true,
      },
    });
  }

  /**
   * Get hero by Epic 7 ingame ID
   */
  async getHeroByIngameId(ingameId: bigint): Promise<HeroWithEquipment | null> {
    return prisma.heroes.findFirst({
      where: { ingameId, userId: this.userId },
      include: {
        User: true,
        GearRecommendations: true,
        Gears: true,
      },
    });
  }

  /**
   * Get heroes by element for filtering
   */
  async getHeroesByElement(element: HeroElement): Promise<HeroForList[]> {
    return prisma.heroes.findMany({
      where: { userId: this.userId, element },
      include: {
        User: true,
        GearRecommendations: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get heroes by class for filtering
   */
  async getHeroesByClass(heroClass: HeroClass): Promise<HeroForList[]> {
    return prisma.heroes.findMany({
      where: { userId: this.userId, class: heroClass },
      include: {
        User: true,
        GearRecommendations: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get heroes by rarity for filtering
   */
  async getHeroesByRarity(rarity: HeroRarity): Promise<HeroForList[]> {
    return prisma.heroes.findMany({
      where: { userId: this.userId, rarity },
      include: {
        User: true,
        GearRecommendations: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get heroes with gear recommendations for optimization
   */
  async getHeroesWithPriorities(): Promise<HeroWithEquipment[]> {
    return prisma.heroes.findMany({
      where: { userId: this.userId },
      include: {
        User: true,
        GearRecommendations: {
          include: {
            GearRecommendationItem: {
              include: {
                StatType1: true,
                StatType2: true,
                StatType3: true,
                StatType4: true,
              },
            },
          },
        },
        Gears: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Create a new hero
   */
  async createHero(data: {
    name: string;
    ingameId: bigint;
    element: HeroElement;
    heroClass: HeroClass;
    rarity: HeroRarity;
    level: number;
    awakening: number;
    imprint: number;
    skillEnhance: number;
  }): Promise<HeroForList> {
    return prisma.heroes.create({
      data: { ...data, userId: this.userId },
      include: {
        User: true,
        GearRecommendations: true,
      },
    });
  }

  /**
   * Update hero information
   */
  async updateHero(
    id: number,
    data: Partial<{
      name: string;
      level: number;
      awakening: number;
      imprint: number;
      skillEnhance: number;
    }>
  ): Promise<HeroForList> {
    return prisma.heroes.update({
      where: { id, userId: this.userId },
      data,
      include: {
        User: true,
        GearRecommendations: true,
      },
    });
  }

  /**
   * Delete hero and clear equipment references
   */
  async deleteHero(id: number): Promise<void> {
    // First, clear any gear that references this hero
    await prisma.gears.updateMany({
      where: { heroId: id, userId: this.userId },
      data: { heroId: null, equipped: false },
    });

    // Then delete the hero
    await prisma.heroes.delete({
      where: { id, userId: this.userId },
    });
  }

  /**
   * Get hero statistics for dashboard
   */
  async getHeroStats(): Promise<{
    total: number;
    byElement: Record<HeroElement, number>;
    byClass: Record<HeroClass, number>;
    byRarity: Record<HeroRarity, number>;
    maxLevel: number;
    maxAwakening: number;
  }> {
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

    const maxLevel = 0;
    const maxAwakening = 0;

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
      maxLevel,
      maxAwakening,
    };
  }
}
