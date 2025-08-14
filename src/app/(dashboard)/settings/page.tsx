import { SettingsForm } from "@/components/settings-form";
import { createDataAccess } from "@/lib/data-access";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSettings() {
  // Get current user using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

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
