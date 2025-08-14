import ControlBar from "@/components/control-bar";
import { GearTable } from "@/components/gear-table";
import { createDataAccess } from "@/lib/data-access";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getGearData() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Fetch real data from database
  const result = await dal.getGearsPage({
    page: 1,
    perPage: 10,
  });

  return result.rows;
}

export default async function GearsPage() {
  const rows = await getGearData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
        <p className="text-muted-foreground">
          View and manage your Epic 7 gear inventory. Filter, sort, and analyze
          your equipment.
        </p>
      </div>

      <ControlBar />
      <GearTable rows={rows} />
    </div>
  );
}
