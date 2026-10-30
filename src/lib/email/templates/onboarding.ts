import type { EmailTemplateOutput, EmailVariables } from './types';

export function renderOnboardingSeries(
  step: 1 | 2 | 3 | 4 | 5,
  vars: EmailVariables
): EmailTemplateOutput {
  const name = vars.candidateName || 'there';
  const url = vars.actionUrl || 'https://nextjob.ai/onboarding';

  const stepsConfig: Record<
    number,
    {
      subject: string;
      preheader: string;
      ctaText: string;
      bodyText: string;
      day: number;
    }
  > = {
    1: {
      day: 1,
      subject: 'Extract career claims from your resume',
      preheader: 'See how NextJob turns raw CV text into structured evidence.',
      ctaText: 'Import resume now',
      bodyText: `Hi ${name},\n\nImport your resume to extract career claims with AI precision.\n\nImport resume: ${url}\n\nBest,\nThe NextJob Team`,
    },
    2: {
      day: 4,
      subject: 'Set target roles, salary, and location filters',
      preheader: 'Filter out auto-rejects by specifying hard eligibility criteria.',
      ctaText: 'Set search preferences',
      bodyText: `Hi ${name},\n\nDefine your target salary, location, and visa sponsorship preferences.\n\nSet search preferences: ${url}\n\nBest,\nThe NextJob Team`,
    },
    3: {
      day: 7,
      subject: 'Review AI tailored resume bullets',
      preheader: 'Accept, edit, or reject tailored bullets with full provenance.',
      ctaText: 'Review tailored bullets',
      bodyText: `Hi ${name},\n\nNextJob generates resume variants grounded in your verified evidence.\n\nReview tailored bullets: ${url}\n\nBest,\nThe NextJob Team`,
    },
    4: {
      day: 10,
      subject: 'Control your application automation mode',
      preheader: 'Choose between Manual, Copilot, and Autopilot execution modes.',
      ctaText: 'Configure automation policy',
      bodyText: `Hi ${name},\n\nConfigure risk thresholds and field approval policies for automated applications.\n\nConfigure automation policy: ${url}\n\nBest,\nThe NextJob Team`,
    },
    5: {
      day: 14,
      subject: 'Submit your first application with proof',
      preheader: 'Experience automated submission and receive a signed receipt.',
      ctaText: 'Submit first application',
      bodyText: `Hi ${name},\n\nSubmit your first job application and receive a cryptographic submission receipt.\n\nSubmit first application: ${url}\n\nBest,\nThe NextJob Team`,
    },
  };

  const config = stepsConfig[step];

  return {
    id: `onboarding-o${step}`,
    sequence: 'onboarding',
    step,
    day: config.day,
    subject: config.subject,
    preheader: config.preheader,
    ctaText: config.ctaText,
    text: config.bodyText,
    html: `<p>Hi ${name},</p><p>${config.preheader}</p><p><a href="${url}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">${config.ctaText}</a></p>`,
  };
}
