import { GearTable } from "./components/gear-table";
import { GearFilters } from "./components/GearFilters";
import { GearsDataAccess } from "./data/gears";
import { SettingsDataAccess } from "@/dashboard/settings/data/settings";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { parseGearSearchParams } from "@/lib/url";
import { GearType, GearRank, MainStatType } from "#prisma";
import { fetchStatThresholds } from "@/lib/gear-thresholds";

/**
 * Server Component that fetches gear data based on URL search parameters
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */
export default async function GearsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Get current session and search params in parallel
  const [session, sp] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    searchParams,
  ]);

  if (!session?.user) redirect("/login");

  // Create data access layer for current user
  const dal = new GearsDataAccess(session.user.id);

  // Debug: Test database queries
  await dal.debugDatabaseQuery();

  // Create a new URLSearchParams and copy values from searchParams
  const params = new URLSearchParams();

  // Safely iterate through the awaited searchParams
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      const values = value.split("|").filter(Boolean);
      if (values.length > 1) {
        params.set(key, values.join("|"));
      } else if (value) {
        params.set(key, value);
      }
    }
  }

  // Parse URL parameters for server-side filtering
  const filters = parseGearSearchParams(params);

  // Fetch data with filters applied server-side
  const result = await dal.getGearsPage({
    page: filters.page,
    perPage: filters.size,
    sortField: filters.sort,
    sortDirection: filters.dir,
    where: {
      ...(filters.filters.type?.length && {
        type: { in: filters.filters.type as GearType[] },
      }),
      ...(filters.filters.rank &&
        filters.filters.rank.length > 0 && {
          rank: { in: filters.filters.rank as GearRank[] },
        }),
      ...(filters.filters.level && {
        level: filters.filters.level,
      }),
      ...(filters.filters.enhance && {
        enhance: filters.filters.enhance,
      }),
      ...(filters.filters.mainStatType?.length && {
        mainStatType: { in: filters.filters.mainStatType as MainStatType[] },
      }),
      ...(filters.filters.subStats?.length && {
        AND: filters.filters.subStats.map((subStat) => ({
          GearSubStats: {
            some: {
              StatType: {
                statName: subStat,
              },
            },
          },
        })),
      }),
      ...(filters.filters.hero && {
        Hero: {
          name: { contains: filters.filters.hero, mode: "insensitive" },
        },
      }),
    },
  });

  // Get user's score thresholds from settings
  const settingsDal = new SettingsDataAccess(session.user.id);
  const userSettings = await settingsDal.getScoringSettings();
  const thresholds = await fetchStatThresholds();
  const scoreThresholds = userSettings
    ? {
        minScore: userSettings.minScore,
        maxScore: userSettings.maxScore,
        minFScore: userSettings.minFScore,
        maxFScore: userSettings.maxFScore,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
        <p className="text-muted-foreground">
          View and manage your Epic 7 gear inventory. Filter, sort, and analyze
          your equipment.
        </p>
      </div>

      <GearFilters />
      <GearTable
        gears={result.rows}
        totalCount={result.total}
        pageCount={Math.ceil(result.total / filters.size)}
        currentPage={filters.page}
        pageSize={filters.size}
        scoreThresholds={scoreThresholds}
        thresholds={thresholds}
      />
    </div>
  );
}
