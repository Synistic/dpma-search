import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@onkernel/sdk", "ws"],
};

export default nextConfig;
