import { hashIdentifier, sanitizePayload } from './sanitizer';
import type { AnalyticsEvent } from './types';

export class ProductAnalytics {
  private apiKey?: string;
  private host: string;
  private events: AnalyticsEvent[] = [];

  constructor(apiKey?: string, host = 'https://app.posthog.com') {
    this.apiKey = apiKey;
    this.host = host;
  }

  capture(
    event: string,
    rawDistinctId: string,
    properties: Record<string, unknown> = {}
  ): AnalyticsEvent {
    // 1. Never send raw PII distinctId (e.g. emails) to analytics
    const distinctId = rawDistinctId.includes('@') ? hashIdentifier(rawDistinctId) : rawDistinctId;

    // 2. Sanitize properties to prevent any leaked CV, passwords, or PII
    const cleanProperties = sanitizePayload(properties);

    const record: AnalyticsEvent = {
      event,
      distinctId,
      properties: {
        ...cleanProperties,
        $lib: 'nextjob-analytics',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    this.events.push(record);

    // If API key is configured, post in background (no-op in local tests)
    if (this.apiKey && typeof fetch !== 'undefined') {
      try {
        fetch(`${this.host}/capture/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: this.apiKey,
            event: record.event,
            distinct_id: record.distinctId,
            properties: record.properties,
            timestamp: record.timestamp,
          }),
        }).catch(() => {
          // Fire-and-forget; never crash caller on analytics network drop
        });
      } catch {
        // Silently swallow
      }
    }

    return record;
  }

  getEvents(): readonly AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}
