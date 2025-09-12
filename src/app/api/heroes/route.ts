import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HeroesDataAccess } from "@/app/(dashboard)/heroes/data/heroes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Use the heroes data access layer
    const heroesDataAccess = new HeroesDataAccess(session.user.id);

    // Build where clause for search
    let whereClause = {};
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

    // Handle duplicate hero names by adding index for unique keys
    const heroNamesWithIndex = heroes.map((h, index) => ({
      name: h.name,
      key: `${h.name}-${index}`,
      hero: h,
    }));

    return NextResponse.json({
      names: heroNamesWithIndex.map((h) => h.name),
      heroes: heroes,
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
