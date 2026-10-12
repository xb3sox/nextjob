/// <reference types="vitest" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Route every `drizzle-orm/pg-core` import through the test-only shim
      // (see vitest.drizzle-shim.ts). Needed because packages/api tests mock
      // the `drizzle-orm` root with bare stubs while the schema imports the
      // subpath, which otherwise loads as externalized CJS where column
      // `defaultConfig` is undefined and index building throws.
      'drizzle-orm/pg-core': fileURLToPath(new URL('./vitest.drizzle-shim.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // NOTE: do NOT add `server.deps.inline: [/drizzle-orm/]`. Inlining makes
    // Vitest treat drizzle-orm's own internal relative imports (e.g.
    // pg-core/index.js -> ./indexes) as inlined too, which silently breaks
    // named exports (`uuid is not a function`). The default externalized-CJS
    // path works; the pg-core shim above repairs the one real defect there
    // (undefined `defaultConfig` during JSON deep-copy in index builders).
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
