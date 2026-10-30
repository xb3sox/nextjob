import { sanitizeAnalyticsProperties } from './sanitizer';
import type { AnalyticsEvent, AnalyticsEventType } from './types';

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private pageStartTime: number = Date.now();
  private isFirstInteraction = true;
  private hasBounced = true;
  private currentPath = '/';

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return 'test_session_server';
    }
    try {
      let id = window.sessionStorage.getItem('nextjob_analytics_sid');
      if (!id) {
        id = `sid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        window.sessionStorage.setItem('nextjob_analytics_sid', id);
      }
      return id;
    } catch {
      return `sid_${Date.now()}_fallback`;
    }
  }

  public track(
    type: AnalyticsEventType,
    properties: Record<string, unknown> = {},
    customPath?: string
  ): AnalyticsEvent {
    const sanitizedProps = sanitizeAnalyticsProperties(properties);
    const path = customPath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      timestamp: Date.now(),
      path,
      sessionId: this.sessionId,
      properties: sanitizedProps,
    };

    this.events.push(event);

    // If an action or navigation occurs, candidate did not bounce
    if (type === 'cta_click' || type === 'signup_conversion' || type === 'waitlist_conversion') {
      this.hasBounced = false;
    }

    return event;
  }

  public trackPageView(path: string, properties: Record<string, unknown> = {}): AnalyticsEvent {
    // Record time on previous page before navigation
    if (this.currentPath !== path && !this.isFirstInteraction) {
      this.recordTimeOnPage(this.currentPath);
    }
    this.currentPath = path;
    this.pageStartTime = Date.now();
    this.isFirstInteraction = false;

    return this.track('page_view', properties, path);
  }

  public trackCtaClick(
    ctaName: string,
    destination?: string,
    extra: Record<string, unknown> = {}
  ): AnalyticsEvent {
    this.hasBounced = false;
    return this.track('cta_click', {
      ctaName,
      destination,
      ...extra,
    });
  }

  public trackConversion(
    type: 'signup_conversion' | 'waitlist_conversion',
    extra: Record<string, unknown> = {}
  ): AnalyticsEvent {
    this.hasBounced = false;
    return this.track(type, {
      ...extra,
    });
  }

  public recordTimeOnPage(path?: string): AnalyticsEvent {
    const elapsedSeconds = Math.max(0, Math.round((Date.now() - this.pageStartTime) / 1000));
    return this.track(
      'time_on_page',
      {
        durationSeconds: elapsedSeconds,
      },
      path || this.currentPath
    );
  }

  public recordSessionBounce(): AnalyticsEvent | null {
    if (this.hasBounced) {
      return this.track('session_bounce', {
        singlePageVisit: true,
      });
    }
    return null;
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clearEvents(): void {
    this.events = [];
    this.hasBounced = true;
    this.pageStartTime = Date.now();
  }
}

export const analytics = new AnalyticsTracker();
