import { StatisticsDataAccess } from "@/lib/dal/statistics";
import { requireAuth, getUserId } from "@/lib/auth-utils";
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
  // Get current user using centralized auth utility
  const session = await requireAuth();

  // Create data access layer for current user
  const dal = new StatisticsDataAccess(getUserId(session));

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
