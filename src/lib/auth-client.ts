import { createAuthClient } from "better-auth/react";

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
