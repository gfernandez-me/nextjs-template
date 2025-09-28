import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = [
    "/_next",
    "/api/auth",
    "/login",
    "/signup",
    "/favicon.ico",
    "/.well-known",
    "/api/public", // Add any public API routes
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow access to public routes and static files
  if (isPublicRoute || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Get session cookie using Better Auth's middleware helper
  const sessionCookie = getSessionCookie(request);
  const session = sessionCookie ? { user: sessionCookie } : null;

  // Handle root path '/'
  if (pathname === "/") {
    if (session?.user) {
      return NextResponse.redirect(new URL("/home", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (session?.user && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Define protected routes
  const protectedRoutes = [
    "/home",
    "/gears",
    "/heroes",
    "/recommendations",
    "/settings",
    "/upload",
    "/change-password",
    "/(dashboard)",
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without valid session, redirect to login
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle admin routes - basic check here, detailed validation in components
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/(dashboard)/admin")
  ) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Admin role validation will happen in the page component
    // This prevents non-authenticated users from accessing admin routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/gears",
    "/heroes",
    "/recommendations",
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
