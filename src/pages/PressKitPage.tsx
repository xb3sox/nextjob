import { ArrowLeft, Check, Download, FileText, Mail, Send, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PressKitPage() {
  const [formData, setFormData] = useState({
    name: '',
    outlet: '',
    email: '',
    inquiryType: 'Interview Request',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.outlet.trim()) {
      setStatus('error');
      setErrorMessage('Please specify your media outlet or publication.');
      return;
    }

    if (!formData.email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your work email address.');
      return;
    }

    if (!EMAIL_RE.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your inquiry message.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Simulated media desk endpoint submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('An unexpected error occurred while sending your message. Please try again.');
    }
  };

  const isBusy = status === 'loading' || status === 'success';

  return (
    <div className="min-h-screen bg-ink text-paper antialiased selection:bg-moss/30">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to main content
      </a>

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ink/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-fog hover:text-paper transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            <span>Back to NextJob</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-fog">
            <span className="hidden sm:inline">Media Desk:</span>
            <a
              href="mailto:press@nextjob.ai"
              className="text-moss hover:underline font-medium inline-flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              press@nextjob.ai
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-moss/30 bg-moss/10 text-moss text-xs font-medium mb-6">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Official Press & Brand Assets</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-paper mb-6">NextJob Press Kit</h1>
          <p className="text-fog text-lg md:text-xl max-w-3xl leading-relaxed mb-10">
            Official logos, brand guidelines, high-res product screenshots, and boilerplate
            information for journalists, publications, and media partners.
          </p>

          {/* Quick Action Download Buttons */}
          <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-12">
            <a
              href="/press-kit/logos/nextjob-logo-pack.zip"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-moss-deep hover:bg-moss text-moss-dark font-semibold text-sm transition-colors shadow-lg shadow-moss/10"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Logo Pack (.zip)
            </a>
            <a
              href="/press-kit/brand-guidelines.pdf"
              download
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/15 hover:border-white/30 text-paper font-medium text-sm transition-colors bg-white/[0.02]"
            >
              <FileText className="w-4 h-4 text-moss" aria-hidden="true" />
              Download Brand Guidelines (PDF)
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 text-fog hover:text-paper hover:border-white/20 text-sm font-medium transition-colors"
            >
              Media Contact Form
            </a>
          </div>

          {/* 1. Logo Pack Section */}
          <section
            id="logos"
            className="py-16 border-b border-white/10"
            aria-labelledby="logo-pack-heading"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 id="logo-pack-heading" className="font-display text-3xl text-paper mb-2">
                  Logo Pack & Vector Assets
                </h2>
                <p className="text-fog text-sm">
                  Official NextJob logos in dark and light variations. SVGs and PNGs included.
                </p>
              </div>
              <a
                href="/press-kit/logos/nextjob-logo-pack.zip"
                download
                className="text-xs text-moss hover:underline font-medium inline-flex items-center gap-1 self-start md:self-auto"
              >
                <span>Download all vector logos (.zip)</span>
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Dark Theme */}
              <div className="rounded-xl border border-white/10 bg-[#0A0D0E] p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-fog/70 mb-4 font-mono uppercase tracking-wider">
                    Dark Theme (Primary)
                  </div>
                  <div className="py-8 flex items-center justify-center border border-white/5 rounded-lg bg-black/40">
                    <img
                      src="/press-kit/logos/nextjob-logo-dark.svg"
                      alt="NextJob logo dark theme preview"
                      className="h-14 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5 text-xs text-fog">
                  <span>SVG / PNG (400x120)</span>
                  <div className="flex gap-3">
                    <a
                      href="/press-kit/logos/nextjob-logo-dark.svg"
                      download="nextjob-logo-dark.svg"
                      className="text-moss hover:underline font-medium"
                    >
                      SVG
                    </a>
                    <a
                      href="/press-kit/logos/nextjob-logo-dark.png"
                      download="nextjob-logo-dark.png"
                      className="text-moss hover:underline font-medium"
                    >
                      PNG
                    </a>
                  </div>
                </div>
              </div>

              {/* Logo Light Theme */}
              <div className="rounded-xl border border-white/10 bg-[#E9EDEA] p-6 flex flex-col justify-between text-ink">
                <div>
                  <div className="text-xs text-fog mb-4 font-mono uppercase tracking-wider">
                    Light Theme
                  </div>
                  <div className="py-8 flex items-center justify-center border border-black/10 rounded-lg bg-white">
                    <img
                      src="/press-kit/logos/nextjob-logo-light.svg"
                      alt="NextJob logo light theme preview"
                      className="h-14 w-auto object-contain"
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/10 text-xs text-ink/70">
                  <span>SVG / PNG (400x120)</span>
                  <div className="flex gap-3">
                    <a
                      href="/press-kit/logos/nextjob-logo-light.svg"
                      download="nextjob-logo-light.svg"
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      SVG
                    </a>
                    <a
                      href="/press-kit/logos/nextjob-logo-light.png"
                      download="nextjob-logo-light.png"
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      PNG
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Brand Guidelines Section */}
          <section
            id="brand-guidelines"
            className="py-16 border-b border-white/10"
            aria-labelledby="brand-guidelines-heading"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 id="brand-guidelines-heading" className="font-display text-3xl text-paper mb-2">
                  Brand Guidelines & Positioning
                </h2>
                <p className="text-fog text-sm">
                  Key specs, color palette, typography, and official company boilerplate.
                </p>
              </div>
              <a
                href="/press-kit/brand-guidelines.pdf"
                download="nextjob-brand-guidelines.pdf"
                className="text-xs text-moss hover:underline font-medium inline-flex items-center gap-1 self-start md:self-auto"
              >
                <span>Download Brand Guidelines (PDF)</span>
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Boilerplate Copy */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-paper mb-3">50-Word Boilerplate</h3>
                <p className="text-xs text-fog leading-relaxed italic">
                  &ldquo;NextJob is the truthful job search platform built on verifiable candidate
                  evidence. By checking hard eligibility before ranking and grounding every claim in
                  cryptographic submission receipts, NextJob eliminates AI hallucination and
                  restores candidate trust across modern ATS workflows.&rdquo;
                </p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-paper mb-3">100-Word Boilerplate</h3>
                <p className="text-xs text-fog leading-relaxed italic">
                  &ldquo;NextJob is transforming automated job discovery and application tailoring
                  with verifiable evidence provenance. Unlike legacy AI application tools that
                  invent candidate experience, NextJob enforces hard eligibility rules prior to
                  application ranking and guarantees zero claim hallucination. Every submission
                  generates an immutable, tamper-evident cryptographic receipt, providing job
                  seekers and hiring teams with unprecedented clarity, transparency, and trust in
                  the modern hiring process.&rdquo;
                </p>
              </div>
            </div>

            {/* Brand Colors Swatches */}
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-paper mb-4">Official Palette</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-[#0A0D0E] flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-full bg-[#34D399] mb-4 shadow-[0_0_12px_rgba(52,211,153,0.4)]" />
                  <div>
                    <div className="text-xs font-semibold text-paper">Moss</div>
                    <div className="text-[11px] font-mono text-moss">#34D399</div>
                    <div className="text-[10px] text-fog mt-1">Primary Accent</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0A0D0E] flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-full bg-[#0A0D0E] border border-white/20 mb-4" />
                  <div>
                    <div className="text-xs font-semibold text-paper">Ink</div>
                    <div className="text-[11px] font-mono text-fog">#0A0D0E</div>
                    <div className="text-[10px] text-fog mt-1">Background Surface</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0A0D0E] flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-full bg-[#E9EDEA] mb-4" />
                  <div>
                    <div className="text-xs font-semibold text-paper">Paper</div>
                    <div className="text-[11px] font-mono text-fog">#E9EDEA</div>
                    <div className="text-[10px] text-fog mt-1">Primary Typography</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#0A0D0E] flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-full bg-[#94A3B8] mb-4" />
                  <div>
                    <div className="text-xs font-semibold text-paper">Fog</div>
                    <div className="text-[11px] font-mono text-fog">#94A3B8</div>
                    <div className="text-[10px] text-fog mt-1">Secondary Text</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Usage rules */}
            <div className="grid md:grid-cols-2 gap-6 text-xs text-fog">
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-paper mb-2">Typography Rules</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Headings:</strong> Instrument Serif / Serif Display (tracking tight).
                  </li>
                  <li>
                    <strong>Body & UI:</strong> Figtree / System Sans-Serif (clean, highly legible).
                  </li>
                  <li>
                    <strong>Hashes & Receipts:</strong> Monospace (font-mono).
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-paper mb-2">Clear Space & Usage</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Maintain clear space equal to 1x height of the "N" emblem around logo.</li>
                  <li>Do not stretch, distort, or rotate brand marks.</li>
                  <li>Do not apply unapproved glow effects or unauthorized colors.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. High-Res Screenshots Section */}
          <section
            id="screenshots"
            className="py-16 border-b border-white/10"
            aria-labelledby="screenshots-heading"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 id="screenshots-heading" className="font-display text-3xl text-paper mb-2">
                  High-Resolution Product Screenshots
                </h2>
                <p className="text-fog text-sm">
                  High-res production screenshots for publication print or web inclusion.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Dashboard & Application Tracker',
                  filename: 'dashboard.png',
                  desc: 'Real-time application pipeline tracking with clear status indicators and receipts.',
                  path: '/press-kit/screenshots/dashboard.png',
                },
                {
                  title: 'AI Job Match & Eligibility Verification',
                  filename: 'job-match.png',
                  desc: 'Pre-flight eligibility analysis matching candidate claims against job criteria.',
                  path: '/press-kit/screenshots/job-match.png',
                },
                {
                  title: 'Evidence Provenance & Verification',
                  filename: 'evidence-verification.png',
                  desc: 'Detailed claim-by-claim verification showing exact career sources.',
                  path: '/press-kit/screenshots/evidence-verification.png',
                },
                {
                  title: 'Cryptographic Submission Receipt',
                  filename: 'submission-receipt.png',
                  desc: 'Hash-verified receipt confirming immutable payload submission to ATS.',
                  path: '/press-kit/screenshots/submission-receipt.png',
                },
              ].map((shot) => (
                <div
                  key={shot.filename}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:border-moss/30 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-white/5 bg-black/40">
                    <img
                      src={shot.path}
                      alt={`${shot.title} high-res screenshot preview`}
                      className="w-full h-48 object-cover rounded-lg border border-white/10"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-paper mb-1">{shot.title}</h3>
                      <p className="text-xs text-fog leading-relaxed mb-4">{shot.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                      <span className="text-fog/70 font-mono">PNG (800x450)</span>
                      <a
                        href={shot.path}
                        download={shot.filename}
                        className="inline-flex items-center gap-1.5 text-moss hover:underline font-medium"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        Download High-Res
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Media Contact Form Section */}
          <section id="contact" className="py-16" aria-labelledby="contact-heading">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 id="contact-heading" className="font-display text-3xl text-paper mb-3">
                  Media Contact & Inquiries
                </h2>
                <p className="text-fog text-sm leading-relaxed">
                  Have a media inquiry, interview request, or need custom assets? Submit our media
                  desk form below and our press team will respond within 24 hours.
                </p>
              </div>

              <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="media-name"
                        className="block text-xs font-medium text-fog mb-2"
                      >
                        Full Name <span className="text-moss">*</span>
                      </label>
                      <input
                        id="media-name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isBusy}
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-moss/50 rounded-lg text-sm text-paper placeholder:text-fog/50 focus:outline-none transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="media-outlet"
                        className="block text-xs font-medium text-fog mb-2"
                      >
                        Media Outlet / Publication <span className="text-moss">*</span>
                      </label>
                      <input
                        id="media-outlet"
                        name="outlet"
                        type="text"
                        required
                        value={formData.outlet}
                        onChange={handleChange}
                        disabled={isBusy}
                        placeholder="TechCrunch, Bloomberg, etc."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-moss/50 rounded-lg text-sm text-paper placeholder:text-fog/50 focus:outline-none transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="media-email"
                        className="block text-xs font-medium text-fog mb-2"
                      >
                        Work Email <span className="text-moss">*</span>
                      </label>
                      <input
                        id="media-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isBusy}
                        placeholder="reporter@publication.com"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-moss/50 rounded-lg text-sm text-paper placeholder:text-fog/50 focus:outline-none transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="media-inquiry-type"
                        className="block text-xs font-medium text-fog mb-2"
                      >
                        Inquiry Topic
                      </label>
                      <select
                        id="media-inquiry-type"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        disabled={isBusy}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-moss/50 rounded-lg text-sm text-paper focus:outline-none transition-colors disabled:opacity-50"
                      >
                        <option value="Interview Request" className="bg-ink text-paper">
                          Interview Request
                        </option>
                        <option value="Press Release Info" className="bg-ink text-paper">
                          Press Release / Fact Check
                        </option>
                        <option value="Custom Assets" className="bg-ink text-paper">
                          Custom Brand Assets
                        </option>
                        <option value="Speaking Request" className="bg-ink text-paper">
                          Speaking Request
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="media-message"
                      className="block text-xs font-medium text-fog mb-2"
                    >
                      Inquiry Details <span className="text-moss">*</span>
                    </label>
                    <textarea
                      id="media-message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isBusy}
                      placeholder="Please outline your story topic, deadline, and interview questions..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-moss/50 rounded-lg text-sm text-paper placeholder:text-fog/50 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  {status === 'error' && errorMessage && (
                    <div
                      role="alert"
                      className="p-3.5 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger flex items-center gap-2"
                    >
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {status === 'success' && (
                    <div
                      role="status"
                      className="p-4 bg-moss/10 border border-moss/20 rounded-lg text-xs text-moss flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        Inquiry received! Thank you {formData.name}. Our press team at
                        press@nextjob.ai will contact you shortly.
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full py-3.5 px-6 bg-moss-deep hover:bg-moss text-moss-dark font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting Inquiry…
                      </>
                    ) : status === 'success' ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" />
                        Inquiry Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Submit Media Inquiry
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-xs text-fog text-center">
        <p>
          © 2026 NextJob. All press assets protected. Need assistance? Contact press@nextjob.ai.
        </p>
      </footer>
    </div>
  );
}
