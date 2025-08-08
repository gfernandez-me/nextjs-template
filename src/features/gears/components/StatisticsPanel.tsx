"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function StatisticsPanel({
  gearByRank,
  enhanceBreakdown,
  mainStatDistribution,
}: {
  gearByRank: Array<{ name: string; value: number }>;
  enhanceBreakdown: Array<{ level: string; count: number }>;
  mainStatDistribution: Array<{ name: string; value: number }>;
}) {
  const pieColors = ["#5b4baa", "#c9a227", "#4b6cb7", "#2a2f3a", "#6a0572"];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gears by Rank</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gearByRank}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#5b4baa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enhancement Levels</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enhanceBreakdown}>
              <XAxis dataKey="level" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="count" fill="#c9a227" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Main Stat Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mainStatDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
              >
                {mainStatDistribution.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
