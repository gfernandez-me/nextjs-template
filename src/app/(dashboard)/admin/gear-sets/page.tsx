import { StatisticsDataAccess } from "@/lib/dal/statistics";
import { requireAuth, getUserId } from "@/lib/auth-utils";
import { GearSetsTable } from "../components/gear-sets-table";

async function getGearSets() {
  // Get current user using centralized auth utility
  const session = await requireAuth();

  // Create data access layer for current user
  const dal = new StatisticsDataAccess(getUserId(session));

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
