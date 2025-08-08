import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/CeciliaBot/E7Assets-Temp/main/assets/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/fribbels/Fribbels-Epic-7-Optimizer/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Increase Server Actions/body parser limit to allow large uploads (gear.txt > 1MB)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
