import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Centralized session management utilities
 * Following Next.js and Better Auth best practices
 */

/**
 * Get the current session for server components
 * This should only be called once per request in the layout
 * Individual pages should receive session data as props
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

/**
 * Require authentication for server components
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login?reason=auth");
  }

  return session;
}

/**
 * Check if user is admin
 * Must be called after requireAuth() or with a valid session
 */
export function isAdmin(session: { user: { role?: string } }) {
  return session.user.role === "ADMIN";
}

/**
 * Require admin role for server components
 * Redirects to home if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();

  // Check if user is admin (using the admin ID from seed)
  if (session.user.id !== "admin-user") {
    redirect("/?reason=insufficient_permissions");
  }

  return session;
}

/**
 * Get user ID from session
 * Throws error if session is invalid (for use in DAL constructors)
 */
export function getUserId(session: { user: { id: string } } | null): string {
  if (!session?.user?.id) {
    throw new Error("Invalid session: user ID not found");
  }
  return session.user.id;
}
