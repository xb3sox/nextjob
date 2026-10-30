import { ChevronDown } from 'lucide-react';
import Reveal from '../Reveal';

const faqs = [
  {
    q: 'How is this different from other AI tools?',
    a: 'We only generate content from your verified profile — no hallucinated claims. We check eligibility before you apply, and every submission includes an immutable receipt.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Encryption at rest and in transit, never sold, exportable or deletable at any time. GDPR compliant.',
  },
  {
    q: "What if I'm an international candidate?",
    a: 'We check work authorization, sponsorship requirements, and location restrictions before showing you opportunities — no wasted applications.',
  },
];

export function FaqBlock() {
  return (
    <section className="py-24 px-6 border-t border-white/5 cwv-offscreen-section">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <h2 id="faq" className="font-display text-4xl mb-12 text-center scroll-mt-28">
            Questions
          </h2>
        </Reveal>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <Reveal key={item.q} delay={i * 80}>
              <details className="group rounded-xl border border-white/10 bg-white/[0.02] open:bg-white/[0.03] transition-colors">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="w-4 h-4 text-fog group-open:rotate-180 transition-transform shrink-0 ltr:ml-4 rtl:mr-4"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-6 pb-5 text-sm text-fog leading-relaxed">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
