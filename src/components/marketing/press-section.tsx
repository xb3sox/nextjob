import { Award, ExternalLink, Headphones, Newspaper, Radio } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export type PressCategory = 'all' | 'article' | 'podcast' | 'award';

export interface PressMention {
  id: string;
  category: 'article' | 'podcast' | 'award';
  publication: string;
  title: string;
  quote: string;
  author?: string;
  date: string;
  formattedDate: string;
  url: string;
  readTimeOrDuration?: string;
}

export const PRESS_MENTIONS: PressMention[] = [
  {
    id: 'techcrunch-feature',
    category: 'article',
    publication: 'TechCrunch',
    title: 'NextJob builds the cryptographic antidote to AI resume hallucination',
    quote:
      'By grounding every line of a job application in cryptographically signed evidence hashes, NextJob turns the job-search AI arms race into verifiable candidate trust.',
    author: 'Devin Coldewey',
    date: '2026-09-15',
    formattedDate: 'Sep 2026',
    url: 'https://techcrunch.com/2026/09/15/nextjob-evidence-provenance-job-applications',
    readTimeOrDuration: '4 min read',
  },
  {
    id: 'latent-space-podcast',
    category: 'podcast',
    publication: 'Latent Space Podcast',
    title: 'Ep. 88: Why AI application agents require strict zero-hallucination policies',
    quote:
      'The architecture of NextJob is fascinating: eligibility runs as a hard gate before ranking, and no LLM is permitted to invent candidate experience beyond verified claims.',
    author: 'Swyx & Alessio',
    date: '2026-08-28',
    formattedDate: 'Aug 2026',
    url: 'https://www.latent.space/p/nextjob-architecture',
    readTimeOrDuration: '42 min audio',
  },
  {
    id: 'fast-company-innovation',
    category: 'award',
    publication: 'Fast Company',
    title: '2026 Innovation by Design Honoree — AI for Human Empowerment',
    quote:
      'Recognized for pioneering transparent, candidate-controlled job search automation that eliminates unqualified rejections and restores hiring integrity.',
    author: 'Fast Company Editors',
    date: '2026-08-10',
    formattedDate: 'Aug 2026',
    url: 'https://www.fastcompany.com/innovation-by-design/2026/nextjob',
    readTimeOrDuration: 'Award Citation',
  },
  {
    id: 'bloomberg-technology',
    category: 'article',
    publication: 'Bloomberg Technology',
    title: 'Job seekers fight back against ATS black boxes with submission receipts',
    quote:
      'NextJob’s tamper-evident submission receipts give applicants indisputable proof of what was transmitted to enterprise applicant tracking systems.',
    author: 'Rachel Metz',
    date: '2026-07-22',
    formattedDate: 'Jul 2026',
    url: 'https://www.bloomberg.com/news/articles/2026-07-22/nextjob-ats-submission-receipts',
    readTimeOrDuration: '5 min read',
  },
];

export interface PressSectionProps {
  className?: string;
}

const CATEGORY_TABS: Array<{
  id: PressCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'All Coverage', icon: Radio },
  { id: 'article', label: 'Articles', icon: Newspaper },
  { id: 'podcast', label: 'Podcasts', icon: Headphones },
  { id: 'award', label: 'Awards', icon: Award },
];

export function PressSection({ className = '' }: PressSectionProps) {
  const [activeCategory, setActiveCategory] = useState<PressCategory>('all');

  const filteredMentions =
    activeCategory === 'all'
      ? PRESS_MENTIONS
      : PRESS_MENTIONS.filter((mention) => mention.category === activeCategory);

  return (
    <section
      id="press"
      aria-labelledby="press-heading"
      className={`py-24 px-6 border-t border-white/5 relative ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-moss/30 bg-moss/10 text-moss text-xs font-medium mb-4">
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Press & Recognition</span>
          </div>
          <h2 id="press-heading" className="font-display text-4xl mb-4 text-paper">
            Trusted by the press. Built on verifiable evidence.
          </h2>
          <p className="text-fog text-base leading-relaxed">
            Leading technology publications and industry experts on how NextJob restores trust and
            transparency to the job application process.
          </p>

          {/* Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter press mentions by category"
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            {CATEGORY_TABS.map(({ id, label, icon: Icon }) => {
              const isSelected = activeCategory === id;
              const count =
                id === 'all'
                  ? PRESS_MENTIONS.length
                  : PRESS_MENTIONS.filter((m) => m.category === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-moss/20 text-moss border border-moss/40 shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)]'
                      : 'bg-white/[0.03] text-fog hover:text-paper border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                  <span className="text-[10px] opacity-75 tnum">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Press Mentions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentions.map((mention) => {
            const isAward = mention.category === 'award';
            return (
              <article
                key={mention.id}
                className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-moss/30 transition-all duration-200"
              >
                <div>
                  {/* Top metadata bar */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="font-display tracking-tight text-sm font-semibold text-paper group-hover:text-moss transition-colors">
                      {mention.publication}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-fog/70">
                      <time dateTime={mention.date}>{mention.formattedDate}</time>
                      {mention.readTimeOrDuration && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{mention.readTimeOrDuration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg font-medium text-paper mb-3 leading-snug group-hover:text-white transition-colors">
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
                      aria-label={`${mention.title} on ${mention.publication} (opens in new tab)`}
                    >
                      <span>{mention.title}</span>
                      <ExternalLink
                        className="w-4 h-4 text-fog group-hover:text-moss shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </h3>

                  {/* Quote */}
                  <blockquote className="text-sm text-fog leading-relaxed mb-6 italic border-l-2 border-white/10 group-hover:border-moss/40 pl-3 transition-colors">
                    &ldquo;{mention.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Footer attribution */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-fog">
                  <span>{mention.author ? `By ${mention.author}` : mention.publication}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium capitalize ${
                      isAward ? 'text-amber-400' : 'text-moss'
                    }`}
                  >
                    {isAward && <Award className="w-3.5 h-3.5" aria-hidden="true" />}
                    {mention.category}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Press Contact / Media Kit Notice */}
        <div className="mt-12 text-center p-6 rounded-xl border border-white/5 bg-white/[0.01]">
          <p className="text-xs text-fog">
            Media inquiries or press interview requests? Reach our media desk at{' '}
            <a
              href="mailto:press@nextjob.ai"
              className="text-moss hover:underline font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-moss rounded"
            >
              press@nextjob.ai
            </a>{' '}
            · Brand assets available upon request.
          </p>
        </div>
      </div>
    </section>
  );
}
