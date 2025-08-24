import { GearTable } from "./components/gear-table";
import { GearFilters } from "./components/GearFilters";
import { GearsDataAccess } from "./data/gears";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { parseGearSearchParams } from "@/lib/url";

/**
 * Server Component that fetches gear data based on URL search parameters
 *
 * @see https://nextjs.org/docs/app/guides/forms
 */
export default async function GearsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Create data access layer for current user
  const dal = new GearsDataAccess(session.user.id);

  // Parse URL parameters for server-side filtering
  const resolvedSearchParams = await searchParams;
  const filters = parseGearSearchParams(
    new URLSearchParams(resolvedSearchParams as Record<string, string>)
  );

  // Fetch data with filters applied server-side
  const result = await dal.getGearsPage({
    page: filters.page,
    perPage: filters.size,
    // TODO: Add sorting and filtering support to DAL
  });

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
      />
    </div>
  );
}
