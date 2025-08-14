import { SettingsForm } from "@/components/settings-form";

async function getSettings() {
  // This would normally fetch from your database
  // For now, return null to use defaults
  return null;
}

export default async function SettingsPage() {
  const initialSettings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your gear optimization settings, scoring weights, and
          thresholds.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
