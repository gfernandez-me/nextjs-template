import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GearPrioritiesForm } from "@/components/gear-priorities-form";
import type { MainStatType } from "#prisma";

export const dynamic = "force-dynamic";

export default async function GearPrioritiesPage() {
  const session = await getAuth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const dal = createDataAccess(session.user.id);

  const [priorities, gearSets, substats, mainStatTypes] = await Promise.all([
    dal.listGearPriorities(),
    db.gearSets.findMany({
      where: { isActive: true },
      orderBy: { setName: "asc" },
      select: { id: true, setName: true },
    }),
    db.statTypes.findMany({
      where: { isSubstat: true },
      orderBy: { statName: "asc" },
      select: { id: true, statName: true },
    }),
    // Enumerate MainStatType enum keys
    Promise.resolve(
      Object.values(
        (
          await import("#prisma")
        ).MainStatType as unknown as Record<string, string>
      ) as string[]
    ),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Gear Priorities</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <GearPrioritiesForm
            gearSets={gearSets}
            substats={substats}
            mainStatTypes={mainStatTypes as unknown as MainStatType[]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {priorities.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No priorities yet. Create one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Set</th>
                    <th className="py-2 pr-2">Main Stat</th>
                    <th className="py-2 pr-2">Priority Subs</th>
                    <th className="py-2 pr-2">Heroes</th>
                    <th className="py-2 pr-2">Active</th>
                    <th className="py-2 pr-2" aria-label="actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {priorities.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2 pr-2 font-medium">{p.name}</td>
                      <td className="py-2 pr-2">
                        {p.gearSet?.setName?.replace(/Set$/, "") ?? "—"}
                      </td>
                      <td className="py-2 pr-2">{p.mainStatType ?? "—"}</td>
                      <td className="py-2 pr-2">
                        {[
                          p.prioritySub1?.statName,
                          p.prioritySub2?.statName,
                          p.prioritySub3?.statName,
                          p.prioritySub4?.statName,
                        ]
                          .filter(Boolean)
                          .join(" > ") || "—"}
                      </td>
                      <td className="py-2 pr-2">
                        {(() => {
                          const links = (
                            p as unknown as {
                              heroes?: Array<{ hero?: { name?: string } }>;
                            }
                          ).heroes;
                          if (Array.isArray(links) && links.length > 0) {
                            return links
                              .map((h) => h.hero?.name)
                              .filter((n): n is string => Boolean(n))
                              .join(", ");
                          }
                          return p.heroName ?? p.targetHero?.name ?? "—";
                        })()}
                      </td>
                      <td className="py-2 pr-2">{p.isActive ? "Yes" : "No"}</td>
                      <td className="py-2 pr-2">
                        <form
                          action={`/api/gear-priorities/${p.id}`}
                          method="post"
                          onSubmit={(e) => {
                            e.preventDefault();
                            fetch(`/api/gear-priorities/${p.id}`, {
                              method: "DELETE",
                            }).then(() => window.location.reload());
                          }}
                        >
                          <Button variant="destructive" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
