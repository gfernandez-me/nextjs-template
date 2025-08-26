"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar/sidebar-menu";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar/sidebar-content";

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  className?: string;
}) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} target="_blank" rel="noopener noreferrer">
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
