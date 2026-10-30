import { beforeEach, describe, expect, it } from 'vitest';
import { GET, newsletterStore, POST } from './route';

describe('Newsletter API Route (T-100, FR-GROW-01)', () => {
  beforeEach(() => {
    newsletterStore.clear();
  });

  it('rejects POST request with missing email', async () => {
    const res = await POST({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'Email address is required.',
    });
  });

  it('rejects POST request with invalid email format', async () => {
    const res = await POST({ email: 'not-an-email', consent: true });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'Please enter a valid email address.',
    });
  });

  it('rejects POST request without GDPR consent', async () => {
    const res = await POST({ email: 'valid@example.com', consent: false });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: 'GDPR consent is required to capture email.',
    });
  });

  it('accepts valid POST request and stores subscription with GDPR metadata', async () => {
    const res = await POST({
      email: 'CANDIDATE@EXAMPLE.COM',
      consent: true,
      source: 'lead_magnet',
      leadMagnetId: 'evidence_playbook_2026',
    });

    expect(res.status).toBe(201);
    const body = res.body as { success: boolean; data: Record<string, unknown> };
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('candidate@example.com');
    expect(body.data.consent).toBe(true);
    expect(body.data.source).toBe('lead_magnet');
    expect(body.data.leadMagnetId).toBe('evidence_playbook_2026');
    expect(body.data.consentTimestamp).toBeDefined();

    // Verify aggregate retrieval via GET without exposing raw PII
    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getBody = getRes.body as { count: number; success: boolean };
    expect(getBody.count).toBe(1);
    expect(getBody.success).toBe(true);

    // Verify stored entity directly
    const stored = newsletterStore.getSubscriber('candidate@example.com');
    expect(stored).toMatchObject({
      email: 'candidate@example.com',
      consent: true,
      source: 'lead_magnet',
      leadMagnetId: 'evidence_playbook_2026',
    });
  });

  it('updates existing subscription on duplicate submission', async () => {
    await POST({
      email: 'user@domain.com',
      consent: true,
      source: 'footer',
    });

    const updateRes = await POST({
      email: 'USER@domain.com',
      consent: true,
      source: 'exit_intent',
    });

    expect(updateRes.status).toBe(200);
    const body = updateRes.body as { message: string; data: { source: string } };
    expect(body.message).toBe('Subscription updated successfully.');
    expect(body.data.source).toBe('exit_intent');

    const getRes = await GET();
    const getBody = getRes.body as { count: number };
    expect(getBody.count).toBe(1);
  });
});
