import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(): Promise<NextResponse> {
  try {
    // Get current user
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Create data access layer for current user
    const dal = createDataAccess(session.user.id);

    // Get user's settings
    const settings = await dal.getSettings();
    if (!settings) {
      return NextResponse.json(
        { message: "No settings found" },
        { status: 400 }
      );
    }

    // Get user's gears
    const gears = await db.gears.findMany({
      where: { userId: session.user.id },
      include: { substats: { include: { statType: true } } },
    });

    // Recalculate scores for all user's gears
    const updates = gears.map(async (gear) => {
      let fScore = 0;
      let score = 0;

      // Calculate fScore using user's settings
      if (settings.fScoreSubstatWeights) {
        const subWeights = settings.fScoreSubstatWeights as Record<
          string,
          number
        >;
        for (const substat of gear.substats) {
          const weight = subWeights[substat.statType.statName] || 1;
          fScore += Number(substat.statValue) * weight;
        }
      }

      // Include main stat if enabled
      if (settings.fScoreIncludeMainStat && settings.fScoreMainStatWeights) {
        const mainWeights = settings.fScoreMainStatWeights as Record<
          string,
          number
        >;
        const mainWeight = mainWeights[gear.mainStatType] || 0;
        fScore += gear.mainStatValue * mainWeight;
      }

      // Calculate fixed score (unchanged)
      const fixedWeights: Record<string, number> = {
        Speed: 2.0,
        "Crit %": 1.5,
        "Crit Dmg %": 1.3,
        "Attack %": 1.2,
        "Defense %": 0.8,
        "Health %": 0.8,
        "Effectiveness %": 0.7,
        "Effect Resist %": 0.6,
        Attack: 0.3,
        Defense: 0.2,
        Health: 0.2,
      };

      for (const substat of gear.substats) {
        const weight = fixedWeights[substat.statType.statName] || 1;
        score += Number(substat.statValue) * weight;
      }

      // Update gear with new scores
      return db.gears.update({
        where: { id: gear.id },
        data: {
          fScore: Math.round(fScore * 100) / 100,
          score: Math.round(score * 100) / 100,
        },
      });
    });

    await Promise.all(updates);

    return NextResponse.json({
      message: "Scores recalculated successfully",
      count: gears.length,
    });
  } catch (error) {
    console.error("Recalculate scores error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
