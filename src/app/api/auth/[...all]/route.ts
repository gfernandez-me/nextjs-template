import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Add debug logging wrapper
const debugHandler = async (request: Request) => {
  console.log("Auth Request:", {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  const response = await auth.handler(request);

  console.log("Auth Response:", {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });

  return response;
};

export const { GET, POST } = toNextJsHandler(debugHandler);
