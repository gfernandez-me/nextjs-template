import { GearPrioritiesForm } from "@/components/gear-priorities-form";
import { getEpic7Data } from "@/lib/epic7-data";

export default async function GearPrioritiesPage() {
  const { gearSets, substats, mainStatTypes } = await getEpic7Data();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gear Priorities</h1>
        <p className="text-muted-foreground">
          Configure your gear optimization priorities. Set weights for different
          stats and gear types.
        </p>
      </div>

      <GearPrioritiesForm
        gearSets={gearSets}
        substats={substats}
        mainStatTypes={mainStatTypes}
      />
    </div>
  );
}
