import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GearRecommendation } from "#prisma";
import { ColumnDef } from "@tanstack/react-table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RecommendationsDataAccess } from "./data/recommendations";

async function getRecommendations(userId: string) {
  const dal = new RecommendationsDataAccess(userId);
  return dal.getAllRecommendations();
}

const columns: ColumnDef<GearRecommendation>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "heroName",
    header: "Hero",
  },
];

export default async function RecommendationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?reason=auth");
  }

  const recommendations = await getRecommendations(session.user.id);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <Button asChild>
          <Link href="/recommendations/edit">Create New</Link>
        </Button>
      </div>

      <DataTable columns={columns} data={recommendations} />
    </div>
  );
}
