import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Add debug logging wrapper
const debugHandler = async (request: Request) => {
  const response = await auth.handler(request);
  return response;
};

export const { GET, POST } = toNextJsHandler(debugHandler);
