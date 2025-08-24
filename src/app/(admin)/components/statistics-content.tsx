"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GearSetStat {
  setName: string;
  piecesRequired: number;
  totalCount: number;
  equippedCount: number;
}

interface GearSetStats {
  totalGears: number;
  totalEquipped: number;
  totalGearsWithSets: number;
  gearSetStats: GearSetStat[];
}

interface StatisticsContentProps {
  stats: {
    total: number;
    equipped: number;
    epicPlus: number;
    maxEnhanced: number;
    gearSetStats: GearSetStats;
  };
}

export function StatisticsContent({ stats }: StatisticsContentProps) {
  // Calculate percentages for gear set display
  const calculatePercentages = (setStat: GearSetStat) => {
    const percentOfAll =
      stats.total > 0
        ? Math.round((setStat.totalCount / stats.total) * 100)
        : 0;
    const percentOfSets =
      stats.gearSetStats.totalGearsWithSets > 0
        ? Math.round(
            (setStat.totalCount / stats.gearSetStats.totalGearsWithSets) * 100
          )
        : 0;
    const percentOfSet =
      setStat.totalCount > 0
        ? Math.round((setStat.equippedCount / setStat.totalCount) * 100)
        : 0;
    const percentOfAllEquipped =
      stats.equipped > 0
        ? Math.round((setStat.equippedCount / stats.equipped) * 100)
        : 0;

    return {
      percentOfAll,
      percentOfSets,
      percentOfSet,
      percentOfAllEquipped,
    };
  };

  // Get gear set icons
  const getGearSetIcon = (setName: string) => {
    const iconMap: Record<string, string> = {
      SpeedSet: "⚡",
      AttackSet: "⚔️",
      HealthSet: "❤️",
      DefenseSet: "🛡️",
      CriticalSet: "🎯",
      HitSet: "🎯",
      DestructionSet: "💥",
      LifestealSet: "🩸",
      CounterSet: "🔄",
      ImmunitySet: "💪",
      ResistSet: "🛡️",
      TorrentSet: "🌊",
      InjurySet: "💀",
      PenetrationSet: "⚡",
      UnitySet: "🤝",
      RageSet: "😠",
      ProtectionSet: "🛡️",
    };
    return iconMap[setName] || "⚙️";
  };

  return (
    <div className="space-y-6">
      {/* Basic Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Total Gears</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.equipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Epic+ Gears</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.epicPlus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Max Enhanced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.maxEnhanced}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gear Set Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Gear Set Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">
            Overview of your gear collection by set type
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.gearSetStats.gearSetStats.map((setStat) => {
              const percentages = calculatePercentages(setStat);
              const icon = getGearSetIcon(setStat.setName);

              return (
                <div
                  key={setStat.setName}
                  className={`p-4 rounded-lg border ${
                    setStat.piecesRequired === 4
                      ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200"
                      : "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h4 className="font-semibold text-sm">
                        {setStat.setName}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {setStat.piecesRequired} pieces
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All:</span>
                      <span className="font-medium">
                        {setStat.totalCount}-{percentages.percentOfAll}%-
                        {percentages.percentOfSets}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipped:</span>
                      <span className="font-medium">
                        {setStat.equippedCount}-{percentages.percentOfSet}%-
                        {percentages.percentOfAllEquipped}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gear Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Gear Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Gear Items</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Currently Equipped</span>
              <span className="font-semibold">{stats.equipped}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Epic or Heroic Quality</span>
              <span className="font-semibold">{stats.epicPlus}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fully Enhanced (+15)</span>
              <span className="font-semibold">{stats.maxEnhanced}</span>
            </div>
            {stats.total > 0 && (
              <div className="flex justify-between items-center">
                <span>Enhancement Rate</span>
                <span className="font-semibold">
                  {Math.round((stats.maxEnhanced / stats.total) * 100)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
