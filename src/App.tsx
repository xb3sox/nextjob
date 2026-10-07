export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NextJob</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Apply with Proof</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Evidence: Validation-ready
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Delivery: Build-ready
            </span>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            NextJob is a trustworthy AI career agent that converts verified career evidence into eligible, high-quality applications and measurable interview outcomes.
          </p>

          <div className="pt-2 space-y-2">
            <h2 className="text-sm font-semibold text-white">Documentation Package</h2>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">→</span>
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">nextjob/README.md</code>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">→</span>
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">nextjob/AGENTS.md</code>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">→</span>
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">nextjob/docs/PRD.md</code>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">→</span>
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">nextjob/docs/TECH.md</code>
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">→</span>
                <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">nextjob/docs/DESIGN.md</code>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white">Next Actions</h2>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">○</span>
              <span>Owner → Approve provisional technology stack → Signed-off TECH.md</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">○</span>
              <span>Owner → Define eligibility false-positive threshold → Approved threshold in PRD.md</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">○</span>
              <span>Owner → Commission tenant isolation penetration test → Report with no critical findings</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-600 text-center">
          Pre-implementation. Documentation package ready for review and approval.
        </p>
      </div>
    </div>
  );
}
