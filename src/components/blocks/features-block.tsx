import { FileSearch, Lock, ShieldCheck } from 'lucide-react';
import Reveal from '../Reveal';
import { Card, CardContent } from '../ui/card';

const features = [
  {
    icon: <FileSearch className="w-5 h-5" aria-hidden="true" />,
    title: 'Evidence-backed',
    body: 'Every claim traces to verified proof from your profile. No invented experience, ever.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" aria-hidden="true" />,
    title: 'Eligibility first',
    body: 'We check work authorization, location, and hard requirements before you spend an application.',
  },
  {
    icon: <Lock className="w-5 h-5" aria-hidden="true" />,
    title: 'Verified receipts',
    body: 'Proof of exactly what was submitted. Hash-verified, immutable, exportable.',
  },
];

export function FeaturesBlock() {
  return (
    <section className="py-24 px-6 border-t border-white/5 cwv-offscreen-section">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="font-display text-4xl mb-4 text-center">Honest automation, end to end</h2>
          <p className="text-fog text-center mb-16 max-w-xl mx-auto">
            Most AI job tools hallucinate. NextJob is built so that can't happen.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <Card className="h-full border-white/10 bg-white/[0.02] hover:border-moss/25 hover:bg-moss/[0.03] transition-colors text-paper">
                <CardContent className="p-6">
                  <span className="inline-flex w-10 h-10 rounded-lg bg-moss/10 text-moss items-center justify-center mb-4">
                    {f.icon}
                  </span>
                  <h3 className="font-medium mb-2">{f.title}</h3>
                  <p className="text-sm text-fog leading-relaxed">{f.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
