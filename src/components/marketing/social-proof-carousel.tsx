import { Award, ChevronLeft, ChevronRight, Pause, Play, Quote, ShieldCheck } from 'lucide-react';
import { type KeyboardEvent, useEffect, useState } from 'react';

export interface SocialProofSlide {
  id: string;
  author: string;
  role: string;
  company: string;
  companyLogoUrl: string;
  quote: string;
  avatarUrl?: string;
  metricValue: string;
  metricLabel: string;
  metricDetail: string;
}

export const SOCIAL_PROOF_SLIDES: SocialProofSlide[] = [
  {
    id: 'proof-stripe',
    author: 'Sarah Jenkins',
    role: 'Staff Systems Engineer',
    company: 'Stripe',
    companyLogoUrl: '/images/logos/stripe.svg',
    quote:
      'Instead of generic bullet points that fall apart in technical screens, every point on my resume pointed directly to verified CareerClaims and architecture artifacts.',
    metricValue: '3.2x',
    metricLabel: 'Interview Response Lift',
    metricDetail: 'Pre-screened against 10 hard eligibility criteria',
  },
  {
    id: 'proof-vercel',
    author: 'David Zhao',
    role: 'Senior Frontend Engineer',
    company: 'Vercel',
    companyLogoUrl: '/images/logos/vercel.svg',
    quote:
      'I used to spend 45 minutes on each repetitive ATS questionnaire. With NextJob, I tailored and submitted verified applications in under 3 minutes each.',
    metricValue: '93%',
    metricLabel: 'Time Saved per Job',
    metricDetail: '3 min average apply workflow vs 45 min manual entry',
  },
  {
    id: 'proof-figma',
    author: 'Elena Rostova',
    role: 'Lead Product Designer',
    company: 'Figma',
    companyLogoUrl: '/images/logos/figma.svg',
    quote:
      'The cryptographic submission receipt gave me an immutable record of what was sent. For the first time, I had verifiable proof of my application state.',
    metricValue: '100%',
    metricLabel: 'Evidence Provenance',
    metricDetail: 'Zero hallucinated skills, backed by frozen SHA-256 receipt',
  },
  {
    id: 'proof-supabase',
    author: 'Marcus Vance',
    role: 'Principal Backend Engineer',
    company: 'Supabase',
    companyLogoUrl: '/images/logos/supabase.svg',
    quote:
      'Eligibility verification stopped me from wasting time on jobs with covert location barriers or mismatched bands. I only applied where I knew I met the hard bar.',
    metricValue: '0%',
    metricLabel: 'False Hope Rate',
    metricDetail: 'Zero applications wasted on disqualifying constraints',
  },
];

export interface SocialProofCarouselProps {
  id?: string;
  slides?: SocialProofSlide[];
  autoRotateInterval?: number;
  className?: string;
}

export function SocialProofCarousel({
  id = 'social-proof-carousel',
  slides = SOCIAL_PROOF_SLIDES,
  autoRotateInterval = 5000,
  className = '',
}: SocialProofCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const totalSlides = slides.length;
  const slide = slides[currentIndex];

  const effectivelyPaused = isPaused || isHovered || isFocused;

  useEffect(() => {
    if (effectivelyPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [effectivelyPaused, totalSlides, autoRotateInterval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
    }
  };

  const initials = slide.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      id={id}
      aria-roledescription="carousel"
      aria-label="Candidate success stories and outcomes"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      className={`py-20 px-6 max-w-5xl mx-auto rounded-2xl ${className}`.trim()}
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
          <Award className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Verified Outcomes</span>
        </div>
        <h2 id="social-proof-heading" className="font-display text-3xl sm:text-4xl text-paper mb-4">
          Real candidates. Verifiable results.
        </h2>
        <p className="text-fog text-base leading-relaxed">
          See how evidence-backed applications translate into real interview callbacks at top
          engineering teams.
        </p>
      </div>

      {/* Carousel Card */}
      <div className="rounded-2xl border border-white/10 bg-panel/90 shadow-2xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-moss/5 blur-3xl pointer-events-none" />

        {/* Live Region for Screen Readers */}
        <div aria-live={effectivelyPaused ? 'polite' : 'off'} className="sr-only">
          Slide {currentIndex + 1} of {totalSlides}: {slide.author} at {slide.company}. Outcome:{' '}
          {slide.metricValue} {slide.metricLabel}.
        </div>

        {/* Slide Content */}
        <article
          aria-roledescription="slide"
          aria-label={`${currentIndex + 1} of ${totalSlides}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Testimonial Quote & Author (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Quote className="w-8 h-8 text-moss/40" aria-hidden="true" />
            <blockquote className="text-lg sm:text-xl text-paper font-normal leading-relaxed">
              "{slide.quote}"
            </blockquote>

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="w-10 h-10 rounded-full bg-moss/10 border border-moss/20 text-moss flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-paper truncate">{slide.author}</span>
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-moss"
                    role="img"
                    aria-label="Verified candidate"
                  />
                </div>
                <div className="text-xs text-fog truncate">
                  {slide.role} • Target: <span className="text-paper">{slide.company}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Metric & Employer Badge (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-xl border border-white/10 bg-white/[0.02] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono uppercase tracking-wider text-fog">
                Hired Team Target
              </span>
              <img
                src={slide.companyLogoUrl}
                alt={`${slide.company} logo`}
                className="h-6 max-w-[100px] object-contain opacity-80"
              />
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-display font-bold text-moss">
                  {slide.metricValue}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-fog">
                  Outcome
                </span>
              </div>
              <div className="text-sm font-semibold text-paper mb-1">{slide.metricLabel}</div>
              <p className="text-xs text-fog leading-relaxed">{slide.metricDetail}</p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-moss font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-moss" aria-hidden="true" />
              <span>Verified CareerClaim & submission receipt</span>
            </div>
          </div>
        </article>

        {/* Carousel Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* Slide Indicator Dots */}
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Choose slide to display"
          >
            {slides.map((s, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to slide ${idx + 1}: ${s.author}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss ${
                    active ? 'w-8 bg-moss' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
              className="p-2 rounded-lg border border-white/10 text-fog hover:text-paper hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              {isPaused ? (
                <Play className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Pause className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous slide"
              className="p-2 rounded-lg border border-white/10 text-fog hover:text-paper hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next slide"
              className="p-2 rounded-lg border border-white/10 text-fog hover:text-paper hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SocialProofCarousel;
