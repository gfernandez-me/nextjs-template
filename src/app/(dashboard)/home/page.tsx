import { StatisticsContent } from "@/components/statistics-content";
import { createDataAccess } from "@/lib/data-access";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getDashboardStats() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      total: 0,
      equipped: 0,
      epicPlus: 0,
      maxEnhanced: 0,
      gearSetStats: {
        totalGears: 0,
        totalEquipped: 0,
        totalGearsWithSets: 0,
        gearSetStats: [],
      },
    };
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Fetch real stats from database
  const [basicStats, gearSetStats] = await Promise.all([
    dal.getGearStats(),
    dal.getGearSetStats(),
  ]);

  return { ...basicStats, gearSetStats };
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

      {/* Statistics Overview */}
      <StatisticsContent stats={stats} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
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
        <div className="col-span-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Gear Collection Status</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Collection Progress</span>
                  <span className="text-sm font-medium">
                    {stats.total > 0
                      ? Math.round((stats.epicPlus / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        stats.total > 0
                          ? Math.round((stats.epicPlus / stats.total) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.epicPlus} of {stats.total} gears are Epic+ quality
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
