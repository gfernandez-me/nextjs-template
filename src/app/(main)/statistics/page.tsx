import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { redirect } from "next/navigation";
import { StatisticsContent } from "@/components/statistics-content";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  // Get current user
  const session = await getAuth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Get user's gear statistics
  const stats = await dal.getGearStats();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Statistics</h1>
      <StatisticsContent stats={stats} />
    </div>
  );
}
