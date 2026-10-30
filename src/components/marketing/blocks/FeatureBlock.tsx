import type { ReactNode } from 'react';

export interface FeatureCardItem {
  icon?: ReactNode;
  title: string;
  description: string;
  badge?: string;
}

export interface FeatureBlockProps {
  title?: string;
  subtitle?: string;
  features: FeatureCardItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeatureBlock({
  title,
  subtitle,
  features,
  columns = 3,
  className = '',
}: FeatureBlockProps) {
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
            <div
              key={feature.title}
              className="mkt-card h-full hover:border-moss/25 hover:bg-moss/[0.03] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                {feature.icon && (
                  <span className="inline-flex w-10 h-10 rounded-lg bg-moss/10 text-moss items-center justify-center">
                    {feature.icon}
                  </span>
                )}
                {feature.badge && <span className="mkt-badge">{feature.badge}</span>}
              </div>
              <h3 className="font-semibold text-lg text-paper mb-2">{feature.title}</h3>
              <p className="text-sm text-fog leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureBlock;
