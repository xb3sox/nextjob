import { beforeEach, describe, expect, it } from 'vitest';
import { MockEmailTransport, NotificationService } from './notification-service';
import { NotificationStore } from './notification-store';
import { sanitizeMetadata, sanitizeText } from './sanitizer';
import type { DomainEvent } from './types';

describe('Notification System (T-28, FR-13)', () => {
  let store: NotificationStore;
  let emailTransport: MockEmailTransport;
  let service: NotificationService;

  const TENANT_A = 'tenant_001';
  const TENANT_B = 'tenant_002';
  const USER_1 = 'user_001';
  const USER_2 = 'user_002';

  beforeEach(() => {
    store = new NotificationStore();
    emailTransport = new MockEmailTransport();
    service = new NotificationService(store, emailTransport);
  });

  describe('FR-13: Actionable vs Non-Actionable Events', () => {
    it('dispatches actionable event (StrongOpportunityFound)', async () => {
      const event: DomainEvent = {
        type: 'StrongOpportunityFound',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: {
          role: 'Staff Engineer',
          company: 'TechCorp',
          fitScore: 92,
          jobId: 'job_123',
        },
      };

      const result = await service.dispatchDomainEvent(event);

      expect(result.dispatched).toBe(true);
      expect(result.inAppNotificationId).toBeDefined();
      expect(result.emailSent).toBe(true);
      expect(emailTransport.sentEmails).toHaveLength(1);
      expect(emailTransport.sentEmails[0].to).toBe('candidate@example.com');
      expect(emailTransport.sentEmails[0].subject).toContain('Strong Opportunity: Staff Engineer');
    });

    it('dispatches actionable event (ApprovalRequested)', async () => {
      const event: DomainEvent = {
        type: 'ApprovalRequested',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: {
          role: 'Principal Engineer',
          company: 'Acme Inc',
          applicationId: 'app_456',
        },
      };

      const result = await service.dispatchDomainEvent(event);

      expect(result.dispatched).toBe(true);
      const list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.notifications).toHaveLength(1);
      expect(list.notifications[0].category).toBe('approval_required');
      expect(list.notifications[0].actionUrl).toBe('/applications/app_456');
    });

    it('dispatches actionable event (SubmissionFailed)', async () => {
      const event: DomainEvent = {
        type: 'SubmissionFailed',
        tenantId: TENANT_A,
        userId: USER_1,
        payload: {
          company: 'CloudScale',
          reason: 'Work authorization question requires manual confirmation',
          applicationId: 'app_789',
        },
      };

      const result = await service.dispatchDomainEvent(event);

      expect(result.dispatched).toBe(true);
      const list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.notifications[0].category).toBe('submission_failed');
      expect(list.notifications[0].message).toContain('Work authorization question');
    });

    it('dispatches all other actionable event types', async () => {
      const eventTypes = [
        'RecruiterMessageReceived',
        'InterviewVerified',
        'JobExpiring',
        'PolicyIssueDetected',
      ] as const;

      for (const type of eventTypes) {
        const res = await service.dispatchDomainEvent({
          type,
          tenantId: TENANT_A,
          userId: USER_1,
          payload: { role: 'Dev', company: 'Org', applicationId: 'app_x' },
        });
        expect(res.dispatched).toBe(true);
      }

      const list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.total).toBe(4);
    });

    it('drops non-actionable events per FR-13', async () => {
      const nonActionableTypes = [
        'JobNormalized',
        'ClaimVerified',
        'RoutineHeartbeat',
        'AnalyticsPing',
        'CacheFlushed',
      ];

      for (const type of nonActionableTypes) {
        const result = await service.dispatchDomainEvent({
          type,
          tenantId: TENANT_A,
          userId: USER_1,
          payload: { foo: 'bar' },
        });

        expect(result.dispatched).toBe(false);
        expect(result.reason).toBe('NON_ACTIONABLE_EVENT');
      }

      const list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.total).toBe(0);
      expect(emailTransport.sentEmails).toHaveLength(0);
    });
  });

  describe('User Preferences & Channel Control', () => {
    it('suppresses email when user disables email channel globally', async () => {
      await service.updatePreferences(TENANT_A, USER_1, {
        channels: { inApp: true, email: false },
      });

      const result = await service.dispatchDomainEvent({
        type: 'StrongOpportunityFound',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: { role: 'Architect', company: 'NextCorp' },
      });

      expect(result.dispatched).toBe(true);
      expect(result.inAppNotificationId).toBeDefined();
      expect(result.emailSent).toBe(false);
      expect(emailTransport.sentEmails).toHaveLength(0);
    });

    it('suppresses in-app when user disables inApp channel globally', async () => {
      await service.updatePreferences(TENANT_A, USER_1, {
        channels: { inApp: false, email: true },
      });

      const result = await service.dispatchDomainEvent({
        type: 'ApprovalRequested',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: { role: 'Architect', company: 'NextCorp' },
      });

      expect(result.dispatched).toBe(true);
      expect(result.inAppNotificationId).toBeUndefined();
      expect(result.emailSent).toBe(true);

      const list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.total).toBe(0);
    });

    it('drops notification when category is disabled in user preferences', async () => {
      const prefs = await service.getPreferences(TENANT_A, USER_1);
      prefs.categories.strong_opportunity.enabled = false;
      await service.updatePreferences(TENANT_A, USER_1, prefs);

      const result = await service.dispatchDomainEvent({
        type: 'StrongOpportunityFound',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: { role: 'Architect', company: 'NextCorp' },
      });

      expect(result.dispatched).toBe(false);
      expect(result.reason).toBe('CATEGORY_DISABLED');
      expect(emailTransport.sentEmails).toHaveLength(0);
    });

    it('suppresses instant email when frequency is daily_digest', async () => {
      const prefs = await service.getPreferences(TENANT_A, USER_1);
      prefs.categories.strong_opportunity.frequency = 'daily_digest';
      await service.updatePreferences(TENANT_A, USER_1, prefs);

      const result = await service.dispatchDomainEvent({
        type: 'StrongOpportunityFound',
        tenantId: TENANT_A,
        userId: USER_1,
        userEmail: 'candidate@example.com',
        payload: { role: 'Architect', company: 'NextCorp' },
      });

      expect(result.dispatched).toBe(true);
      expect(result.inAppNotificationId).toBeDefined();
      expect(result.emailSent).toBe(false);
      expect(emailTransport.sentEmails).toHaveLength(0);
    });
  });

  describe('In-App Notification Management', () => {
    it('manages read status and unread count', async () => {
      await service.dispatchDomainEvent({
        type: 'StrongOpportunityFound',
        tenantId: TENANT_A,
        userId: USER_1,
        payload: { role: 'Dev 1', company: 'Org 1' },
      });

      await service.dispatchDomainEvent({
        type: 'ApprovalRequested',
        tenantId: TENANT_A,
        userId: USER_1,
        payload: { role: 'Dev 2', company: 'Org 2' },
      });

      let list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.total).toBe(2);
      expect(list.unreadCount).toBe(2);

      const firstId = list.notifications[0].id;
      const updated = await service.markAsRead(TENANT_A, USER_1, firstId);
      expect(updated?.read).toBe(true);
      expect(updated?.readAt).toBeInstanceOf(Date);

      list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.unreadCount).toBe(1);

      const unreadOnly = await service.listNotifications(TENANT_A, USER_1, { unreadOnly: true });
      expect(unreadOnly.total).toBe(1);

      const count = await service.markAllAsRead(TENANT_A, USER_1);
      expect(count).toBe(1);

      list = await service.listNotifications(TENANT_A, USER_1);
      expect(list.unreadCount).toBe(0);
    });

    it('supports pagination with limit and offset', async () => {
      for (let i = 0; i < 5; i++) {
        await service.dispatchDomainEvent({
          type: 'StrongOpportunityFound',
          tenantId: TENANT_A,
          userId: USER_1,
          payload: { role: `Role ${i}`, company: 'Corp' },
        });
      }

      const page1 = await service.listNotifications(TENANT_A, USER_1, { limit: 2, offset: 0 });
      expect(page1.notifications).toHaveLength(2);
      expect(page1.total).toBe(5);

      const page2 = await service.listNotifications(TENANT_A, USER_1, { limit: 2, offset: 2 });
      expect(page2.notifications).toHaveLength(2);

      const page3 = await service.listNotifications(TENANT_A, USER_1, { limit: 2, offset: 4 });
      expect(page3.notifications).toHaveLength(1);
    });
  });

  describe('Tenant and User Isolation', () => {
    it('isolates notifications between different tenants and users', async () => {
      // Create notification for User 1 in Tenant A
      const resA = await service.dispatchDomainEvent({
        type: 'ApprovalRequested',
        tenantId: TENANT_A,
        userId: USER_1,
        payload: { role: 'Role A', company: 'Company A' },
      });

      // Create notification for User 2 in Tenant B
      await service.dispatchDomainEvent({
        type: 'ApprovalRequested',
        tenantId: TENANT_B,
        userId: USER_2,
        payload: { role: 'Role B', company: 'Company B' },
      });

      const listA = await service.listNotifications(TENANT_A, USER_1);
      const listB = await service.listNotifications(TENANT_B, USER_2);

      expect(listA.total).toBe(1);
      expect(listA.notifications[0].title).toContain('Role A');
      expect(listA.notifications[0].message).toContain('Company A');

      expect(listB.total).toBe(1);
      expect(listB.notifications[0].title).toContain('Role B');
      expect(listB.notifications[0].message).toContain('Company B');

      // User 2 in Tenant B cannot mark User 1's notification as read
      const markAttempt = await service.markAsRead(TENANT_B, USER_2, resA.inAppNotificationId!);
      expect(markAttempt).toBeNull();

      // User 1's notification is still unread
      const verifyA = await service.listNotifications(TENANT_A, USER_1);
      expect(verifyA.unreadCount).toBe(1);
    });
  });

  describe('Sanitization & Privacy Protection (FR-03)', () => {
    it('redacts SSN, tokens, and credit cards from text', () => {
      const sensitive = 'Candidate SSN is 123-45-6789 with card 4111-2222-3333-4444';
      const clean = sanitizeText(sensitive);
      expect(clean).not.toContain('123-45-6789');
      expect(clean).not.toContain('4111-2222-3333-4444');
      expect(clean).toContain('[REDACTED]');
    });

    it('strips protected demographic and health fields from metadata', () => {
      const meta = {
        role: 'Staff Engineer',
        salary_exact: 180000,
        disability: 'none',
        health: 'sensitive info',
        race: 'declined',
        safeNotes: 'Candidate holds active certifications',
      };

      const clean = sanitizeMetadata(meta);

      expect(clean).toBeDefined();
      expect(clean?.role).toBe('Staff Engineer');
      expect(clean?.safeNotes).toBe('Candidate holds active certifications');
      expect(clean?.disability).toBeUndefined();
      expect(clean?.health).toBeUndefined();
      expect(clean?.race).toBeUndefined();
      expect(clean?.salary_exact).toBeUndefined();
    });

    it('automatically sanitizes event payloads upon dispatch', async () => {
      await service.dispatchDomainEvent({
        type: 'SubmissionFailed',
        tenantId: TENANT_A,
        userId: USER_1,
        payload: {
          company: 'Fintech Corp',
          reason: 'Error occurred for SSN 999-88-7777 during verification',
          health: 'sensitive health data',
        },
      });

      const list = await service.listNotifications(TENANT_A, USER_1);
      const notif = list.notifications[0];

      expect(notif.message).not.toContain('999-88-7777');
      expect(notif.message).toContain('[REDACTED]');
      expect(notif.metadata?.health).toBeUndefined();
    });
  });
});
