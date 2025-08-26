"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";
import { useSidebar } from "./sidebar-context";

// SidebarInput - Input field for search/filtering
export function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "bg-sidebar-accent text-sidebar-accent-foreground placeholder:text-sidebar-accent-foreground/50",
        className
      )}
      {...props}
    />
  );
}

// SidebarTrigger - Button to trigger sidebar open/close
export function SidebarTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-slot="sidebar-trigger"
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={toggleSidebar}
      {...props}
    >
      {children || <PanelLeftIcon className="h-4 w-4" />}
    </Button>
  );
}
