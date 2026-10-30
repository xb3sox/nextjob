export interface TestimonialBlockItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  verifiedClaim?: string;
}

export interface TestimonialBlockProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialBlockItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function TestimonialBlock({
  title = 'Trusted by Engineers and Leaders',
  subtitle = 'See how job seekers use evidence-grounded applications to land callbacks faster.',
  testimonials,
  columns = 3,
  className = '',
}: TestimonialBlockProps) {
  const gridCols = {
    1: 'max-w-2xl mx-auto grid-cols-1',
    2: 'md:grid-cols-2 max-w-4xl mx-auto',
    3: 'md:grid-cols-3 max-w-5xl mx-auto',
  }[columns];

  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-14">
            {title && <h2 className="font-display text-4xl text-paper mb-3">{title}</h2>}
            {subtitle && <p className="text-fog max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}

        <div className={`grid gap-6 ${gridCols}`}>
          {testimonials.map((item) => (
            <figure
              key={`${item.author}-${item.company}`}
              className="mkt-card flex flex-col justify-between h-full bg-charcoal/50 border border-white/10 p-6 rounded-xl"
            >
              <blockquote className="text-paper/90 text-sm leading-relaxed mb-6">
                "{item.quote}"
              </blockquote>

              <div>
                {item.verifiedClaim && (
                  <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-moss/10 text-moss text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                    Verified: {item.verifiedClaim}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.author}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-moss/20 text-moss font-semibold flex items-center justify-center text-sm border border-moss/30">
                      {item.author.charAt(0)}
                    </div>
                  )}

                  <div>
                    <figcaption className="font-medium text-sm text-paper">
                      {item.author}
                    </figcaption>
                    <p className="text-xs text-fog">
                      {item.role} at <span className="text-paper/80">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialBlock;
