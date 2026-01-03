const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@thelocals/core'],
    experimental: {
        turbopack: {
            root: path.resolve(__dirname, '../../..'),
        }
    }
};

module.exports = nextConfig;
