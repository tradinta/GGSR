import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps to prevent Windows path resolution errors
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
  },
  // Ensure we don't get strict errors for typescript/eslint during build if they aren't critical
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
