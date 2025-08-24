"use client";

import * as React from "react";
import {
  IconCopy,
  IconDashboard,
  IconDatabase,
  IconFileUpload,
  IconGauge,
  IconHome,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconSword,
  IconUserCircle,
  IconUsers,
  IconShield,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "#prisma";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: IconDashboard,
    },
    {
      title: "Gears",
      url: "/gears",
      icon: IconSword,
    },
    {
      title: "Heroes",
      url: "/heroes",
      icon: IconUsers,
    },
    {
      title: "Upload",
      url: "/upload",
      icon: IconFileUpload,
    },
    {
      title: "Gear Priorities",
      url: "/gear-priorities",
      icon: IconListDetails,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Account",
      url: "/profile",
      icon: IconUserCircle,
    },
  ],
  navClouds: [
    {
      title: "Gear Management",
      icon: IconDatabase,
      isActive: true,
      url: "#",
      items: [
        {
          title: "View All Gears",
          url: "/gears",
        },
        {
          title: "Upload New Data",
          url: "/upload",
        },
        {
          title: "Configure Priorities",
          url: "/gear-priorities",
        },
      ],
    },
    {
      title: "Analysis",
      icon: IconGauge,
      url: "#",
      items: [
        {
          title: "Gear Statistics",
          url: "/statistics",
        },
        {
          title: "Optimization Settings",
          url: "/settings",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Dashboard",
      url: "/home",
      icon: IconHome,
    },
    {
      title: "Epic 7 Optimizer",
      url: "https://github.com/fribbels/Fribbels-Epic-7-Optimizer",
      icon: IconCopy,
    },
  ],
  navAdmin: [
    {
      title: "Admin Panel",
      icon: IconShield,
      url: "/admin/gear-sets",
      items: [
        {
          title: "Gear Sets",
          url: "/admin/gear-sets",
        },
      ],
    },
  ],
  documents: [
    {
      name: "Gear Database",
      url: "/gears",
      icon: IconDatabase,
    },
    {
      name: "Hero Database",
      url: "/heroes",
      icon: IconUsers,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  if (!user) {
    throw new Error("AppSidebar requires a user but received undefined.");
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Epic 7 Optimizer
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        {user.email === "admin@epic7optimizer.com" && (
          <NavSecondary items={data.navAdmin} className="mt-4" />
        )}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
