import { UploadForm } from "./components/upload-form";
import { SettingsDataAccess } from "@/lib/dal/settings";
import { requireAuth, getUserId } from "@/lib/auth-utils";

async function getUserSettings() {
  // Get session from layout context - no need to fetch again
  const session = await requireAuth();

  const dal = new SettingsDataAccess(getUserId(session));
  return await dal.getSettings();
}

export default async function UploadPage() {
  const userSettings = await getUserSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Gear Data</h1>
        <p className="text-muted-foreground">
          Import your Epic 7 gear data from Fribbels Optimizer. Upload gear.txt
          files to sync your inventory.
        </p>
      </div>

      <UploadForm userSettings={userSettings} />
    </div>
  );
}
