"use client";

import * as React from "react";
import {
  IconDashboard,
  IconFileUpload,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconSword,
  IconUsers,
  IconShield,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar/sidebar-menu";
import { Sidebar } from "@/components/ui/sidebar/sidebar";
import { User } from "#prisma";
import Link from "next/link";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar/sidebar-content";

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
      title: "Gear Recommendations",
      url: "/recommendations",
      icon: IconListDetails,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
  navAdmin: [
    {
      title: "Gear Sets",
      icon: IconShield,
      url: "/admin/gear-sets",
      items: [
        {
          title: "Gear Sets",
          url: "/admin/gear-sets",
        },
      ],
    },
    {
      title: "Users",
      icon: IconUsers,
      url: "/admin/users",
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
      ],
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
        {user.email === "admin@epic7optimizer.com" && (
          <NavSecondary items={data.navAdmin} className="mt-4" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
