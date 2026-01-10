const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['@thelocals/platform-core', '@thelocals/platform-config', '@thelocals/ui-web', '@thelocals/flows'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    cacheHandler: require.resolve('./cache-handler.js'),
    cacheHandler: require.resolve('./cache-handler.js'),
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
