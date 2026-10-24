import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Waitlist signup form — the landing page's single conversion moment.
 * Owns its state end-to-end: validation, loading, success, and error,
 * with accessible wiring (aria-invalid / aria-describedby / live regions).
 */
export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setStatus('error');
      setErrorMessage('That doesn’t look like a valid email — check for typos.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Simulate API call — replace with POST /api/waitlist when T-52 backend lands.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong on our side. Please try again.');
    }
  };

  const busy = status === 'loading' || status === 'success';

  return (
    <div id="signup" className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="text"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setErrorMessage('');
            }
          }}
          placeholder="you@company.com"
          disabled={busy}
          className={`flex-1 px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-fog/70 focus:outline-none transition-colors ${
            status === 'error'
              ? 'border-danger/60 focus:border-danger'
              : 'border-white/10 focus:border-moss/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? 'email-error' : undefined}
        />
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-3 bg-moss-deep hover:bg-moss disabled:bg-moss-deep/50 disabled:cursor-not-allowed text-moss-dark font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
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
              Joining…
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Joined!
            </>
          ) : (
            <>
              Start free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {status === 'error' && errorMessage && (
        <p
          id="email-error"
          role="alert"
          className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger"
        >
          {errorMessage}
        </p>
      )}

      {status === 'success' && (
        <div
          role="status"
          className="mt-3 p-3 bg-moss/10 border border-moss/20 rounded-lg text-sm text-moss"
        >
          You’re on the list — we’ll email {email} when your spot opens.
        </div>
      )}
    </div>
  );
}
