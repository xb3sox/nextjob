import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  Lock,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

export default function DataHandlingPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-ink text-paper antialiased">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-fog hover:text-paper transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <span className="text-sm font-bold tracking-tight text-paper">
              NextJob Transparency
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
            <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
            FR-TRUST-03 Data Handling Transparency
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">
            Data Handling & Transparency Manifesto
          </h1>
          <p className="mt-4 text-base text-fog max-w-3xl leading-relaxed">
            Your career evidence is personal, hard-earned, and proprietary. NextJob was engineered
            from the ground up to guarantee that your data is never monetized, never hallucinated,
            and never shared without your explicit authorization.
          </p>
        </div>

        {/* 5 Core Transparency Pillars */}
        <div className="space-y-12">
          {/* Pillar 1: Collection Boundaries */}
          <section aria-labelledby="collection-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h2 id="collection-heading" className="text-xl font-bold text-paper">
                1. What Data We Collect (and What We Never Collect)
              </h2>
            </div>
            <p className="text-xs text-fog leading-relaxed">
              We collect only the minimum career artifacts required to construct your verified
              CareerGraph and evaluate job eligibility.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  What We Collect
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-paper/90">
                  <li>• Resumes & CVs you explicitly upload (PDF, DOCX)</li>
                  <li>• Career claims verified by you (employment, education, skills)</li>
                  <li>• Work authorization status & location preferences</li>
                  <li>• Job postings you inspect or apply to</li>
                  <li>• Cryptographic submission receipts & application outcome logs</li>
                </ul>
              </div>

              <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-red-300">
                  <XCircle className="h-4 w-4 text-red-400" />
                  What We Never Collect
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-paper/90">
                  <li>• No biometric identifiers or facial recognition data</li>
                  <li>• No sensitive medical, health, or disability records</li>
                  <li>• No background checks, credit reports, or financial history</li>
                  <li>• No browsing history outside the job application workflow</li>
                  <li>• No demographic data without explicit per-field user review</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pillar 2: AI & Evidence Provenance */}
          <section aria-labelledby="ai-usage-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h2 id="ai-usage-heading" className="text-xl font-bold text-paper">
                2. How Your Career Data Is Used (Zero Hallucination Constraint)
              </h2>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <p className="text-xs text-fog leading-relaxed">
                NextJob enforces an inviolable architectural rule: every tailored sentence, bullet
                point, or cover letter statement generated by our AI Gateway **must trace directly
                to a verified CareerClaim ID**. If evidence cannot be found, generation is refused.
              </p>
              <div className="border-t border-zinc-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-paper">PII Redaction</span>
                  <p className="mt-1 text-fog">
                    Personal emails, phone numbers, and addresses are automatically redacted before
                    prompts reach LLM providers.
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-paper">No Public Model Training</span>
                  <p className="mt-1 text-fog">
                    We maintain zero-retention enterprise agreements with Anthropic, OpenAI, and
                    Google AI. Your resumes are never used to train foundation models.
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-paper">Audited Precedence</span>
                  <p className="mt-1 text-fog">
                    Policy precedence (Legal &gt; Platform &gt; NextJob &gt; Org &gt; User)
                    guarantees that sensitive demographic fields cannot be auto-submitted.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pillar 3: Retention Schedules */}
          <section aria-labelledby="retention-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h2 id="retention-heading" className="text-xl font-bold text-paper">
                3. Retention Schedules & Storage Durations
              </h2>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-fog">
                  <tr>
                    <th className="p-3">Data Category</th>
                    <th className="p-3">Storage Purpose</th>
                    <th className="p-3">Retention Window</th>
                    <th className="p-3">Deletion Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                  <tr>
                    <td className="p-3 font-semibold text-paper">Uploaded CVs & Evidence</td>
                    <td className="p-3 text-fog">CareerGraph construction & proof provenance</td>
                    <td className="p-3 text-paper">Duration of active account</td>
                    <td className="p-3 text-emerald-400 font-mono">Immediate on user delete</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-paper">Submission Receipts</td>
                    <td className="p-3 text-fog">Audit proof and tamper verification</td>
                    <td className="p-3 text-paper">Duration of active account</td>
                    <td className="p-3 text-emerald-400 font-mono">Immediate on user delete</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-paper">Temporal Workflow State</td>
                    <td className="p-3 text-fog">Orchestrating connector execution</td>
                    <td className="p-3 text-paper">14 days post-completion</td>
                    <td className="p-3 text-fog font-mono">Automated TTL purge</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-paper">Application Tracking Logs</td>
                    <td className="p-3 text-fog">Tracker UI & interview conversion metrics</td>
                    <td className="p-3 text-paper">Duration of active account</td>
                    <td className="p-3 text-emerald-400 font-mono">Immediate on user delete</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pillar 4: Cascading Hard Deletion */}
          <section aria-labelledby="deletion-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h2 id="deletion-heading" className="text-xl font-bold text-paper">
                4. Cascading Hard Deletion Process (No Ghost Records)
              </h2>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-3 text-xs text-fog">
              <p className="leading-relaxed">
                When you request account deletion through the Privacy Controls dashboard, NextJob
                triggers an immediate, synchronous cascading delete workflow:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                  <span className="font-semibold text-paper block mb-1">Step 1</span>
                  All CareerClaims, evidence pointers, and raw resume files purged from S3 storage.
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                  <span className="font-semibold text-paper block mb-1">Step 2</span>
                  Application records, submission receipts, and answers hard-deleted from Postgres.
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                  <span className="font-semibold text-paper block mb-1">Step 3</span>
                  Active sessions revoked, authentication identities severed, and tokens purged.
                </div>
                <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                  <span className="font-semibold text-paper block mb-1">Step 4</span>A
                  cryptographically verifiable deletion certificate is issued to you.
                </div>
              </div>
            </div>
          </section>

          {/* Pillar 5: Zero Data Sales Guarantee */}
          <section aria-labelledby="guarantee-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              <h2 id="guarantee-heading" className="text-xl font-bold text-paper">
                5. Zero Data Sales Guarantee
              </h2>
            </div>
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-6 space-y-2">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                Our Immutable Contract With Candidates
              </h3>
              <p className="text-xs text-paper/90 leading-relaxed">
                NextJob has never sold, rented, leased, or brokered personal data, and we never
                will. Our revenue is derived exclusively from software subscriptions (candidate
                Search Pass and institutional cohort licenses). We do not accept advertising,
                sponsor placement, or recruiter data-feed fees.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-fog">
          <span>Last updated: October 31, 2026 · Conforms to GDPR, CCPA & FR-TRUST-03</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-paper transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-paper transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
