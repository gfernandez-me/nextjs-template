import { NextResponse } from "next/server";
import { SettingsDataAccess } from "@/lib/dal/settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(): Promise<NextResponse> {
  try {
    // Get current user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Create data access layer for current user
    const dal = new SettingsDataAccess(session.user.id);

    // Get user's settings
    const settings = await dal.getSettings();
    if (!settings) {
      return NextResponse.json(
        { message: "No settings found" },
        { status: 400 }
      );
    }

    // Get user's gears
    const gears = await prisma.gears.findMany({
      where: { userId: session.user.id },
      include: {
        GearSubStats: { include: { StatType: true } },
        User: true,
        Hero: true,
      },
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
        for (const substat of gear.GearSubStats) {
          const weight = subWeights[substat.StatType.statName] || 1;
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
        fScore += Number(gear.mainStatValue) * mainWeight;
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

      for (const substat of gear.GearSubStats) {
        const weight = fixedWeights[substat.StatType.statName] || 1;
        score += Number(substat.statValue) * weight;
      }

      // Update gear with new scores
      return prisma.gears.update({
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
