"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsContentProps {
  stats: {
    total: number;
    equipped: number;
    epicPlus: number;
    maxEnhanced: number;
  };
}

export function StatisticsContent({ stats }: StatisticsContentProps) {
  return (
    <div className="space-y-6">
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
