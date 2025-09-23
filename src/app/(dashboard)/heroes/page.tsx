import { HeroTable } from "./components/hero-table";
import { HeroFilters } from "./components/HeroFilters";
import { HeroesDataAccess } from "./data/heroes";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { parseHeroSearchParams } from "@/lib/url";

/**
 * Server Component that fetches hero data based on URL search parameters
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */
export default async function HeroesPage({
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
  const dal = new HeroesDataAccess(session.user.id);

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
  const filters = parseHeroSearchParams(params);

  // Fetch data with filters applied server-side
  const result = await dal.getHeroesPage({
    page: filters.page,
    perPage: filters.size,
    sortField: filters.sort || "name",
    sortDirection: filters.dir || "asc",
    where: {
      ...(filters.filters.name && {
        name: {
          contains: filters.filters.name,
          mode: "insensitive" as const,
        },
      }),
      ...(filters.filters.element?.length && {
        element: { in: filters.filters.element },
      }),
      ...(filters.filters.rarity?.length && {
        rarity: { in: filters.filters.rarity },
      }),
      ...(filters.filters.class?.length && {
        class: { in: filters.filters.class },
      }),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
        <p className="text-muted-foreground">
          Manage your Epic 7 heroes and their gear recommendations. Configure
          optimization settings for each character.
        </p>
      </div>

      <HeroFilters />
      <HeroTable
        heroes={result.rows}
        totalCount={result.total}
        pageCount={Math.ceil(result.total / filters.size)}
        currentPage={filters.page}
        pageSize={filters.size}
      />
    </div>
  );
}
