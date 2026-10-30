# NextJob Marketing Design System Components

A set of reusable, accessible, typography-driven marketing components adhering to `docs/DESIGN.md` and using design tokens defined in `src/styles/marketing-tokens.css`.

## Design Principles

1. **Ultra-minimal & Typography-driven**: Clear hierarchy, dark theme surface (`#0b0d0c`), emerald/moss accent (`#34d399` / `#10b981`), and Instrument Serif display headings.
2. **Accessible**: Keyboard navigation, WCAG 2.2 AA focus indicators, ARIA labels, and explicit roles.
3. **Responsive**: Mobile-first grid layouts supporting breakpoints (`sm`, `md`, `lg`).

## Components

### 1. `CtaButton`
Call-To-Action button with multiple variants and sizes.
- **Variants**: `primary`, `secondary`, `outline`, `ghost`
- **Sizes**: `sm`, `md`, `lg`
- **Props**: `href`, `icon`, `iconPosition`, `onClick`, `disabled`

```tsx
import { CtaButton } from '@/components/marketing';
import { ArrowRight } from 'lucide-react';

<CtaButton variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
  Start free — create your account
</CtaButton>
```

### 2. `TrustBadges` & `EmployerTrustLogos`
Display compliance badges, security certifications, and target employer brand logos.
- **Components**: `TrustBadge`, `TrustBadges`, `EmployerTrustLogos`

```tsx
import { TrustBadges, EmployerTrustLogos } from '@/components/marketing';

<TrustBadges />
<EmployerTrustLogos companies={['Google', 'Stripe', 'Vercel', 'Linear', 'Figma']} />
```

### 3. `HeroSection`
Hero section supporting headlines, subheads, primary/secondary CTAs, badges, and product previews.
- **Variants**: `default`, `direct`, `minimal`

```tsx
import { HeroSection } from '@/components/marketing';

<HeroSection
  variant="direct"
  badge="Now in private beta"
  primaryCta={{ label: "Start free", href: "/signup" }}
  secondaryCta={{ label: "Join waitlist", href: "#waitlist" }}
/>
```

### 4. `FeatureSection` & `FeatureCard`
Grid layout showcasing core capabilities and value props.
- **Columns**: 2, 3, or 4 columns

```tsx
import { FeatureSection } from '@/components/marketing';

<FeatureSection
  title="Honest automation, end to end"
  subtitle="No hallucinated claims. Every statement backed by verified proof."
  features={[
    { title: "Evidence-backed", description: "Traces directly to your verified claims." },
    { title: "Eligibility first", description: "Authorization checked before applying." },
    { title: "Verified receipts", description: "Immutable proof on submission." }
  ]}
/>
```

### 5. `PricingCard` & `PricingSection`
Pricing cards and comparison grids for Free and Search Pass tiers.

```tsx
import { PricingSection } from '@/components/marketing';

<PricingSection
  tiers={[
    { id: "free", name: "Free", price: "$0", period: "/forever", features: ["Build profile", "Discover jobs"] },
    { id: "search", name: "Search", price: "$39", period: "/30 days", popular: true, features: ["Everything in Free", "Full matching", "Tailored applications"] }
  ]}
/>
```

### 6. `TestimonialCard` & `TestimonialSection`
Testimonials with quotes, candidate attribution, company badges, and verification indicators.

```tsx
import { TestimonialSection } from '@/components/marketing';

<TestimonialSection
  testimonials={[
    { quote: "Every application was accurate and verified.", author: "Alex R.", role: "Senior Engineer", company: "Tech Co" }
  ]}
/>
```

## Design Tokens

Design tokens are defined in `src/styles/marketing-tokens.css`:
- `--mkt-bg-ink`: Page background (`#0b0d0c`)
- `--mkt-bg-surface`: Card surface (`rgba(255, 255, 255, 0.02)`)
- `--mkt-color-moss`: Accent green (`#34d399`)
- `--mkt-color-moss-deep`: Deep accent (`#10b981`)
- `--mkt-border-default`: Border subtle (`rgba(255, 255, 255, 0.1)`)
