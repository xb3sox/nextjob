export type AnalyticsEventType =
  | 'page_view'
  | 'cta_click'
  | 'signup_conversion'
  | 'waitlist_conversion'
  | 'time_on_page'
  | 'session_bounce'
  | 'experiment_assigned';

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  path: string;
  sessionId: string;
  properties: Record<string, unknown>;
}

export interface ExperimentConfig {
  id: string;
  variants: string[];
  defaultVariant: string;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  timestamp: number;
}
