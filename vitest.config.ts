/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    projects: [
      {
        // Node-environment tests: backend packages + pure logic
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['packages/**/*.{test,spec}.{ts,tsx}', 'src/lib/**/*.{test,spec}.{ts,tsx}'],
        },
      },
      {
        // jsdom is intentionally NOT used here: jsdom@30 pulls undici@8 which
        // requires Node >= 20.24/22 (webidl.util.markAsUncloneable). The repo's
        // DOM component tests run in the happy-dom environment instead.
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['src/lib/**'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/*.stories.*',
        'coverage/',
      ],
    },
  },
});
