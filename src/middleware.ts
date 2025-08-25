import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const { pathname } = request.nextUrl;

  // Handle root path '/'
  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/home", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // List of protected routes (update as per current structure)
  const protectedRoutes = [
    "/home",
    "/gears",
    "/heroes",
    "/gear-priorities",
    "/settings",
    "/upload",
    "/change-password",
    "/(dashboard)",
  ];

  // Protect /admin routes for admin users only
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/(dashboard)/admin")
  ) {
    if (!sessionCookie || !(await isAdmin(sessionCookie))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect other routes for authenticated users
  if (
    !sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();

  // Helper to check admin status using Better Auth session
  async function isAdmin(cookie: string) {
    try {
      const headers = new Headers();
      headers.append("cookie", cookie);

      const session = await auth.api.getSession({ headers });
      if (!session?.user) return false;

      // Check if user is admin by email (since role is not in default schema)
      return session.user.email === "admin@epic7optimizer.com";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/gears",
    "/heroes",
    "/gear-priorities",
    "/settings",
    "/upload",
    "/change-password",
    "/login",
    "/signup",
    "/admin",
    "/(dashboard)/admin",
    "/(dashboard)",
  ], // Apply middleware to these routes
};
