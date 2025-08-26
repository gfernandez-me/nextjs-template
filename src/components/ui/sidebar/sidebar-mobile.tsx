"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SIDEBAR_WIDTH_MOBILE } from "./sidebar-constants";
import type { SidebarSide } from "./sidebar-constants";

interface SidebarMobileProps extends React.ComponentProps<"div"> {
  side?: SidebarSide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarMobile({
  side = "left",
  open,
  onOpenChange,
  className,
  children,
  ...props
}: SidebarMobileProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
      <SheetContent
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
        side={side}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Displays the mobile sidebar.</SheetDescription>
        </SheetHeader>
        <div
          data-slot="sidebar"
          data-mobile="true"
          className={cn("flex h-full flex-col", className)}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
