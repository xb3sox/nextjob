import { FUNNEL_STAGES, type FunnelStage, funnelTracker } from '../../../../lib/analytics/funnel';

export interface RouteResponse<T = unknown> {
  status: number;
  body: T;
}

export async function GET(): Promise<RouteResponse> {
  const report = funnelTracker.calculateReport();
  return {
    status: 200,
    body: {
      success: true,
      data: report,
    },
  };
}

export async function POST(requestData: {
  sessionId?: string;
  stage?: FunnelStage;
  metadata?: Record<string, unknown>;
  path?: string;
}): Promise<RouteResponse> {
  const { sessionId, stage, metadata, path } = requestData || {};

  if (!sessionId || typeof sessionId !== 'string') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Missing required field: sessionId',
      },
    };
  }

  if (!stage || !FUNNEL_STAGES.includes(stage)) {
    return {
      status: 400,
      body: {
        success: false,
        error: `Invalid or missing stage. Must be one of: ${FUNNEL_STAGES.join(', ')}`,
      },
    };
  }

  const event = funnelTracker.trackStage(stage, sessionId, metadata || {}, path);

  return {
    status: 201,
    body: {
      success: true,
      data: event,
    },
  };
}
