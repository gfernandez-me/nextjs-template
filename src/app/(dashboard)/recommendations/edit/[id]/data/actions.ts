import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

export async function getRecommendationById(
  id: number,
  userId: string
): Promise<{
  id: number;
  name: string;
  heroName: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  GearRecommendationItem: Array<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    type: import("#prisma").GearType;
    mainStatType: import("#prisma").MainStatType;
    statType1Id: number;
    statType2Id: number | null;
    statType3Id: number | null;
    statType4Id: number | null;
    gearRecommendationId: number;
    StatType1: Omit<import("#prisma").StatTypes, "weight"> & { weight: number };
    StatType2:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
    StatType3:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
    StatType4:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
  }>;
} | null> {
  try {
    const recommendation = await prisma.gearRecommendation.findFirst({
      where: {
        id,
        userId,
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
      },
    });

    // Convert Decimal types to numbers for client component compatibility
    const serializedRecommendation = recommendation
      ? convertDecimals(recommendation)
      : null;
    return serializedRecommendation as Awaited<
      ReturnType<typeof getRecommendationById>
    >;
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    return null;
  }
}
