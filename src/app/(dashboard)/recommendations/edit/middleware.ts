import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const config = {
  matcher: ["/recommendations/edit/:path*"],
};

export async function middleware(request: Request) {
  // Protected routes require auth and can be accessed by anyone
  return await withAuth(request);
}

async function withAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    const url = new URL(request.url);
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(url.pathname)}`, url)
    );
  }

  return NextResponse.next();
}
