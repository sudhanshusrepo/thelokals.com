const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['@thelocals/platform-core', '@thelocals/platform-config'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
