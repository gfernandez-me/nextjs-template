import type {
  DashboardStats,
  GearRankDistribution,
  GearTypeDistribution,
  GearEnhancementDistribution,
  GearScoreStats,
  LegacyGearSetStats,
} from "./types/statistics";
import {
  getGearStats,
  getHeroStats,
  getGearSetStats,
  getRecentActivity,
  getGearRankDistribution,
  getGearTypeDistribution,
  getGearEnhancementDistribution,
  getGearScoreStats,
  listGearSets,
  listStatTypes,
  getGearSetStatsLegacy,
} from "./queries/statistics-queries";

// ============================================================================
// MAIN STATISTICS DATA ACCESS CLASS
// ============================================================================

export class StatisticsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [gears, heroes, gearSets, recentActivity] = await Promise.all([
      getGearStats(this.userId),
      getHeroStats(this.userId),
      getGearSetStats(this.userId),
      getRecentActivity(this.userId),
    ]);

    return {
      gears,
      heroes,
      gearSets,
      recentActivity,
    };
  }

  /**
   * Get gear statistics
   */
  async getGearStats(): Promise<DashboardStats["gears"]> {
    return getGearStats(this.userId);
  }

  /**
   * Get hero statistics
   */
  async getHeroStats(): Promise<DashboardStats["heroes"]> {
    return getHeroStats(this.userId);
  }

  /**
   * Get gear set statistics
   */
  async getGearSetStats(): Promise<DashboardStats["gearSets"]> {
    return getGearSetStats(this.userId);
  }

  /**
   * Get recent activity timestamps
   */
  async getRecentActivity(): Promise<DashboardStats["recentActivity"]> {
    return getRecentActivity(this.userId);
  }

  /**
   * Get gear rank distribution
   */
  async getGearRankDistribution(): Promise<GearRankDistribution[]> {
    return getGearRankDistribution(this.userId);
  }

  /**
   * Get gear type distribution
   */
  async getGearTypeDistribution(): Promise<GearTypeDistribution[]> {
    return getGearTypeDistribution(this.userId);
  }

  /**
   * Get gear enhancement distribution
   */
  async getGearEnhancementDistribution(): Promise<
    GearEnhancementDistribution[]
  > {
    return getGearEnhancementDistribution(this.userId);
  }

  /**
   * Get gear score statistics
   */
  async getGearScoreStats(): Promise<GearScoreStats> {
    return getGearScoreStats(this.userId);
  }

  /**
   * List all gear sets for management
   */
  async listGearSets() {
    return listGearSets();
  }

  /**
   * List all stat types for reference
   */
  async listStatTypes() {
    return listStatTypes();
  }

  /**
   * Get gear set stats in the old format for backward compatibility
   */
  async getGearSetStatsLegacy(): Promise<LegacyGearSetStats> {
    return getGearSetStatsLegacy(this.userId);
  }
}
