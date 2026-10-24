import {
  type CareerClaim,
  type CareerGraph,
  type JobRequirements,
  type TailoringResult,
  tailoringEngine,
} from '@nextjob/tailoring';
import { ArrowLeft, Check, Pencil, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * T-18: tailoring review surface.
 *
 * Every proposed statement is shown next to the CareerClaim it came from, so a
 * user can accept, edit, or reject it with the evidence in view. Nothing here
 * writes back to the profile — persistence belongs to the approval workflow
 * (T-20); decisions are held in component state only.
 */

type Decision = 'pending' | 'accepted' | 'edited' | 'rejected';

interface Review {
  decision: Decision;
  text: string;
}

// ponytail: demo graph until the profile service is wired to the app shell
// (T-08 exposes claims/evidence over the API, not in the SPA yet). Swap this
// constant for the fetched CareerGraph; the page itself stays unchanged.
const DEMO_GRAPH: CareerGraph = {
  claims: [
    {
      id: 'claim-exp-1',
      type: 'experience',
      title: 'Senior Software Engineer',
      content: {
        company: 'Tech Corp',
        startDate: '2020-01',
        endDate: '2024-06',
        achievements: ['Led a team of 5 engineers', 'Cut deploy time by 70%'],
      },
      evidenceId: 'evidence-1',
      verificationStatus: 'verified',
      confidence: 0.95,
    },
    {
      id: 'claim-exp-2',
      type: 'experience',
      title: 'Software Engineer',
      content: {
        company: 'Startup Inc',
        startDate: '2017-03',
        endDate: '2019-12',
        achievements: ['Built the billing pipeline'],
      },
      evidenceId: 'evidence-2',
      verificationStatus: 'verified',
      confidence: 0.9,
    },
    {
      id: 'claim-skill-1',
      type: 'skill',
      title: 'TypeScript',
      content: { level: 'expert', yearsOfExperience: 7 },
      evidenceId: 'evidence-3',
      verificationStatus: 'verified',
      confidence: 0.95,
    },
    {
      id: 'claim-skill-2',
      type: 'skill',
      title: 'React',
      content: { level: 'advanced', yearsOfExperience: 6 },
      evidenceId: 'evidence-4',
      verificationStatus: 'verified',
      confidence: 0.9,
    },
  ],
};

const DEMO_JOB: JobRequirements = {
  title: 'Staff Frontend Engineer',
  company: 'Stripe',
  requiredSkills: ['TypeScript', 'React'],
};

/** Compact, type-agnostic rendering of a claim's stored content. */
function describeClaim(claim: CareerClaim): string {
  const content = claim.content;
  if (!content || typeof content !== 'object') return String(content ?? '');
  return Object.entries(content)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    .join(' · ');
}

function sectionLabel(type: string): string {
  const label = type.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function TailorPage() {
  const [result, setResult] = useState<TailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let active = true;

    tailoringEngine
      .tailor({ type: 'resume', careerGraph: DEMO_GRAPH, jobRequirements: DEMO_JOB })
      .then((generated) => {
        if (!active) return;
        setResult(generated);
        setReviews(
          Object.fromEntries(
            (generated.sections ?? []).map((section, index) => [
              `${section.type}-${index}`,
              { decision: 'pending', text: section.content },
            ])
          )
        );
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Tailoring failed');
      });

    return () => {
      active = false;
    };
  }, []);

  const claimById = useMemo(() => new Map(DEMO_GRAPH.claims.map((claim) => [claim.id, claim])), []);

  const decide = (key: string, decision: Decision, text?: string) => {
    setReviews((prev) => ({
      ...prev,
      [key]: { decision, text: text ?? prev[key]?.text ?? '' },
    }));
    setEditing(null);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-ink text-paper px-6 py-16">
        <p role="alert" className="max-w-xl mx-auto text-sm text-danger">
          {error}
        </p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-ink text-paper px-6 py-16">
        <p role="status" className="max-w-xl mx-auto text-sm text-fog">
          Preparing your draft…
        </p>
      </main>
    );
  }

  const sections = result.sections ?? [];
  const counts = Object.values(reviews).reduce(
    (acc, review) => {
      if (review.decision !== 'pending') acc[review.decision] += 1;
      else acc.pending += 1;
      return acc;
    },
    { accepted: 0, edited: 0, rejected: 0, pending: 0 }
  );

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-paper transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Dashboard
          </Link>
          <span className="text-sm text-fog">{DEMO_JOB.company}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-3">Review your draft</h1>
        <p className="text-fog mb-6 max-w-xl">
          Every line below traces to a verified claim in your profile. Accept it, change it, or drop
          it.
        </p>

        <p className="text-xs text-fog mb-10 inline-flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
          <span className="tnum">{Math.round(result.confidence * 100)}%</span> confidence ·{' '}
          {result.warnings.length} warning{result.warnings.length === 1 ? '' : 's'} ·{' '}
          {result.unsupportedClaims.length} claim
          {result.unsupportedClaims.length === 1 ? '' : 's'} unused
        </p>

        <p role="status" aria-live="polite" className="mb-6 text-sm text-fog">
          {counts.pending === 0
            ? `All ${sections.length} statements reviewed — ${counts.accepted} accepted, ${counts.edited} edited, ${counts.rejected} rejected.`
            : `${counts.pending} of ${sections.length} statements left to review.`}
        </p>

        <ul className="space-y-4">
          {sections.map((section, index) => {
            const key = `${section.type}-${index}`;
            const review = reviews[key] ?? { decision: 'pending', text: section.content };
            const claims = section.evidenceClaimIds
              .map((id) => claimById.get(id))
              .filter((claim): claim is CareerClaim => Boolean(claim));
            const label = sectionLabel(section.type);

            return (
              <li key={key}>
                <section
                  aria-labelledby={`${key}-heading`}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 id={`${key}-heading`} className="text-xs uppercase tracking-wider text-fog">
                      {label}
                    </h2>
                    <span
                      className={`text-xs font-medium ${
                        review.decision === 'accepted' || review.decision === 'edited'
                          ? 'text-moss'
                          : review.decision === 'rejected'
                            ? 'text-danger'
                            : 'text-fog/60'
                      }`}
                    >
                      {review.decision === 'pending' ? 'Needs review' : review.decision}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs text-fog mb-1.5">Original</h3>
                    {claims.length > 0 ? (
                      <ul className="space-y-1">
                        {claims.map((claim) => (
                          <li key={claim.id} className="text-xs text-fog/80 leading-relaxed">
                            <span className="text-paper">{claim.title}</span> —{' '}
                            {describeClaim(claim)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-fog/80">No linked claim</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs text-fog mb-1.5">Proposed</h3>
                    {editing === key ? (
                      <div>
                        <label htmlFor={`${key}-draft`} className="sr-only">
                          Edit proposed {label.toLowerCase()} statement
                        </label>
                        <textarea
                          id={`${key}-draft`}
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          rows={4}
                          className="w-full rounded-lg border border-white/15 bg-ink p-3 text-sm text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => decide(key, 'edited', draft)}
                            className="rounded-lg bg-moss-deep hover:bg-moss px-3 py-1.5 text-xs font-semibold text-moss-dark transition-colors"
                          >
                            Save edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-fog hover:text-paper transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line">{review.text}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xs text-fog mb-1.5">Evidence</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {claims.length > 0 ? (
                        claims.map((claim) => (
                          <span
                            key={claim.id}
                            className="inline-flex items-center gap-1 rounded-full border border-moss/25 bg-moss/5 px-2 py-0.5 text-[11px] text-moss"
                          >
                            <Check className="w-3 h-3" aria-hidden="true" />
                            {claim.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-danger">Unsupported</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => decide(key, 'accepted')}
                      aria-label={`Accept ${label.toLowerCase()} statement`}
                      aria-pressed={review.decision === 'accepted'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-moss/40 hover:text-moss transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(key);
                        setDraft(review.text);
                      }}
                      aria-label={`Edit ${label.toLowerCase()} statement`}
                      aria-pressed={review.decision === 'edited'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(key, 'rejected')}
                      aria-label={`Reject ${label.toLowerCase()} statement`}
                      aria-pressed={review.decision === 'rejected'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-danger/40 hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      Reject
                    </button>
                  </div>
                </section>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-xs text-fog/70">
          Submission isn’t wired up yet — approved statements stay in this draft until the approval
          workflow (T-20) lands.
        </p>
      </main>
    </div>
  );
}
