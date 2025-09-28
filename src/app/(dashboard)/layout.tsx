import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";
import { requireAuth } from "@/lib/auth-utils";
import { SessionProvider } from "./session-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get session once at layout level - middleware already validated it
  const session = await requireAuth();

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
            <div className="mx-auto h-full w-full max-w-[1800px] px-4 py-6">
              {/* Pass session data to children via context */}
              <SessionProvider session={session}>{children}</SessionProvider>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
