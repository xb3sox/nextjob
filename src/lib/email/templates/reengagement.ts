import type { EmailTemplateOutput, EmailVariables } from './types';

export function renderReengagementSeries(_step: 1, vars: EmailVariables): EmailTemplateOutput {
  const name = vars.candidateName || 'there';
  const url = vars.actionUrl || 'https://nextjob.ai/dashboard';
  const matchCount = vars.matchCount ?? 8;

  return {
    id: 're-engagement-r1',
    sequence: 're-engagement',
    step: 1,
    day: 30,
    subject: `${matchCount} new job matches available on NextJob`,
    preheader: 'Review fresh opportunity matches and keep your career claims updated.',
    ctaText: 'Explore new matches',
    text: `Hi ${name},\n\nWe found ${matchCount} new job matches aligned with your verified profile.\n\nExplore new matches: ${url}\n\nBest,\nThe NextJob Team`,
    html: `<p>Hi ${name},</p><p>We found ${matchCount} new job matches aligned with your verified profile.</p><p><a href="${url}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">Explore new matches</a></p>`,
  };
}
