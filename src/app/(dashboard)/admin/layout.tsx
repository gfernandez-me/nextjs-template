import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // TODO: Add proper admin role checking when user roles are implemented
  // For now, we'll use a simple check - you can enhance this later
  const isAdmin = session.user.email === "admin@epic7optimizer.com";

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage Epic 7 Gear Optimizer system settings and data.
        </p>
      </div>
      {children}
    </div>
  );
}
