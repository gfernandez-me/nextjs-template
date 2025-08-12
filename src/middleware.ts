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

  // If user is signed in and tries to access sign in page, redirect to home
  if (pathname === "/signin" && token) {
    return NextResponse.redirect(new URL("/", request.url));
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
