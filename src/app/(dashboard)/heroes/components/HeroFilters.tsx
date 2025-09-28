"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HeroFilters(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = React.useState<string>(
    searchParams.get("name") || ""
  );

  React.useEffect(() => {
    setName(searchParams.get("name") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("name")]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (name && name.trim().length > 0) {
        params.set("name", name.trim());
      } else {
        params.delete("name");
      }
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <div className="grid w-full gap-4 md:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="hero-name">Hero name</Label>
        <Input
          id="hero-name"
          placeholder="Type a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    </div>
  );
}
