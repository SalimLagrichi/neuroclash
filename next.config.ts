import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No static export settings for SSR/API support
  images: {
    domains: ['img.clerk.com'],
  },
};

export default nextConfig;
