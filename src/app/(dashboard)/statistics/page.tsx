import { StatisticsContent } from "@/components/statistics-content";
import { createDataAccess } from "@/lib/data-access";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getStats() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Fetch real stats from database
  return await dal.getGearStats();
}

export default async function StatisticsPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">
          View detailed statistics and analytics about your Epic 7 gear
          collection.
        </p>
      </div>

      <StatisticsContent stats={stats} />
    </div>
  );
}
