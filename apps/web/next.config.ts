import { withConsentManifest } from "@c15t/nextjs/build";

import type { NextConfig } from "next";
import "./env.config";

const INTERNAL_PACKAGES = [
  "@workspace/analytics-web",
  "@workspace/api",
  "@workspace/auth",
  "@workspace/billing",
  "@workspace/billing-web",
  "@workspace/cms",
  "@workspace/email",
  "@workspace/db",
  "@workspace/flags",
  "@workspace/flags-web",
  "@workspace/i18n",
  "@workspace/monitoring-web",
  "@workspace/shared",
  "@workspace/storage",
  "@workspace/ui",
  "@workspace/ui-web",
];

const config: NextConfig = {
  reactStrictMode: true,
  /** Auto-memoize components via React Compiler (Rust path in Turbopack) */
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
    ],
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: INTERNAL_PACKAGES,
  experimental: {
    optimizePackageImports: INTERNAL_PACKAGES,
    /** Security-related upgrade reminders during dev/build (Next.js 16.4+) */
    agentUpgrade: "security",
    /** Keep soft navigations / Server Actions pending and retry on reconnect */
    useOffline: true,
    /** Faster React Compiler inside Turbopack (requires reactCompiler: true) */
    turbopackRustReactCompiler: true,
    /** Required when `[locale]` is the root layout (Next.js 16.3 pattern) */
    globalNotFound: true,
  },

  /**
   * Type checking runs as a separate CI task. When enabled, `next build`
   * uses the project-local TypeScript CLI (supports TypeScript 7).
   */
  typescript: { ignoreBuildErrors: true },
};

export default withConsentManifest(config);
