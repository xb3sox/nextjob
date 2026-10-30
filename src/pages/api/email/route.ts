import {
  confirmDoubleOptIn,
  type EmailProvider,
  emailServiceStore,
  sendDoubleOptInConfirmation,
  sendEmail,
  sendTemplateEmail,
  unsubscribe,
} from '../../../lib/email/service';
import type { EmailVariables } from '../../../lib/email/templates/types';

export interface RouteResponse<T = unknown> {
  status: number;
  body: T;
}

export async function GET(params?: {
  action?: 'confirm' | 'unsubscribe' | 'log' | 'status';
  token?: string;
  email?: string;
}): Promise<RouteResponse> {
  const { action, token, email } = params || {};
  if (action === 'confirm') {
    if (!token)
      return { status: 400, body: { success: false, error: 'Confirmation token is required.' } };
    const res = await confirmDoubleOptIn(token);
    return { status: res.success ? 200 : 400, body: res };
  }
  if (action === 'unsubscribe') {
    const target = token || email;
    if (!target)
      return {
        status: 400,
        body: { success: false, error: 'Token or email is required to unsubscribe.' },
      };
    return { status: 200, body: await unsubscribe(target) };
  }
  if (action === 'status') {
    const target = token || email;
    if (!target)
      return {
        status: 400,
        body: { success: false, error: 'Token or email is required to query status.' },
      };
    const rec =
      (token ? emailServiceStore.getOptInRecordByToken(token) : undefined) ||
      (email ? emailServiceStore.getOptInRecordByEmail(email) : undefined);
    return rec
      ? { status: 200, body: { success: true, record: rec } }
      : { status: 444, body: { success: false, error: 'No opt-in record found.' } };
  }
  if (action === 'log') {
    const sent = emailServiceStore.getSentEmails();
    return {
      status: 200,
      body: {
        success: true,
        count: sent.length,
        logs: sent.map((i) => ({
          id: i.id,
          to: i.to,
          subject: i.subject,
          provider: i.provider,
          status: i.status,
          timestamp: i.timestamp,
        })),
      },
    };
  }
  return {
    status: 200,
    body: { success: true, service: 'NextJob Email Nurture API', version: '1.0.0' },
  };
}

export async function POST(req: {
  action?: 'send' | 'double_opt_in' | 'confirm_opt_in' | 'unsubscribe' | 'send_template';
  to?: string;
  email?: string;
  subject?: string;
  html?: string;
  text?: string;
  provider?: EmailProvider;
  token?: string;
  confirmBaseUrl?: string;
  source?: string;
  sequence?: 'welcome' | 'onboarding' | 're-engagement';
  step?: number;
  vars?: EmailVariables;
}): Promise<RouteResponse> {
  const {
    action = 'send',
    to,
    email,
    subject,
    html,
    text,
    provider,
    token,
    confirmBaseUrl,
    source,
    sequence,
    step,
    vars,
  } = req || {};

  if (action === 'double_opt_in') {
    const target = email || to;
    if (!target)
      return {
        status: 400,
        body: { success: false, error: 'Email address is required for double opt-in.' },
      };
    try {
      const res = await sendDoubleOptInConfirmation(target, confirmBaseUrl, source);
      return {
        status: 201,
        body: {
          success: true,
          message: 'Double opt-in confirmation email dispatched successfully.',
          token: res.token,
          status: res.record.status,
          sendResult: res.result,
        },
      };
    } catch (err) {
      return {
        status: 400,
        body: {
          success: false,
          error: err instanceof Error ? err.message : 'Double opt-in failed.',
        },
      };
    }
  }

  if (action === 'confirm_opt_in') {
    if (!token)
      return { status: 400, body: { success: false, error: 'Confirmation token is required.' } };
    const res = await confirmDoubleOptIn(token);
    return { status: res.success ? 200 : 400, body: res };
  }

  if (action === 'unsubscribe') {
    const target = token || email || to;
    if (!target)
      return {
        status: 400,
        body: { success: false, error: 'Token or email is required to unsubscribe.' },
      };
    return { status: 200, body: await unsubscribe(target) };
  }

  if (action === 'send_template') {
    const recipient = to || email;
    if (!recipient)
      return {
        status: 400,
        body: { success: false, error: 'Recipient email (to/email) is required.' },
      };
    if (!sequence || !step || !vars)
      return {
        status: 400,
        body: {
          success: false,
          error: 'sequence, step, and vars are required to render template.',
        },
      };
    const res = await sendTemplateEmail(sequence, step, vars, recipient, provider);
    return { status: res.success ? 200 : 400, body: { success: res.success, result: res } };
  }

  const recipient = to || email;
  if (!recipient || !subject || !html)
    return {
      status: 400,
      body: { success: false, error: 'Recipient email (to), subject, and html body are required.' },
    };

  const result = await sendEmail({ to: recipient, subject, html, text, provider });
  return { status: result.success ? 200 : 400, body: { success: result.success, result } };
}
