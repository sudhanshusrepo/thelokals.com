
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: Number(process.env.PORT) || 5173,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@core': path.resolve(__dirname, '../core'),
        '@thelocals/core': path.resolve(__dirname, '../core'),
      }
    }
  };
});
