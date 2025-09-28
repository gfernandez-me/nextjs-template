import { NextRequest, NextResponse } from "next/server";
import { SettingsDataAccess } from "@/lib/dal/settings";
import { requireAuth, getUserId } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get current user using centralized auth utility
    const session = await requireAuth();

    // Create data access layer for current user
    const dal = new SettingsDataAccess(getUserId(session));

    // Get user's settings
    const settings = await dal.getSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
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

    // Create data access layer for current user
    const dal = new SettingsDataAccess(getUserId(session));

    const body = await request.json();

    // Create or update settings for the current user
    const settings = await dal.upsertSettings({
      fScoreIncludeMainStat: body.fScoreIncludeMainStat,
      fScoreSubstatWeights: body.fScoreSubstatWeights,
      fScoreMainStatWeights: body.fScoreMainStatWeights,
      substatThresholds: body.substatThresholds,
      minScore: body.minScore ?? 0,
      maxScore: body.maxScore ?? 100,
      minFScore: body.minFScore ?? 0,
      maxFScore: body.maxFScore ?? 100,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
