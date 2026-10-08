import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-white/60">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Home size={18} />
            Go Home
          </a>

          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-3 text-base font-medium text-white hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </a>

          <a
            href="/#features"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-white/[0.02] px-6 py-3 text-base font-medium text-white hover:bg-white/[0.05] transition-colors"
          >
            <Search size={18} />
            Explore Features
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-sm text-white/40">
            Looking for something specific?{' '}
            <a href="/#pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Check our pricing
            </a>{' '}
            or{' '}
            <a href="/#b2b" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              B2B solutions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
