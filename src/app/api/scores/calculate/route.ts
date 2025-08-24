import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { calculateUserGearScores } from "@/lib/calculate-scores";

export async function POST(): Promise<NextResponse> {
  try {
    // Get current user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Calculate scores for the current user's gear
    const result = await calculateUserGearScores(session.user.id);

    return NextResponse.json({
      message: "Scores calculated successfully",
      result,
    });
  } catch (error) {
    console.error("Error calculating scores:", error);
    return NextResponse.json(
      {
        message: "Failed to calculate scores",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
