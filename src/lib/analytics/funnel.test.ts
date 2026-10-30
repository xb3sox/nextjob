import { beforeEach, describe, expect, it } from 'vitest';
import { GET, POST } from '../../pages/api/analytics/funnel/route';
import { ConversionFunnelTracker, FUNNEL_STAGES, funnelTracker } from './funnel';

describe('ConversionFunnelTracker (T-105, FR-MON-01)', () => {
  let tracker: ConversionFunnelTracker;

  beforeEach(() => {
    tracker = new ConversionFunnelTracker();
    funnelTracker.clear();
  });

  it('tracks events across all 6 funnel stages', () => {
    const sessionId = 'test_session_100';

    for (const stage of FUNNEL_STAGES) {
      const event = tracker.trackStage(stage, sessionId, { referrer: 'google' }, '/landing');
      expect(event.stage).toBe(stage);
      expect(event.sessionId).toBe(sessionId);
      expect(event.timestamp).toBeGreaterThan(0);
      expect(event.isoTimestamp).toBeDefined();
    }

    const events = tracker.getEventsForSession(sessionId);
    expect(events.length).toBe(6);
  });

  it('calculates stage counts, conversions, and drop-off rates accurately', () => {
    // Session 1: completes full funnel
    tracker.trackStage('visitor', 's1', {}, '/');
    tracker.trackStage('page_view', 's1', {}, '/features');
    tracker.trackStage('cta_click', 's1', {}, '/signup');
    tracker.trackStage('signup_start', 's1', {}, '/signup');
    tracker.trackStage('signup_complete', 's1', {}, '/dashboard');
    tracker.trackStage('first_application', 's1', {}, '/applications');

    // Session 2: drops off at cta_click
    tracker.trackStage('visitor', 's2', {}, '/');
    tracker.trackStage('page_view', 's2', {}, '/pricing');
    tracker.trackStage('cta_click', 's2', {}, '/pricing');

    const report = tracker.calculateReport();

    expect(report.totalSessions).toBe(2);
    expect(report.overallConversionRate).toBe(50); // 1 out of 2 = 50%
    expect(report.totalDropoffRate).toBe(50);

    const visitorStage = report.stages.find((s) => s.stage === 'visitor')!;
    expect(visitorStage.count).toBe(2);
    expect(visitorStage.conversionFromPrevious).toBe(100);
    expect(visitorStage.dropoffFromPrevious).toBe(0);

    const appStage = report.stages.find((s) => s.stage === 'first_application')!;
    expect(appStage.count).toBe(1);
    expect(appStage.conversionFromPrevious).toBe(100); // 1 out of 1 signup_complete
    expect(appStage.overallConversion).toBe(50);
  });

  it('records stage timestamps and calculates average stage transition durations', async () => {
    const sessionId = 's_time_test';
    const t0 = 1000000;

    tracker.trackStage('visitor', sessionId, {}, '/');
    const events = tracker.getEventsForSession(sessionId);
    events[0].timestamp = t0;

    tracker.trackStage('page_view', sessionId, {}, '/page1');
    const events2 = tracker.getEventsForSession(sessionId);
    events2[1].timestamp = t0 + 2000; // 2s transition

    const report = tracker.calculateReport();
    const pvStage = report.stages.find((s) => s.stage === 'page_view')!;

    expect(pvStage.avgTimeFromPreviousMs).toBe(2000);
    expect(pvStage.firstRecordedAt).toBeDefined();
    expect(pvStage.lastRecordedAt).toBeDefined();
  });

  it('sanitizes metadata properties to prevent PII leaks', () => {
    const evt = tracker.trackStage('visitor', 's_pii', {
      email: 'user@example.com',
      password: 'secret_password_123',
      ctaName: 'Start Free Trial',
      referrerText: 'Contact user@example.com now',
    });

    expect(evt.metadata?.email).toBeUndefined();
    expect(evt.metadata?.password).toBeUndefined();
    expect(evt.metadata?.ctaName).toBe('Start Free Trial');
    expect(evt.metadata?.referrerText).toBe('Contact [REDACTED_EMAIL] now');
  });

  describe('API Route /api/analytics/funnel (route.ts)', () => {
    it('handles POST requests to log funnel events with validation', async () => {
      const resMissing = await POST({});
      expect(resMissing.status).toBe(400);

      const resInvalidStage = await POST({ sessionId: 's1', stage: 'invalid_stage' as any });
      expect(resInvalidStage.status).toBe(400);

      const resSuccess = await POST({
        sessionId: 's_api_1',
        stage: 'signup_start',
        metadata: { source: 'landing_hero' },
      });

      expect(resSuccess.status).toBe(201);
      expect((resSuccess.body as any).success).toBe(true);
      expect((resSuccess.body as any).data.stage).toBe('signup_start');
    });

    it('handles GET requests to return calculated funnel report', async () => {
      await POST({ sessionId: 's_api_get', stage: 'visitor' });
      await POST({ sessionId: 's_api_get', stage: 'page_view' });

      const res = await GET();
      expect(res.status).toBe(200);
      expect((res.body as any).success).toBe(true);
      expect((res.body as any).data.totalSessions).toBeGreaterThanOrEqual(1);
    });
  });
});
