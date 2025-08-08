import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increase Server Actions/body parser limit to allow large uploads (gear.txt > 1MB)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
