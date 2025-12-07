
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from monorepo root (two levels up from packages/provider)
  const env = loadEnv(mode, path.resolve(__dirname, '../..'), '');

  return {
    server: {
      port: Number(process.env.PORT) || 5173,
      host: '0.0.0.0',
    },
    build: {
      outDir: './dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: 'terser',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['react-hot-toast', 'react-helmet'],
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
        }
      }
    },
    plugins: [react()],
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
