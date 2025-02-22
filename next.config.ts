import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.clerk.com"], // Add Clerk's image domain here
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;