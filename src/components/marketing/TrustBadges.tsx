import { CheckCircle2, Lock, ShieldCheck, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TrustBadgeProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function TrustBadge({
  icon = <ShieldCheck className="w-4 h-4 text-moss" aria-hidden="true" />,
  title,
  subtitle,
  className = '',
}: TrustBadgeProps) {
  return (
    <div className={`mkt-badge ${className}`.trim()}>
      <span className="shrink-0">{icon}</span>
      <span className="font-medium text-paper">{title}</span>
      {subtitle && <span className="text-fog">({subtitle})</span>}
    </div>
  );
}

export interface TrustBadgesProps {
  badges?: Array<{ title: string; subtitle?: string; icon?: ReactNode }>;
  className?: string;
}

const defaultBadges = [
  {
    title: 'SOC 2 Compliant',
    subtitle: 'Type II',
    icon: <ShieldCheck className="w-4 h-4 text-moss" aria-hidden="true" />,
  },
  {
    title: 'GDPR Compliant',
    subtitle: 'EU Ready',
    icon: <Lock className="w-4 h-4 text-moss" aria-hidden="true" />,
  },
  {
    title: 'Zero Hallucinations',
    subtitle: '100% Provenance',
    icon: <CheckCircle2 className="w-4 h-4 text-moss" aria-hidden="true" />,
  },
  {
    title: 'Encrypted at Rest',
    subtitle: '256-bit AES',
    icon: <Zap className="w-4 h-4 text-moss" aria-hidden="true" />,
  },
];

export function TrustBadges({ badges = defaultBadges, className = '' }: TrustBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`.trim()}>
      {badges.map((b) => (
        <TrustBadge key={b.title} title={b.title} subtitle={b.subtitle} icon={b.icon} />
      ))}
    </div>
  );
}

export interface EmployerTrustLogosProps {
  label?: string;
  companies?: string[];
  className?: string;
}

export function EmployerTrustLogos({
  label = 'Built for candidates targeting teams at',
  companies = ['Google', 'Stripe', 'Vercel', 'Linear', 'Figma'],
  className = '',
}: EmployerTrustLogosProps) {
  return (
    <div className={`text-center ${className}`.trim()}>
      {label && <p className="text-sm text-fog mb-6">{label}</p>}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
        {companies.map((company) => (
          <span key={company} className="text-base font-semibold text-fog tracking-tight">
            {company}
          </span>
        ))}
      </div>
    </div>
  );
}
