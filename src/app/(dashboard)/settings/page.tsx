import { SettingsForm } from "./components/settings-form";
import { SettingsDataAccess } from "@/lib/dal/settings";
import { requireAuth, getUserId } from "@/lib/auth-utils";

async function getSettings() {
  // Get session from layout context - no need to fetch again
  const session = await requireAuth();

  // Create data access layer for current user
  const dal = new SettingsDataAccess(getUserId(session));

  // Get user's settings
  return await dal.getSettings();
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your gear optimization preferences and scoring algorithms.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
