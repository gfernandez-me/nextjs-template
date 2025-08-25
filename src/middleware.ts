import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

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

  // If there's a session cookie, verify it
  if (sessionCookie) {
    try {
      const headers = new Headers();
      headers.append("cookie", sessionCookie);

      // Special handling for recent logins - allow a grace period
      const sessionToken = request.cookies.get("better-auth.session_token");

      if (sessionToken?.value) {
        // If we have a session token, allow access to all authenticated routes
        // This prevents the race condition during session establishment
        return NextResponse.next();
      }

      const session = await auth.api.getSession({ headers });

      // If session is valid and user is on login page, redirect to home
      if (session?.user?.id && pathname === "/login") {
        return NextResponse.redirect(new URL("/home", request.url));
      }

      // If session is invalid and not on login page, redirect to login
      if (!session?.user?.id && pathname !== "/login") {
        const response = NextResponse.redirect(new URL("/login", request.url));
        clearAuthCookies(response);
        return response;
      }

      // Valid session, allow request
      return NextResponse.next();
    } catch (error) {
      console.error("Session validation error:", error);
      // On error, clear cookies and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearAuthCookies(response);
      return response;
    }
  }

  // Helper function to clear all auth-related cookies
  function clearAuthCookies(response: NextResponse) {
    response.cookies.delete("auth-session");
    response.cookies.delete("auth-session.sig");
    response.cookies.delete("auth-session.enc");
    // Add any other auth-related cookies your setup might use
  }

  // Handle root path '/'
  if (pathname === "/") {
    if (sessionCookie) {
      // Validate session before redirecting
      try {
        const headers = new Headers();
        headers.append("cookie", sessionCookie);
        const session = await auth.api.getSession({ headers });

        if (session?.user?.id) {
          // Valid session, redirect to home
          return NextResponse.redirect(new URL("/home", request.url));
        }
        // If session is invalid, just redirect to login without clearing cookies
        // This allows the auth system to handle token refresh if needed
        return NextResponse.redirect(new URL("/login", request.url));
      } catch (error) {
        console.error("Error validating session:", error);
        // Session validation failed, clear cookie and redirect to login
        const response = NextResponse.redirect(
          new URL("/login?reason=session-error", request.url)
        );
        clearAuthCookies(response);
        return response;
      }
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    try {
      const headers = new Headers();
      headers.append("cookie", sessionCookie);
      const session = await auth.api.getSession({ headers });

      if (session?.user?.id) {
        // Valid session, redirect to home with redirect count
        const homeUrl = new URL("/home", request.url);
        return NextResponse.redirect(homeUrl);
      } else {
        // Invalid session, clear cookie and stay on login
        const response = NextResponse.next();
        clearAuthCookies(response);
        return response;
      }
    } catch (error) {
      console.error("Error validating session:", error);
      // Session validation failed, clear cookie and stay on login
      const response = NextResponse.next();
      clearAuthCookies(response);
      return response;
    }
  }

  // List of protected routes (update as per current structure)
  const protectedRoutes = [
    "/home",
    "/gears",
    "/heroes",
    "/gear-recommendations",
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

  // For protected routes, validate session if cookie exists
  if (
    sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    try {
      const headers = new Headers();
      headers.append("cookie", sessionCookie);
      const session = await auth.api.getSession({ headers });

      if (!session?.user?.id) {
        // Invalid session, clear cookie and redirect to login
        const response = NextResponse.redirect(
          new URL("/login?reason=invalid-session", request.url)
        );
        clearAuthCookies(response);
        return response;
      }
    } catch (error) {
      console.error("Error validating session:", error);
      // Session validation failed, clear cookie and redirect to login
      const response = NextResponse.redirect(
        new URL("/login?reason=session-error", request.url)
      );
      clearAuthCookies(response);
      return response;
    }
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
    "/gear-recommendations",
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
