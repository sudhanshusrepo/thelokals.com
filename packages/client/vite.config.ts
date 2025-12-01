
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      historyApiFallback: true,
    },
    build: {
      outDir: 'dist',
      target: 'esnext', // Optimize for modern browsers
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'react-loading-skeleton'],
            map: ['leaflet', 'react-leaflet'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
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
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify('https://gdnltvvxiychrsdzenia.supabase.co'),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8'),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://gdnltvvxiychrsdzenia.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@core': path.resolve(__dirname, '../core'),
      }
    }
  };
});
