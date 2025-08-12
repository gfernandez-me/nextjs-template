import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Get current user
  const session = await getAuth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Get user's settings
  const settings = await dal.getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
