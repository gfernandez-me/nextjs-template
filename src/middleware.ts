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
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow access to public routes and static files
  if (isPublicRoute || pathname.includes(".")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // If no session cookie, redirect to login
  if (!sessionCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If there's a session cookie, allow access (session validation will happen in the page)
  if (sessionCookie) {
    // Special handling for recent logins - allow a grace period
    const sessionToken = request.cookies.get("better-auth.session_token");

    if (sessionToken?.value) {
      // If we have a session token, allow access to all authenticated routes
      // This prevents the race condition during session establishment
      return NextResponse.next();
    }

    // If session is valid and user is on login page, redirect to home
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    // Valid session, allow request
    return NextResponse.next();
  }

  // Handle root path '/'
  if (pathname === "/") {
    if (sessionCookie) {
      // If we have a session cookie, redirect to home
      return NextResponse.redirect(new URL("/home", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    // Valid session, redirect to home
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // List of protected routes (update as per current structure)
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

  // Protect /admin routes for admin users only
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/(dashboard)/admin")
  ) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Admin validation will happen in the page component
  }

  // Protect other routes for authenticated users
  if (
    !sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For protected routes, if cookie exists, allow access (validation happens in page)
  if (
    sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
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
