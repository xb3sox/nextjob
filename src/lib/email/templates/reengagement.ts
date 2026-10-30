import type { EmailTemplateOutput, EmailVariables } from './types';
import { escapeHtml, renderEmailFooter, sanitizeUrl } from './utils';

export function renderReengagementSeries(_step: 1, vars: EmailVariables): EmailTemplateOutput {
  const rawName = vars.candidateName || 'there';
  const name = escapeHtml(rawName);
  const rawUrl = vars.actionUrl || 'https://nextjob.ai/dashboard';
  const safeUrl = sanitizeUrl(rawUrl);
  const matchCount = vars.matchCount ?? 8;
  const footer = renderEmailFooter(vars);

  return {
    id: 're-engagement-r1',
    sequence: 're-engagement',
    step: 1,
    day: 30,
    subject: `${matchCount} new job matches available on NextJob`,
    preheader: 'Review fresh opportunity matches and keep your career claims updated.',
    ctaText: 'Explore new matches',
    text: `Hi ${rawName},\n\nWe found ${matchCount} new job matches aligned with your verified profile.\n\nExplore new matches: ${rawUrl}\n\nBest,\nThe NextJob Team${footer.text}`,
    html: `<p>Hi ${name},</p><p>We found ${matchCount} new job matches aligned with your verified profile.</p><p><a href="${safeUrl}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">Explore new matches</a></p>${footer.html}`,
  };
}
