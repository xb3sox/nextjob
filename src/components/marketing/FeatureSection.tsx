import type { ReactNode } from 'react';

export interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, badge, className = '' }: FeatureCardProps) {
  return (
    <div
      className={`mkt-card h-full hover:border-moss/25 hover:bg-moss/[0.03] transition-colors ${className}`.trim()}
    >
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <span className="inline-flex w-10 h-10 rounded-lg bg-moss/10 text-moss items-center justify-center">
            {icon}
          </span>
        )}
        {badge && <span className="mkt-badge">{badge}</span>}
      </div>
      <h3 className="font-semibold text-lg text-paper mb-2">{title}</h3>
      <p className="text-sm text-fog leading-relaxed">{description}</p>
    </div>
  );
}

export interface FeatureItem {
  icon?: ReactNode;
  title: string;
  description: string;
  badge?: string;
}

export interface FeatureSectionProps {
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureSection({
  title,
  subtitle,
  features,
  columns = 3,
  className = '',
}: FeatureSectionProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && <h2 className="font-display text-4xl text-paper mb-3">{title}</h2>}
            {subtitle && <p className="text-fog max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className={`grid gap-6 ${gridCols}`}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              badge={feature.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
