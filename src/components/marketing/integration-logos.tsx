import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export type IntegrationStatus = 'supported' | 'coming_soon';

export interface IntegrationLogo {
  name: string;
  logoUrl: string;
  status: IntegrationStatus;
  statusLabel?: string;
  description?: string;
}

export interface IntegrationLogosProps {
  heading?: string;
  subheading?: string;
  integrations?: IntegrationLogo[];
  supportedNotice?: string;
  className?: string;
}

export const DEFAULT_INTEGRATION_LOGOS: IntegrationLogo[] = [
  {
    name: 'Greenhouse',
    logoUrl: '/images/integrations/greenhouse.svg',
    status: 'supported',
    statusLabel: 'Active connector',
    description: 'Direct field detection, autofill, and verification receipt generation',
  },
  {
    name: 'Lever',
    logoUrl: '/images/integrations/lever.svg',
    status: 'supported',
    statusLabel: 'Active connector',
    description: 'Automatic application field parsing and evidence-backed submit',
  },
  {
    name: 'Workday',
    logoUrl: '/images/integrations/workday.svg',
    status: 'supported',
    statusLabel: 'Active connector',
    description: 'Multi-step job application automation with qualification checks',
  },
  {
    name: 'iCIMS',
    logoUrl: '/images/integrations/icims.svg',
    status: 'supported',
    statusLabel: 'Active connector',
    description: 'Enterprise portal job application sync and receipt capture',
  },
  {
    name: 'Ashby',
    logoUrl: '/images/integrations/ashby.svg',
    status: 'coming_soon',
    statusLabel: 'Coming soon',
    description: 'Modern startup ATS integration planned in Phase 2',
  },
  {
    name: 'BambooHR',
    logoUrl: '/images/integrations/bamboohr.svg',
    status: 'coming_soon',
    statusLabel: 'Coming soon',
    description: 'HRIS & career portal connector planned in Phase 2',
  },
  {
    name: 'SmartRecruiters',
    logoUrl: '/images/integrations/smartrecruiters.svg',
    status: 'coming_soon',
    statusLabel: 'Coming soon',
    description: 'Enterprise recruiting platform connector planned in Phase 2',
  },
  {
    name: 'Workable',
    logoUrl: '/images/integrations/workable.svg',
    status: 'coming_soon',
    statusLabel: 'Coming soon',
    description: 'All-in-one recruiting software connector planned in Phase 2',
  },
];

export function IntegrationLogos({
  heading = 'Supported ATS Integrations',
  subheading = 'NextJob connects natively with major Applicant Tracking Systems to verify eligibility, autofill applications from proven history, and issue cryptographic submission receipts.',
  integrations = DEFAULT_INTEGRATION_LOGOS,
  supportedNotice = 'Connectors execute strictly with user consent and evidence-backed claims',
  className = '',
}: IntegrationLogosProps) {
  const supportedIntegrations = integrations.filter((item) => item.status === 'supported');
  const comingSoonIntegrations = integrations.filter((item) => item.status === 'coming_soon');

  return (
    <section aria-label="ATS integrations" className={`py-16 px-6 ${className}`.trim()}>
      <div className="max-w-6xl mx-auto text-center">
        {heading && (
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-paper mb-4 tracking-tight">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="text-base text-fog max-w-2xl mx-auto mb-12 leading-relaxed">{subheading}</p>
        )}

        {/* Supported Integrations Grid */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-moss/10 border border-moss/20 text-xs font-medium text-moss mb-6">
            <CheckCircle2 className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
            <span>Active Supported ATS Connectors</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch justify-items-center">
            {supportedIntegrations.map((item) => (
              <article
                key={item.name}
                className="group relative flex flex-col items-center justify-between p-5 w-full rounded-xl border border-white/10 bg-panel/60 hover:border-moss/40 hover:bg-white/[0.04] transition-all duration-300"
                aria-label={`${item.name} integration - ${item.statusLabel ?? 'Supported'}`}
                title={`${item.name} integration - ${item.statusLabel ?? 'Supported'}`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-moss/15 text-[11px] font-semibold text-moss border border-moss/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss" aria-hidden="true" />
                    {item.statusLabel ?? 'Supported'}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-center h-10 w-full">
                  <img
                    src={item.logoUrl}
                    alt={`${item.name} logo`}
                    className="max-h-8 w-auto max-w-[120px] object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                {item.description && (
                  <p className="text-xs text-fog/80 mt-2 text-center line-clamp-2 leading-normal">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Coming Soon Integrations Grid */}
        <div className="pt-6 border-t border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-fog/90 mb-6">
            <Clock className="w-3.5 h-3.5 text-fog/70" aria-hidden="true" />
            <span>Planned Integrations (Coming Soon)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch justify-items-center">
            {comingSoonIntegrations.map((item) => (
              <article
                key={item.name}
                className="group relative flex flex-col items-center justify-between p-5 w-full rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300 opacity-75 hover:opacity-100"
                aria-label={`${item.name} integration - ${item.statusLabel ?? 'Coming Soon'}`}
                title={`${item.name} integration - ${item.statusLabel ?? 'Coming Soon'}`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-medium text-fog border border-white/10">
                    <Clock className="w-3 h-3 text-fog/70" aria-hidden="true" />
                    {item.statusLabel ?? 'Coming Soon'}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-center h-10 w-full">
                  <img
                    src={item.logoUrl}
                    alt={`${item.name} logo`}
                    className="max-h-8 w-auto max-w-[120px] object-contain filter grayscale opacity-50 group-hover:opacity-80 transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                {item.description && (
                  <p className="text-xs text-fog/60 mt-2 text-center line-clamp-2 leading-normal">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        {supportedNotice && (
          <div className="inline-flex items-center gap-2 text-xs text-fog/70 mt-10">
            <ShieldCheck className="w-4 h-4 text-moss shrink-0" aria-hidden="true" />
            <span>{supportedNotice}</span>
          </div>
        )}
      </div>
    </section>
  );
}
