import prisma from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GearRecommendation } from "#prisma";
import { ColumnDef } from "@tanstack/react-table";

async function getRecommendations() {
  return prisma.gearRecommendation.findMany({
    include: {
      Hero: true,
      GearRecommendationItem: {
        include: {
          StatType1: true,
          StatType2: true,
          StatType3: true,
          StatType4: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

const columns: ColumnDef<GearRecommendation>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "Hero.name",
    header: "Hero",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

export default async function RecommendationsPage() {
  const recommendations = await getRecommendations();

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
