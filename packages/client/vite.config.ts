
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      historyApiFallback: true,
    },
    build: {
      outDir: '../../dist', // Output to root dist for Cloudflare
      emptyOutDir: true,
      target: 'esnext',
      minify: false, // Keep false for debugging until fully stable
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            }
          ]
        },
        manifest: {
          name: 'thelokals.com',
          short_name: 'thelokals',
          description: 'Discover all types of local services in one app',
          theme_color: '#0d9488',
          background_color: '#ffffff',
          display: 'standalone',
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
          ]
        }
      })
    ],
    // Explicitly deduping react-router to prevent "useNavigateUnstable" error
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@core': path.resolve(__dirname, '../core'),
        '@thelocals/core': path.resolve(__dirname, '../core'),
      }
    }
  };
});
