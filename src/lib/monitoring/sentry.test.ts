import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addBreadcrumb,
  captureException,
  captureMessage,
  generateFingerprint,
  initSentry,
  parseStackTrace,
  SentryClient,
  setTag,
  setUser,
} from './sentry';

describe('Sentry Monitoring (T-107)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses Chrome and Safari/Firefox stack traces', () => {
    const v8 = 'Error: err\n at run (http://localhost/engine.ts:42:15)';
    const ff = 'run@http://localhost/engine.ts:42:15';
    expect(parseStackTrace(v8)[0]).toMatchObject({
      function: 'run',
      filename: 'http://localhost/engine.ts',
      lineno: 42,
      colno: 15,
    });
    expect(parseStackTrace(ff)[0]).toMatchObject({
      function: 'run',
      filename: 'http://localhost/engine.ts',
      lineno: 42,
      colno: 15,
    });
    expect(parseStackTrace(undefined)).toEqual([]);
  });

  it('generates normalized deterministic fingerprints for error grouping', () => {
    const frame = { filename: 'src/tailor.ts', lineno: 55 };
    const fp1 = generateFingerprint('TypeError', 'Missing item (id: 12345)', frame);
    const fp2 = generateFingerprint('TypeError', 'Missing item (id: 99999)', frame);
    expect(fp1).toEqual(fp2);
    expect(fp1[0]).toBe('TypeError');
    expect(fp1[1]).toContain('<n>');
  });

  it('deduplicates identical errors occurring within dedupWindowMs', () => {
    const client = new SentryClient({ dedupWindowMs: 5000 });
    const err = new Error('DB timeout');
    const id1 = client.captureException(err);
    const id2 = client.captureException(err);
    expect(id1).toBe(id2);
    expect(client.getEvents()).toHaveLength(1);
  });

  it('triggers onSpikeAlert when error rate exceeds threshold', () => {
    const onSpikeAlert = vi.fn();
    const client = new SentryClient({
      dedupWindowMs: 0,
      spikeThreshold: { maxErrors: 3, windowMs: 5000 },
      onSpikeAlert,
    });
    client.captureException(new Error('e1'));
    client.captureException(new Error('e2'));
    expect(onSpikeAlert).not.toHaveBeenCalled();
    client.captureException(new Error('e3'));
    expect(onSpikeAlert).toHaveBeenCalledTimes(1);
    expect(onSpikeAlert.mock.calls[0][0].count).toBe(3);
  });

  it('scrubs PII (email, name, phone, ssn) and pseudo-anonymizes user ID', () => {
    const client = new SentryClient();
    client.setUser({
      id: 'usr_long_id_1234567890abcdef',
      email: 'user@example.com',
      name: 'John Doe',
      phone: '+1 555-0100',
      role: 'candidate',
    });
    client.captureException(new Error('Render error'));
    const user = client.getEvents()[0].user;
    expect(user?.email).toBeUndefined();
    expect(user?.name).toBeUndefined();
    expect(user?.phone).toBeUndefined();
    expect(user?.role).toBe('candidate');
    expect(user?.id).toBe('usr_usr_long_id_');
  });

  it('attaches breadcrumbs and tags to captured events', () => {
    const client = new SentryClient();
    client.setTag('env', 'production');
    client.addBreadcrumb({ category: 'nav', message: 'navigated to /dash' });
    client.captureException(new Error('Navigation fault'));
    const ev = client.getEvents()[0];
    expect(ev.tags.env).toBe('production');
    expect(ev.breadcrumbs[0].message).toBe('navigated to /dash');
  });

  it('captures messages with level and custom context', () => {
    const client = new SentryClient();
    const id = client.captureMessage('Warmup started', 'info');
    expect(id).toMatch(/^msg_/);
    expect(client.getEvents()[0].message).toBe('Warmup started');
  });

  it('provides singleton API exports', () => {
    const client = initSentry({ release: 'v1.0.0', environment: 'test', dedupWindowMs: 0 });
    setUser({ role: 'admin' });
    setTag('module', 'tailor');
    addBreadcrumb({ message: 'clicked', category: 'action' });
    expect(captureException(new Error('Crash'))).not.toBeNull();
    expect(captureMessage('Notice', 'warning')).not.toBeNull();
    const events = client.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].release).toBe('v1.0.0');
    expect(events[0].tags.module).toBe('tailor');
  });
});
