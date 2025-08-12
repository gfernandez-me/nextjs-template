import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HeroesPage() {
  const session = await getAuth();
  if (!session?.user?.id) redirect("/signin");

  const heroes = await db.heroes.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: {
      ingameId: true,
      name: true,
      element: true,
      class: true,
      rarity: true,
      speed: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Heroes</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Heroes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Element</th>
                  <th className="py-2 px-2">Class</th>
                  <th className="py-2 px-2">Rarity</th>
                  <th className="py-2 px-2">Speed</th>
                </tr>
              </thead>
              <tbody>
                {heroes.map((h) => (
                  <tr key={String(h.ingameId)} className="border-t">
                    <td className="py-2 px-2 font-medium">{h.name}</td>
                    <td className="py-2 px-2">{h.element ?? "—"}</td>
                    <td className="py-2 px-2">{h.class ?? "—"}</td>
                    <td className="py-2 px-2">{h.rarity ?? "—"}</td>
                    <td className="py-2 px-2">{h.speed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
