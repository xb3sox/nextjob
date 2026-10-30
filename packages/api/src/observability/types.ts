export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  spanId?: string;
  tenantId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export type SpanStatus = 'UNSET' | 'OK' | 'ERROR';

export interface Span {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  attributes: Record<string, string | number | boolean>;
  status: SpanStatus;
  statusMessage?: string;
}

export interface AnalyticsEvent {
  event: string;
  distinctId: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface ObservabilityConfig {
  serviceName: string;
  environment: string;
  logLevel?: LogLevel;
  langfuse?: {
    publicKey?: string;
    secretKey?: string;
    baseUrl?: string;
  };
  posthog?: {
    apiKey?: string;
    host?: string;
  };
  otel?: {
    endpoint?: string;
    sampleRate?: number;
  };
}
