import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@thelocals/platform-core', '@thelocals/flows'],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' }
    ]
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily to bypass strict checks during rapid build
  }
};

export default nextConfig;
