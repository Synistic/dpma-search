import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core", "@onkernel/sdk", "ws"],
};

export default nextConfig;
