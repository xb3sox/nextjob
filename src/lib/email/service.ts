import { newsletterStore } from '../../pages/api/newsletter/route';
import { renderEmailTemplate } from './templates';
import type { EmailVariables } from './templates/types';

export type EmailProvider = 'resend' | 'sendgrid' | 'mailchimp' | 'mock';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  provider?: EmailProvider;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  id: string;
  provider: EmailProvider;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  provider: EmailProvider;
  timestamp: string;
  status: 'delivered' | 'failed';
  error?: string;
}

export interface DoubleOptInRecord {
  id: string;
  email: string;
  token: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  createdAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
  source?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_FROM = 'NextJob Nurture <nurture@nextjob.ai>';

function parseEmail(fromStr?: string) {
  const target = fromStr || DEFAULT_FROM;
  const match = target.match(/^(?:(.*)<)?([^>]+)>?$/);
  return match?.[2]
    ? { name: match[1]?.trim().replace(/^["']|["']$/g, '') || undefined, email: match[2].trim() }
    : { email: target.trim() };
}

class EmailServiceStore {
  private sent: SentEmailRecord[] = [];
  private optIn: Map<string, DoubleOptInRecord> = new Map();
  private emailMap: Map<string, string> = new Map();

  recordSentEmail(item: SentEmailRecord): void {
    if (this.sent.length >= 5000) this.sent.shift();
    this.sent.push(item);
  }
  getSentEmails(): SentEmailRecord[] {
    return [...this.sent];
  }
  getSentEmailsForRecipient(email: string): SentEmailRecord[] {
    const norm = email.trim().toLowerCase();
    return this.sent.filter((s) => s.to.toLowerCase() === norm);
  }
  saveOptInRecord(rec: DoubleOptInRecord): void {
    this.optIn.set(rec.token, rec);
    this.emailMap.set(rec.email.toLowerCase(), rec.token);
  }
  getOptInRecordByToken(token: string) {
    return this.optIn.get(token);
  }
  getOptInRecordByEmail(email: string) {
    const t = this.emailMap.get(email.trim().toLowerCase());
    return t ? this.optIn.get(t) : undefined;
  }
  clear(): void {
    this.sent = [];
    this.optIn.clear();
    this.emailMap.clear();
  }
}

export const emailServiceStore = new EmailServiceStore();

async function sendHttp(
  provider: EmailProvider,
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<EmailSendResult> {
  const now = new Date().toISOString();
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok)
      return {
        id: `${provider}_err_${Date.now()}`,
        provider,
        success: false,
        error: `${provider} error (${res.status}): ${await res.text()}`,
        timestamp: now,
      };
    const data = res.headers.get('content-type')?.includes('json')
      ? ((await res.json()) as { id?: string })
      : {};
    return { id: data.id || `${provider}_${Date.now()}`, provider, success: true, timestamp: now };
  } catch (err) {
    return {
      id: `${provider}_err_${Date.now()}`,
      provider,
      success: false,
      error: String(err),
      timestamp: now,
    };
  }
}

export async function sendEmail(opts: SendEmailOptions): Promise<EmailSendResult> {
  const to = opts.to.trim().toLowerCase();
  if (!EMAIL_REGEX.test(to))
    return {
      id: `invalid_${Date.now()}`,
      provider: opts.provider || 'mock',
      success: false,
      error: 'Invalid recipient email format.',
      timestamp: new Date().toISOString(),
    };

  const opt = emailServiceStore.getOptInRecordByEmail(to);
  if (opt?.status === 'unsubscribed')
    return {
      id: `unsub_${Date.now()}`,
      provider: opts.provider || 'mock',
      success: false,
      error: 'Recipient unsubscribed.',
      timestamp: new Date().toISOString(),
    };

  const p = opts.provider || 'mock';
  const now = new Date().toISOString();
  const parsed = parseEmail(opts.from);
  let res: EmailSendResult;

  if (p === 'resend' && process.env.RESEND_API_KEY) {
    res = await sendHttp(
      'resend',
      'https://api.resend.com/emails',
      { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      {
        from: opts.from || DEFAULT_FROM,
        to: [to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.replyTo,
      }
    );
  } else if (p === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    res = await sendHttp(
      'sendgrid',
      'https://api.sendgrid.com/v3/mail/send',
      {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      {
        personalizations: [{ to: [{ email: to }] }],
        from: parsed,
        subject: opts.subject,
        content: [
          ...(opts.text ? [{ type: 'text/plain', value: opts.text }] : []),
          { type: 'text/html', value: opts.html },
        ],
      }
    );
  } else if (p === 'mailchimp' && process.env.MAILCHIMP_API_KEY) {
    res = await sendHttp(
      'mailchimp',
      'https://mandrillapp.com/api/1.0/messages/send.json',
      { 'Content-Type': 'application/json' },
      {
        key: process.env.MAILCHIMP_API_KEY,
        message: {
          from_email: parsed.email,
          from_name: parsed.name,
          to: [{ email: to, type: 'to' }],
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
        },
      }
    );
  } else {
    res = { id: `${p}_mock_${Date.now()}`, provider: p, success: true, timestamp: now };
  }

  emailServiceStore.recordSentEmail({
    id: res.id,
    to,
    from: opts.from || DEFAULT_FROM,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    provider: res.provider,
    timestamp: res.timestamp,
    status: res.success ? 'delivered' : 'failed',
    error: res.error,
  });
  return res;
}

export async function sendDoubleOptInConfirmation(
  email: string,
  confirmBaseUrl = 'https://nextjob.ai/api/email',
  source = 'newsletter'
) {
  const norm = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(norm)) throw new Error('Invalid email address for double opt-in.');
  const existing = emailServiceStore.getOptInRecordByEmail(norm);
  const token = existing
    ? existing.token
    : `optin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const rec: DoubleOptInRecord = {
    id: existing ? existing.id : `opt_${Date.now()}`,
    email: norm,
    token,
    status: existing ? existing.status : 'pending',
    createdAt: existing ? existing.createdAt : now,
    source,
  };
  emailServiceStore.saveOptInRecord(rec);

  const confirmUrl = `${confirmBaseUrl}?action=confirm&token=${token}`;
  const unsubscribeUrl = `${confirmBaseUrl}?action=unsubscribe&token=${token}`;
  const html = `<p>Confirm subscription: <a href="${confirmUrl}">Confirm Email</a> or <a href="${unsubscribeUrl}">Unsubscribe</a></p>`;
  const result = await sendEmail({
    to: norm,
    subject: 'Confirm your NextJob subscription',
    html,
    text: `Confirm: ${confirmUrl}`,
    provider: 'mock',
  });

  return { token, record: rec, result };
}

export async function confirmDoubleOptIn(token: string) {
  if (!token) return { success: false, error: 'Token parameter is required.' };
  const rec = emailServiceStore.getOptInRecordByToken(token);
  if (!rec) return { success: false, error: 'Invalid or expired confirmation token.' };
  rec.status = 'confirmed';
  rec.confirmedAt = new Date().toISOString();
  emailServiceStore.saveOptInRecord(rec);

  const sub = newsletterStore.getSubscriber(rec.email);
  if (sub) sub.consent = true;
  return { success: true, email: rec.email, record: rec };
}

export async function unsubscribe(tokenOrEmail: string) {
  if (!tokenOrEmail) return { success: false, message: 'Token or email parameter is required.' };
  const norm = tokenOrEmail.trim().toLowerCase();
  let rec =
    emailServiceStore.getOptInRecordByToken(tokenOrEmail) ||
    emailServiceStore.getOptInRecordByEmail(norm);
  const now = new Date().toISOString();
  if (rec) {
    rec.status = 'unsubscribed';
    rec.unsubscribedAt = now;
    emailServiceStore.saveOptInRecord(rec);
  } else if (EMAIL_REGEX.test(norm)) {
    rec = {
      id: `unsub_${Date.now()}`,
      email: norm,
      token: `unsub_${Date.now()}`,
      status: 'unsubscribed',
      createdAt: now,
      unsubscribedAt: now,
    };
    emailServiceStore.saveOptInRecord(rec);
  }
  return {
    success: true,
    email: rec?.email || norm,
    message: 'Successfully unsubscribed from NextJob email communications.',
  };
}

export async function sendTemplateEmail(
  sequence: 'welcome' | 'onboarding' | 're-engagement',
  step: number,
  vars: EmailVariables,
  to: string,
  provider?: EmailProvider
) {
  const rendered = renderEmailTemplate(sequence, step, vars);
  return sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    provider,
  });
}
