"use client";

import { createContext, useContext } from "react";

/**
 * Session context for passing authenticated user data to child components
 * This eliminates the need for individual pages to fetch session data
 */

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

interface SessionContextType {
  session: Session;
  userId: string;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  session: Session;
  children: React.ReactNode;
}

export function SessionProvider({ session, children }: SessionProviderProps) {
  const contextValue: SessionContextType = {
    session,
    userId: session.user.id,
    isAdmin: session.user.role === "ADMIN",
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to access session data in client components
 * For server components, use the getServerSession utility instead
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}

/**
 * Hook to get just the user ID
 * Useful for DAL constructors and other utilities
 */
export function useUserId() {
  const { userId } = useSession();
  return userId;
}
