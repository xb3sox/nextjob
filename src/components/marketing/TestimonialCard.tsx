import { Quote } from 'lucide-react';

export interface TestimonialCardProps {
  quote: string;
  author: string;
  authorRole?: string;
  jobTitle?: string;
  company?: string;
  avatarUrl?: string;
  verifiedBadge?: boolean;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  authorRole,
  jobTitle,
  company,
  avatarUrl,
  verifiedBadge = true,
  className = '',
}: TestimonialCardProps) {
  const displayRole = authorRole || jobTitle || '';
  const initials = author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <figure
      className={`mkt-card h-full flex flex-col justify-between hover:border-white/20 transition-colors ${className}`.trim()}
    >
      <div>
        <Quote className="w-5 h-5 text-moss/60 mb-3" aria-hidden="true" />
        <blockquote className="text-sm text-paper leading-relaxed mb-6 font-normal">
          "{quote}"
        </blockquote>
      </div>

      <figcaption className="flex items-center gap-3 pt-4 border-t border-white/5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={author}
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-moss/10 border border-moss/20 text-moss flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-paper truncate">{author}</span>
            {verifiedBadge && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-moss"
                role="img"
                title="Verified candidate"
                aria-label="Verified candidate"
              />
            )}
          </div>
          {displayRole && (
            <p className="text-xs text-fog truncate">
              {displayRole}
              {company ? ` at ${company}` : ''}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export interface TestimonialItem {
  quote: string;
  author: string;
  authorRole?: string;
  jobTitle?: string;
  company?: string;
  avatarUrl?: string;
}

export interface TestimonialSectionProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
  columns?: 2 | 3;
  className?: string;
}

export function TestimonialSection({
  title = 'Trusted by proactive job seekers',
  subtitle = 'Here is what candidates say about applying with verified proof.',
  testimonials,
  columns = 3,
  className = '',
}: TestimonialSectionProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

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
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.author}
              quote={t.quote}
              author={t.author}
              authorRole={t.authorRole}
              jobTitle={t.jobTitle}
              company={t.company}
              avatarUrl={t.avatarUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialCard;
