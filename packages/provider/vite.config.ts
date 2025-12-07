
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// import viteCompression from 'vite-plugin-compression'; // Temporarily disabled for Cloudflare Pages

export default defineConfig(({ mode }) => {
  // Load env file from monorepo root (two levels up from packages/provider)
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');

  return {
    server: {
      port: Number(process.env.PORT) || 5173,
      host: '0.0.0.0',
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'esnext',
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js']
          }
        }
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'thelokals Provider Portal',
          short_name: 'thelokals Pro',
          description: 'Manage your service bookings and grow your business',
          theme_color: '#0d9488',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          orientation: 'portrait',
          categories: ['business', 'productivity'],
          icons: [
            {
              src: '/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Job Requests',
              short_name: 'Jobs',
              description: 'View pending job requests',
              url: '/jobs',
              icons: [{ src: '/web-app-manifest-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'My Bookings',
              short_name: 'Bookings',
              description: 'View your active bookings',
              url: '/bookings',
              icons: [{ src: '/web-app-manifest-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            }
          ]
        }
      })
      // Temporarily disabled for Cloudflare Pages compatibility
      // viteCompression({
      //   algorithm: 'brotliCompress',
      //   ext: '.br',
      //   threshold: 10240,
      //   deleteOriginFile: false
      // })
    ],
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@core': path.resolve(__dirname, '../core'),
        '@thelocals/core': path.resolve(__dirname, '../core'),
      }
    },
    envDir: path.resolve(__dirname, '../..'), // Load .env from monorepo root
  };
});
