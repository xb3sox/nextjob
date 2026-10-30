import {
  Check,
  CheckCircle2,
  Copy,
  FileCheck,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import {
  OUTPUT_CATEGORIES,
  type OutputTabId,
  SAMPLE_COVER_LETTERS,
  SAMPLE_RECEIPTS,
  SAMPLE_RESUME_SNIPPETS,
} from './sample-outputs-data';

export interface SampleOutputsProps {
  id?: string;
  className?: string;
}

export function SampleOutputs({ id = 'sample-outputs', className = '' }: SampleOutputsProps) {
  const [activeTab, setActiveTab] = useState<OutputTabId>('receipts');
  const [selectedReceiptIndex, setSelectedReceiptIndex] = useState(0);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [selectedLetterIndex] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  const activeCategoryIndex = OUTPUT_CATEGORIES.findIndex((cat) => cat.id === activeTab);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') {
      const nextIdx = (activeCategoryIndex + 1) % OUTPUT_CATEGORIES.length;
      setActiveTab(OUTPUT_CATEGORIES[nextIdx].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIdx =
        (activeCategoryIndex - 1 + OUTPUT_CATEGORIES.length) % OUTPUT_CATEGORIES.length;
      setActiveTab(OUTPUT_CATEGORIES[prevIdx].id);
    } else if (e.key === 'Home') {
      setActiveTab(OUTPUT_CATEGORIES[0].id);
    } else if (e.key === 'End') {
      setActiveTab(OUTPUT_CATEGORIES[OUTPUT_CATEGORIES.length - 1].id);
    }
  };

  const copyHashToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Gracefully handle missing clipboard permissions in test runners
    }
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const currentReceipt = SAMPLE_RECEIPTS[selectedReceiptIndex] ?? SAMPLE_RECEIPTS[0];
  const currentSnippet = SAMPLE_RESUME_SNIPPETS[selectedSnippetIndex] ?? SAMPLE_RESUME_SNIPPETS[0];
  const currentLetter = SAMPLE_COVER_LETTERS[selectedLetterIndex] ?? SAMPLE_COVER_LETTERS[0];

  return (
    <section
      id={id}
      aria-labelledby="sample-outputs-heading"
      className={`py-20 px-6 max-w-5xl mx-auto ${className}`.trim()}
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/20 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Proof & Credibility Gallery</span>
        </div>
        <h2
          id="sample-outputs-heading"
          className="font-display text-3xl sm:text-4xl text-paper mb-4"
        >
          Real sample outputs, 100% redacted
        </h2>
        <p className="text-fog text-base leading-relaxed">
          Inspect authentic NextJob artifacts: immutable submission receipts, evidence-constrained
          resume tailoring, and grounded cover letters. Sensitive PII is completely redacted by
          default.
        </p>
      </div>

      {/* Security & PII Redaction Banner */}
      <div className="mb-8 p-4 rounded-xl border border-moss/30 bg-moss/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-moss/20 text-moss flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-semibold text-moss uppercase tracking-wider">
              100% PII & Sensitive Data Redacted
            </div>
            <p className="text-xs text-fog">
              Names, emails, phone numbers, addresses, and employer identifiers are automatically
              redacted (`[REDACTED_*]`) prior to display.
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-moss/10 text-moss border border-moss/25 inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-moss" aria-hidden="true" />
          <span>Privacy Guaranteed</span>
        </span>
      </div>

      {/* Main Gallery Container */}
      <div className="rounded-2xl border border-white/10 bg-panel/90 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Category Tab List */}
        <div
          role="tablist"
          aria-label="Sample output category navigation"
          className="flex border-b border-white/10 bg-white/[0.02] overflow-x-auto scrollbar-none"
        >
          {OUTPUT_CATEGORIES.map((category) => {
            const isSelected = activeTab === category.id;
            return (
              <button
                key={category.id}
                role="tab"
                type="button"
                id={`output-tab-${category.id}`}
                aria-selected={isSelected}
                aria-controls={`output-panel-${category.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(category.id)}
                onKeyDown={handleKeyDown}
                className={`flex-1 min-w-[200px] px-5 py-4 text-left transition-colors flex flex-col gap-1 border-r border-white/5 last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-inset ${
                  isSelected
                    ? 'bg-moss/[0.06] border-b-2 border-b-moss'
                    : 'hover:bg-white/[0.03] text-fog'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${isSelected ? 'text-moss' : 'text-fog/70'}`}
                  >
                    {category.badge}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-fog/60">
                    Sample
                  </span>
                </div>
                <div
                  className={`text-sm font-medium truncate ${isSelected ? 'text-paper' : 'text-fog'}`}
                >
                  {category.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="p-6 sm:p-8 min-h-[420px]">
          {/* TAB 1: SUBMISSION RECEIPTS */}
          {activeTab === 'receipts' && (
            <div
              id="output-panel-receipts"
              role="tabpanel"
              aria-labelledby="output-tab-receipts"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-paper flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-moss" aria-hidden="true" />
                    Verified Submission Receipt Output
                  </h3>
                  <p className="text-xs text-fog mt-1">
                    Generated automatically upon ATS response. Immutable sha256 fingerprint
                    guarantees payload integrity.
                  </p>
                </div>
                {/* Selector for multiple receipt samples */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fog">Sample:</span>
                  <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                    {SAMPLE_RECEIPTS.map((r, idx) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedReceiptIndex(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          selectedReceiptIndex === idx
                            ? 'bg-moss text-ink font-semibold'
                            : 'text-fog hover:text-paper'
                        }`}
                      >
                        Sample #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Receipt Visualizer Box */}
              <div className="rounded-xl border border-white/10 bg-ink p-5 space-y-4 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-fog">Receipt ID:</span>
                    <span className="text-paper font-semibold">{currentReceipt.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-moss/20 text-moss text-[11px] font-semibold border border-moss/30">
                    STATUS: SUBMITTED_VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-fog">Job Role: </span>
                    <span className="text-paper font-medium">{currentReceipt.jobTitle}</span>
                  </div>
                  <div>
                    <span className="text-fog">Target Company: </span>
                    <span className="text-moss font-medium">{currentReceipt.companyName}</span>
                  </div>
                  <div>
                    <span className="text-fog">ATS Connector: </span>
                    <span className="text-paper">{currentReceipt.atsName}</span>
                  </div>
                  <div>
                    <span className="text-fog">Timestamp (UTC): </span>
                    <span className="text-paper">{currentReceipt.submittedAt}</span>
                  </div>
                </div>

                {/* Candidate Info - Redacted */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="text-[11px] text-fog/70 uppercase tracking-wider mb-1 font-semibold">
                    Redacted Candidate Identity
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fog">Candidate Name:</span>
                    <span className="text-moss font-semibold">{currentReceipt.candidateName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fog">Candidate Email:</span>
                    <span className="text-moss font-semibold">{currentReceipt.candidateEmail}</span>
                  </div>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="p-3 rounded-lg bg-moss/[0.05] border border-moss/20 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-moss uppercase tracking-wider mb-0.5">
                      Canonical Payload SHA-256 Hash
                    </div>
                    <div className="text-moss truncate text-xs font-semibold">
                      {currentReceipt.sha256Hash}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyHashToClipboard(currentReceipt.sha256Hash)}
                    aria-label="Copy SHA-256 hash"
                    className="p-1.5 rounded bg-moss/10 hover:bg-moss/20 text-moss transition-colors shrink-0"
                  >
                    {copiedHash ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Field-level sha256 hashes */}
                <div>
                  <div className="text-[11px] text-fog uppercase tracking-wider mb-2">
                    Per-Field SHA-256 Hash Verification ({currentReceipt.verifiedFieldsCount} Fields
                    Verified, {currentReceipt.unsupportedClaimsCount} Unsupported)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentReceipt.fieldHashes.map((fh) => (
                      <div
                        key={fh.fieldName}
                        className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-fog">{fh.fieldName}:</span>
                        <span className="text-moss font-mono">{fh.hashSnippet} ✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAILORED RESUME SNIPPETS */}
          {activeTab === 'resume' && (
            <div
              id="output-panel-resume"
              role="tabpanel"
              aria-labelledby="output-tab-resume"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-paper flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-moss" aria-hidden="true" />
                    Evidence-Constrained Resume Tailoring
                  </h3>
                  <p className="text-xs text-fog mt-1">
                    Compares raw unoptimized claims against provenance-backed tailored bullets. Zero
                    fabricated claims allowed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fog">Sample:</span>
                  <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                    {SAMPLE_RESUME_SNIPPETS.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSnippetIndex(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          selectedSnippetIndex === idx
                            ? 'bg-moss text-ink font-semibold'
                            : 'text-fog hover:text-paper'
                        }`}
                      >
                        {s.roleTarget.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Redacted Candidate Header */}
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-fog">Target Role: </span>
                  <span className="text-paper font-semibold">{currentSnippet.roleTarget}</span>
                </div>
                <div className="flex items-center gap-3 text-moss font-mono text-[11px]">
                  <span>{currentSnippet.candidateInfo.name}</span>
                  <span>•</span>
                  <span>{currentSnippet.candidateInfo.email}</span>
                  <span>•</span>
                  <span>{currentSnippet.candidateInfo.location}</span>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="rounded-xl border border-white/10 bg-ink overflow-hidden space-y-4 p-5">
                <div>
                  <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-1">
                    Raw / Untailored Input Bullet
                  </div>
                  <div className="p-3.5 rounded-lg bg-red-500/[0.04] border border-red-500/10 text-xs text-fog line-through leading-relaxed">
                    {currentSnippet.rawBullet}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-moss uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evidence-Constrained Tailored Output
                    </span>
                    <span className="text-[10px] text-moss font-mono lowercase">
                      Evidence Source: {currentSnippet.evidenceSource}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-moss/[0.06] border border-moss/30 text-xs text-paper font-medium leading-relaxed">
                    {currentSnippet.tailoredBullet}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-fog">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-moss" />
                    Provenance Link:{' '}
                    <code className="text-moss font-mono">{currentSnippet.claimId}</code>
                  </span>
                  <span className="text-[11px] text-fog/70">100% Truthful Provenance Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COVER LETTER EXAMPLES */}
          {activeTab === 'cover-letter' && (
            <div
              id="output-panel-cover-letter"
              role="tabpanel"
              aria-labelledby="output-tab-cover-letter"
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-paper flex items-center gap-2">
                    <FileText className="w-5 h-5 text-moss" aria-hidden="true" />
                    Grounded Cover Letter Output Example
                  </h3>
                  <p className="text-xs text-fog mt-1">
                    Excerpt of generated cover letter with inline evidence reference markers.
                    Contact details redacted.
                  </p>
                </div>
              </div>

              {/* Cover Letter Document Preview */}
              <div className="rounded-xl border border-white/10 bg-ink p-6 space-y-4 font-sans text-xs">
                {/* Redacted Contact Header */}
                <div className="border-b border-white/10 pb-4 space-y-1 font-mono text-[11px] text-fog">
                  <div className="text-paper font-semibold">
                    {currentLetter.candidateContact.fullName}
                  </div>
                  <div>
                    {currentLetter.candidateContact.email} • {currentLetter.candidateContact.phone}
                  </div>
                  <div>{currentLetter.candidateContact.address}</div>
                </div>

                <div className="text-fog font-medium">{currentLetter.salutation}</div>

                <div className="space-y-3 text-paper leading-relaxed text-xs">
                  {currentLetter.bodyParagraphs.map((para) => (
                    <p key={para.slice(0, 30)}>{para}</p>
                  ))}
                </div>

                {/* Evidence Linkage Footer */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-fog">Grounded Claim References:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentLetter.groundedClaimIds.map((cid) => (
                        <span
                          key={cid}
                          className="px-2 py-0.5 rounded bg-moss/10 text-moss font-mono text-[10px] border border-moss/20"
                        >
                          {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-moss font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 0 Unsupported Statements
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SampleOutputs;
