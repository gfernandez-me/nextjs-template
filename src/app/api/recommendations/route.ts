import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get current user using centralized auth utility
    const session = await requireAuth();

    // Get all recommendations for the current user
    const recommendations = await prisma.gearRecommendation.findMany({
      where: { userId: getUserId(session) },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal types to numbers for client component compatibility
    const serializedRecommendations = convertDecimals(recommendations);

    return NextResponse.json(serializedRecommendations);
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user using centralized auth utility
    const session = await requireAuth();

    const body = await request.json();
    const isUpdate = body.id && typeof body.id === "number";

    if (isUpdate) {
      // Update existing recommendation
      const recommendation = await prisma.gearRecommendation.update({
        where: {
          id: body.id,
          userId: getUserId(session), // Ensure user owns this recommendation
        },
        data: {
          name: body.name,
          heroName: body.heroName || null,
          // Delete existing items and recreate them
          GearRecommendationItem: {
            deleteMany: {},
            create: body.items.map(
              (item: {
                type: string;
                mainStatType: string;
                statType1Id: number;
                statType2Id?: number;
                statType3Id?: number;
                statType4Id?: number;
              }) => ({
                type: item.type,
                mainStatType: item.mainStatType,
                statType1Id: item.statType1Id,
                statType2Id: item.statType2Id || null,
                statType3Id: item.statType3Id || null,
                statType4Id: item.statType4Id || null,
              })
            ),
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
        },
      });

      // Convert Decimal types to numbers for client component compatibility
      const serializedRecommendation = convertDecimals(recommendation);
      return NextResponse.json(serializedRecommendation);
    } else {
      // Create new recommendation
      const recommendation = await prisma.gearRecommendation.create({
        data: {
          name: body.name,
          userId: getUserId(session),
          heroName: body.heroName || null,
          GearRecommendationItem: {
            create: body.items.map(
              (item: {
                type: string;
                mainStatType: string;
                statType1Id: number;
                statType2Id?: number;
                statType3Id?: number;
                statType4Id?: number;
              }) => ({
                type: item.type,
                mainStatType: item.mainStatType,
                statType1Id: item.statType1Id,
                statType2Id: item.statType2Id || null,
                statType3Id: item.statType3Id || null,
                statType4Id: item.statType4Id || null,
              })
            ),
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
        },
      });

      // Convert Decimal types to numbers for client component compatibility
      const serializedRecommendation = convertDecimals(recommendation);
      return NextResponse.json(serializedRecommendation);
    }
  } catch (error) {
    console.error("Create/Update recommendation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
