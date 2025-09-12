"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { createHeroTableColumns } from "./components/hero-table/columns";
import { HeroForTable } from "./data/heroes";

export default function HeroesPage() {
  const [heroes, setHeroes] = React.useState<HeroForTable[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Create columns with useMemo to prevent recreation on every render
  const columns = React.useMemo(() => createHeroTableColumns(), []);

  React.useEffect(() => {
    async function fetchHeroes() {
      try {
        const response = await fetch("/api/heroes", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setHeroes(data.heroes || []);
          setError(null);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch heroes:", errorData);
          setError(errorData.error || "Failed to fetch heroes");
        }
      } catch (error) {
        console.error("Error fetching heroes:", error);
        setError("Network error occurred while fetching heroes");
      } finally {
        setLoading(false);
      }
    }

    fetchHeroes();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
          <p className="text-muted-foreground">
            Manage your Epic 7 heroes and their gear recommendations. Configure
            optimization settings for each character.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading heroes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
          <p className="text-muted-foreground">
            Manage your Epic 7 heroes and their gear recommendations. Configure
            optimization settings for each character.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-2">
              Error loading heroes
            </div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
        <p className="text-muted-foreground">
          Manage your Epic 7 heroes and their gear recommendations. Configure
          optimization settings for each character.
        </p>
      </div>

      <DataTable columns={columns} data={heroes} />
    </div>
  );
}
