import crypto from 'node:crypto';
import type { Span, SpanStatus } from './types';

export function generateTraceId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateSpanId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function formatTraceparent(traceId: string, spanId: string, sampled = true): string {
  const flags = sampled ? '01' : '00';
  return `00-${traceId}-${spanId}-${flags}`;
}

export function parseTraceparent(
  header: string
): { traceId: string; spanId: string; sampled: boolean } | null {
  const parts = header.trim().split('-');
  if (parts.length !== 4 || parts[0] !== '00') {
    return null;
  }
  const [_, traceId, spanId, flags] = parts;
  if (traceId.length !== 32 || spanId.length !== 16) {
    return null;
  }
  return {
    traceId,
    spanId,
    sampled: flags === '01',
  };
}

export class Tracer {
  private serviceName: string;
  private completedSpans: Span[] = [];

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  startSpan(
    name: string,
    attributes: Record<string, string | number | boolean> = {},
    parent?: { traceId: string; spanId?: string }
  ): Span {
    const traceId = parent?.traceId || generateTraceId();
    const spanId = generateSpanId();

    return {
      id: spanId,
      traceId,
      parentId: parent?.spanId,
      name,
      startTime: Date.now(),
      attributes: {
        'service.name': this.serviceName,
        ...attributes,
      },
      status: 'UNSET',
    };
  }

  endSpan(span: Span, status: SpanStatus = 'OK', statusMessage?: string): Span {
    const endTime = Date.now();
    span.endTime = endTime;
    span.durationMs = Math.max(0, endTime - span.startTime);
    span.status = status;
    span.statusMessage = statusMessage;

    this.completedSpans.push({ ...span });
    return span;
  }

  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes: Record<string, string | number | boolean> = {},
    parent?: { traceId: string; spanId?: string }
  ): Promise<T> {
    const span = this.startSpan(name, attributes, parent);
    try {
      const result = await fn(span);
      this.endSpan(span, 'OK');
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.endSpan(span, 'ERROR', message);
      throw err;
    }
  }

  getCompletedSpans(): readonly Span[] {
    return [...this.completedSpans];
  }

  clearSpans(): void {
    this.completedSpans = [];
  }
}
