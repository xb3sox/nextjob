import { ShieldCheck } from 'lucide-react';

export interface CustomerLogo {
  name: string;
  logoUrl: string;
  permissionVerified: boolean;
  permissionNote?: string;
}

export interface CustomerLogosProps {
  heading?: string;
  subheading?: string;
  logos?: CustomerLogo[];
  permissionNotice?: string;
  className?: string;
}

export const DEFAULT_CUSTOMER_LOGOS: CustomerLogo[] = [
  {
    name: 'Stripe',
    logoUrl: '/images/logos/stripe.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'Vercel',
    logoUrl: '/images/logos/vercel.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'Linear',
    logoUrl: '/images/logos/linear.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'Figma',
    logoUrl: '/images/logos/figma.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'Supabase',
    logoUrl: '/images/logos/supabase.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'OpenAI',
    logoUrl: '/images/logos/openai.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'GitHub',
    logoUrl: '/images/logos/github.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
  {
    name: 'Notion',
    logoUrl: '/images/logos/notion.svg',
    permissionVerified: true,
    permissionNote: 'Used with candidate consent and partner agreement',
  },
];

export function CustomerLogos({
  heading = 'Trusted by candidates hired at leading engineering teams',
  subheading,
  logos = DEFAULT_CUSTOMER_LOGOS,
  permissionNotice = 'Logos displayed with verified permission',
  className = '',
}: CustomerLogosProps) {
  return (
    <section aria-label="Customer and employer logos" className={`py-12 px-6 ${className}`.trim()}>
      <div className="max-w-6xl mx-auto text-center">
        {heading && (
          <h2 className="text-sm font-medium text-fog tracking-wide uppercase mb-3">{heading}</h2>
        )}
        {subheading && <p className="text-sm text-fog/80 mb-8 max-w-xl mx-auto">{subheading}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 md:gap-8 items-center justify-items-center my-8">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="group relative flex items-center justify-center p-3 w-full h-12 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300"
              title={`${logo.name} (${logo.permissionNote ?? 'Permission verified'})`}
            >
              <img
                src={logo.logoUrl}
                alt={`${logo.name} logo`}
                className="max-h-6 w-auto max-w-[100px] object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {permissionNotice && (
          <div className="inline-flex items-center gap-1.5 text-xs text-fog/70 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-moss shrink-0" aria-hidden="true" />
            <span>{permissionNotice}</span>
          </div>
        )}
      </div>
    </section>
  );
}
