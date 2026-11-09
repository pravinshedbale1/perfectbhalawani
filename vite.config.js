import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom domain (perfectbhalawani.in) वर base '/' ठेवा.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { chunkSizeWarningLimit: 1200 },
});
