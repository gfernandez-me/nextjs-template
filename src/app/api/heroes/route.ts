import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { convertDecimals } from "@/lib/decimal";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");

    let whereClause = {};
    if (query) {
      whereClause = {
        name: {
          contains: query,
          mode: "insensitive" as const,
        },
      };
    }

    const heroes = await prisma.heroes.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        element: true,
        class: true,
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    const convertedHeroes = convertDecimals(heroes);

    // Handle duplicate hero names by adding index for unique keys
    const heroNamesWithIndex = convertedHeroes.map((h, index) => ({
      name: h.name,
      key: `${h.name}-${index}`,
      hero: h,
    }));

    return NextResponse.json({
      names: heroNamesWithIndex.map((h) => h.name),
      heroes: convertedHeroes,
      heroNamesWithIndex: heroNamesWithIndex,
    });
  } catch (error) {
    console.error("Error fetching heroes:", error);
    return NextResponse.json(
      { error: "Failed to fetch heroes" },
      { status: 500 }
    );
  }
}
