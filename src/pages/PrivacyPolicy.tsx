import { useState } from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, Download, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const [darkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const bg = darkMode ? 'bg-slate-950' : 'bg-white';
  const text = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-300' : 'text-slate-600';
  const textSubtle = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-900/40' : 'bg-slate-50';
  const cardBorder = darkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Header */}
      <header className={`border-b ${cardBorder} ${darkMode ? 'bg-slate-950/95' : 'bg-white/95'} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              Back to Home
            </a>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Shield size={18} className="text-slate-900" />
              </div>
              <span className="text-lg font-bold">NextJob</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className={`text-sm ${textSubtle}`}>Last updated: January 15, 2026</p>
        </div>

        <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-8 mb-8`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
              <Shield className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Our Commitment to Your Privacy</h2>
              <p className={textMuted}>
                At NextJob, we believe your career data is deeply personal. We're committed to protecting your privacy 
                and being transparent about how we handle your information.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="text-emerald-400" size={24} />
              What We Collect
            </h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <h3 className="font-semibold mb-3">We Collect:</h3>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Account Information:</strong> Email address, name, and authentication credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Career Data:</strong> CV/resume content, work history, skills, education, and certifications that you upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Application Data:</strong> Job applications you create through our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Usage Data:</strong> How you interact with our service (pages visited, features used)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Technical Data:</strong> IP address, browser type, device information</span>
                </li>
              </ul>
            </div>

            <div className={`rounded-xl border border-red-500/20 bg-red-500/5 p-6 mt-4`}>
              <h3 className="font-semibold mb-3 text-red-400">We Never Collect:</h3>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Social security numbers or government IDs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Financial information (we use Stripe for payments)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Health or disability information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Protected characteristics (race, religion, sexual orientation)</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="text-emerald-400" size={24} />
              How We Use Your Data
            </h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <ul className={`space-y-3 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">→</span>
                  <span><strong>Provide our service:</strong> Process your CV, match you with jobs, generate applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">→</span>
                  <span><strong>Improve our product:</strong> Analyze usage patterns to enhance features (anonymized)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">→</span>
                  <span><strong>Communicate with you:</strong> Send important updates about your account or service changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">→</span>
                  <span><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and technical issues</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="text-emerald-400" size={24} />
              Data Security
            </h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Encryption:</strong> All data encrypted at rest and in transit (TLS 1.3)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Access Controls:</strong> Strict authentication and authorization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Regular Audits:</strong> Security assessments and penetration testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span><strong>Minimal Access:</strong> Only essential personnel can access your data</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`rounded-xl border ${cardBorder} ${cardBg} p-5`}>
                <Download className="text-emerald-400 mb-2" size={20} />
                <h3 className="font-semibold mb-2">Export Your Data</h3>
                <p className={`text-sm ${textMuted}`}>
                  Download all your data in a machine-readable format at any time
                </p>
              </div>
              <div className={`rounded-xl border ${cardBorder} ${cardBg} p-5`}>
                <Trash2 className="text-emerald-400 mb-2" size={20} />
                <h3 className="font-semibold mb-2">Delete Your Account</h3>
                <p className={`text-sm ${textMuted}`}>
                  Permanently delete your account and all associated data
                </p>
              </div>
              <div className={`rounded-xl border ${cardBorder} ${cardBg} p-5`}>
                <Eye className="text-emerald-400 mb-2" size={20} />
                <h3 className="font-semibold mb-2">View Your Data</h3>
                <p className={`text-sm ${textMuted}`}>
                  See exactly what data we have stored about you
                </p>
              </div>
              <div className={`rounded-xl border ${cardBorder} ${cardBg} p-5`}>
                <Lock className="text-emerald-400 mb-2" size={20} />
                <h3 className="font-semibold mb-2">Restrict Processing</h3>
                <p className={`text-sm ${textMuted}`}>
                  Limit how we use your data for specific purposes
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <div className={`rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6`}>
              <h3 className="font-semibold mb-3 text-emerald-400">We Never Sell Your Data</h3>
              <p className={textMuted}>
                We will never sell, rent, or share your personal data with third parties for advertising or marketing purposes. 
                Your career data is yours alone.
              </p>
            </div>

            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6 mt-4`}>
              <h3 className="font-semibold mb-3">Limited Third-Party Sharing</h3>
              <p className={`${textMuted} mb-3`}>
                We only share data with trusted service providers who help us operate our service:
              </p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong>Payment Processing:</strong> Stripe (for subscription billing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong>Cloud Infrastructure:</strong> AWS and Vercel (for hosting and storage)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span><strong>Analytics:</strong> PostHog (anonymized usage analytics)</span>
                </li>
              </ul>
              <p className={`text-sm ${textSubtle} mt-3`}>
                All third-party providers are contractually obligated to protect your data and comply with GDPR.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <ul className={`space-y-3 ${textMuted}`}>
                <li>
                  <strong>Account Data:</strong> Retained while your account is active
                </li>
                <li>
                  <strong>Career Data:</strong> Retained while your account is active, deleted within 30 days of account deletion
                </li>
                <li>
                  <strong>Application History:</strong> Retained for 2 years after account deletion (for dispute resolution)
                </li>
                <li>
                  <strong>Analytics Data:</strong> Anonymized after 90 days, retained indefinitely in anonymized form
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Some data may be retained longer if required by law
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                If you have questions about this privacy policy or want to exercise your rights, contact us:
              </p>
              <div className="flex items-center gap-3">
                <Mail className="text-emerald-400" size={20} />
                <a href="mailto:privacy@nextjob.ai" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  privacy@nextjob.ai
                </a>
              </div>
              <p className={`text-sm ${textSubtle} mt-4`}>
                We'll respond to all privacy-related inquiries within 30 days.
              </p>
            </div>
          </section>
        </div>

        <div className={`mt-12 pt-8 border-t ${cardBorder} text-center`}>
          <p className={`text-sm ${textSubtle}`}>
            © 2026 NextJob. All rights reserved. | 
            <a href="/terms" className="text-emerald-400 hover:text-emerald-300 ml-2 transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
