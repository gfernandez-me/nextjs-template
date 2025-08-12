import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { GearTable } from "@/components/gear-table";
import ControlBar from "@/components/control-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<unknown>;
}) {
  // Get current user
  const session = await getAuth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  const resolvedUnknown = (await searchParams) ?? {};
  const resolved = resolvedUnknown as Record<string, string | string[]>;
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

  if (resolved?.type) {
    const typeRaw = Array.isArray(resolved.type)
      ? resolved.type[0]
      : (resolved.type as string);
    const display: ReadonlyArray<
      "Weapon" | "Helmet" | "Armor" | "Necklace" | "Ring" | "Boots"
    > = ["Weapon", "Helmet", "Armor", "Necklace", "Ring", "Boots"];
    const slot: ReadonlyArray<
      "weapon" | "helm" | "armor" | "neck" | "ring" | "boot"
    > = ["weapon", "helm", "armor", "neck", "ring", "boot"];
    if (display.includes(typeRaw as (typeof display)[number])) {
      where.gear = typeRaw;
    } else if (slot.includes(typeRaw.toLowerCase() as (typeof slot)[number])) {
      const map: Record<string, string> = {
        weapon: "Weapon",
        helm: "Helmet",
        armor: "Armor",
        neck: "Necklace",
        ring: "Ring",
        boot: "Boots",
      };
      where.gear = map[typeRaw.toLowerCase()];
    }
  }

  if (resolved?.enhance !== undefined) {
    const enh = parseInt(String(resolved.enhance), 10);
    if (!Number.isNaN(enh)) where.enhance = enh;
  }

  // Substats filter: expect subs query as "A|B|C|D" matching statType.statName labels
  const subsRaw = String(resolved?.subs ?? "");
  const subs = subsRaw.split("|").filter(Boolean);
  if (subs.length) {
    where.substats = {
      some: {
        statType: { statName: { in: subs } },
      },
    } as unknown as {
      some?: {
        statType?: { statName?: { in: string[] } };
      };
    };
  }

  // Backend hero name filter (case-insensitive contains) via search param `hero`
  const heroParam = String(resolved?.hero ?? "").trim();
  if (heroParam) {
    where.hero = {
      is: {
        name: { contains: heroParam, mode: "insensitive" },
      },
    } as unknown as {
      is?: { name?: { contains?: string; mode?: "insensitive" } };
    };
  }

  // Sorting from URL: ?sort=column&dir=asc|desc
  const sortBy = String(resolved?.sort ?? "createdAt");
  const sortDir = (
    String(resolved?.dir ?? "desc").toLowerCase() === "asc" ? "asc" : "desc"
  ) as "asc" | "desc";

  const [{ rows: allGears, total }, stats] = await Promise.all([
    dal.getGearsPage({ page, perPage, where, sortBy, sortDir }),
    dal.getGearStats(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Gear Inventory</h1>

      <ControlBar />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>Quick snapshot of your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-muted-foreground">Total Gears</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.equipped}</div>
              <div className="text-muted-foreground">Equipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.epicPlus}</div>
              <div className="text-muted-foreground">Epic+ Gears</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.maxEnhanced}</div>
              <div className="text-muted-foreground">Max Enhanced</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GearTable rows={allGears} />

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
    </div>
  );
}
