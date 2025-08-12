import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that are public (no authentication required)
const publicRoutes = ["/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's not a public route and no token, redirect to sign in
  if (!isPublicRoute && !token) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If visiting the sign-in page and a token exists (possibly stale), clear it to avoid loops
  if (pathname.startsWith("/signin") && token) {
    const res = NextResponse.next();
    res.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Use default runtime; edge is not required for this middleware
// export const runtime = "experimental-edge";
