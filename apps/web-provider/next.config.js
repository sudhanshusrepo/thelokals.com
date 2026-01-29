const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // For Cloudflare Workers
    transpilePackages: ['@thelocals/platform-core', '@thelocals/platform-config'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    images: {
        unoptimized: true, // Required for Cloudflare Pages
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
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
