import { Suspense } from "react";
import { HomeStatistics } from "./components/home-statistics";
import { HomeStatsDataAccess } from "@/lib/dal/home-stats";
import { requireAuth, getUserId } from "@/lib/auth-utils";

async function getHomeStats() {
  // Get session from layout context - no need to fetch again
  const session = await requireAuth();

  // Create data access layer for current user
  const dal = new HomeStatsDataAccess(getUserId(session));

  // Fetch home-specific stats
  return await dal.getHomeStats();
}

export default async function HomePage() {
  const stats = await getHomeStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Epic 7 Gear Optimizer dashboard. Here you can view
          your gear statistics and manage your optimization settings.
        </p>
      </div>

      <Suspense fallback={<div>Loading statistics...</div>}>
        <HomeStatistics stats={stats} />
      </Suspense>
    </div>
  );
}
