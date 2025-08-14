import { ProfileForm } from "@/components/profile-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user || null;
}

export default async function AccountPage() {
  const user = await getUser();
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
