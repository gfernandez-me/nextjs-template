import {
  getGearsPage,
  getGearStats,
  getAggregates,
} from "@/features/gears/server/queries";
// import type { GearRow } from "@/features/gears/server/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GearTable } from "@/components/GearTable";
import GearFilters from "@/features/gears/components/GearFilters";
import StatisticsPanel from "@/features/gears/components/StatisticsPanel";
import { formatMainStatLabel } from "@/lib/stats";

function getGearIcon(gearType: string) {
  switch (gearType.toLowerCase()) {
    case "weapon":
      return "⚔️";
    case "armor":
      return "🛡️";
    case "helmet":
    case "helm":
      return "🪖";
    case "necklace":
    case "neck":
      return "📿";
    case "ring":
      return "💍";
    case "boots":
    case "boot":
      return "🥾";
    default:
      return "❓";
  }
}

function getRankColor(rank: string) {
  switch (rank.toLowerCase()) {
    case "common":
      return "text-gray-500";
    case "uncommon":
      return "text-green-600";
    case "rare":
      return "text-blue-600";
    case "epic":
      return "text-purple-600";
    case "heroic":
      return "text-orange-600";
    default:
      return "text-gray-500";
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolved = (await searchParams) ?? {};
  const pageParam = Array.isArray(resolved?.page)
    ? resolved?.page[0]
    : (resolved?.page as string | undefined);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const perPage = 50;
  const where: Record<string, unknown> = {};
  if (resolved?.rank) {
    const ranks = String(resolved.rank).split("|").filter(Boolean);
    if (ranks.length) where.rank = { in: ranks };
  }
  if (resolved?.type) where.gear = resolved.type;
  if (resolved?.maxed === "true") where.enhance = 15;
  const [{ rows: allGears, total }, stats, aggregates] = await Promise.all([
    getGearsPage({ page, perPage, orderBy: [{ createdAt: "desc" }], where }),
    getGearStats(),
    getAggregates(where),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Fallback aggregates from current page data if server aggregation returns empty
  const aggFallback = (() => {
    const byRank: Record<string, number> = {};
    const byEnhance: Record<string, number> = {};
    const byMain: Record<string, number> = {};
    for (const g of allGears) {
      byRank[g.rank] = (byRank[g.rank] ?? 0) + 1;
      const enh = `+${g.enhance}`;
      byEnhance[enh] = (byEnhance[enh] ?? 0) + 1;
      const main = formatMainStatLabel(g.mainStatType);
      byMain[main] = (byMain[main] ?? 0) + 1;
    }
    return {
      gearByRank: Object.entries(byRank).map(([name, value]) => ({
        name,
        value,
      })),
      enhanceBreakdown: Object.entries(byEnhance).map(([level, count]) => ({
        level,
        count,
      })),
      mainStatDistribution: Object.entries(byMain).map(([name, value]) => ({
        name,
        value,
      })),
    };
  })();
  const charts = {
    gearByRank: aggregates.gearByRank?.length
      ? aggregates.gearByRank
      : aggFallback.gearByRank,
    enhanceBreakdown: aggregates.enhanceBreakdown?.length
      ? aggregates.enhanceBreakdown
      : aggFallback.enhanceBreakdown,
    mainStatDistribution: aggregates.mainStatDistribution?.length
      ? aggregates.mainStatDistribution
      : aggFallback.mainStatDistribution,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚔️ Epic 7 Gear Overview
          </CardTitle>
          <CardDescription>
            Displaying gear data imported from Fribbels Epic 7 Optimizer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            <aside className="col-span-12 md:col-span-3 space-y-4 md:sticky md:top-20 self-start">
              <GearFilters />
              <StatisticsPanel
                gearByRank={charts.gearByRank}
                enhanceBreakdown={charts.enhanceBreakdown}
                mainStatDistribution={charts.mainStatDistribution}
              />
            </aside>
            <section className="col-span-12 md:col-span-9 flex flex-col min-h-[60vh]">
              {allGears.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No gear data found. Upload your gear.txt file to get
                    started.
                  </p>
                </div>
              ) : (
                <GearTable rows={allGears} />
              )}
            </section>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`/?page=${Math.max(1, page - 1)}`}
                className="px-2 py-1 border rounded hover:bg-muted"
                aria-disabled={page <= 1}
              >
                Prev
              </Link>
              <Link
                href={`/?page=${Math.min(totalPages, page + 1)}`}
                className="px-2 py-1 border rounded hover:bg-muted"
                aria-disabled={page >= totalPages}
              >
                Next
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {allGears.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Gears</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.equipped}</div>
                <div className="text-sm text-muted-foreground">Equipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.epicPlus}</div>
                <div className="text-sm text-muted-foreground">Epic+ Gears</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.maxEnhanced}</div>
                <div className="text-sm text-muted-foreground">
                  Max Enhanced
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
