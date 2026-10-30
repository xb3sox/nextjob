import type {
  ApplicationSnapshot,
  ApplicationState,
  SubmissionReceipt,
} from '@nextjob/applications';

export type { ApplicationSnapshot, ApplicationState, SubmissionReceipt };

export const APPLICATION_GROUPS = [
  'Planned',
  'Needs approval',
  'Applying',
  'Applied',
  'Interview',
  'Rejected',
  'Offer',
  'Withdrawn',
] as const;

export type ApplicationGroup = (typeof APPLICATION_GROUPS)[number];

export const STATE_TO_GROUP: Readonly<Record<ApplicationState, ApplicationGroup>> = {
  DISCOVERED: 'Planned',
  NORMALIZED: 'Planned',
  ELIGIBILITY_CHECKED: 'Planned',
  MATCHED: 'Planned',
  PLANNED: 'Planned',
  TAILORED: 'Planned',
  POLICY_CHECKED: 'Needs approval',
  NEEDS_APPROVAL: 'Needs approval',
  NEEDS_USER: 'Needs approval',
  READY: 'Applying',
  EXECUTING: 'Applying',
  FAILED_RETRYABLE: 'Applying',
  NEEDS_RECONCILIATION: 'Applying',
  SUBMITTED_UNVERIFIED: 'Applied',
  SUBMITTED_VERIFIED: 'Applied',
  INTERVIEW: 'Interview',
  REJECTED: 'Rejected',
  OFFER: 'Offer',
  HIRED: 'Offer',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Withdrawn',
  BLOCKED: 'Withdrawn',
  FAILED_FINAL: 'Withdrawn',
};

export interface TrackedApplication extends ApplicationSnapshot {
  jobTitle?: string;
  companyName?: string;
  receipt?: SubmissionReceipt;
}
