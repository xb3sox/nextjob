import crypto from 'node:crypto';
import { NotificationStore } from './notification-store';
import { sanitizeMetadata, sanitizeText } from './sanitizer';
import {
  ACTIONABLE_EVENT_TYPES,
  type ActionableEventType,
  type DispatchResult,
  type DomainEvent,
  type EmailMessage,
  type EmailTransport,
  type InAppNotification,
  type NotificationCategory,
  type NotificationPreferences,
} from './types';

export class MockEmailTransport implements EmailTransport {
  public sentEmails: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<{ id: string; success: boolean }> {
    this.sentEmails.push(message);
    return {
      id: `email_${crypto.randomUUID()}`,
      success: true,
    };
  }

  clear(): void {
    this.sentEmails = [];
  }
}

export function getDefaultPreferences(tenantId: string, userId: string): NotificationPreferences {
  return {
    tenantId,
    userId,
    channels: {
      inApp: true,
      email: true,
    },
    categories: {
      strong_opportunity: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      approval_required: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      submission_failed: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      recruiter_message: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      interview_verified: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      job_expiring: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
      policy_issue: { enabled: true, channels: ['in_app', 'email'], frequency: 'instant' },
    },
    updatedAt: new Date(),
  };
}

export class NotificationService {
  constructor(
    private readonly store: NotificationStore = new NotificationStore(),
    private readonly emailTransport: EmailTransport = new MockEmailTransport()
  ) {}

  /**
   * Dispatches notifications for actionable domain events (FR-13).
   * Drops non-actionable events to prevent notification noise.
   */
  async dispatchDomainEvent(event: DomainEvent): Promise<DispatchResult> {
    // 1. FR-13: Validate that the event type is an actionable event
    if (!ACTIONABLE_EVENT_TYPES.includes(event.type as ActionableEventType)) {
      return {
        dispatched: false,
        reason: 'NON_ACTIONABLE_EVENT',
      };
    }

    const { category, title, message, actionUrl } = this.formatEventContent(
      event.type as ActionableEventType,
      event.payload
    );

    // 2. Fetch user preferences (or fallback to defaults)
    const preferences =
      (await this.store.getPreferences(event.tenantId, event.userId)) ??
      getDefaultPreferences(event.tenantId, event.userId);

    const categoryPref = preferences.categories[category];
    if (!categoryPref?.enabled || categoryPref.frequency === 'off') {
      return {
        dispatched: false,
        reason: 'CATEGORY_DISABLED',
      };
    }

    // 3. Cleanse content to prevent any PII/sensitive data leakage (FR-03)
    const cleanTitle = sanitizeText(title);
    const cleanMessage = sanitizeText(message);
    const cleanMetadata = sanitizeMetadata(event.payload);

    let inAppNotificationId: string | undefined;
    let emailSent = false;

    // 4. In-App Notification
    const shouldSendInApp = preferences.channels.inApp && categoryPref.channels.includes('in_app');

    if (shouldSendInApp) {
      const created = await this.store.saveNotification({
        tenantId: event.tenantId,
        userId: event.userId,
        category,
        title: cleanTitle,
        message: cleanMessage,
        actionUrl,
        metadata: cleanMetadata,
      });
      inAppNotificationId = created.id;
    }

    // 5. Outbound Email Notification
    const shouldSendEmail =
      preferences.channels.email &&
      categoryPref.channels.includes('email') &&
      categoryPref.frequency === 'instant' &&
      !!event.userEmail;

    if (shouldSendEmail && event.userEmail) {
      await this.emailTransport.send({
        to: event.userEmail,
        subject: `NextJob: ${cleanTitle}`,
        text: `${cleanMessage}\n\nView details: ${actionUrl || 'https://nextjob.app'}`,
        metadata: cleanMetadata,
      });
      emailSent = true;
    }

    return {
      dispatched: !!inAppNotificationId || emailSent,
      inAppNotificationId,
      emailSent,
    };
  }

  private formatEventContent(
    type: ActionableEventType,
    payload: Record<string, unknown>
  ): {
    category: NotificationCategory;
    title: string;
    message: string;
    actionUrl?: string;
  } {
    const role = (payload.role as string) || (payload.jobTitle as string) || 'Position';
    const company = (payload.company as string) || (payload.companyName as string) || 'Company';
    const applicationId = (payload.applicationId as string) || '';
    const jobId = (payload.jobId as string) || applicationId;

    switch (type) {
      case 'StrongOpportunityFound': {
        const fitScore = payload.fitScore ?? 85;
        return {
          category: 'strong_opportunity',
          title: `Strong Opportunity: ${role} at ${company}`,
          message: `We identified an exceptional fit (${fitScore}%) matching your verified skills.`,
          actionUrl: `/applications/${jobId}`,
        };
      }
      case 'ApprovalRequested':
        return {
          category: 'approval_required',
          title: `Action Required: Review application for ${role}`,
          message: `Your tailored application for ${company} is ready for review before submission.`,
          actionUrl: `/applications/${applicationId}`,
        };
      case 'SubmissionFailed':
        return {
          category: 'submission_failed',
          title: `Submission Issue: ${company}`,
          message: `Automated submission paused: ${payload.reason || 'Verification check required'}.`,
          actionUrl: `/applications/${applicationId}`,
        };
      case 'RecruiterMessageReceived':
        return {
          category: 'recruiter_message',
          title: `New Message from ${company}`,
          message: `A recruiter sent a message regarding your application for ${role}.`,
          actionUrl: `/applications/${applicationId}`,
        };
      case 'InterviewVerified':
        return {
          category: 'interview_verified',
          title: `Interview Confirmed: ${company}`,
          message: `Interview verified for ${role}. Prepare tailored talking points now.`,
          actionUrl: `/applications/${applicationId}`,
        };
      case 'JobExpiring':
        return {
          category: 'job_expiring',
          title: `Opportunity Closing Soon: ${role}`,
          message: `The listing at ${company} closes in ${payload.daysLeft || 2} days.`,
          actionUrl: `/applications/${jobId}`,
        };
      case 'PolicyIssueDetected':
        return {
          category: 'policy_issue',
          title: `Policy Conflict Detected: ${role}`,
          message: `A policy check failed: ${payload.issue || 'Missing required career claim'}.`,
          actionUrl: `/applications/${applicationId}`,
        };
    }
  }

  async listNotifications(
    tenantId: string,
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<{ notifications: InAppNotification[]; total: number; unreadCount: number }> {
    return this.store.list(tenantId, userId, options);
  }

  async markAsRead(
    tenantId: string,
    userId: string,
    notificationId: string
  ): Promise<InAppNotification | null> {
    return this.store.markAsRead(tenantId, userId, notificationId);
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    return this.store.markAllAsRead(tenantId, userId);
  }

  async getPreferences(tenantId: string, userId: string): Promise<NotificationPreferences> {
    const existing = await this.store.getPreferences(tenantId, userId);
    if (existing) return existing;
    const defaults = getDefaultPreferences(tenantId, userId);
    await this.store.savePreferences(defaults);
    return defaults;
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    update: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(tenantId, userId);
    const merged: NotificationPreferences = {
      ...current,
      ...update,
      channels: {
        ...current.channels,
        ...(update.channels || {}),
      },
      categories: {
        ...current.categories,
        ...(update.categories || {}),
      },
      updatedAt: new Date(),
    };
    await this.store.savePreferences(merged);
    return merged;
  }
}
