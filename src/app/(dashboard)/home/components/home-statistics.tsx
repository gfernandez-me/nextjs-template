"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";

interface HomeStats {
  total: number;
  equipped: number;
  epicPlus: number;
  maxEnhanced: number;
}

interface HomeStatisticsProps {
  stats: HomeStats;
}

export function HomeStatistics({ stats }: HomeStatisticsProps) {
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
            <div className="text-sm text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.equipped / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Epic+</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.epicPlus}</div>
            <div className="text-sm text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.epicPlus / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Max Enhanced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.maxEnhanced}</div>
            <div className="text-sm text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.maxEnhanced / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Epic+ Quality</span>
              <span className="text-sm font-medium">
                {stats.total > 0 ? Math.round((stats.epicPlus / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    stats.total > 0 ? Math.round((stats.epicPlus / stats.total) * 100) : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.epicPlus} of {stats.total} gears are Epic+ quality
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Upload new gear data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Configure gear priorities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">View gear statistics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm">Manage optimization settings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Gear Collection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Collection Progress</span>
                  <span className="text-sm font-medium">
                    {stats.total > 0 ? Math.round((stats.epicPlus / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        stats.total > 0 ? Math.round((stats.epicPlus / stats.total) * 100) : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.epicPlus} of {stats.total} gears are Epic+ quality
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
