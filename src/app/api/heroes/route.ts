import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 50))
    );
    const full = searchParams.get("full") === "1";

    if (full) {
      const heroes = await db.heroes.findMany({
        where: q
          ? {
              name: {
                contains: q,
                mode: "insensitive",
              },
            }
          : undefined,
        select: { name: true, ingameId: true },
        orderBy: { name: "asc" },
        take: limit,
      });
      return NextResponse.json({ heroes });
    }

    const heroes = await db.heroes.findMany({
      where: q
        ? {
            name: {
              contains: q,
              mode: "insensitive",
            },
          }
        : undefined,
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
      take: limit,
    });

    const names = heroes.map((h) => h.name).filter(Boolean);
    return NextResponse.json({ names });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch heroes" },
      { status: 500 }
    );
  }
}
