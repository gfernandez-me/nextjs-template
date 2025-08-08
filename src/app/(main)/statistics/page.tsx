import { getGearStats, getAggregates } from "@/app/lib/gear";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatisticsCharts from "@/components/statistics-charts";

export default async function StatisticsPage() {
  const [stats, aggregates] = await Promise.all([
    getGearStats(),
    getAggregates(),
  ]);

  // charts are client-rendered inside StatisticsCharts

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Statistics</h1>

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

      <StatisticsCharts
        gearByRank={aggregates.gearByRank}
        enhanceBreakdown={aggregates.enhanceBreakdown}
        mainStatDistribution={aggregates.mainStatDistribution}
      />
    </div>
  );
}
