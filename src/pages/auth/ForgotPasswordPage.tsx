import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, Check, Mail } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { status, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) setError(result.error);
    else setSent(true);
  };

  return (
    <AuthLayout
      title={sent ? 'Check your email' : 'Reset your password'}
      subtitle={sent ? undefined : "Enter the email on your account and we'll send you a reset link."}
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="text-moss hover:text-paper transition-colors font-medium">Back to sign in</Link>
        </>
      }
    >
      {sent ? (
        <div className="flex items-start gap-3 rounded-lg border border-moss/30 bg-moss/5 px-4 py-4 text-sm text-paper">
          <Mail className="w-5 h-5 text-moss shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            The link expires in one hour.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input
              id="forgot-email" type="email" autoComplete="email" required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-fog/70 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/30 transition-colors"
            />
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-moss-deep hover:bg-moss disabled:opacity-60 disabled:cursor-not-allowed text-moss-dark font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-moss-dark/30 border-t-moss-dark animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Check className="w-4 h-4" aria-hidden="true" />
            )}
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
