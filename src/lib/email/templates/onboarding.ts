import type { EmailTemplateOutput, EmailVariables } from './types';
import { escapeHtml, renderEmailFooter, sanitizeUrl } from './utils';

const ONBOARDING_CONFIG: Record<
  number,
  {
    subject: string;
    preheader: string;
    ctaText: string;
    bodySummary: string;
    day: number;
  }
> = {
  1: {
    day: 1,
    subject: 'Extract career claims from your resume',
    preheader: 'See how NextJob turns raw CV text into structured evidence.',
    ctaText: 'Import resume now',
    bodySummary: 'Import your resume to extract career claims with AI precision.',
  },
  2: {
    day: 4,
    subject: 'Set target roles, salary, and location filters',
    preheader: 'Filter out auto-rejects by specifying hard eligibility criteria.',
    ctaText: 'Set search preferences',
    bodySummary: 'Define your target salary, location, and visa sponsorship preferences.',
  },
  3: {
    day: 7,
    subject: 'Review AI tailored resume bullets',
    preheader: 'Accept, edit, or reject tailored bullets with full provenance.',
    ctaText: 'Review tailored bullets',
    bodySummary: 'NextJob generates resume variants grounded in your verified evidence.',
  },
  4: {
    day: 10,
    subject: 'Control your application automation mode',
    preheader: 'Choose between Manual, Copilot, and Autopilot execution modes.',
    ctaText: 'Configure automation policy',
    bodySummary:
      'Configure risk thresholds and field approval policies for automated applications.',
  },
  5: {
    day: 14,
    subject: 'Submit your first application with proof',
    preheader: 'Experience automated submission and receive a signed receipt.',
    ctaText: 'Submit first application',
    bodySummary:
      'Submit your first job application and receive a cryptographic submission receipt.',
  },
};

export function renderOnboardingSeries(
  step: 1 | 2 | 3 | 4 | 5,
  vars: EmailVariables
): EmailTemplateOutput {
  const rawName = vars.candidateName || 'there';
  const name = escapeHtml(rawName);
  const rawUrl = vars.actionUrl || 'https://nextjob.ai/onboarding';
  const safeUrl = sanitizeUrl(rawUrl);
  const footer = renderEmailFooter(vars);

  const config = ONBOARDING_CONFIG[step];

  return {
    id: `onboarding-o${step}`,
    sequence: 'onboarding',
    step,
    day: config.day,
    subject: config.subject,
    preheader: config.preheader,
    ctaText: config.ctaText,
    text: `Hi ${rawName},\n\n${config.bodySummary}\n\n${config.ctaText}: ${rawUrl}\n\nBest,\nThe NextJob Team${footer.text}`,
    html: `<p>Hi ${name},</p><p>${escapeHtml(config.bodySummary)}</p><p><a href="${safeUrl}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">${escapeHtml(
      config.ctaText
    )}</a></p>${footer.html}`,
  };
}
