const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
