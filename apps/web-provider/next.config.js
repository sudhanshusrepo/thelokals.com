const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['@thelocals/platform-core', '@thelocals/platform-config'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    images: {
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gdnltvvxiychrsdzenia.supabase.co',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
