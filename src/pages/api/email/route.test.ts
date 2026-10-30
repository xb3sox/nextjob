import { beforeEach, describe, expect, it } from 'vitest';
import { emailServiceStore } from '../../../lib/email/service';
import { GET, POST } from './route';

describe('Email API Route (T-101, FR-GROW-02)', () => {
  beforeEach(() => {
    emailServiceStore.clear();
  });

  it('rejects POST request missing recipient, subject, or html body', async () => {
    const res = await POST({ action: 'send', to: 'test@example.com' });
    expect(res.status).toBe(400);
    const body = res.body as { success: boolean; error: string };
    expect(body.success).toBe(false);
    expect(body.error).toContain('Recipient email (to), subject, and html body are required');
  });

  it('handles double opt-in registration via POST', async () => {
    const res = await POST({
      action: 'double_opt_in',
      email: 'NEW_SUBSCRIBER@EXAMPLE.COM',
      source: 'footer_form',
    });

    expect(res.status).toBe(201);
    const body = res.body as {
      success: boolean;
      token: string;
      status: string;
      sendResult: { success: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.status).toBe('pending');
    expect(body.sendResult.success).toBe(true);

    // Confirm token via GET
    const confirmRes = await GET({ action: 'confirm', token: body.token });
    expect(confirmRes.status).toBe(200);
    const confirmBody = confirmRes.body as { success: boolean; email: string };
    expect(confirmBody.success).toBe(true);
    expect(confirmBody.email).toBe('new_subscriber@example.com');
  });

  it('handles unsubscribe request via GET and POST', async () => {
    // Register double opt-in
    const optInRes = await POST({
      action: 'double_opt_in',
      email: 'unsub_api@example.com',
    });
    const token = (optInRes.body as { token: string }).token;

    // Unsubscribe via GET
    const unsubRes = await GET({ action: 'unsubscribe', token });
    expect(unsubRes.status).toBe(200);
    const unsubBody = unsubRes.body as { success: boolean; email: string };
    expect(unsubBody.success).toBe(true);
    expect(unsubBody.email).toBe('unsub_api@example.com');

    // Query status via GET
    const statusRes = await GET({ action: 'status', email: 'unsub_api@example.com' });
    expect(statusRes.status).toBe(200);
    const statusBody = statusRes.body as {
      success: boolean;
      record: { status: string };
    };
    expect(statusBody.record.status).toBe('unsubscribed');
  });

  it('renders and sends template email via POST send_template action', async () => {
    const res = await POST({
      action: 'send_template',
      to: 'candidate_template@example.com',
      sequence: 'welcome',
      step: 1,
      vars: {
        candidateName: 'Taylor',
        actionUrl: 'https://nextjob.ai/setup',
      },
    });

    expect(res.status).toBe(200);
    const body = res.body as { success: boolean };
    expect(body.success).toBe(true);

    // Verify delivery in logs
    const logRes = await GET({ action: 'log' });
    expect(logRes.status).toBe(200);
    const logBody = logRes.body as { count: number; logs: Array<{ to: string; subject: string }> };
    expect(logBody.count).toBe(1);
    expect(logBody.logs[0].to).toBe('candidate_template@example.com');
    expect(logBody.logs[0].subject).toContain('Welcome to NextJob');
  });
});
