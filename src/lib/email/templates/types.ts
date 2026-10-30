export interface EmailVariables {
  candidateName: string;
  actionUrl: string;
  verifiedClaimsCount?: number;
  matchCount?: number;
  unsubscribedUrl?: string;
}

export interface EmailTemplateOutput {
  id: string;
  sequence: 'welcome' | 'onboarding' | 're-engagement';
  step: number;
  day: number;
  subject: string;
  preheader: string;
  ctaText: string;
  text: string;
  html: string;
}
