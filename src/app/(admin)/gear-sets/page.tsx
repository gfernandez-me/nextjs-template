import { StatisticsDataAccess } from "../data/statistics";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GearSetsTable } from "../components/gear-sets-table";

async function getGearSets() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  // Create data access layer for current user
  const dal = new StatisticsDataAccess(session.user.id);

  // Fetch gear sets from database
  return await dal.listGearSets();
}

export default async function GearSetsManagementPage() {
  const gearSets = await getGearSets();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gear Sets Management
          </h2>
          <p className="text-muted-foreground">
            Manage Epic 7 gear sets, their effects, and properties.
          </p>
        </div>
      </div>

      <GearSetsTable initialData={gearSets} />
    </div>
  );
}
