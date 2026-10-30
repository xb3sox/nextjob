import { beforeEach, describe, expect, it } from 'vitest';
import {
  AITelemetry,
  formatTraceparent,
  generateSpanId,
  generateTraceId,
  getObservability,
  hashIdentifier,
  initObservability,
  Logger,
  ProductAnalytics,
  parseTraceparent,
  sanitizePayload,
  sanitizeString,
  Tracer,
} from './index';

describe('Observability Stack (T-38, FR-ANA-01..02, G-08..09)', () => {
  describe('Sanitizer & Zero PII Protection', () => {
    it('redacts email, phone, SSN, and bearer tokens in strings', () => {
      const sensitiveText =
        'Contact basem@example.com at +1-555-019-2834 or SSN 123-45-6789. Bearer eyJhbGciOiJIUzI1NiJ9';
      const clean = sanitizeString(sensitiveText);

      expect(clean).not.toContain('basem@example.com');
      expect(clean).not.toContain('+1-555-019-2834');
      expect(clean).not.toContain('123-45-6789');
      expect(clean).not.toContain('eyJhbGciOiJIUzI1NiJ9');
      expect(clean).toContain('[REDACTED_EMAIL]');
      expect(clean).toContain('[REDACTED_PHONE]');
      expect(clean).toContain('[REDACTED_SSN]');
      expect(clean).toContain('Bearer [REDACTED_TOKEN]');
    });

    it('deeply redacts sensitive keys in objects', () => {
      const payload = {
        userId: 'usr_123',
        password: 'superSecretPassword!',
        token: 'secret-token-xyz',
        cv_text: 'My full resume content with private history',
        profile: {
          email: 'test@candidate.ai',
          apiKey: 'key_live_12345',
        },
      };

      const sanitized = sanitizePayload(payload);
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.cv_text).toBe('[REDACTED]');
      expect(sanitized.profile.email).toBe('[REDACTED]');
      expect(sanitized.profile.apiKey).toBe('[REDACTED]');
      expect(sanitized.userId).toBe('usr_123');
    });

    it('creates deterministic 16-char SHA-256 hash for identifiers', () => {
      const hash1 = hashIdentifier('candidate@example.com');
      const hash2 = hashIdentifier('candidate@example.com');
      const hash3 = hashIdentifier('other@example.com');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toHaveLength(16);
    });
  });

  describe('Structured Logger', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('info', { service: 'test-service' }, false);
    });

    it('records logs with timestamp, level, message, and sanitized data', () => {
      const entry = logger.info('User logged in', {
        email: 'user@example.com',
        role: 'candidate',
      });

      expect(entry).not.toBeNull();
      expect(entry?.level).toBe('info');
      expect(entry?.message).toBe('User logged in');
      expect(entry?.data?.role).toBe('candidate');
      expect(entry?.data?.email).toBe('[REDACTED]');
      expect(entry?.context?.service).toBe('test-service');
      expect(entry?.timestamp).toBeTruthy();
    });

    it('filters logs below configured min level', () => {
      const debugEntry = logger.debug('Verbose trace info');
      expect(debugEntry).toBeNull();
      expect(logger.getEntries()).toHaveLength(0);

      const warnEntry = logger.warn('Warning occurred');
      expect(warnEntry).not.toBeNull();
      expect(logger.getEntries()).toHaveLength(1);
    });

    it('creates child logger inheriting parent context', () => {
      const child = logger.child({ tenantId: 'tenant_abc', traceId: 'trace_123' });
      const entry = child.info('Child operation');

      expect(entry?.context?.service).toBe('test-service');
      expect(entry?.context?.tenantId).toBe('tenant_abc');
      expect(entry?.context?.traceId).toBe('trace_123');
    });

    it('captures sanitized error objects', () => {
      const err = new Error('Database connection failed for token secret_token_xyz');
      const entry = logger.error('Operation failed', err);

      expect(entry?.error?.name).toBe('Error');
      expect(entry?.error?.message).toContain('Database connection failed');
      expect(entry?.error?.stack).toBeTruthy();
    });
  });

  describe('OpenTelemetry Tracer', () => {
    let tracer: Tracer;

    beforeEach(() => {
      tracer = new Tracer('api-test');
    });

    it('generates valid W3C traceId and spanId', () => {
      const traceId = generateTraceId();
      const spanId = generateSpanId();

      expect(traceId).toHaveLength(32);
      expect(spanId).toHaveLength(16);
    });

    it('formats and parses W3C traceparent headers', () => {
      const traceId = generateTraceId();
      const spanId = generateSpanId();
      const header = formatTraceparent(traceId, spanId, true);

      expect(header).toBe(`00-${traceId}-${spanId}-01`);

      const parsed = parseTraceparent(header);
      expect(parsed?.traceId).toBe(traceId);
      expect(parsed?.spanId).toBe(spanId);
      expect(parsed?.sampled).toBe(true);
    });

    it('creates, measures, and records completed spans', () => {
      const span = tracer.startSpan('job.matching', { 'match.count': 42 });
      expect(span.status).toBe('UNSET');
      expect(span.attributes['service.name']).toBe('api-test');
      expect(span.attributes['match.count']).toBe(42);

      const ended = tracer.endSpan(span, 'OK');
      expect(ended.status).toBe('OK');
      expect(ended.durationMs).toBeGreaterThanOrEqual(0);

      const completed = tracer.getCompletedSpans();
      expect(completed).toHaveLength(1);
      expect(completed[0].name).toBe('job.matching');
    });

    it('records error status when withSpan catches exception', async () => {
      await expect(
        tracer.withSpan('failing.action', async () => {
          throw new Error('Connector network fault');
        })
      ).rejects.toThrow('Connector network fault');

      const completed = tracer.getCompletedSpans();
      expect(completed).toHaveLength(1);
      expect(completed[0].status).toBe('ERROR');
      expect(completed[0].statusMessage).toBe('Connector network fault');
    });
  });

  describe('Product Analytics (PostHog-compatible)', () => {
    let analytics: ProductAnalytics;

    beforeEach(() => {
      analytics = new ProductAnalytics();
    });

    it('captures analytics events with zero PII', () => {
      const event = analytics.capture('application_submitted', 'candidate@company.com', {
        jobId: 'job_456',
        fitScore: 92,
        email: 'leaked@private.com',
        cv_text: 'Sensitive resume history',
      });

      expect(event.event).toBe('application_submitted');
      // distinctId hashed to prevent PII in analytics
      expect(event.distinctId).not.toContain('candidate@company.com');
      expect(event.distinctId).toHaveLength(16);

      // Sensitive properties redacted
      expect(event.properties.email).toBe('[REDACTED]');
      expect(event.properties.cv_text).toBe('[REDACTED]');
      expect(event.properties.fitScore).toBe(92);
      expect(event.properties.jobId).toBe('job_456');
    });
  });

  describe('Langfuse AI Telemetry', () => {
    let telemetry: AITelemetry;

    beforeEach(() => {
      telemetry = new AITelemetry();
    });

    it('records AI generation metrics and anonymizes user identifier', () => {
      const record = telemetry.recordGeneration({
        traceId: 'trace_gen_123',
        name: 'tailor_resume_section',
        model: 'gemini-1.5-pro',
        userId: 'candidate@user.com',
        promptTokens: 120,
        completionTokens: 80,
        totalTokens: 200,
        latencyMs: 340,
        success: true,
        metadata: {
          section: 'experience',
          claimCount: 3,
          password: 'should_be_redacted',
        },
      });

      expect(record.model).toBe('gemini-1.5-pro');
      expect(record.userId).not.toContain('candidate@user.com');
      expect(record.metadata?.password).toBe('[REDACTED]');
      expect(record.metadata?.section).toBe('experience');

      const saved = telemetry.getRecords();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('tailor_resume_section');
    });
  });

  describe('Unified Observability Manager', () => {
    it('initializes and provides logger, tracer, analytics, and aiTelemetry', () => {
      const obs = initObservability({
        serviceName: 'nextjob-test',
        environment: 'test',
        logLevel: 'debug',
      });

      expect(obs.logger).toBeInstanceOf(Logger);
      expect(obs.tracer).toBeInstanceOf(Tracer);
      expect(obs.analytics).toBeInstanceOf(ProductAnalytics);
      expect(obs.aiTelemetry).toBeInstanceOf(AITelemetry);

      expect(getObservability()).toBe(obs);
    });
  });
});
