import { AITelemetry } from './ai-telemetry';
import { ProductAnalytics } from './analytics';
import { Logger } from './logger';
import { Tracer } from './tracer';
import type { ObservabilityConfig } from './types';

export * from './ai-telemetry';
export * from './analytics';
export * from './logger';
export * from './sanitizer';
export * from './tracer';
export * from './types';

export class Observability {
  readonly config: ObservabilityConfig;
  readonly logger: Logger;
  readonly tracer: Tracer;
  readonly analytics: ProductAnalytics;
  readonly aiTelemetry: AITelemetry;

  constructor(config: ObservabilityConfig) {
    this.config = config;
    this.logger = new Logger(
      config.logLevel || 'info',
      {
        service: config.serviceName,
        env: config.environment,
      },
      process.env.NODE_ENV !== 'test'
    );
    this.tracer = new Tracer(config.serviceName);
    this.analytics = new ProductAnalytics(config.posthog?.apiKey, config.posthog?.host);
    this.aiTelemetry = new AITelemetry(config.langfuse);
  }
}

let instance: Observability | null = null;

export function initObservability(config: ObservabilityConfig): Observability {
  instance = new Observability(config);
  return instance;
}

export function getObservability(): Observability {
  if (!instance) {
    instance = new Observability({
      serviceName: 'nextjob-api',
      environment: process.env.NODE_ENV || 'development',
    });
  }
  return instance;
}
