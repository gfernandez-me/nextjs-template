import { getAuth } from "@/lib/auth";
import { createDataAccess } from "@/lib/data-access";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // Get current user
  const session = await getAuth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Create data access layer for current user
  const dal = createDataAccess(session.user.id);

  // Get user details
  const user = await dal.getUser();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
