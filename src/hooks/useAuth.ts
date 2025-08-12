"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/lib/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(options?: {
  suppressInitialFetch?: boolean;
}): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  useEffect(() => {
    if (options?.suppressInitialFetch) {
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser, options?.suppressInitialFetch]);

  return {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
  };
}
