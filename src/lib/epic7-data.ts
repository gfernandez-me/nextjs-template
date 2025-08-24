import { StatisticsDataAccess } from "@/admin/data/statistics";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MainStatType, GearSets, StatTypes } from "#prisma";

export interface Epic7Data {
  gearSets: GearSets[];
  substats: StatTypes[];
  mainStatTypes: MainStatType[];
}

/**
 * Fetches Epic 7 reference data (gear sets, stat types, main stat types)
 * Used across multiple pages to avoid duplication
 */
export async function getEpic7Data(): Promise<Epic7Data> {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create data access layer for current user
  const dal = new StatisticsDataAccess(session.user.id);

  // Fetch real data from database
  const [gearSets, substats] = await Promise.all([
    dal.listGearSets(),
    dal.listStatTypes(),
  ]);

  // Use Prisma-generated enum for main stat types
  const mainStatTypes = Object.values(MainStatType);

  return {
    gearSets,
    substats,
    mainStatTypes,
  };
}
