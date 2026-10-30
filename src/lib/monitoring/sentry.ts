/**
 * Sentry-Compatible Error Tracking & Monitoring System (T-107)
 */

export interface StackFrame {
  filename?: string;
  function?: string;
  lineno?: number;
  colno?: number;
}

export interface Breadcrumb {
  timestamp: number;
  message: string;
  category: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface BreadcrumbInput {
  message: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export interface UserContext {
  id?: string;
  role?: string;
  plan?: string;
  [key: string]: unknown;
}

export interface SentryEvent {
  eventId: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  message: string;
  errorName?: string;
  stack?: string;
  frames?: StackFrame[];
  fingerprint: string[];
  repeatCount?: number;
  user?: UserContext;
  tags: Record<string, string>;
  extra: Record<string, unknown>;
  breadcrumbs: Breadcrumb[];
  release?: string;
  environment?: string;
}

export interface SpikeAlert {
  count: number;
  windowMs: number;
  lastError: SentryEvent;
  timestamp: number;
}

export interface SentryOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
  dedupWindowMs?: number;
  spikeThreshold?: { maxErrors: number; windowMs: number };
  onSpikeAlert?: (alert: SpikeAlert) => void;
  beforeSend?: (event: SentryEvent) => SentryEvent | null;
  transport?: (event: SentryEvent) => Promise<boolean>;
  autoInstrument?: boolean;
}

const PII_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PII_PHONE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const FORBIDDEN_KEYS = new Set([
  'email',
  'name',
  'fullname',
  'full_name',
  'candidate_name',
  'password',
  'token',
  'secret',
  'ssn',
  'phone',
  'ip',
  'ip_address',
]);

function sanitizeUser(user: UserContext | null): UserContext | undefined {
  if (!user) return undefined;
  const clean: UserContext = {};
  for (const [k, v] of Object.entries(user)) {
    if (FORBIDDEN_KEYS.has(k.toLowerCase())) continue;
    clean[k] =
      typeof v === 'string'
        ? v.replace(PII_EMAIL, '[REDACTED]').replace(PII_PHONE, '[REDACTED]')
        : v;
  }
  if (clean.id && typeof clean.id === 'string' && clean.id.length > 16) {
    clean.id = `usr_${clean.id.substring(0, 12)}`;
  }
  return clean;
}

export function parseStackTrace(stack?: string): StackFrame[] {
  if (!stack) return [];
  const frames: StackFrame[] = [];
  for (const line of stack.split('\n')) {
    const trimmed = line.trim();
    const chrome = trimmed.match(/^at\s+(?:(.+?)\s+\((.+?):(\d+):(\d+)\)|(.+?):(\d+):(\d+))$/);
    if (chrome) {
      frames.push({
        function: chrome[1] || '<anonymous>',
        filename: chrome[2] || chrome[5],
        lineno: parseInt(chrome[3] || chrome[6], 10),
        colno: parseInt(chrome[4] || chrome[7], 10),
      });
      continue;
    }
    const ff = trimmed.match(/^(.*?)@(.*?):(\d+):(\d+)$/);
    if (ff) {
      frames.push({
        function: ff[1] || '<anonymous>',
        filename: ff[2],
        lineno: parseInt(ff[3], 10),
        colno: parseInt(ff[4], 10),
      });
    }
  }
  return frames;
}

export function generateFingerprint(
  name: string,
  message: string,
  topFrame?: StackFrame
): string[] {
  const normMsg = message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>')
    .replace(/\d+/g, '<n>');
  const frameId = topFrame
    ? `${topFrame.filename || 'unknown'}:${topFrame.lineno || 0}`
    : 'no-stack';
  return [name, normMsg, frameId];
}

export class SentryClient {
  private options: SentryOptions;
  private userContext: UserContext | undefined;
  private tags: Record<string, string> = {};
  private extra: Record<string, unknown> = {};
  private breadcrumbs: Breadcrumb[] = [];
  private events: SentryEvent[] = [];
  private recentErrors = new Map<string, { lastSeen: number; count: number; eventId: string }>();
  private errorTimestamps: number[] = [];

  constructor(options: SentryOptions = {}) {
    this.options = {
      environment: 'production',
      sampleRate: 1.0,
      dedupWindowMs: 10_000,
      spikeThreshold: { maxErrors: 5, windowMs: 60_000 },
      ...options,
    };
    if (this.options.autoInstrument) this.instrumentGlobalHandlers();
  }

  public setUser(user: UserContext | null) {
    this.userContext = sanitizeUser(user);
  }
  public setTag(k: string, v: string | number | boolean) {
    this.tags[k] = String(v);
  }
  public setExtra(k: string, v: unknown) {
    this.extra[k] = v;
  }

  public addBreadcrumb(b: BreadcrumbInput) {
    this.breadcrumbs.push({
      timestamp: Date.now(),
      category: b.category || 'default',
      level: b.level || 'info',
      message: b.message.replace(PII_EMAIL, '[REDACTED]'),
      data: b.data,
    });
    if (this.breadcrumbs.length > 50) this.breadcrumbs.shift();
  }

  public captureException(error: unknown, context: Record<string, unknown> = {}): string | null {
    if (this.options.sampleRate !== undefined && Math.random() > this.options.sampleRate)
      return null;
    const now = Date.now();
    let name = 'Error';
    let message = 'Unknown error';
    let stack: string | undefined;

    if (error instanceof Error) {
      name = error.name || 'Error';
      message = error.message || '';
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        message = String(error);
      }
    }

    const frames = parseStackTrace(stack);
    const fingerprint = generateFingerprint(name, message, frames[0]);
    const fpKey = fingerprint.join('::');

    const existing = this.recentErrors.get(fpKey);
    const dedupWindow = this.options.dedupWindowMs || 10_000;
    if (existing && now - existing.lastSeen < dedupWindow) {
      existing.count += 1;
      existing.lastSeen = now;
      return existing.eventId;
    }

    const eventId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    let event: SentryEvent | null = {
      eventId,
      timestamp: now,
      level: 'error',
      errorName: name,
      message,
      stack,
      frames,
      fingerprint,
      repeatCount: 1,
      user: this.userContext,
      tags: { ...this.tags },
      extra: { ...this.extra, ...context },
      breadcrumbs: [...this.breadcrumbs],
      release: this.options.release,
      environment: this.options.environment,
    };

    if (this.options.beforeSend) {
      event = this.options.beforeSend(event);
      if (!event) return null;
    }

    this.events.push(event);
    this.recentErrors.set(fpKey, { lastSeen: now, count: 1, eventId });
    this.checkSpike(now, event);
    if (this.options.transport) this.options.transport(event).catch(() => {});
    return eventId;
  }

  public captureMessage(
    msg: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    ctx: Record<string, unknown> = {}
  ): string | null {
    if (this.options.sampleRate !== undefined && Math.random() > this.options.sampleRate)
      return null;
    const eventId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    let event: SentryEvent | null = {
      eventId,
      timestamp: Date.now(),
      level,
      message: msg,
      fingerprint: ['message', msg],
      tags: { ...this.tags },
      extra: { ...this.extra, ...ctx },
      breadcrumbs: [...this.breadcrumbs],
      release: this.options.release,
      environment: this.options.environment,
      user: this.userContext,
    };
    if (this.options.beforeSend) {
      event = this.options.beforeSend(event);
      if (!event) return null;
    }
    this.events.push(event);
    if (this.options.transport) this.options.transport(event).catch(() => {});
    return eventId;
  }

  private checkSpike(now: number, lastError: SentryEvent) {
    const t = this.options.spikeThreshold;
    if (!t || !this.options.onSpikeAlert) return;
    this.errorTimestamps.push(now);
    this.errorTimestamps = this.errorTimestamps.filter((ts) => ts >= now - t.windowMs);
    if (this.errorTimestamps.length >= t.maxErrors) {
      this.options.onSpikeAlert({
        count: this.errorTimestamps.length,
        windowMs: t.windowMs,
        lastError,
        timestamp: now,
      });
    }
  }

  public getEvents(): SentryEvent[] {
    return [...this.events];
  }
  public clear() {
    this.events = [];
    this.breadcrumbs = [];
    this.recentErrors.clear();
    this.errorTimestamps = [];
  }

  public instrumentGlobalHandlers() {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', (e) => {
      this.captureException(e.error || e.message, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.captureException(e.reason || 'Unhandled Promise Rejection');
    });
  }
}

let defaultClient: SentryClient | null = null;
export function initSentry(options: SentryOptions = {}): SentryClient {
  defaultClient = new SentryClient(options);
  return defaultClient;
}
export function getSentryClient(): SentryClient {
  if (!defaultClient) defaultClient = new SentryClient();
  return defaultClient;
}
export function captureException(err: unknown, ctx?: Record<string, unknown>) {
  return getSentryClient().captureException(err, ctx);
}
export function captureMessage(
  msg: string,
  lvl?: 'debug' | 'info' | 'warning' | 'error',
  ctx?: Record<string, unknown>
) {
  return getSentryClient().captureMessage(msg, lvl, ctx);
}
export function setUser(user: UserContext | null) {
  getSentryClient().setUser(user);
}
export function addBreadcrumb(b: BreadcrumbInput) {
  getSentryClient().addBreadcrumb(b);
}
export function setTag(k: string, v: string | number | boolean) {
  getSentryClient().setTag(k, v);
}
