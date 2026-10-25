import { ArrowRight, Check } from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
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
          className={`flex-1 px-4 py-3 bg-white/5 border rounded-lg text-white placeholder:text-white/40 focus:outline-none transition-colors ${
            status === 'error'
              ? 'border-red-500/60 focus:border-red-500'
              : 'border-white/10 focus:border-emerald-500/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-invalid={status === 'error'}
          aria-describedby={status === 'error' ? 'email-error' : undefined}
        />
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {status === 'loading' ? (
            'Joining…'
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
          className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
        >
          {errorMessage}
        </p>
      )}

      {status === 'success' && (
        <div
          role="status"
          className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400"
        >
          You’re on the list — we’ll email {email} when your spot opens.
        </div>
      )}
    </div>
  );
}
