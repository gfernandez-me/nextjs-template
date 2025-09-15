import { ColumnDef } from "@tanstack/react-table";
import { HeroForTable } from "../../data/heroes";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export function createHeroTableColumns(): ColumnDef<HeroForTable>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const hero = row.original;
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {hero.name}
              {hero.duplicateCount > 1 && ` (${hero.duplicateCount})`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "element",
      header: "Element",
      cell: ({ row }) => {
        const element = row.getValue("element") as string | null;
        if (!element) return <span className="text-muted-foreground">-</span>;

        const elementColors: Record<string, string> = {
          FIRE: "bg-red-100 text-red-800",
          ICE: "bg-blue-100 text-blue-800",
          EARTH: "bg-green-100 text-green-800",
          LIGHT: "bg-yellow-100 text-yellow-800",
          DARK: "bg-purple-100 text-purple-800",
        };

        return (
          <Badge
            variant="secondary"
            className={elementColors[element] || "bg-gray-100 text-gray-800"}
          >
            {element}
          </Badge>
        );
      },
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => {
        const heroClass = row.getValue("class") as string | null;
        if (!heroClass) return <span className="text-muted-foreground">-</span>;

        const classColors: Record<string, string> = {
          WARRIOR: "bg-orange-100 text-orange-800",
          KNIGHT: "bg-blue-100 text-blue-800",
          RANGER: "bg-green-100 text-green-800",
          MAGE: "bg-purple-100 text-purple-800",
          SOUL_WEAVER: "bg-pink-100 text-pink-800",
          THIEF: "bg-gray-100 text-gray-800",
        };

        return (
          <Badge
            variant="secondary"
            className={classColors[heroClass] || "bg-gray-100 text-gray-800"}
          >
            {heroClass.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rarity",
      header: "Rarity",
      cell: ({ row }) => {
        const rarity = row.getValue("rarity") as string | null;
        if (!rarity) return <span className="text-muted-foreground">-</span>;

        const rarityColors: Record<string, string> = {
          THREE_STAR: "bg-gray-100 text-gray-800",
          FOUR_STAR: "bg-blue-100 text-blue-800",
          FIVE_STAR: "bg-purple-100 text-purple-800",
          SIX_STAR: "bg-yellow-100 text-yellow-800",
        };

        return (
          <Badge
            variant="secondary"
            className={rarityColors[rarity] || "bg-gray-100 text-gray-800"}
          >
            {rarity.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "gearCount",
      header: "Gear",
      cell: ({ row }) => {
        const gearCount = row.getValue("gearCount") as number;
        return (
          <div className="text-center">
            <Badge variant={gearCount > 0 ? "default" : "secondary"}>
              {gearCount}/6
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "speed",
      header: "Speed",
      cell: ({ row }) => {
        const speed = row.getValue("speed") as number | null;
        if (speed === null)
          return <span className="text-muted-foreground">-</span>;
        return <span className="font-mono">{speed}</span>;
      },
    },
    {
      accessorKey: "attack",
      header: "Attack",
      cell: ({ row }) => {
        const attack = row.getValue("attack") as number | null;
        if (attack === null)
          return <span className="text-muted-foreground">-</span>;
        return <span className="font-mono">{attack.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "health",
      header: "Health",
      cell: ({ row }) => {
        const health = row.getValue("health") as number | null;
        if (health === null)
          return <span className="text-muted-foreground">-</span>;
        return <span className="font-mono">{health.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "defense",
      header: "Defense",
      cell: ({ row }) => {
        const defense = row.getValue("defense") as number | null;
        if (defense === null)
          return <span className="text-muted-foreground">-</span>;
        return <span className="font-mono">{defense.toLocaleString()}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const hero = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement delete functionality
                  console.log("Delete hero:", hero.id);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
