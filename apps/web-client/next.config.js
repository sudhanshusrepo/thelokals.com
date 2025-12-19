const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@supabase/supabase-js': path.resolve(__dirname, '../../node_modules/@supabase/supabase-js'),
    };
    return config;
  },
};

module.exports = nextConfig;
