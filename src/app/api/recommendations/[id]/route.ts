import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid recommendation ID" },
        { status: 400 }
      );
    }

    // Check if the recommendation belongs to the current user
    const existingRecommendation = await prisma.gearRecommendation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingRecommendation) {
      return NextResponse.json(
        { message: "Recommendation not found" },
        { status: 404 }
      );
    }

    // Delete the recommendation (cascade will handle items)
    await prisma.gearRecommendation.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    console.error("Delete recommendation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
