/**
 * Table columns definition for the recommendations table
 */

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { GearRecommendation } from "#prisma";
import { getGearTypeLabel, getMainStatLabel } from "@/lib/stat-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export function createRecommendationTableColumns(
  onDelete: (id: number) => void
): ColumnDef<GearRecommendation>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "heroName",
      header: "Hero",
    },
    {
      accessorKey: "GearRecommendationItem",
      header: "Gear Items",
      cell: ({ row }) => {
        const items = row.getValue("GearRecommendationItem") as Array<{
          type: import("#prisma").GearType;
          mainStatType: import("#prisma").MainStatType;
          StatType1?: { statName: string } | null;
          StatType2?: { statName: string } | null;
          StatType3?: { statName: string } | null;
          StatType4?: { statName: string } | null;
        }>;
        if (!items || items.length === 0) return "No items";

        return (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="border rounded p-2 bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{getGearTypeLabel(item.type)}</Badge>
                  <Badge variant="secondary">
                    {getMainStatLabel(item.mainStatType)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Substats:</span>{" "}
                  {[
                    item.StatType1?.statName,
                    item.StatType2?.statName,
                    item.StatType3?.statName,
                    item.StatType4?.statName,
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const recommendation = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/recommendations/edit/${recommendation.id}`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(recommendation.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];
}
