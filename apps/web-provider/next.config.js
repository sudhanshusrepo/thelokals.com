const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

module.exports = nextConfig;
