import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Trim password to handle any whitespace
    const trimmedPassword = password.trim();

    const session = await signIn(email, trimmedPassword);

    if (!session) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { message: "Signed in successfully", user: session.user },
      { status: 200 }
    );

    // Set JWT token as HTTP-only cookie
    response.cookies.set("auth-token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
