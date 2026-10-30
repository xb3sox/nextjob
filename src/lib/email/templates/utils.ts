import type { EmailVariables } from './types';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(?:https?:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

export const COMPANY_ADDRESS = 'NextJob Inc. · 548 Market St, Suite 30000, San Francisco, CA 94104';

export function renderEmailFooter(vars: EmailVariables): { text: string; html: string } {
  const unsubUrl =
    vars.unsubscribeUrl || vars.unsubscribedUrl || 'https://nextjob.ai/settings/notifications';
  const safeUnsub = sanitizeUrl(unsubUrl);

  return {
    text: `\n\n---\n${COMPANY_ADDRESS}\nTo manage preferences or unsubscribe, visit: ${unsubUrl}`,
    html: `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" /><footer style="font-size:12px;color:#6b7280;line-height:1.5;"><p>${escapeHtml(
      COMPANY_ADDRESS
    )}</p><p><a href="${safeUnsub}" style="color:#6b7280;text-decoration:underline;">Unsubscribe or manage preferences</a></p></footer>`,
  };
}
