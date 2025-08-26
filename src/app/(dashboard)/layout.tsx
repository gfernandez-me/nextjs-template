import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Redirect unauthenticated users to login with a reason
    redirect("/login?reason=auth");
  }

  return (
    <div className="relative flex min-h-screen">
      <SidebarProvider>
        <AppSidebar
          user={{ ...session.user, image: session.user.image ?? null }}
          variant="inset"
        />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto h-full max-w-[1600px] p-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
