import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@thelocals/core'],
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
