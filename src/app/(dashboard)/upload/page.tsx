import { UploadForm } from "./components/upload-form";
import { SettingsDataAccess } from "@/dashboard/settings/data/settings";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

async function getUserSettings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dal = new SettingsDataAccess(session.user.id);
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
