import { UploadForm } from "@/components/upload-form";

async function getUserSettings() {
  // This would normally fetch from your database
  // For now, return null to use defaults
  return null;
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
