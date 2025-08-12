"use client";

import * as React from "react";

type TabsContext = {
  value: string;
  setValue: (v: string) => void;
};

const Ctx = React.createContext<TabsContext | null>(null);

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue || "");
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as string) : uncontrolled;
  const setValue = (v: string) => {
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border p-1 ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={`px-3 py-1 rounded text-xs font-medium ${
        isActive ? "bg-foreground text-background" : "hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx || ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
