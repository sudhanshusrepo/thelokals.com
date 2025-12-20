const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ['@thelocals/core', 'lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
