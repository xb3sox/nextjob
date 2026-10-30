# Content Blocks Library Documentation

> **FR-CONT-03 Specification**
> Reusable content blocks library: hero variants, feature sections, testimonials, pricing, FAQ, and CTA sections; fully documented with usage guidelines, component props, design token integration, and messaging alignment.

---

## Overview

The NextJob Content Block Library provides production-grade, reusable UI sections engineered for marketing and product landing pages. Every content block strictly enforces:
- **Design Token Compliance:** Integrates with `.mkt-card`, `.mkt-badge`, `.mkt-btn-primary`, and `.mkt-btn-outline` design tokens.
- **Dark Theme Palette:** Native `#0a0a0a` background, paper typography (`#f4f5f4`), fog text (`#9da39a`), and moss accent (`#4ade80`).
- **WCAG 2.2 AA Accessibility:** Full keyboard navigation, semantic HTML landmarks (`<section>`, `<figure>`, `<header>`), and visible focus rings.
- **Messaging Alignment:** Directly maps to the 5 Core Value Pillars in `docs/marketing/messaging-hierarchy.md`.

---

## 1. HeroBlock

Reusable hero section supporting multiple narrative entry points, customizable call-to-action buttons, note trust markers, and preview node mounts.

### Variants
- `'default'`: Primary brand landing hero.
- `'direct'`: Outcome and callback focus.
- `'minimal'`: Ultra-clean single-headline approach.
- `'split'`: 2-column layout with content on left and interactive preview on right.

### Component Props (`HeroBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'direct' \| 'minimal' \| 'split'` | `'default'` | Layout and headline preset |
| `badge` | `string` | `'Now in private beta'` | Top pill badge text |
| `headline` | `ReactNode` | Preset headline | Main H1 text |
| `subhead` | `string` | Preset subhead | Supporting copy |
| `primaryCta` | `HeroBlockCta` | `{ label: 'Start free', href: '/signup' }` | Main CTA button |
| `secondaryCta` | `HeroBlockCta` | `{ label: 'Join waitlist', href: '#waitlist' }` | Secondary action |
| `note` | `string` | `'Free while in beta · No credit card required'` | Micro trust copy |
| `preview` | `ReactNode` | `undefined` | Embedded demo or image preview |
| `align` | `'center' \| 'left'` | `'center'` | Text alignment |

### Code Example
```tsx
import { HeroBlock } from '@/components/marketing/blocks';

export function LandingHero() {
  return (
    <HeroBlock
      variant="minimal"
      badge="Evidence-Based Career Platform"
      headline={<>Apply to jobs with <em className="not-italic text-moss">proof</em>, not promises.</>}
      subhead="Verified experience, automatic eligibility checks, and evidence-backed applications."
      primaryCta={{ label: 'Start free — create account', href: '/signup' }}
      secondaryCta={{ label: 'See how it works', href: '#demo' }}
      note="No credit card required · 100% candidate-owned evidence"
    />
  );
}
```

---

## 2. FeatureBlock

Grid section displaying key feature cards with custom icons, badges, and benefit descriptions.

### Component Props (`FeatureBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `undefined` | Section H2 heading |
| `subtitle` | `string` | `undefined` | Subtitle paragraph |
| `features` | `FeatureCardItem[]` | Required | Array of feature items |
| `columns` | `2 \| 3 \| 4` | `3` | Responsive grid columns |

### Code Example
```tsx
import { FeatureBlock } from '@/components/marketing/blocks';
import { ShieldCheck, Zap, FileCheck } from 'lucide-react';

export function CoreFeatures() {
  return (
    <FeatureBlock
      title="Honest automation, end to end"
      subtitle="From profile extraction to direct ATS submission, every step is verifiable."
      columns={3}
      features={[
        {
          icon: <ShieldCheck className="w-5 h-5" />,
          title: 'Evidence Provenance',
          description: 'Every statement in your tailored resume traces back to a verified CareerClaim.',
          badge: '100% Grounded',
        },
        {
          icon: <Zap className="w-5 h-5" />,
          title: 'Eligibility Engine',
          description: 'Evaluate work authorization, location, and required skills before applying.',
          badge: '≤2% False Positive',
        },
        {
          icon: <FileCheck className="w-5 h-5" />,
          title: 'Cryptographic Receipts',
          description: 'Receive an immutable SHA-256 hash of all submitted questions and answers.',
          badge: 'Verifiable',
        },
      ]}
    />
  );
}
```

---

## 3. TestimonialBlock

Social proof grid showcasing candidate feedback, roles, companies, and verified claim badges.

### Component Props (`TestimonialBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Trusted by Engineers and Leaders'` | Section H2 heading |
| `subtitle` | `string` | `'See how job seekers use evidence-grounded applications...'` | Subtitle copy |
| `testimonials` | `TestimonialBlockItem[]` | Required | Array of testimonial objects |
| `columns` | `1 \| 2 \| 3` | `3` | Grid column layout |

### Code Example
```tsx
import { TestimonialBlock } from '@/components/marketing/blocks';

export function TestimonialsSection() {
  return (
    <TestimonialBlock
      title="Proven outcomes for technical candidates"
      columns={2}
      testimonials={[
        {
          quote: "NextJob eliminated ATS rejections caused by keyword mismatch without lying about my experience.",
          author: "Alex Rivera",
          role: "Senior Distributed Systems Engineer",
          company: "CloudScale",
          verifiedClaim: "10+ YOE in Go & Rust",
        },
        {
          quote: "Having cryptographic receipts for every submission gives me total confidence in my job search.",
          author: "Priya Sharma",
          role: "Staff Frontend Architect",
          company: "DataPulse",
          verifiedClaim: "Lead Architect at Scale",
        },
      ]}
    />
  );
}
```

---

## 4. PricingBlock

Multi-tier pricing cards showcasing plans, billing cadences, feature lists, and highlighted popular choices.

### Component Props (`PricingBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Simple, Transparent Pricing'` | Section H2 title |
| `subtitle` | `string` | `'No hidden fees, no credit traps...'` | Section subtitle |
| `plans` | `PricingPlan[]` | Required | Array of pricing plans |
| `note` | `string` | Trust footer note | Micro-copy below plans |

### Code Example
```tsx
import { PricingBlock } from '@/components/marketing/blocks';

export function PricingSection() {
  return (
    <PricingBlock
      plans={[
        {
          id: 'free',
          name: 'Free Tier',
          price: '$0',
          description: 'Build your profile, discover jobs, and verify career claims.',
          features: ['Career graph import', 'Eligibility checks', '3 tailored applications'],
          ctaLabel: 'Get Started Free',
          ctaHref: '/signup',
        },
        {
          id: 'search-pass',
          name: 'Search Pass',
          price: '$39',
          period: '/ 30 days',
          description: 'Full matching, unlimited tailoring, and submission receipts.',
          features: ['Unlimited tailored resumes', 'Cryptographic receipts', 'Priority ATS connectors', 'Real-time tracker'],
          ctaLabel: 'Start Search Pass',
          ctaHref: '/signup?plan=search-pass',
          isPopular: true,
        },
      ]}
    />
  );
}
```

---

## 5. FaqBlock

Interactive accordion list for addressing common candidate objections, technical details, and security questions.

### Component Props (`FaqBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | `'Frequently Asked Questions'` | Section title |
| `subtitle` | `string` | Supporting copy | Section subtitle |
| `items` | `FaqItem[]` | Required | Array of question-answer pairs |

### Code Example
```tsx
import { FaqBlock } from '@/components/marketing/blocks';

export function FAQSection() {
  return (
    <FaqBlock
      items={[
        {
          question: 'How do you prevent resume hallucination?',
          answer: 'Our tailoring engine will not output any bullet point unless it mathematically maps to an approved, user-verified CareerClaim.',
        },
        {
          question: 'What are cryptographic submission receipts?',
          answer: 'On submission, NextJob generates a SHA-256 hash of all submitted questions and answers, providing an immutable record.',
        },
      ]}
    />
  );
}
```

---

## 6. CtaBlock

High-converting banner CTA section for bottom-of-page or mid-page conversion loops.

### Component Props (`CtaBlockProps`)
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Headline text | Banner H2 headline |
| `subtitle` | `string` | Subtitle text | Supporting paragraph |
| `primaryAction` | `CtaBlockAction` | `{ label: 'Start free...', href: '/signup' }` | Main button |
| `secondaryAction` | `CtaBlockAction` | `{ label: 'Explore docs...', href: '/docs' }` | Secondary button |
| `note` | `string` | Trust note | Footer micro-copy |
| `badge` | `string` | Badge text | Top pill badge |

### Code Example
```tsx
import { CtaBlock } from '@/components/marketing/blocks';

export function BottomCta() {
  return (
    <CtaBlock
      title="Ready to stop blasting hallucinated resumes?"
      subtitle="Join candidates landing real interviews with verified, evidence-grounded applications."
      primaryAction={{ label: 'Start free — create account', href: '/signup' }}
      secondaryAction={{ label: 'Read technical docs', href: '/docs' }}
    />
  );
}
```
