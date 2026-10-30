/**
 * Types and interfaces for the NextJob Notification System (T-28, FR-13).
 */

export const NOTIFICATION_CATEGORIES = [
  'strong_opportunity',
  'approval_required',
  'submission_failed',
  'recruiter_message',
  'interview_verified',
  'job_expiring',
  'policy_issue',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationChannel = 'in_app' | 'email';

export type FrequencyPreference = 'instant' | 'daily_digest' | 'off';

export interface InAppNotification {
  id: string;
  tenantId: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date | null;
}

export interface CategoryPreference {
  enabled: boolean;
  channels: NotificationChannel[];
  frequency: FrequencyPreference;
}

export interface NotificationPreferences {
  userId: string;
  tenantId: string;
  channels: {
    inApp: boolean;
    email: boolean;
  };
  categories: Record<NotificationCategory, CategoryPreference>;
  quietHours?: {
    enabled: boolean;
    startHour: number; // 0-23
    endHour: number; // 0-23
    timezone: string;
  };
  updatedAt: Date;
}

export const ACTIONABLE_EVENT_TYPES = [
  'StrongOpportunityFound',
  'ApprovalRequested',
  'SubmissionFailed',
  'RecruiterMessageReceived',
  'InterviewVerified',
  'JobExpiring',
  'PolicyIssueDetected',
] as const;

export type ActionableEventType = (typeof ACTIONABLE_EVENT_TYPES)[number];

export interface DomainEvent<T = Record<string, unknown>> {
  type: ActionableEventType | string;
  tenantId: string;
  userId: string;
  payload: T;
  userEmail?: string;
  timestamp?: Date;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailTransport {
  send(message: EmailMessage): Promise<{ id: string; success: boolean }>;
}

export interface DispatchResult {
  dispatched: boolean;
  reason?: string;
  inAppNotificationId?: string;
  emailSent?: boolean;
}
