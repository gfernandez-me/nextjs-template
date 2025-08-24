import { GearRank } from "#prisma/generated/client";
import prisma from "@/lib/prisma";

export class HomeStatsDataAccess {
  constructor(private userId: string) {}

  /**
   * Get basic gear statistics for the home dashboard
   */
  async getHomeStats() {
    const [total, equipped, epicPlus, maxEnhanced] = await Promise.all([
      prisma.gears.count({ where: { userId: this.userId } }),
      prisma.gears.count({ where: { userId: this.userId, equipped: true } }),
      prisma.gears.count({
        where: {
          userId: this.userId,
          rank: { in: [GearRank.EPIC, GearRank.HEROIC] },
        },
      }),
      prisma.gears.count({
        where: { userId: this.userId, enhance: 15 },
      }),
    ]);

    return {
      total,
      equipped,
      epicPlus,
      maxEnhanced,
    };
  }
}
