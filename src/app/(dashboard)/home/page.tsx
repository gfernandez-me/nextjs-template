import { SectionCards } from "@/components/section-cards";
import { StatisticsContent } from "@/components/statistics-content";
import { createDataAccess } from "@/lib/data-access";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getDashboardStats() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Fetch real stats from database
  return await dal.getGearStats();
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Epic 7 Gear Optimizer dashboard. Here you can view
          your gear statistics and manage your optimization settings.
        </p>
      </div>

      <SectionCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <StatisticsContent stats={stats} />
        </div>
        <div className="col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Upload new gear data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Configure gear priorities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">View gear statistics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Manage optimization settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
