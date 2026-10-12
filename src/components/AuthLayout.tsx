import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Shared split-screen shell for auth pages: brand panel on the left,
 * form card on the right. Keeps every auth screen visually identical and
 * keyboard/logic order predictable.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink text-paper grid lg:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep the form focused */}
      <aside className="hidden lg:flex flex-col justify-between p-12 border-r border-white/5 bg-panel relative overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.08),transparent_60%)]" />
        <Link to="/" className="relative flex items-center gap-2 text-sm font-semibold hover:opacity-90 transition-opacity">
          <span className="w-8 h-8 rounded-lg bg-moss-deep text-moss-dark flex items-center justify-center font-bold">N</span>
          NextJob
        </Link>
        <blockquote className="relative max-w-md">
          <p className="font-display text-3xl leading-snug mb-4">
            “Every claim in my applications traced back to something I actually did.”
          </p>
          <footer className="text-sm text-fog">
            Beta user · Senior Backend Engineer
          </footer>
        </blockquote>
        <ul className="relative space-y-2 text-sm text-fog">
          <li className="flex items-center gap-2"><Dot /> Evidence-backed applications</li>
          <li className="flex items-center gap-2"><Dot /> Eligibility checked before you apply</li>
          <li className="flex items-center gap-2"><Dot /> Immutable submission receipts</li>
        </ul>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-10 text-sm font-semibold">
            <span className="w-8 h-8 rounded-lg bg-moss-deep text-moss-dark flex items-center justify-center font-bold">N</span>
            NextJob
          </Link>
          <h1 className="font-display text-4xl mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-fog mb-8">{subtitle}</p>}
          {children}
          {footer && <div className="mt-8 text-sm text-fog text-center">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

function Dot() {
  return <span className="w-1.5 h-1.5 rounded-full bg-moss shrink-0" />;
}
