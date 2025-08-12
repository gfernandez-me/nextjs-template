import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
