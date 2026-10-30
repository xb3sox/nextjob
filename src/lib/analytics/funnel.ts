import { sanitizeAnalyticsProperties } from './sanitizer';

export type FunnelStage =
  | 'visitor'
  | 'page_view'
  | 'cta_click'
  | 'signup_start'
  | 'signup_complete'
  | 'first_application';

export const FUNNEL_STAGES: FunnelStage[] = [
  'visitor',
  'page_view',
  'cta_click',
  'signup_start',
  'signup_complete',
  'first_application',
];

export interface FunnelEvent {
  id: string;
  sessionId: string;
  stage: FunnelStage;
  timestamp: number;
  isoTimestamp: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface StageMetrics {
  stage: FunnelStage;
  count: number;
  conversionFromPrevious: number; // percentage 0-100
  dropoffFromPrevious: number; // percentage 0-100
  overallConversion: number; // percentage from visitor 0-100
  avgTimeFromPreviousMs: number;
  firstRecordedAt: string | null;
  lastRecordedAt: string | null;
}

export interface FunnelReport {
  totalSessions: number;
  stages: StageMetrics[];
  overallConversionRate: number;
  totalDropoffRate: number;
  generatedAt: string;
}

export class ConversionFunnelTracker {
  private events: FunnelEvent[] = [];

  public trackStage(
    stage: FunnelStage,
    sessionId: string,
    metadata: Record<string, unknown> = {},
    path?: string
  ): FunnelEvent {
    const sanitizedMeta = sanitizeAnalyticsProperties(metadata);
    const now = Date.now();

    const event: FunnelEvent = {
      id: `fnl_${now}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      stage,
      timestamp: now,
      isoTimestamp: new Date(now).toISOString(),
      path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      metadata: sanitizedMeta,
    };

    this.events.push(event);
    return event;
  }

  public getEvents(): FunnelEvent[] {
    return [...this.events];
  }

  public getEventsForSession(sessionId: string): FunnelEvent[] {
    return this.events.filter((e) => e.sessionId === sessionId);
  }

  public clear(): void {
    this.events = [];
  }

  public calculateReport(customEvents?: FunnelEvent[]): FunnelReport {
    const eventList = customEvents || this.events;

    // Group events by session
    const sessions = new Map<string, Map<FunnelStage, FunnelEvent>>();
    const stageTimestamps = new Map<FunnelStage, number[]>();

    for (const stage of FUNNEL_STAGES) {
      stageTimestamps.set(stage, []);
    }

    for (const event of eventList) {
      let sessionMap = sessions.get(event.sessionId);
      if (!sessionMap) {
        sessionMap = new Map<FunnelStage, FunnelEvent>();
        sessions.set(event.sessionId, sessionMap);
      }

      // Record earliest occurrence for each stage in a session
      if (
        !sessionMap.has(event.stage) ||
        event.timestamp < sessionMap.get(event.stage)!.timestamp
      ) {
        sessionMap.set(event.stage, event);
      }

      stageTimestamps.get(event.stage)?.push(event.timestamp);
    }

    const totalSessions = sessions.size;
    const stageCounts: Record<FunnelStage, number> = {
      visitor: 0,
      page_view: 0,
      cta_click: 0,
      signup_start: 0,
      signup_complete: 0,
      first_application: 0,
    };

    const stageTimeDifferences: Record<FunnelStage, number[]> = {
      visitor: [],
      page_view: [],
      cta_click: [],
      signup_start: [],
      signup_complete: [],
      first_application: [],
    };

    for (const sessionMap of sessions.values()) {
      for (let i = 0; i < FUNNEL_STAGES.length; i++) {
        const stage = FUNNEL_STAGES[i];
        if (sessionMap.has(stage)) {
          stageCounts[stage]++;

          // Calculate time from previous stage for this session if previous stage exists
          if (i > 0) {
            const prevStage = FUNNEL_STAGES[i - 1];
            const currentEvt = sessionMap.get(stage)!;
            const prevEvt = sessionMap.get(prevStage);
            if (prevEvt && currentEvt.timestamp >= prevEvt.timestamp) {
              stageTimeDifferences[stage].push(currentEvt.timestamp - prevEvt.timestamp);
            }
          }
        }
      }
    }

    const firstStageCount = stageCounts.visitor || totalSessions || 0;

    const stages: StageMetrics[] = FUNNEL_STAGES.map((stage, idx) => {
      const count = stageCounts[stage];
      const prevCount = idx === 0 ? count : stageCounts[FUNNEL_STAGES[idx - 1]];

      const conversionFromPrevious =
        prevCount > 0 ? Number(((count / prevCount) * 100).toFixed(2)) : 0;
      const dropoffFromPrevious =
        prevCount > 0 ? Number((100 - conversionFromPrevious).toFixed(2)) : 0;
      const overallConversion =
        firstStageCount > 0 ? Number(((count / firstStageCount) * 100).toFixed(2)) : 0;

      const diffs = stageTimeDifferences[stage];
      const avgTimeFromPreviousMs =
        diffs.length > 0 ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;

      const tsList = stageTimestamps.get(stage) || [];
      const sortedTs = [...tsList].sort((a, b) => a - b);
      const firstRecordedAt = sortedTs.length > 0 ? new Date(sortedTs[0]).toISOString() : null;
      const lastRecordedAt =
        sortedTs.length > 0 ? new Date(sortedTs[sortedTs.length - 1]).toISOString() : null;

      return {
        stage,
        count,
        conversionFromPrevious,
        dropoffFromPrevious,
        overallConversion,
        avgTimeFromPreviousMs,
        firstRecordedAt,
        lastRecordedAt,
      };
    });

    const finalStageCount = stageCounts.first_application;
    const overallConversionRate =
      firstStageCount > 0 ? Number(((finalStageCount / firstStageCount) * 100).toFixed(2)) : 0;
    const totalDropoffRate = Number((100 - overallConversionRate).toFixed(2));

    return {
      totalSessions,
      stages,
      overallConversionRate,
      totalDropoffRate,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const funnelTracker = new ConversionFunnelTracker();
