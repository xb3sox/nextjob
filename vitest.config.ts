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
    // NOTE: do NOT add `server.deps.inline: [/drizzle-orm/]` or a global
    // `resolve.alias` for `drizzle-orm/pg-core`. Both were attempted and both
    // break named exports (`uuid is not a function`) by splitting module
    // identity between the shim/inlined copy and drizzle's externalized CJS
    // internals. The correct fix lives in auth.test.ts: its `vi.mock` of the
    // `drizzle-orm` root uses `{ importActual }` so importing the mocked root
    // still yields the real `pg-core` classes that src/db/schema.ts needs.
    projects: [
      {
        // Node-environment tests: backend packages + pure logic
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['packages/**/*.{test,spec}.{ts,tsx}', 'src/lib/**/*.{test,spec}.{ts,tsx}'],
          server: {
            deps: {
              // Externalize all node_modules deps (Vitest default behavior,
              // pinned explicitly here): drizzle-orm must load as plain CJS
              // with intact class identity for schema brand checks.
              externalizer: 'vite-node',
            },
          },
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
