const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@thelocals/core'],
    outputFileTracingRoot: path.join(__dirname, '../../..'),
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
