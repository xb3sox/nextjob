/**
 * Application Instrumentation (T-107)
 * Initializes error tracking and performance/observability hooks.
 */

import { initSentry } from './lib/monitoring/sentry';

export function initializeInstrumentation() {
  const isProduction = import.meta.env.PROD;
  const release = import.meta.env.VITE_APP_VERSION || 'nextjob@0.1.0';

  const client = initSentry({
    environment: import.meta.env.MODE || 'development',
    release,
    sampleRate: 1.0,
    dedupWindowMs: 10_000,
    spikeThreshold: {
      maxErrors: isProduction ? 10 : 5,
      windowMs: 60_000,
    },
    onSpikeAlert: (alert) => {
      console.warn(
        `[Sentry Alert] High error spike detected: ${alert.count} errors in ${alert.windowMs / 1000}s. Last error: ${alert.lastError.message}`
      );
    },
    autoInstrument: typeof window !== 'undefined',
  });

  return client;
}

// Auto-initialize when loaded in browser environments
if (typeof window !== 'undefined') {
  initializeInstrumentation();
}
