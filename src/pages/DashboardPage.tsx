import { ClipboardCheck, FileText, LogOut, Search, Zap } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Post-login app shell. The full product surfaces (profile import, jobs,
 * tracker) land in T-07/T-08/T-15/T-27; this page proves the authenticated
 * session end-to-end and gives users a real destination after sign-in.
 */
export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'there';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Zap className="w-5 h-5 text-moss" aria-hidden="true" />
            NextJob
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-fog truncate max-w-48">{user.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm text-fog hover:text-paper transition-colors"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-display text-5xl mb-3">Welcome, {displayName}.</h1>
        <p className="text-fog mb-12 max-w-xl">
          Your account is live. Set up your verified profile below and NextJob will start finding
          eligible roles and drafting evidence-backed applications.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <NextCard
            step="1"
            icon={<FileText className="w-5 h-5" aria-hidden="true" />}
            title="Import your profile"
            body="Upload a resume — we extract claims and keep provenance for every one."
            cta="Start import"
            disabled
          />
          <NextCard
            step="2"
            icon={<Search className="w-5 h-5" aria-hidden="true" />}
            title="Discover eligible jobs"
            body="Matching filters on work authorization, location, and requirements first."
            cta="Coming soon"
            disabled
          />
          <NextCard
            step="3"
            icon={<ClipboardCheck className="w-5 h-5" aria-hidden="true" />}
            title="Track applications"
            body="Every submission gets an immutable receipt. Every outcome feeds learning."
            cta="Coming soon"
            disabled
          />
        </div>

        <p className="mt-10 text-xs text-fog/70">
          You’re signed in with a verified session (email confirmed). Profile import and job
          discovery are the next milestones — see TASKS.md T-07 / T-08.
        </p>
      </main>
    </div>
  );
}

function NextCard({
  step,
  icon,
  title,
  body,
  cta,
  disabled,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="w-9 h-9 rounded-lg bg-moss/10 text-moss flex items-center justify-center">
          {icon}
        </span>
        <span className="text-xs text-fog tnum">Step {step}</span>
      </div>
      <h2 className="font-medium mb-1.5">{title}</h2>
      <p className="text-sm text-fog leading-relaxed flex-1">{body}</p>
      <span
        className={`mt-4 inline-flex text-sm font-medium ${
          disabled
            ? 'text-fog/50 cursor-not-allowed'
            : 'text-moss hover:text-paper transition-colors'
        }`}
        aria-disabled={disabled}
      >
        {cta} →
      </span>
    </div>
  );
}
