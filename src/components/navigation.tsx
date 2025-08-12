"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const routes = [
  { href: "/", label: "Home", description: "View all gear data" },
  {
    href: "/upload",
    label: "Upload",
    description: "Upload gear data from Fribbels optimizer",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Configure scoring and thresholds",
  },
  {
    href: "/statistics",
    label: "Statistics",
    description: "View gear statistics and analytics",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Epic 7 Gear Optimizer
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Epic 7 Gear Optimizer
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="text-sm text-muted-foreground">
              Please sign in to continue
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Epic 7 Gear Optimizer
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === route.href
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
                title={route.description}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
