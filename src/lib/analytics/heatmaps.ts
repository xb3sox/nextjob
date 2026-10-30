/**
 * Heatmaps & Session Recording System (T-109, Phase 33)
 * Provides privacy-first click tracking, scroll depth measurement,
 * interaction session recording, and consent-gated telemetry with zero PII.
 */

export interface ConsentPreferences {
  analytics: boolean;
  sessionRecording: boolean;
  decidedAt: number;
}

export interface HeatmapPoint {
  xPercent: number; // 0-100% of viewport width
  yPercent: number; // 0-100% of document height
  path: string;
  elementTag: string;
  timestamp: number;
}

export interface ScrollDepthEvent {
  path: string;
  maxDepthPercent: number; // 0-100%
  timestamp: number;
}

export interface InteractionEvent {
  type: 'click' | 'scroll' | 'navigate' | 'focus';
  path: string;
  timestamp: number;
  data: Record<string, unknown>;
}

const CONSENT_KEY = 'nextjob_cookie_consent';

export class HeatmapTracker {
  private consent: ConsentPreferences | null = null;
  private clickPoints: HeatmapPoint[] = [];
  private scrollEvents: ScrollDepthEvent[] = [];
  private interactions: InteractionEvent[] = [];
  private maxScrollPercentage = 0;
  private currentPath = '/';

  constructor() {
    this.consent = this.loadConsent();
    if (typeof window !== 'undefined') {
      this.currentPath = window.location.pathname;
    }
  }

  public loadConsent(): ConsentPreferences | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public setConsent(preferences: { analytics: boolean; sessionRecording: boolean }): void {
    this.consent = {
      ...preferences,
      decidedAt: Date.now(),
    };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CONSENT_KEY, JSON.stringify(this.consent));
      } catch {}
    }
  }

  public hasRecordingConsent(): boolean {
    return Boolean(this.consent?.sessionRecording);
  }

  public hasAnalyticsConsent(): boolean {
    return Boolean(this.consent?.analytics);
  }

  public trackClick(
    x: number,
    y: number,
    viewportWidth: number,
    documentHeight: number,
    target?: HTMLElement
  ): HeatmapPoint | null {
    if (!this.hasRecordingConsent()) return null;

    const safeViewportWidth = Math.max(viewportWidth, 1);
    const safeDocHeight = Math.max(documentHeight, 1);

    const xPercent = Math.min(100, Math.max(0, Math.round((x / safeViewportWidth) * 1000) / 10));
    const yPercent = Math.min(100, Math.max(0, Math.round((y / safeDocHeight) * 1000) / 10));

    // Never record text content or values from form controls
    const elementTag = target ? target.tagName.toLowerCase() : 'unknown';

    const point: HeatmapPoint = {
      xPercent,
      yPercent,
      path: this.currentPath,
      elementTag,
      timestamp: Date.now(),
    };

    this.clickPoints.push(point);
    this.recordInteraction('click', { xPercent, yPercent, elementTag });
    return point;
  }

  public trackScroll(
    scrollTop: number,
    windowHeight: number,
    documentHeight: number
  ): ScrollDepthEvent | null {
    if (!this.hasAnalyticsConsent()) return null;

    const scrollableHeight = Math.max(documentHeight - windowHeight, 1);
    const currentPercent = Math.min(
      100,
      Math.max(0, Math.round((scrollTop / scrollableHeight) * 100))
    );

    if (currentPercent > this.maxScrollPercentage) {
      this.maxScrollPercentage = currentPercent;
    }

    const event: ScrollDepthEvent = {
      path: this.currentPath,
      maxDepthPercent: this.maxScrollPercentage,
      timestamp: Date.now(),
    };

    this.scrollEvents.push(event);
    return event;
  }

  public recordInteraction(type: InteractionEvent['type'], data: Record<string, unknown>): void {
    if (!this.hasRecordingConsent()) return;

    // Sanitize any data to ensure zero raw PII
    const cleanData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (/password|email|phone|ssn|name/i.test(k)) continue;
      cleanData[k] = v;
    }

    this.interactions.push({
      type,
      path: this.currentPath,
      timestamp: Date.now(),
      data: cleanData,
    });
  }

  public setPath(newPath: string): void {
    this.currentPath = newPath;
    this.maxScrollPercentage = 0;
    this.recordInteraction('navigate', { to: newPath });
  }

  public getHeatmapPoints(path?: string): HeatmapPoint[] {
    return path ? this.clickPoints.filter((p) => p.path === path) : [...this.clickPoints];
  }

  public getScrollEvents(path?: string): ScrollDepthEvent[] {
    return path ? this.scrollEvents.filter((s) => s.path === path) : [...this.scrollEvents];
  }

  public getInteractions(): InteractionEvent[] {
    return [...this.interactions];
  }

  public clear(): void {
    this.clickPoints = [];
    this.scrollEvents = [];
    this.interactions = [];
    this.maxScrollPercentage = 0;
  }
}

// Global Singleton
let defaultHeatmapTracker: HeatmapTracker | null = null;

export function getHeatmapTracker(): HeatmapTracker {
  if (!defaultHeatmapTracker) {
    defaultHeatmapTracker = new HeatmapTracker();
  }
  return defaultHeatmapTracker;
}
