import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    options: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60, // 30 days (match session maxAge)
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "my-better-auth-secret-key", // Fallback for development
  trustHost: true,
  debug: true,
});
