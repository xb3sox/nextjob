---
version: "1.0"
name: "NextJob Design System"
description: "Ultra-minimal, typography-driven design inspired by Linear, Stripe, and Vercel"
design_philosophy:
  - "Radical simplicity - every pixel earns its place"
  - "Typography as design - let words do the work"
  - "Show, don't tell - demonstrate through the interface"
  - "Specific over generic - complete sentences that address objections"
  - "Breathing room - generous whitespace creates confidence"
colors:
  background:
    base: "#0a0a0a"
    surface: "rgba(255, 255, 255, 0.02)"
    surfaceHover: "rgba(255, 255, 255, 0.05)"
  text:
    primary: "#ffffff"
    secondary: "rgba(255, 255, 255, 0.6)"
    tertiary: "rgba(255, 255, 255, 0.4)"
    subtle: "rgba(255, 255, 255, 0.3)"
  border:
    default: "rgba(255, 255, 255, 0.1)"
    strong: "rgba(255, 255, 255, 0.2)"
  accent:
    primary: "#10b981"
    primaryHover: "#059669"
    primarySubtle: "rgba(16, 185, 129, 0.1)"
typography:
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  scale:
    hero:
      fontSize: "60px"
      fontWeight: "600"
      letterSpacing: "-0.02em"
      lineHeight: "1.1"
      mobile: "48px"
    h1:
      fontSize: "48px"
      fontWeight: "600"
      letterSpacing: "-0.02em"
      lineHeight: "1.1"
    h2:
      fontSize: "36px"
      fontWeight: "600"
      letterSpacing: "-0.02em"
      lineHeight: "1.2"
    h3:
      fontSize: "24px"
      fontWeight: "600"
      lineHeight: "1.3"
    body:
      fontSize: "20px"
      fontWeight: "400"
      lineHeight: "1.6"
      mobile: "18px"
    small:
      fontSize: "16px"
      fontWeight: "400"
      lineHeight: "1.5"
    caption:
      fontSize: "14px"
      fontWeight: "400"
      lineHeight: "1.4"
    tiny:
      fontSize: "12px"
      fontWeight: "500"
      lineHeight: "1.3"
  principles:
    - "Headlines are sentences, not fragments"
    - "Generous line-height for readability"
    - "Tight tracking on headlines (-0.02em)"
    - "Minimal weight variation (600/400)"
spacing:
  baseUnit: "8px"
  scale:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    "2xl": "48px"
    "3xl": "64px"
    "4xl": "80px"
  principles:
    - "Generous whitespace creates confidence"
    - "Consistent rhythm using the scale"
    - "Sections need 80px+ vertical padding"
    - "Content max-width: 1152px (72rem)"
borderRadius:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
shadows:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  principle: "Minimal shadows. Use borders instead."
layout:
  containerWidths:
    max: "1152px"
    narrow: "768px"
    wide: "1280px"
  grid:
    columns: 12
    gutter: "24px"
    margin:
      mobile: "24px"
      desktop: "48px"
  breakpoints:
    sm: "640px"
    md: "768px"
    lg: "1024px"
    xl: "1280px"
    "2xl": "1536px"
motion:
  transitions:
    fast: "150ms"
    normal: "300ms"
    slow: "500ms"
  easing:
    default: "cubic-bezier(0.4, 0, 0.2, 1)"
    in: "cubic-bezier(0.4, 0, 1, 1)"
    out: "cubic-bezier(0, 0, 0.2, 1)"
  principles:
    - "Subtle - enhance, don't distract"
    - "Purposeful - communicate state changes"
    - "Fast - users don't want to wait"
    - "Consistent - same easing for similar actions"
components:
  button:
    primary:
      background: "#10b981"
      text: "#ffffff"
      fontWeight: "600"
      padding: "12px 24px"
      borderRadius: "8px"
      hover: "#059669"
      transition: "150ms"
    secondary:
      background: "transparent"
      text: "rgba(255, 255, 255, 0.6)"
      hover: "#ffffff"
      transition: "150ms"
    sizes:
      sm:
        height: "32px"
        fontSize: "14px"
      md:
        height: "40px"
        fontSize: "16px"
      lg:
        height: "48px"
        fontSize: "16px"
  card:
    background: "rgba(255, 255, 255, 0.02)"
    border: "1px rgba(255, 255, 255, 0.1)"
    borderRadius: "12px"
    padding: "24px"
    hoverBorder: "rgba(255, 255, 255, 0.2)"
  input:
    background: "rgba(255, 255, 255, 0.05)"
    border: "1px rgba(255, 255, 255, 0.1)"
    borderRadius: "8px"
    padding: "12px 16px"
    focusBorder: "rgba(16, 185, 129, 0.5)"
    placeholder: "rgba(255, 255, 255, 0.3)"
  badge:
    background: "rgba(16, 185, 129, 0.1)"
    border: "1px rgba(16, 185, 129, 0.2)"
    borderRadius: "9999px"
    padding: "4px 12px"
    fontSize: "12px"
    fontWeight: "500"
    color: "#34d399"
accessibility:
  contrastRatios:
    primaryText: "15.4:1 (AAA)"
    secondaryText: "7.5:1 (AA)"
    tertiaryText: "4.6:1 (AA)"
    interactive: "4.5:1 minimum"
  focusStates:
    style: "2px emerald ring with 2px offset"
    visible: "all interactive elements"
    contrast: "maintains color contrast"
    removal: "never removed"
  motion:
    respectPrefersReducedMotion: true
    provideAlternatives: true
    noAutoPlay: true
designPatterns:
  hero:
    - "Headline: Complete sentence addressing core value"
    - "Subhead: Specific details that preempt objections"
    - "CTA: Single, clear action with email input"
    - "Product preview: Show the interface, not illustrations"
  features:
    - "Minimal copy: 3 features max, 1-2 sentences each"
    - "Visual hierarchy: Bold headings, muted descriptions"
    - "Generous spacing: 80px+ between sections"
    - "No icons: Let the words speak"
  socialProof:
    - "Early placement: Right after the hero"
    - "Minimal styling: Low opacity, no backgrounds"
    - "Recognizable names: Use brands people know"
    - "No quotes: Logos are enough"
  pricing:
    - "Simple tiers: 2-3 options max"
    - "Clear differentiation: Highlight recommended plan"
    - "Feature lists: Checkmarks, concise descriptions"
    - "No tricks: No hidden fees, no psychological pricing"
antiPatterns:
  avoid:
    - "Cluttered layouts with too many elements"
    - "Generic stock photos or illustrations"
    - "Buzzwords and marketing speak"
    - "Multiple CTAs competing for attention"
    - "Dense text blocks without whitespace"
    - "Decorative elements that don't serve a purpose"
    - "Saturated colors on dark backgrounds"
    - "Complex gradients or glassmorphism"
    - "Auto-playing videos or animations"
    - "Pop-ups and modals on first visit"
  embrace:
    - "Generous whitespace"
    - "Complete sentences in headlines"
    - "Product screenshots over illustrations"
    - "Single, clear call-to-action"
    - "Minimal color palette"
    - "Typography as the primary design element"
    - "Subtle borders over shadows"
    - "Specific details over vague claims"
    - "Early social proof"
    - "Fast, purposeful animations"
inspiration:
  - name: "Linear"
    pattern: "Product-focused, minimal, dark"
    lesson: "Show the product, don't describe it"
  - name: "Stripe"
    pattern: "Specific value propositions, early proof"
    lesson: "Write complete sentences that address objections"
  - name: "Vercel"
    pattern: "Radical minimalism, typography-driven"
    lesson: "Earn minimalism with brand recognition"
  - name: "Resend"
    pattern: "Typography as differentiation"
    lesson: "Type is the cheapest brand differentiator"
---

# NextJob Design System

## Philosophy

**Ultra-minimal. Typography-driven. Show, don't tell.**

Inspired by Linear, Stripe, and Vercel. Every pixel earns its place.

### Core Principles

1. **Radical simplicity** - If it doesn't serve the user's goal, remove it
2. **Typography as design** - Let the words do the work, not illustrations
3. **Show the product** - Demonstrate value through the interface, not descriptions
4. **Specific over generic** - Write complete sentences that address objections
5. **Breathing room** - Generous whitespace creates confidence

## Color System

### Background
- **Base**: `#0a0a0a` - Near-black, softer than pure black
- **Surface**: `rgba(255, 255, 255, 0.02)` - Subtle elevation
- **Surface Hover**: `rgba(255, 255, 255, 0.05)` - Interactive states

### Text
- **Primary**: `#ffffff` - Main headings, important text
- **Secondary**: `rgba(255, 255, 255, 0.6)` - Body text, descriptions
- **Tertiary**: `rgba(255, 255, 255, 0.4)` - Muted text, labels
- **Subtle**: `rgba(255, 255, 255, 0.3)` - Placeholders, hints

### Borders
- **Default**: `rgba(255, 255, 255, 0.1)` - Subtle separation
- **Strong**: `rgba(255, 255, 255, 0.2)` - Emphasis, focus

### Accents
- **Primary**: `#10b981` (Emerald 500) - Success, verification, CTAs
- **Primary Hover**: `#059669` (Emerald 600)
- **Primary Subtle**: `rgba(16, 185, 129, 0.1)` - Backgrounds

## Typography

### Font Family
Inter with system font stack fallback.

### Type Scale
```
Hero:     60px / 600 weight / -0.02em tracking / 1.1 line-height (mobile: 48px)
H1:       48px / 600 weight / -0.02em tracking / 1.1 line-height
H2:       36px / 600 weight / -0.02em tracking / 1.2 line-height
H3:       24px / 600 weight / 1.3 line-height
Body:     20px / 400 weight / 1.6 line-height (mobile: 18px)
Small:    16px / 400 weight / 1.5 line-height
Caption:  14px / 400 weight / 1.4 line-height
Tiny:     12px / 500 weight / 1.3 line-height
```

### Typography Principles
- **Headlines are sentences** - Not fragments. Complete thoughts that address objections.
- **Generous line-height** - 1.1 for headlines, 1.6 for body. Let text breathe.
- **Tight tracking on headlines** - -0.02em creates cohesion in large text.
- **Weight hierarchy** - 600 for headlines, 400 for body. Minimal variation.

## Spacing

### Base Unit: 8px
```
xs:   4px   (0.25rem) - Tight spacing
sm:   8px   (0.5rem)  - Component padding
md:   16px  (1rem)    - Standard spacing
lg:   24px  (1.5rem)  - Section padding
xl:   32px  (2rem)    - Large gaps
2xl:  48px  (3rem)    - Section margins
3xl:  64px  (4rem)    - Major sections
4xl:  80px  (5rem)    - Hero padding
```

### Spacing Principles
- **Generous whitespace** - More space = more confidence
- **Consistent rhythm** - Use the scale, don't invent new values
- **Breathing room** - Sections need 80px+ vertical padding
- **Content max-width** - 1152px (72rem) for readability

## Components

### Buttons
- **Primary**: Emerald background, white text, 600 weight
  - Padding: 12px 24px
  - Border radius: 8px
  - Hover: Emerald 600
  - Transition: 150ms
  
- **Secondary**: Transparent, white/60 text
  - Hover: White text
  - Transition: 150ms

### Cards
- Background: `rgba(255, 255, 255, 0.02)`
- Border: `1px rgba(255, 255, 255, 0.1)`
- Border radius: 12px
- Padding: 24px
- Hover: Border becomes `rgba(255, 255, 255, 0.2)`

### Inputs
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px rgba(255, 255, 255, 0.1)`
- Border radius: 8px
- Padding: 12px 16px
- Focus: Border becomes `rgba(16, 185, 129, 0.5)`
- Placeholder: `rgba(255, 255, 255, 0.3)`

## Layout

### Container Widths
- **Max width**: 1152px (72rem) - Main content
- **Narrow**: 768px (48rem) - Focused content
- **Wide**: 1280px (80rem) - Marketing sections

### Breakpoints
```
sm:  640px   (40rem)
md:  768px   (48rem)
lg:  1024px  (64rem)
xl:  1280px  (80rem)
2xl: 1536px  (96rem)
```

## Design Patterns

### Hero Section
1. **Headline**: Complete sentence addressing the core value
2. **Subhead**: Specific details that preempt objections
3. **CTA**: Single, clear action with email input
4. **Product preview**: Show the interface, not illustrations

### Feature Sections
1. **Minimal copy**: 3 features max, 1-2 sentences each
2. **Visual hierarchy**: Bold headings, muted descriptions
3. **Generous spacing**: 80px+ between sections
4. **No icons**: Let the words speak

### Social Proof
1. **Early placement**: Right after the hero
2. **Minimal styling**: Low opacity, no backgrounds
3. **Recognizable names**: Use brands people know
4. **No quotes**: Logos are enough

### Pricing
1. **Simple tiers**: 2-3 options max
2. **Clear differentiation**: Highlight the recommended plan
3. **Feature lists**: Checkmarks, concise descriptions
4. **No tricks**: No hidden fees, no psychological pricing

## Anti-Patterns

### What to Avoid
- ❌ Cluttered layouts with too many elements
- ❌ Generic stock photos or illustrations
- ❌ Buzzwords and marketing speak
- ❌ Multiple CTAs competing for attention
- ❌ Dense text blocks without whitespace
- ❌ Decorative elements that don't serve a purpose
- ❌ Saturated colors on dark backgrounds
- ❌ Complex gradients or glassmorphism
- ❌ Auto-playing videos or animations
- ❌ Pop-ups and modals on first visit

### What to Embrace
- ✅ Generous whitespace
- ✅ Complete sentences in headlines
- ✅ Product screenshots over illustrations
- ✅ Single, clear call-to-action
- ✅ Minimal color palette
- ✅ Typography as the primary design element
- ✅ Subtle borders over shadows
- ✅ Specific details over vague claims
- ✅ Early social proof
- ✅ Fast, purposeful animations

## Inspiration

### Linear
**Pattern**: Product-focused, minimal, dark  
**Lesson**: Show the product, don't describe it

### Stripe
**Pattern**: Specific value propositions, early proof  
**Lesson**: Write complete sentences that address objections

### Vercel
**Pattern**: Radical minimalism, typography-driven  
**Lesson**: Earn minimalism with brand recognition

### Resend
**Pattern**: Typography as differentiation  
**Lesson**: Type is the cheapest brand differentiator

## Conclusion

This design system prioritizes clarity, trust, and professionalism. By embracing radical simplicity and letting typography carry the design, we create an experience that feels confident and modern. Every decision serves the user's goal: applying to jobs with proof, not promises.
