import { getEpic7Data } from "@/lib/epic7-data";

export default async function HeroesPage() {
  const { gearSets, substats, mainStatTypes } = await getEpic7Data();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Heroes</h1>
        <p className="text-muted-foreground">
          Manage your Epic 7 heroes and their gear recommendations. Configure
          optimization settings for each character.
        </p>
      </div>
    </div>
  );
}
