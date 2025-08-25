import { GearType, MainStatType, StatTypes } from "#prisma";
import prisma from "@/lib/prisma";

export interface CreateRecommendationInput {
  name: string;
  userId: string;
  heroId?: number;
  items: {
    type: GearType;
    mainStatType: MainStatType;
    statType1Id: number;
    statType2Id?: number;
    statType3Id?: number;
    statType4Id?: number;
  }[];
}

export async function createRecommendation(data: CreateRecommendationInput) {
  return prisma.gearRecommendation.create({
    data: {
      name: data.name,
      userId: data.userId,
      heroId: data.heroId,
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
      Hero: true,
      GearRecommendationItem: {
        include: {
          StatType1: true,
          StatType2: true,
          StatType3: true,
          StatType4: true,
        },
      },
    },
  });
}

export async function getHeroes() {
  return prisma.heroes.findMany({
    select: {
      id: true,
      name: true,
      element: true,
      class: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getStatTypes() {
  return prisma.statTypes.findMany({
    orderBy: {
      statName: "asc",
    },
  });
}
