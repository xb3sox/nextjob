import { useState } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FaqBlockProps {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  className?: string;
}

export function FaqBlock({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about evidence-grounded applications.',
  items,
  className = '',
}: FaqBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`py-20 px-6 border-t border-white/5 ${className}`.trim()}>
      <div className="max-w-3xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="font-display text-4xl text-paper mb-3">{title}</h2>}
            {subtitle && <p className="text-fog max-w-xl mx-auto">{subtitle}</p>}
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="mkt-card bg-charcoal/40 border border-white/10 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-semibold text-paper hover:text-moss transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="text-moss text-xl leading-none transition-transform duration-200">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-fog leading-relaxed border-t border-white/5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqBlock;
