import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Custom domain (perfectbhalawani.in) वर base '/' ठेवा.
// दोन पाने: मुख्य app (index.html) व LibreOffice सराव (office.html — cross-origin isolated)
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), office: resolve(__dirname, 'office.html') } },
  },
});
