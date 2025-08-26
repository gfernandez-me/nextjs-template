import type { Prisma } from "#prisma";
import prisma from "@/lib/prisma";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Settings with user information
export type SettingsWithUser = Prisma.SettingsGetPayload<{
  include: { User: true };
}>;

// Settings for scoring calculations
export type ScoringSettings = {
  id: number;
  userId: string;
  fScoreIncludeMainStat: boolean;
  fScoreSubstatWeights: Record<string, number>;
  fScoreMainStatWeights: Record<string, number>;
  substatThresholds: Record<string, { plus15: number[] }>;
  minScore: number;
  maxScore: number;
  minFScore: number;
  maxFScore: number;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export class SettingsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get user settings with user information
   */
  async getSettings(): Promise<SettingsWithUser | null> {
    let settings = await prisma.settings.findFirst({
      where: { userId: this.userId },
      include: { User: true },
    });

    // If no settings exist, create default ones with calculated thresholds
    if (!settings) {
      const defaultThresholds = await this.calculateDefaultScoreThresholds();
      settings = await this.upsertSettings({
        fScoreIncludeMainStat: true,
        fScoreSubstatWeights: {},
        fScoreMainStatWeights: {},
        substatThresholds: {},
        ...defaultThresholds,
      });
    }

    return settings;
  }

  /**
   * Get scoring settings for calculations
   */
  async getScoringSettings(): Promise<ScoringSettings | null> {
    const settings = await prisma.settings.findFirst({
      where: { userId: this.userId },
      select: {
        id: true,
        userId: true,
        fScoreIncludeMainStat: true,
        fScoreSubstatWeights: true,
        fScoreMainStatWeights: true,
        substatThresholds: true,
        minScore: true,
        maxScore: true,
        minFScore: true,
        maxFScore: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!settings) return null;

    // Parse JSON fields
    return {
      ...settings,
      fScoreSubstatWeights: settings.fScoreSubstatWeights as Record<
        string,
        number
      >,
      fScoreMainStatWeights: settings.fScoreMainStatWeights as Record<
        string,
        number
      >,
      substatThresholds: settings.substatThresholds as Record<
        string,
        { plus15: number[] }
      >,
      minScore: settings.minScore ?? 0,
      maxScore: settings.maxScore ?? 100,
      minFScore: settings.minFScore ?? 0,
      maxFScore: settings.maxFScore ?? 100,
    };
  }

  /**
   * Create or update user settings
   */
  async upsertSettings(data: {
    fScoreIncludeMainStat: boolean;
    fScoreSubstatWeights: Record<string, number>;
    fScoreMainStatWeights: Record<string, number>;
    substatThresholds: Record<string, { plus15: number[] }>;
    minScore: number;
    maxScore: number;
    minFScore: number;
    maxFScore: number;
  }): Promise<SettingsWithUser> {
    return prisma.settings.upsert({
      where: { userId: this.userId },
      update: data,
      create: { ...data, userId: this.userId },
      include: { User: true },
    });
  }

  /**
   * Calculate default score thresholds based on user's gear data
   */
  async calculateDefaultScoreThresholds(): Promise<{
    minScore: number;
    maxScore: number;
    minFScore: number;
    maxFScore: number;
  }> {
    // Get average scores from user's gear
    const scoreStats = await prisma.gears.aggregate({
      where: { userId: this.userId },
      _avg: {
        score: true,
        fScore: true,
      },
      _min: {
        score: true,
        fScore: true,
      },
      _max: {
        score: true,
        fScore: true,
      },
    });

    const avgScore = scoreStats._avg.score ?? 50;
    const avgFScore = scoreStats._avg.fScore ?? 50;
    const minScore = scoreStats._min.score ?? 0;
    const maxScore = scoreStats._max.score ?? 100;
    const minFScore = scoreStats._min.fScore ?? 0;
    const maxFScore = scoreStats._max.fScore ?? 100;

    // Calculate thresholds: 20% below average for min, 20% above average for expected
    const scoreRange = maxScore - minScore;
    const fScoreRange = maxFScore - minFScore;

    return {
      minScore: Math.max(0, avgScore - scoreRange * 0.2),
      maxScore: Math.min(100, avgScore + scoreRange * 0.2),
      minFScore: Math.max(0, avgFScore - fScoreRange * 0.2),
      maxFScore: Math.min(100, avgFScore + fScoreRange * 0.2),
    };
  }

  /**
   * Update specific setting fields
   */
  async updateSettings(
    data: Partial<{
      fScoreIncludeMainStat: boolean;
      fScoreSubstatWeights: Record<string, number>;
      fScoreMainStatWeights: Record<string, number>;
      substatThresholds: Record<string, { plus15: number[] }>;
      minScore: number;
      maxScore: number;
      minFScore: number;
      maxFScore: number;
    }>
  ): Promise<SettingsWithUser> {
    const existing = await prisma.settings.findFirst({
      where: { userId: this.userId },
    });

    if (!existing) {
      // Create with defaults if doesn't exist
      return this.upsertSettings({
        fScoreIncludeMainStat: data.fScoreIncludeMainStat ?? true,
        fScoreSubstatWeights: data.fScoreSubstatWeights ?? {},
        fScoreMainStatWeights: data.fScoreMainStatWeights ?? {},
        substatThresholds: data.substatThresholds ?? {},
        minScore: data.minScore ?? 0,
        maxScore: data.maxScore ?? 100,
        minFScore: data.minFScore ?? 0,
        maxFScore: data.maxFScore ?? 100,
      });
    }

    return prisma.settings.update({
      where: { id: existing.id },
      data,
      include: { User: true },
    });
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<SettingsWithUser> {
    const defaultSettings = {
      fScoreIncludeMainStat: true,
      fScoreSubstatWeights: {
        Speed: 2.0,
        "Crit %": 1.5,
        "Crit Dmg %": 1.3,
        "Attack %": 1.2,
        "Defense %": 0.8,
        "Health %": 0.8,
        "Effectiveness %": 0.7,
        "Effect Resist %": 0.6,
        Attack: 0.3,
        Defense: 0.2,
        Health: 0.2,
      },
      fScoreMainStatWeights: {
        att: 0,
        def: 0,
        max_hp: 0,
        att_rate: 0.5,
        def_rate: 0.3,
        max_hp_rate: 0.3,
        cri: 0.6,
        cri_dmg: 0.6,
        speed: 1.0,
        acc: 0.4,
        res: 0.4,
      },
      substatThresholds: {
        Speed: { plus15: [4, 5, 6, 7, 8] },
        "Crit %": { plus15: [3, 4, 5, 6, 7] },
        "Crit Dmg %": { plus15: [4, 5, 6, 7, 8] },
        "Attack %": { plus15: [4, 5, 6, 7, 8] },
        "Defense %": { plus15: [4, 5, 6, 7, 8] },
        "Health %": { plus15: [4, 5, 6, 7, 8] },
        "Effectiveness %": { plus15: [4, 5, 6, 7, 8] },
        "Effect Resist %": { plus15: [4, 5, 6, 7, 8] },
        Attack: { plus15: [20, 25, 30, 35, 40] },
        Defense: { plus15: [20, 25, 30, 35, 40] },
        Health: { plus15: [200, 250, 300, 350, 400] },
      },
    };

    return this.upsertSettings({
      ...defaultSettings,
      minScore: 0,
      maxScore: 100,
      minFScore: 0,
      maxFScore: 100,
    });
  }

  /**
   * Get settings statistics
   */
  async getSettingsStats(): Promise<{
    hasCustomWeights: boolean;
    hasCustomThresholds: boolean;
    lastUpdated: Date | null;
  }> {
    const settings = await prisma.settings.findFirst({
      where: { userId: this.userId },
      select: {
        fScoreSubstatWeights: true,
        fScoreMainStatWeights: true,
        substatThresholds: true,
        updatedAt: true,
      },
    });

    if (!settings) {
      return {
        hasCustomWeights: false,
        hasCustomThresholds: false,
        lastUpdated: null,
      };
    }

    const defaultWeights = {
      Speed: 2.0,
      "Crit %": 1.5,
      "Crit Dmg %": 1.3,
      "Attack %": 1.2,
      "Defense %": 0.8,
      "Health %": 0.8,
      "Effectiveness %": 0.7,
      "Effect Resist %": 0.6,
      Attack: 0.3,
      Defense: 0.2,
      Health: 0.2,
    };

    const defaultMainWeights = {
      att: 0,
      def: 0,
      max_hp: 0,
      att_rate: 0.5,
      def_rate: 0.3,
      max_hp_rate: 0.3,
      cri: 0.6,
      cri_dmg: 0.6,
      speed: 1.0,
      acc: 0.4,
      res: 0.4,
    };

    const currentWeights = settings.fScoreSubstatWeights as Record<
      string,
      number
    >;
    const currentMainWeights = settings.fScoreMainStatWeights as Record<
      string,
      number
    >;

    const hasCustomWeights =
      JSON.stringify(currentWeights) !== JSON.stringify(defaultWeights) ||
      JSON.stringify(currentMainWeights) !== JSON.stringify(defaultMainWeights);

    const hasCustomThresholds =
      JSON.stringify(settings.substatThresholds) !== JSON.stringify({});

    return {
      hasCustomWeights,
      hasCustomThresholds,
      lastUpdated: settings.updatedAt,
    };
  }

  /**
   * Delete user settings
   */
  async deleteSettings(): Promise<void> {
    await prisma.settings.deleteMany({
      where: { userId: this.userId },
    });
  }
}
