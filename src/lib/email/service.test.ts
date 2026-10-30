import { beforeEach, describe, expect, it } from 'vitest';
import { newsletterStore } from '../../pages/api/newsletter/route';
import {
  confirmDoubleOptIn,
  emailServiceStore,
  sendDoubleOptInConfirmation,
  sendEmail,
  sendTemplateEmail,
  unsubscribe,
} from './service';

describe('Email Service Integration (T-101, FR-GROW-02)', () => {
  beforeEach(() => {
    emailServiceStore.clear();
    newsletterStore.clear();
  });

  it('delivers email reliably via mock provider and records delivery log', async () => {
    const res = await sendEmail({
      to: 'candidate@example.com',
      subject: 'Welcome to NextJob',
      html: '<h1>Welcome</h1>',
      text: 'Welcome',
      provider: 'mock',
    });

    expect(res.success).toBe(true);
    expect(res.provider).toBe('mock');
    expect(res.id).toBeDefined();

    const sent = emailServiceStore.getSentEmailsForRecipient('candidate@example.com');
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toBe('Welcome to NextJob');
    expect(sent[0].status).toBe('delivered');
  });

  it('rejects email sending to invalid email addresses', async () => {
    const res = await sendEmail({
      to: 'not-an-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid recipient email format');
  });

  it('executes double opt-in workflow: registration, confirmation email, token verification', async () => {
    const optIn = await sendDoubleOptInConfirmation(
      'OPTIN_USER@EXAMPLE.COM',
      'https://nextjob.ai/api/email',
      'newsletter_footer'
    );

    expect(optIn.token).toBeDefined();
    expect(optIn.record.email).toBe('optin_user@example.com');
    expect(optIn.record.status).toBe('pending');
    expect(optIn.result.success).toBe(true);

    // Verify confirmation email was sent
    const sent = emailServiceStore.getSentEmailsForRecipient('optin_user@example.com');
    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toContain('Confirm your NextJob subscription');
    expect(sent[0].html).toContain(optIn.token);

    // Verify confirm function
    const confirmRes = await confirmDoubleOptIn(optIn.token);
    expect(confirmRes.success).toBe(true);
    expect(confirmRes.email).toBe('optin_user@example.com');

    const updatedRecord = emailServiceStore.getOptInRecordByToken(optIn.token);
    expect(updatedRecord?.status).toBe('confirmed');
    expect(updatedRecord?.confirmedAt).toBeDefined();
  });

  it('handles unsubscribe request and blocks subsequent emails', async () => {
    const email = 'unsub_user@example.com';
    const optIn = await sendDoubleOptInConfirmation(email);

    // Unsubscribe
    const unsubRes = await unsubscribe(optIn.token);
    expect(unsubRes.success).toBe(true);
    expect(unsubRes.email).toBe(email);

    const record = emailServiceStore.getOptInRecordByEmail(email);
    expect(record?.status).toBe('unsubscribed');

    // Attempting to send email should now be blocked
    const sendRes = await sendEmail({
      to: email,
      subject: 'New Job Alert',
      html: '<p>Jobs</p>',
    });

    expect(sendRes.success).toBe(false);
    expect(sendRes.error).toContain('Recipient unsubscribed');
  });

  it('renders and dispatches template emails for welcome, onboarding, and re-engagement series', async () => {
    const vars = {
      candidateName: 'Jordan',
      actionUrl: 'https://nextjob.ai/dashboard',
      matchCount: 15,
      unsubscribeUrl: 'https://nextjob.ai/unsubscribe?token=abc',
    };

    const welcomeRes = await sendTemplateEmail('welcome', 1, vars, 'jordan@example.com');
    expect(welcomeRes.success).toBe(true);

    const onboardingRes = await sendTemplateEmail('onboarding', 2, vars, 'jordan@example.com');
    expect(onboardingRes.success).toBe(true);

    const reengageRes = await sendTemplateEmail('re-engagement', 1, vars, 'jordan@example.com');
    expect(reengageRes.success).toBe(true);

    const logs = emailServiceStore.getSentEmailsForRecipient('jordan@example.com');
    expect(logs).toHaveLength(3);
    expect(logs[0].subject).toContain('Welcome to NextJob');
    expect(logs[1].subject).toContain('Set target roles');
    expect(logs[2].subject).toContain('15 new job matches');
  });

  it('supports provider fallback options for Resend, SendGrid, and Mailchimp', async () => {
    const resendRes = await sendEmail({
      to: 'provider@example.com',
      subject: 'Resend Test',
      html: '<p>Resend</p>',
      provider: 'resend',
    });
    expect(resendRes.success).toBe(true);
    expect(resendRes.provider).toBe('resend');

    const sgRes = await sendEmail({
      to: 'provider@example.com',
      subject: 'SendGrid Test',
      html: '<p>SendGrid</p>',
      provider: 'sendgrid',
    });
    expect(sgRes.success).toBe(true);
    expect(sgRes.provider).toBe('sendgrid');

    const mcRes = await sendEmail({
      to: 'provider@example.com',
      subject: 'Mailchimp Test',
      html: '<p>Mailchimp</p>',
      provider: 'mailchimp',
    });
    expect(mcRes.success).toBe(true);
    expect(mcRes.provider).toBe('mailchimp');
  });
});
