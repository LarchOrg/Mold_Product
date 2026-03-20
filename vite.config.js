import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth':  { target: 'http://localhost:5001', changeOrigin: true },
      '/api/mould': { target: 'http://localhost:5002', changeOrigin: true },
    },
  },
});
