import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@thelocals/core'],
  // This helps Next.js resolve the monorepo root
  outputFileTracingRoot: path.join(__dirname, "../../"),

};

export default nextConfig;
