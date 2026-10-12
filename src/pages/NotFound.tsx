import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-ink text-paper flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-8xl mb-4 text-moss">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-fog leading-relaxed">
            This page doesn't exist or has moved. Your applications and profile are
            still where you left them.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-moss-deep px-6 py-3 text-base font-medium text-moss-dark hover:bg-moss active:translate-y-px transition-colors"
          >
            <Home size={18} />
            Go home
          </a>

          <a
            href="/#how-it-works"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-3 text-base font-medium text-paper hover:bg-white/[0.05] active:translate-y-px transition-colors"
          >
            <Search size={18} />
            Explore features
          </a>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full rounded-lg px-6 py-2 text-sm font-medium text-fog hover:text-paper transition-colors"
          >
            <ArrowLeft size={16} />
            Go back to the previous page
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-sm text-fog">
            Looking for something specific?{' '}
            <a href="/#pricing" className="text-moss underline underline-offset-4 decoration-moss/40 hover:decoration-moss transition-colors">
              See pricing
            </a>{' '}
            or{' '}
            <a href="/#faq" className="text-moss underline underline-offset-4 decoration-moss/40 hover:decoration-moss transition-colors">
              read the FAQ
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
