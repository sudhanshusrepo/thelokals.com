const path = require("path");

// OpenNext Cloudflare adapter
const withCloudflare = require("@opennextjs/cloudflare");

// Bundle analyzer (only in analyze mode)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@thelocals/core'],
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@thelocals/core', 'framer-motion', 'lucide-react', 'date-fns', 'react-hot-toast'],
  },

  // Security and performance headers
  // Security and performance headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let supabaseOrigin = '';

    try {
      if (supabaseUrl) {
        const url = new URL(supabaseUrl);
        supabaseOrigin = url.origin;
      }
    } catch (e) {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
    }

    // Base CSP directives
    let connectSrc = "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.gemini.google.com https://nominatim.openstreetmap.org";

    // Add Supabase origin if distinct from wildcards
    if (supabaseOrigin && !supabaseOrigin.includes('.supabase.co')) {
      connectSrc += ` ${supabaseOrigin}`;
      // If local, adding websocket port for realtime if needed, though usually standard port
      if (supabaseOrigin.includes('127.0.0.1') || supabaseOrigin.includes('localhost')) {
        const wsOrigin = supabaseOrigin.replace('http', 'ws');
        connectSrc += ` ${wsOrigin}`;
      }
    }

    const cspValue = isDev
      ? `default-src 'self' 'unsafe-eval' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; ${connectSrc};`
      : `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; ${connectSrc}; frame-ancestors 'self'; base-uri 'self'; form-action 'self';`;

    return [
      // Static asset caching
      {
        source: '/(.*)\\.(jpg|jpeg|png|svg|ico|woff2)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self), interest-cohort=()',
          },
          // Content Security Policy (Dynamic)
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
  // Exclude heavy dependencies from server bundle for Cloudflare Workers
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude Sentry from server bundle to reduce size
      config.externals = config.externals || [];
      config.externals.push({
        '@sentry/nextjs': 'commonjs @sentry/nextjs',
      });
    }
    return config;
  },
};

module.exports = withCloudflare(withBundleAnalyzer(nextConfig));
