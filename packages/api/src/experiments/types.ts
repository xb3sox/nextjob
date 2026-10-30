export type ExperimentDomain =
  | 'ranking'
  | 'match_explanations'
  | 'tailoring'
  | 'approval_ux'
  | 'notifications'
  | 'pricing'
  | 'onboarding';

export type PrimaryOutcomeMetric = 'interview_lift';

export type GuardrailMetric =
  | 'unsupported_claims'
  | 'ineligible_applications'
  | 'duplicate_submissions'
  | 'sensitive_field_errors'
  | 'complaints'
  | 'connector_failures';

export interface Variant {
  id: string;
  name: string;
  weight: number;
  config?: Record<string, unknown>;
}

export interface GuardrailThreshold {
  metric: GuardrailMetric;
  maxRate: number;
  maxCount?: number;
}

export interface Experiment {
  id: string;
  name: string;
  domain: ExperimentDomain;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: Variant[];
  primaryOutcome: PrimaryOutcomeMetric;
  guardrails: GuardrailThreshold[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentAssignment {
  experimentId: string;
  userId: string;
  variantId: string;
  assignedAt: string;
}

export interface MetricEvent {
  experimentId: string;
  variantId: string;
  userId: string;
  metricName: PrimaryOutcomeMetric | GuardrailMetric | 'total_submissions' | 'total_applications';
  value: number;
  timestamp: string;
}

export interface GuardrailAlert {
  experimentId: string;
  metric: GuardrailMetric;
  currentRate: number;
  maxRate: number;
  status: 'triggered' | 'resolved';
  message: string;
  timestamp: string;
}
