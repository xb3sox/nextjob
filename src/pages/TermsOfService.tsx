import { useState } from 'react';
import { ArrowLeft, Shield, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className={`text-sm ${textSubtle}`}>Last updated: January 15, 2026</p>
        </div>

        <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-8 mb-8`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
              <FileText className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to NextJob</h2>
              <p className={textMuted}>
                These terms govern your use of NextJob's AI career agent platform. By using our service, 
                you agree to these terms. Please read them carefully.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                NextJob is an AI-powered career agent that helps you:
              </p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-1 shrink-0" />
                  <span>Build a verified career graph from your CV and experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-1 shrink-0" />
                  <span>Discover job opportunities that match your qualifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-1 shrink-0" />
                  <span>Generate tailored applications with verified evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-1 shrink-0" />
                  <span>Track applications and outcomes</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Account Registration</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>To use NextJob, you must:</p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Provide accurate and complete information during registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Maintain the security of your account credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Notify us immediately of any unauthorized access</span>
                </li>
              </ul>
              <p className={`text-sm ${textSubtle} mt-4`}>
                You are responsible for all activities that occur under your account.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="text-emerald-400" size={20} />
                You May:
              </h3>
              <ul className={`space-y-2 ${textMuted} mb-6`}>
                <li>Use NextJob for legitimate job search purposes</li>
                <li>Upload your own career information and documents</li>
                <li>Generate applications based on your verified experience</li>
                <li>Export your data at any time</li>
              </ul>

              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                You May Not:
              </h3>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Submit false or misleading information about your qualifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Use the service to harass, discriminate, or violate others' rights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Attempt to reverse engineer or compromise our systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Use automated tools to scrape or abuse the service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Share your account credentials with others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Use the service for any illegal purpose</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. AI-Generated Content</h2>
            <div className={`rounded-xl border border-amber-500/20 bg-amber-500/5 p-6`}>
              <AlertTriangle className="text-amber-400 mb-3" size={24} />
              <h3 className="font-semibold mb-3 text-amber-400">Important Notice</h3>
              <p className={textMuted}>
                NextJob uses AI to help generate application content. While we strive for accuracy:
              </p>
              <ul className={`space-y-2 ${textMuted} mt-3`}>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>You are responsible for reviewing all AI-generated content before submission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>We only generate content based on information you provide and verify</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>You must ensure all applications are truthful and accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>We are not liable for decisions made based on AI-generated content</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscriptions and Billing</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <h3 className="font-semibold mb-3">Free Tier</h3>
              <p className={`${textMuted} mb-4`}>
                Our free tier includes limited features. No credit card required.
              </p>

              <h3 className="font-semibold mb-3">Paid Plans</h3>
              <ul className={`space-y-2 ${textMuted} mb-4`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Subscriptions are billed monthly or annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>You can cancel anytime from your account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Refunds are provided for unused portions of annual subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Prices may change with 30 days notice</span>
                </li>
              </ul>
              <p className={`text-sm ${textSubtle}`}>
                Payment processing is handled by Stripe. We never store your payment information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <h3 className="font-semibold mb-3">Your Content</h3>
              <p className={`${textMuted} mb-4`}>
                You retain all rights to your career data, CV, and personal information. 
                By using NextJob, you grant us a limited license to:
              </p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li>Process your data to provide the service</li>
                <li>Generate applications based on your information</li>
                <li>Store your data securely while your account is active</li>
              </ul>

              <h3 className="font-semibold mb-3 mt-6">Our Content</h3>
              <p className={textMuted}>
                NextJob's platform, algorithms, designs, and documentation are protected by intellectual property laws. 
                You may not copy, modify, or distribute our proprietary technology.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                To the maximum extent permitted by law:
              </p>
              <ul className={`space-y-2 ${textMuted}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>NextJob is provided "as is" without warranties of any kind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>We are not liable for any indirect, incidental, or consequential damages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Our total liability is limited to the amount you paid in the last 12 months</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>We are not responsible for job offers, rejections, or employment outcomes</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <h3 className="font-semibold mb-3">You May Terminate</h3>
              <p className={`${textMuted} mb-4`}>
                You can delete your account at any time from your account settings. 
                All your data will be permanently deleted within 30 days.
              </p>

              <h3 className="font-semibold mb-3">We May Terminate</h3>
              <p className={textMuted}>
                We may suspend or terminate your account if you violate these terms, 
                engage in fraudulent activity, or fail to pay subscription fees. 
                We'll provide notice when possible.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Dispute Resolution</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                Any disputes arising from these terms or your use of NextJob will be resolved through:
              </p>
              <ol className={`space-y-2 ${textMuted} list-decimal list-inside`}>
                <li>Good faith negotiation between you and NextJob</li>
                <li>Mediation by a mutually agreed-upon mediator</li>
                <li>Binding arbitration in accordance with applicable laws</li>
              </ol>
              <p className={`text-sm ${textSubtle} mt-4`}>
                These terms are governed by the laws of the jurisdiction where NextJob is incorporated.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={textMuted}>
                We may update these terms from time to time. We'll notify you of material changes via:
              </p>
              <ul className={`space-y-2 ${textMuted} mt-3`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Email notification to your registered email address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>In-app notification when you next log in</span>
                </li>
              </ul>
              <p className={`${textMuted} mt-4`}>
                Continued use of NextJob after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <div className={`rounded-xl border ${cardBorder} ${cardBg} p-6`}>
              <p className={`${textMuted} mb-4`}>
                If you have questions about these terms, contact us at:
              </p>
              <div className="space-y-2">
                <p className={textMuted}>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@nextjob.ai" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    legal@nextjob.ai
                  </a>
                </p>
                <p className={textMuted}>
                  <strong>Privacy inquiries:</strong>{' '}
                  <a href="mailto:privacy@nextjob.ai" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                    privacy@nextjob.ai
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className={`mt-12 pt-8 border-t ${cardBorder} text-center`}>
          <p className={`text-sm ${textSubtle}`}>
            © 2026 NextJob. All rights reserved. | 
            <a href="/privacy" className="text-emerald-400 hover:text-emerald-300 ml-2 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
