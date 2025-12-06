
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

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
    define: {
      // Expose env variables to client
      'process.env': env
    }
  };
});
