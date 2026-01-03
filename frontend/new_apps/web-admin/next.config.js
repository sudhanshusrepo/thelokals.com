const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@thelocals/core'],
    experimental: {
        turbo: {
            root: path.join(__dirname, '../../..'),
        }
    }
};

module.exports = nextConfig;
