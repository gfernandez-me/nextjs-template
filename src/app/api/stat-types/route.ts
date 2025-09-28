import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get current session using centralized auth utility
    const session = await requireAuth();

    // Fetch all stat types
    const statTypes = await prisma.statTypes.findMany({
      orderBy: { statName: "asc" },
    });

    return NextResponse.json(statTypes);
  } catch (error) {
    console.error("Error fetching stat types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
