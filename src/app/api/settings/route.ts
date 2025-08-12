import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";

export const dynamic = "force-dynamic";

export async function GET() {
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
    // Get current user
    const session = await getAuth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Create data access layer for current user
    const dal = createDataAccess(session.user.id);

    const body = await request.json();

    // Create or update settings for the current user
    const settings = await dal.createOrUpdateSettings({
      fScoreIncludeMainStat: body.fScoreIncludeMainStat,
      fScoreSubstatWeights: body.fScoreSubstatWeights,
      fScoreMainStatWeights: body.fScoreMainStatWeights,
      substatThresholds: body.substatThresholds,
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
