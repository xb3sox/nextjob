export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="text-center">
      <Skeleton className="h-8 w-48 mx-auto mb-6" />
      <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
      <Skeleton className="h-16 w-2/3 mx-auto mb-6" />
      <Skeleton className="h-6 w-1/2 mx-auto mb-10" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-12 w-40 rounded-xl" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export function PricingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-6" />
      <Skeleton className="h-12 w-24 mb-6" />
      <div className="space-y-3 mb-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-4" />
        ))}
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-6" />
      <Skeleton className="h-4 w-32 mb-1" />
      <Skeleton className="h-3 w-24 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function FAQSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      <div className="px-6 py-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation Skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section Skeleton */}
          <section className="mb-20">
            <HeroSkeleton />
          </section>

          {/* Features Section Skeleton */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </section>

          {/* Pricing Section Skeleton */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
              <PricingCardSkeleton />
              <PricingCardSkeleton />
              <PricingCardSkeleton />
            </div>
          </section>

          {/* Testimonials Section Skeleton */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <TestimonialSkeleton />
              <TestimonialSkeleton />
              <TestimonialSkeleton />
            </div>
          </section>

          {/* FAQ Section Skeleton */}
          <section>
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              <FAQSkeleton />
              <FAQSkeleton />
              <FAQSkeleton />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
