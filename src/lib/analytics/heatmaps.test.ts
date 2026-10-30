// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { HeatmapTracker } from './heatmaps';

describe('Heatmaps & Session Recording (T-109)', () => {
  let tracker: HeatmapTracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = new HeatmapTracker();
  });

  describe('Consent Handling', () => {
    it('defaults to no recording or analytics consent before decision', () => {
      expect(tracker.hasRecordingConsent()).toBe(false);
      expect(tracker.hasAnalyticsConsent()).toBe(false);
    });

    it('persists and respects granted consent', () => {
      tracker.setConsent({ analytics: true, sessionRecording: true });
      expect(tracker.hasRecordingConsent()).toBe(true);
      expect(tracker.hasAnalyticsConsent()).toBe(true);

      // Verify loaded from storage on new instance
      const freshTracker = new HeatmapTracker();
      expect(freshTracker.hasRecordingConsent()).toBe(true);
      expect(freshTracker.hasAnalyticsConsent()).toBe(true);
    });

    it('supports partial consent (analytics only, no session recording)', () => {
      tracker.setConsent({ analytics: true, sessionRecording: false });
      expect(tracker.hasAnalyticsConsent()).toBe(true);
      expect(tracker.hasRecordingConsent()).toBe(false);
    });
  });

  describe('Click Heatmap Tracking', () => {
    it('rejects click tracking when recording consent is missing', () => {
      const point = tracker.trackClick(100, 200, 1000, 2000);
      expect(point).toBeNull();
      expect(tracker.getHeatmapPoints()).toHaveLength(0);
    });

    it('tracks percentage coordinates accurately with recording consent', () => {
      tracker.setConsent({ analytics: true, sessionRecording: true });
      const target = document.createElement('button');
      target.textContent = 'Apply Now';

      const point = tracker.trackClick(500, 1000, 1000, 2000, target);
      expect(point).not.toBeNull();
      expect(point?.xPercent).toBe(50);
      expect(point?.yPercent).toBe(50);
      expect(point?.elementTag).toBe('button');
      expect(tracker.getHeatmapPoints()).toHaveLength(1);
    });

    it('filters heatmap points by route path', () => {
      tracker.setConsent({ analytics: true, sessionRecording: true });
      tracker.setPath('/jobs');
      tracker.trackClick(100, 100, 1000, 1000);

      tracker.setPath('/tailor');
      tracker.trackClick(200, 200, 1000, 1000);

      expect(tracker.getHeatmapPoints('/jobs')).toHaveLength(1);
      expect(tracker.getHeatmapPoints('/tailor')).toHaveLength(1);
      expect(tracker.getHeatmapPoints()).toHaveLength(2);
    });
  });

  describe('Scroll Depth Tracking', () => {
    it('rejects scroll tracking when analytics consent is missing', () => {
      const scroll = tracker.trackScroll(500, 1000, 3000);
      expect(scroll).toBeNull();
      expect(tracker.getScrollEvents()).toHaveLength(0);
    });

    it('tracks maximum scroll depth achieved with consent', () => {
      tracker.setConsent({ analytics: true, sessionRecording: false });
      // Total scrollable: 3000 - 1000 = 2000. ScrollTop 1000 = 50%
      const event1 = tracker.trackScroll(1000, 1000, 3000);
      expect(event1?.maxDepthPercent).toBe(50);

      // Scrolling back up does not decrease maxDepthPercent
      const event2 = tracker.trackScroll(200, 1000, 3000);
      expect(event2?.maxDepthPercent).toBe(50);

      // Scrolling further updates maxDepthPercent
      const event3 = tracker.trackScroll(1800, 1000, 3000);
      expect(event3?.maxDepthPercent).toBe(90);
    });
  });

  describe('Session Interactions & PII Redaction', () => {
    it('redacts sensitive form keys from recorded interaction data', () => {
      tracker.setConsent({ analytics: true, sessionRecording: true });
      tracker.recordInteraction('focus', {
        fieldId: 'salary_input',
        password: 'supersecretpassword',
        candidateName: 'Alice Smith',
        step: 2,
      });

      const interactions = tracker.getInteractions();
      expect(interactions).toHaveLength(1);
      const data = interactions[0].data;
      expect(data.step).toBe(2);
      expect(data.fieldId).toBe('salary_input');
      expect(data.password).toBeUndefined();
      expect(data.candidateName).toBeUndefined();
    });
  });
});
