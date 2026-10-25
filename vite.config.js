import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@nextjob/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      // T-18: review UI consumes the tailoring engine's real output.
      '@nextjob/tailoring': path.resolve(__dirname, './packages/tailoring/src/index.ts'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
