const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@thelocals/core'],
    experimental: {
        outputFileTracingRoot: path.join(__dirname, '../../..'),
    }
};

module.exports = nextConfig;
