import { createAuthClient } from "better-auth/react";

// Use NEXT_PUBLIC_BETTER_AUTH_URL for client-side access
// Default to current origin if not set
const baseURL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin
    : process.env.BETTER_AUTH_URL;

// Function to get the current origin (with port if not 80/443)
const getCurrentOrigin = () => {
  if (typeof window === "undefined") return "";
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
};

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL || getCurrentOrigin()
      : process.env.BETTER_AUTH_URL,
  defaultOptions: {
    redirectTo: "/home",
    signInOptions: {
      rememberMe: true,
    },
  },
});
