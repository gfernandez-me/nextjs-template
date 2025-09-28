import {
  HeroElement,
  HeroClass,
  HeroRarity,
  GearRank,
  GearType,
} from "#prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Dashboard statistics overview
export type DashboardStats = {
  gears: {
    total: number;
    equipped: number;
    epicPlus: number;
    maxEnhanced: number;
  };
  heroes: {
    total: number;
    byElement: Record<HeroElement, number>;
    byClass: Record<HeroClass, number>;
    byRarity: Record<HeroRarity, number>;
  };
  gearSets: {
    total: number;
    byPieces: Record<number, number>;
    topSets: Array<{
      setName: string;
      piecesRequired: number;
      totalCount: number;
      equippedCount: number;
    }>;
  };
  recentActivity: {
    lastUpload: Date | null;
    lastGearUpdate: Date | null;
    lastHeroUpdate: Date | null;
  };
};

// Gear set statistics
export type GearSetStats = {
  setName: string;
  piecesRequired: number;
  totalCount: number;
  equippedCount: number;
  completionRate: number;
};

// Gear rank distribution
export type GearRankDistribution = {
  rank: GearRank;
  count: number;
  percentage: number;
};

// Gear type distribution
export type GearTypeDistribution = {
  type: GearType;
  count: number;
  percentage: number;
  displayName: string;
};

// Gear enhancement distribution
export type GearEnhancementDistribution = {
  enhance: number;
  count: number;
  percentage: number;
};

// Gear score statistics
export type GearScoreStats = {
  totalScored: number;
  averageFScore: number;
  averageScore: number;
  topScores: Array<{
    id: number;
    fScore: number;
    score: number;
  }>;
};

// Legacy gear set stats for backward compatibility
export type LegacyGearSetStats = {
  totalGears: number;
  totalEquipped: number;
  totalGearsWithSets: number;
  gearSetStats: Array<{
    setName: string;
    piecesRequired: number;
    totalCount: number;
    equippedCount: number;
  }>;
};
