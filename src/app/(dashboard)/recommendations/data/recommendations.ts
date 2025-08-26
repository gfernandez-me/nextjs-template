import type { GearType, MainStatType, Prisma } from "#prisma";
import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Raw types from Prisma
type RawGearRecommendation = Prisma.GearRecommendationGetPayload<{
  include: {
    GearRecommendationItem: {
      include: {
        StatType1: true;
        StatType2: true;
        StatType3: true;
        StatType4: true;
      };
    };
    User: true;
  };
}>;

// Serialized types for client components
export type GearRecommendationForTable = RawGearRecommendation;

// Type aliases
export type GearRecommendationWithFullRelations = GearRecommendationForTable;

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export class RecommendationsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get all gear recommendations for the current user
   */
  async getAllRecommendations(): Promise<GearRecommendationForTable[]> {
    const recommendations = await prisma.gearRecommendation.findMany({
      where: { userId: this.userId },
      include: {
        GearRecommendationItem: {
          include: {
            StatType1: true,
            StatType2: true,
            StatType3: true,
            StatType4: true,
          },
        },
        User: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return convertDecimals(recommendations) as GearRecommendationForTable[];
  }

  /**
   * Get a single gear recommendation by ID
   */
  async getRecommendationById(
    id: number
  ): Promise<GearRecommendationForTable | null> {
    const recommendation = await prisma.gearRecommendation.findFirst({
      where: {
        id,
        userId: this.userId,
      },
      include: {
        GearRecommendationItem: {
          include: {
            StatType1: true,
            StatType2: true,
            StatType3: true,
            StatType4: true,
          },
        },
        User: true,
      },
    });

    return recommendation
      ? (convertDecimals(recommendation) as GearRecommendationForTable)
      : null;
  }

  /**
   * Create a new gear recommendation
   */
  async createRecommendation(data: {
    name: string;
    heroName?: string;
    items: Array<{
      type: GearType;
      mainStatType: MainStatType;
      statType1Id: number;
      statType2Id?: number;
      statType3Id?: number;
      statType4Id?: number;
    }>;
  }): Promise<GearRecommendationForTable> {
    return prisma.gearRecommendation.create({
      data: {
        name: data.name,
        heroName: data.heroName,
        userId: this.userId,
        GearRecommendationItem: {
          create: data.items.map((item) => ({
            type: item.type,
            mainStatType: item.mainStatType,
            statType1Id: item.statType1Id,
            statType2Id: item.statType2Id,
            statType3Id: item.statType3Id,
            statType4Id: item.statType4Id,
          })),
        },
      },
      include: {
        GearRecommendationItem: {
          include: {
            StatType1: true,
            StatType2: true,
            StatType3: true,
            StatType4: true,
          },
        },
        User: true,
      },
    });
  }

  /**
   * Update an existing gear recommendation
   */
  async updateRecommendation(
    id: number,
    data: {
      name?: string;
      heroName?: string;
    }
  ): Promise<GearRecommendationForTable> {
    return prisma.gearRecommendation.update({
      where: {
        id,
        userId: this.userId,
      },
      data,
      include: {
        GearRecommendationItem: {
          include: {
            StatType1: true,
            StatType2: true,
            StatType3: true,
            StatType4: true,
          },
        },
        User: true,
      },
    });
  }

  /**
   * Delete a gear recommendation
   */
  async deleteRecommendation(id: number): Promise<void> {
    await prisma.gearRecommendation.delete({
      where: {
        id,
        userId: this.userId,
      },
    });
  }

  /**
   * Get recommendations count for the current user
   */
  async getRecommendationsCount(): Promise<number> {
    return prisma.gearRecommendation.count({
      where: { userId: this.userId },
    });
  }
}
