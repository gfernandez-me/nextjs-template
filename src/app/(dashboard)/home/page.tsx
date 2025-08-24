import { Suspense } from "react";
import { HomeStatistics } from "./components/home-statistics";
import { HomeStatsDataAccess } from "./data/home-stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

async function getHomeStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Create data access layer for current user
  const dal = new HomeStatsDataAccess(session.user.id);

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
