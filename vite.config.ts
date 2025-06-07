import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy Firestore API requests to avoid CORS issues during development
      '/google.firestore.v1.Firestore/Write/channel': {
        target: 'https://firestore.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/google.firestore.v1.Firestore\/Write\/channel/, '/google.firestore.v1.Firestore/Write/channel'),
      },
    },
  },
});
