import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getUserId } from "@/lib/auth-utils";
import { HeroesDataAccess } from "@/lib/dal/heroes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication using centralized utility
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Use the heroes data access layer
    const heroesDataAccess = new HeroesDataAccess(getUserId(session));

    // Build where clause for search
    let whereClause: Parameters<HeroesDataAccess["getHeroesPage"]>[0]["where"] =
      {};
    if (query) {
      whereClause = {
        name: {
          contains: query,
          mode: "insensitive" as const,
        },
      };
    }

    // Get heroes using the data access layer
    const { rows: heroes } = await heroesDataAccess.getHeroesPage({
      page: 1,
      perPage: limit,
      where: whereClause,
      sortField: "name",
      sortDirection: "asc",
    });

    // Transform to the format expected by the filter components
    const heroOptions = heroes.map((hero) => ({
      id: hero.id,
      name: hero.name,
      count: hero.duplicateCount,
      element: hero.element,
      class: hero.class,
    }));

    return NextResponse.json({
      heroes: heroOptions,
    });
  } catch (error) {
    console.error("[HERO SEARCH DEBUG] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch heroes" },
      { status: 500 }
    );
  }
}
