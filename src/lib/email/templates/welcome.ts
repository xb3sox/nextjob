import type { EmailTemplateOutput, EmailVariables } from './types';

export function renderWelcomeSeries(step: 1 | 2 | 3, vars: EmailVariables): EmailTemplateOutput {
  const name = vars.candidateName || 'there';
  const url = vars.actionUrl || 'https://nextjob.ai/dashboard';
  const matchCount = vars.matchCount ?? 5;

  if (step === 1) {
    return {
      id: 'welcome-w1',
      sequence: 'welcome',
      step: 1,
      day: 0,
      subject: 'Welcome to NextJob — start your verified profile',
      preheader: 'Import your resume to extract verified career claims in seconds.',
      ctaText: 'Verify your profile — start setup',
      text: `Hi ${name},\n\nWelcome to NextJob. We replace job application promises with verified evidence.\n\nUpload your current resume to extract your claims: ${url}\n\nBest,\nThe NextJob Team`,
      html: `<p>Hi ${name},</p><p>Welcome to NextJob. We replace job application promises with verified evidence.</p><p><a href="${url}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">Verify your profile — start setup</a></p>`,
    };
  }

  if (step === 2) {
    return {
      id: 'welcome-w2',
      sequence: 'welcome',
      step: 2,
      day: 3,
      subject: 'Verify your claims — build your evidence graph',
      preheader: 'Ground every resume statement in real work evidence.',
      ctaText: 'Review career claims',
      text: `Hi ${name},\n\nNextJob never fabricates candidate experience. Every bullet point links to an approved CareerClaim.\n\nReview your claims: ${url}\n\nBest,\nThe NextJob Team`,
      html: `<p>Hi ${name},</p><p>NextJob never fabricates candidate experience. Every bullet point links to an approved CareerClaim.</p><p><a href="${url}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">Review career claims</a></p>`,
    };
  }

  return {
    id: 'welcome-w3',
    sequence: 'welcome',
    step: 3,
    day: 7,
    subject: 'Match eligible roles — tailor with proof',
    preheader: 'Discover roles where your qualifications satisfy hard constraints.',
    ctaText: 'View matched jobs',
    text: `Hi ${name},\n\nYour profile is ready. NextJob found ${matchCount} eligible roles waiting for you.\n\nView matched jobs: ${url}\n\nBest,\nThe NextJob Team`,
    html: `<p>Hi ${name},</p><p>Your profile is ready. NextJob found ${matchCount} eligible roles waiting for you.</p><p><a href="${url}" style="background-color:#10b981;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;">View matched jobs</a></p>`,
  };
}
