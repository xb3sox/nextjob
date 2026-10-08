# Product Requirements

## Overview

Job seekers face fragmented discovery, irrelevant opportunities, repetitive applications, AI hallucinating experience, work-authorization uncertainty, unsafe auto-apply tools, duplicate submissions, and no outcome learning. Institutions lack privacy-safe visibility into participant progress.

**Target customer:** Active professionals (P1), international candidates (P2), graduates (P3), career changers (P4), and institution-sponsored participants (P5) with program administrators (P6) and operations staff (P7).

**Value:** Convert verified career evidence into eligible, high-quality applications and measurable interview outcomes while keeping the user in control.

**Differentiation:** Evidence-backed Career Graph, eligibility-before-application gating, no fabricated claims, risk-based automation, verified submission receipts, outcome-driven optimization, and global capability transparency.

## Evidence & Assumptions

- **Working decision:** Evidence-constrained generation produces higher interview rates than unconstrained AI. Requires validation.
- **Assumption:** Users will accept approval friction for sensitive fields. Requires validation.
- **Assumption:** Institutions will pay for aggregate-only cohort reporting. Requires validation.
- **Fact:** Current auto-apply tools generate duplicate submissions and fabricate claims (observed behavior in market).
- **Evidence gap:** No inspected data on willingness to pay for Search Pass at $39/30 days.

## Goals

- **G-01:** Increase qualified interview conversion → Verified Qualified Interview Rate → target TBD
- **G-02:** Reduce application effort → Approval effort per application → target TBD
- **G-03:** Prevent unsupported claims → Unsupported-claim rate = 0
- **G-04:** Prevent ineligible applications → Eligibility false-positive rate ≤ 2%
- **G-05:** Verify every submission → Verified submission rate ≥ 98%
- **G-06:** Prevent duplicate submissions → Duplicate prevention ≥ 95%
- **G-07:** Make every action explainable → 100% of automated actions have reason + source + evidence
- **G-08:** Support global candidates → Capability labels on every job card
- **G-09:** Autopilot safety → Evidence coverage ≥ 80% before autopilot execution
- **G-10:** Privacy-safe reporting → Minimum cohort size ≥ 5 participants for aggregate reporting

## Scope

### MVP

- Authentication (email/social)
- CV import (PDF/DOCX) with extraction and verification
- Career Graph with evidence provenance
- Preferences and eligibility capture
- Job ingestion, normalization, deduplication
- Eligibility engine (location, authorization, sponsorship, licenses)
- Matching and ranking with explainability
- Tailoring engine (resume variant, cover letter, answers)
- Risk and policy engine with approval workflow
- Browser extension for assisted ATS execution
- Submission receipts with verification
- Application tracker with state machine
- Manual outcome capture
- Notifications (in-app, email)
- Organizations, cohorts, aggregate reporting
- Billing (free + Search Pass)
- Admin and operations console
- Analytics, audit, privacy controls

### Non-Goals

Mass-application spam, LinkedIn automation, CAPTCHA bypass, immigration/legal advice, recruiter marketplace, employer ATS, social network, native mobile app, autonomous unrestricted browser agent, custom foundation model, interview cheating, automated protected-characteristic answers, complex CRM.

## Critical Flows

1. **Onboarding:** User → sign up → import CV → verify each extracted claim → set preferences → set eligibility → set automation policy.
2. **Application:** Job discovered → eligibility checked (MUST pass or be Unknown) → ranked → reviewed → tailored from evidence → risk checked → approvals obtained → executed → receipt generated → tracked.
3. **Sensitive field:** Question detected → risk classified as Sensitive → system blocks auto-fill → user provides answer only → answer stored with scope and expiration.
4. **Failure recovery:** Connector timeout → state set to FAILED_RETRYABLE → exponential retry → if exhausted → NEEDS_RECONCILIATION → manual fallback available.

## Requirements

- **FR-01 [Must]:** Every generated factual statement MUST map to a verified CareerClaim with evidence_id.
- **FR-02 [Must]:** Eligibility MUST be evaluated before ranking. Unknown MUST NOT silently become Eligible.
- **FR-03 [Must]:** Sensitive fields (demographics, disability, health) MUST require explicit user-only input.
- **FR-04 [Must]:** Every verified submission MUST produce a receipt containing job version, submitted fields, answer hashes, and confirmation evidence.
- **FR-05 [Must]:** Duplicate applications MUST be prevented via idempotency keys and unique user+job constraints.
- **FR-06 [Must]:** Every automated action MUST be explainable with reason, source, rule_version, and confidence.
- **FR-07 [Must]:** Policy precedence MUST be enforced: Legal/Safety > Platform > Evidara > Organization > User > Context.
- **FR-08 [Must]:** Ambiguous external submission results MUST NOT automatically retry.
- **FR-09 [Must]:** Organization reporting MUST be aggregate-only with minimum cohort thresholds.
- **FR-10 [Must]:** Users MUST be able to view, export, correct, and delete their data.
- **FR-11 [Should]:** Application answers SHOULD be stored for reuse with scope, risk_level, and expiration.
- **FR-12 [Should]:** Job cards SHOULD display all capability dimensions (Eligibility, Fit, Evidence, Execution, Language, Automation, Freshness).
- **FR-13 [Should]:** Notifications SHOULD be limited to actionable events only.
- **FR-14 [Could]:** Interview preparation MAY generate likely questions and evidence-backed talking points.

### Onboarding Requirements

- **FR-ONB-01 [Must]:** Account creation MUST support email and social authentication.
- **FR-ONB-02 [Must]:** CV import MUST accept PDF/DOCX and extract identity, employment, education, skills, certifications, projects, achievements, and languages.
- **FR-ONB-03 [Must]:** Every extracted claim MUST be confirmed, edited, removed, or marked unverified by the user.
- **FR-ONB-04 [Must]:** Preferences MUST capture target roles, seniority, industries, locations, remote/hybrid/on-site, salary expectations, company preferences, exclusions, relocation, and notice period.
- **FR-ONB-05 [Must]:** Eligibility MUST capture explicit user-provided citizenship, work authorization, sponsorship requirement, location restrictions, and clearance/licensing requirements.
- **FR-ONB-06 [Must]:** Automation policy MUST allow user to select Manual, Copilot, or Autopilot-eligible modes with field-level overrides.

### Application State Machine

- **FR-ASM-01 [Must]:** Applications MUST progress through states: DISCOVERED → NORMALIZED → ELIGIBILITY_CHECKED → MATCHED → PLANNED → TAILORED → POLICY_CHECKED → NEEDS_APPROVAL → READY → EXECUTING → SUBMITTED_UNVERIFIED → SUBMITTED_VERIFIED.
- **FR-ASM-02 [Must]:** Outcome states MUST include: INTERVIEW, REJECTED, OFFER, WITHDRAWN, HIRED.
- **FR-ASM-03 [Must]:** Exception states MUST include: BLOCKED, NEEDS_USER, FAILED_RETRYABLE, NEEDS_RECONCILIATION, FAILED_FINAL, CANCELLED.
- **FR-ASM-04 [Must]:** State transitions MUST be atomic and auditable.

### Failure & Edge Cases

- **FR-FEC-01 [Must]:** System MUST explicitly handle: duplicate jobs, closed jobs, changed job descriptions, missing evidence, conflicting evidence, unknown eligibility, unsupported questions, sensitive questions, CAPTCHA, MFA, ATS timeout, partial submission, unknown submission result, connector outage, revoked OAuth, expired authorization, model failure, invalid structured output, malicious job content, user edits during execution, job removed during application, duplicate recruiter confirmation.
- **FR-FEC-02 [Must]:** Every failure MUST produce: status + explanation + recovery action.
- **FR-FEC-03 [Must]:** Ambiguous external submissions MUST NOT automatically retry (FR-08).

### Accessibility & Localization

- **FR-ACC-01 [Must]:** All user interfaces MUST meet WCAG 2.2 AA.
- **FR-ACC-02 [Must]:** System MUST support: keyboard navigation, screen-reader support, visible focus, semantic HTML, error identification, accessible approvals, no color-only meaning, responsive layouts.
- **FR-ACC-03 [Should]:** System SHOULD be RTL-ready and support locale-aware dates, currency formatting, address/phone localization.
- **FR-ACC-04 [Could]:** Additional languages MAY be supported post-MVP (architecture supports it).

### Analytics & Experimentation

- **FR-ANA-01 [Must]:** System MUST track product events for: onboarding, claim verification, job impressions, match actions, eligibility, tailoring, approvals, submission, failures, outcomes, interviews, billing.
- **FR-ANA-02 [Must]:** System MUST NOT send sensitive application content or raw CV data to product analytics.
- **FR-ANA-03 [Should]:** Experiments SHOULD test: ranking, match explanations, tailoring, approval UX, notifications, pricing, onboarding.
- **FR-ANA-04 [Must]:** Primary experiment outcome MUST be interview lift.
- **FR-ANA-05 [Must]:** Experiment guardrails MUST include: unsupported claims, ineligible applications, duplicate submissions, sensitive-field errors, complaints, connector failures.

### Monetization

- **FR-MON-01 [Must]:** Free tier MUST include: Career Graph, job discovery, eligibility, tracker, limited applications.
- **FR-MON-02 [Must]:** Search Pass (~$39/30 days) MUST include: full matching, tailoring, assisted applications, tracking, receipts.
- **FR-MON-03 [Should]:** Agent Pass (next phase) SHOULD add: safe autopilot, advanced automation, outcome optimization.
- **FR-MON-04 [Must]:** System MUST NOT monetize: candidate data, sensitive data, recruiter advertising based on private data, hidden credits, fake guarantees.

### Rollout Plan

- **FR-ROL-01 [Must]:** Phase 1 (MVP) MUST include: identity, Career Graph, evidence, jobs, eligibility, matching, tailoring, risk engine, approvals, extension, execution, receipts, tracker, organizations, billing, admin, analytics.
- **FR-ROL-02 [Should]:** Phase 2 SHOULD add: email outcomes, interview preparation, additional ATSs, localization, experiments.
- **FR-ROL-03 [Could]:** Phase 3 MAY add: safe autopilot, outcome-informed ranking, expanded eligibility, B2B integrations, Career Vault.

### Marketing & Landing Page

- **FR-MKT-01 [Must]:** Landing page MUST clearly communicate value proposition: "Apply with proof" — evidence-backed career agent that converts verified evidence into eligible applications and interview outcomes.
- **FR-MKT-02 [Must]:** Landing page MUST display: hero section with tagline, core differentiators (evidence-backed Career Graph, eligibility before application, no fabricated claims, verified submission receipts, global capability transparency), target personas (active professionals, international candidates, graduates, career changers), pricing tiers (Free, Search Pass, Agent Pass), social proof placeholders, clear CTAs (Sign Up, Learn More).
- **FR-MKT-03 [Must]:** Landing page MUST be optimized for conversion: above-the-fold value prop, benefit-focused copy, trust signals (security, privacy, no data sales), frictionless signup flow, mobile-responsive.
- **FR-MKT-04 [Must]:** Landing page MUST support SEO: semantic HTML, meta tags, structured data, fast load times (<2s LCP), accessible (WCAG 2.2 AA).
- **FR-MKT-05 [Must]:** Landing page MUST integrate analytics: track page views, CTA clicks, signup conversions, bounce rate, time on page; no PII in analytics events.
- **FR-MKT-06 [Should]:** Landing page SHOULD support A/B testing for: hero copy, pricing display, CTA placement, social proof variants.
- **FR-MKT-07 [Should]:** Landing page SHOULD include: FAQ section addressing common objections (AI hallucination, privacy, work authorization, eligibility accuracy), testimonials/reviews section (post-launch), blog/resources section (post-launch).
- **FR-MKT-08 [Must]:** Landing page MUST support B2B2C: separate section or page for institutions/programs highlighting cohort management, aggregate reporting, privacy safeguards, pricing.
- **FR-MKT-09 [Must]:** Landing page MUST comply with legal requirements: privacy policy link, terms of service link, cookie consent (if applicable), GDPR compliance for EU visitors.
- **FR-MKT-10 [Should]:** Landing page SHOULD support referral program: unique referral links, referral tracking, incentive display (post-launch).

### Performance Excellence

- **FR-PERF-01 [Must]:** Landing page MUST achieve Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 on both mobile and desktop.
- **FR-PERF-02 [Must]:** Landing page MUST implement image optimization: WebP/AVIF formats, responsive images with srcset, lazy loading below fold, art direction for different breakpoints.
- **FR-PERF-03 [Must]:** Landing page MUST implement font optimization: preload critical fonts, font-display: swap, use variable fonts where possible, subset fonts for used characters.
- **FR-PERF-04 [Must]:** Landing page MUST implement code splitting: route-based splitting, dynamic imports for below-fold content, bundle analysis to keep initial JS < 100KB gzipped.
- **FR-PERF-05 [Must]:** Landing page MUST implement edge caching: CDN configuration with appropriate cache headers, stale-while-revalidate for dynamic content, cache invalidation on content updates.
- **FR-PERF-06 [Must]:** Landing page MUST implement Real User Monitoring (RUM): track actual user performance metrics (LCP, FID, CLS, INP) with p75 and p95 percentiles.

### Advanced SEO

- **FR-SEO-01 [Must]:** Landing page MUST include comprehensive schema markup: Organization, Product, FAQ, BreadcrumbList, WebSite schemas validated with Google Rich Results Test.
- **FR-SEO-02 [Must]:** Landing page MUST generate dynamic Open Graph images: auto-generated per page with branding, title, description, and visual elements using Next.js ImageResponse.
- **FR-SEO-03 [Must]:** Landing page MUST include Twitter Cards: summary_large_image with custom images optimized for Twitter display (1200x628px).
- **FR-SEO-04 [Must]:** Landing page MUST auto-generate sitemap.xml: updated on content changes, includes all public pages, proper lastmod dates, priority and changefreq attributes.
- **FR-SEO-05 [Must]:** Landing page MUST configure robots.txt: allow legitimate crawlers, block AI bots (GPTBot, ClaudeBot, CCBot) unless explicitly allowed, reference sitemap location.
- **FR-SEO-06 [Must]:** Landing page MUST implement canonical URLs: prevent duplicate content issues, self-referencing canonicals on all pages.
- **FR-SEO-07 [Must]:** Landing page MUST support AI search optimization: llms.txt file for AI crawlers, structured data optimized for AI consumption, clear entity definitions.
- **FR-SEO-08 [Should]:** Landing page SHOULD implement hreflang tags: prepare for internationalization with proper language/region codes.

### Conversion Science

- **FR-CRO-01 [Must]:** Landing page MUST include interactive product demo: embedded preview showing application flow with real-looking data, no signup required to view.
- **FR-CRO-02 [Must]:** Landing page MUST include before/after comparison: traditional apply process vs NextJob side-by-side showing time saved and quality improvement.
- **FR-CRO-03 [Must]:** Landing page MUST include ROI calculator: interactive tool estimating time saved, interview rate improvement, and application quality score based on user inputs.
- **FR-CRO-04 [Should]:** Landing page SHOULD implement exit intent popup: offer lead magnet (career guide, checklist) or special discount when user attempts to leave.
- **FR-CRO-05 [Should]:** Landing page SHOULD implement scroll-triggered animations: reveal content progressively as user scrolls using Intersection Observer.
- **FR-CRO-06 [Must]:** Landing page MUST track micro-conversions: form starts, video plays, demo interactions, pricing page views, FAQ expansions.
- **FR-CRO-07 [Should]:** Landing page SHOULD implement social proof rotation: rotating testimonials, customer logos, and success metrics with smooth transitions.
- **FR-CRO-08 [Should]:** Landing page SHOULD implement urgency indicators: limited-time offers, countdown timers for promotions (ethical use only, no fake scarcity).
- **FR-CRO-09 [Should]:** Landing page SHOULD implement sticky CTA: persistent call-to-action bar that appears after scrolling past hero.
- **FR-CRO-10 [Must]:** Landing page MUST include comparison table: feature comparison with traditional job search methods (without naming specific competitors).

### Visual Excellence

- **FR-VIS-01 [Must]:** Landing page MUST implement marketing design system: hero components, feature sections, pricing cards, testimonial components, CTA button variants.
- **FR-VIS-02 [Should]:** Landing page SHOULD implement scroll animations: Framer Motion for reveal effects, parallax scrolling, smooth transitions between sections.
- **FR-VIS-03 [Should]:** Landing page SHOULD implement micro-interactions: button hover states with scale/shadow, form field focus animations, loading state transitions.
- **FR-VIS-04 [Must]:** Landing page MUST implement loading skeletons: content placeholders during data fetch to prevent layout shift and improve perceived performance.
- **FR-VIS-05 [Should]:** Landing page SHOULD support video content: hero video backgrounds (muted, autoplay, loop), product walkthrough videos, testimonial videos with captions.
- **FR-VIS-06 [Should]:** Landing page SHOULD implement dark/light mode: respect user preference via prefers-color-scheme, provide manual toggle, persist choice in localStorage.
- **FR-VIS-07 [Must]:** Landing page MUST implement responsive images: art direction using <picture> element with different crops for mobile/tablet/desktop.
- **FR-VIS-08 [Must]:** Landing page MUST use consistent icon system: Lucide icons throughout, consistent sizing (16px inline, 24px section headers, 32px hero), proper color inheritance.

### Content Strategy

- **FR-CONT-01 [Must]:** Landing page MUST follow messaging hierarchy: primary value prop → key benefits → detailed features → social proof → final CTA.
- **FR-CONT-02 [Must]:** Landing page MUST follow copywriting guidelines: conversational tone, benefit-focused language, short sentences (<20 words), active voice, no jargon.
- **FR-CONT-03 [Must]:** Landing page MUST use content blocks library: reusable sections (hero, features, testimonials, pricing, CTA) with consistent structure and spacing.
- **FR-CONT-04 [Should]:** Landing page SHOULD include video scripts: product demo script (60s), explainer video script (90s), testimonial interview template.
- **FR-CONT-05 [Should]:** Landing page SHOULD support email nurture sequences: welcome series (3 emails over 7 days), onboarding emails (5 emails over 14 days), re-engagement emails (monthly).
- **FR-CONT-06 [Should]:** Landing page SHOULD offer lead magnets: downloadable guides (career checklist, resume template, interview prep), whitepapers (AI in hiring trends), checklists (application tracker).
- **FR-CONT-07 [Should]:** Landing page SHOULD include blog/resources structure: SEO-optimized content hub with categories (career tips, product updates, industry insights), tag system, related posts.

### Trust & Credibility

- **FR-TRUST-01 [Should]:** Landing page SHOULD display customer logos: prominent section with 6-12 company logos (post-launch, with permission), grayscale with color on hover.
- **FR-TRUST-02 [Should]:** Landing page SHOULD display security certifications: SOC 2 Type II badge, GDPR compliance badge, encryption indicators (post-certification).
- **FR-TRUST-03 [Must]:** Landing page MUST include data handling transparency: dedicated page explaining what data is collected, how it's used, storage duration, deletion process, no data sales guarantee.
- **FR-TRUST-04 [Must]:** Landing page MUST include sample outputs: example submission receipts, tailored resume snippets, cover letter examples (with sensitive data redacted).
- **FR-TRUST-05 [Should]:** Landing page SHOULD display integration logos: supported ATS systems (Greenhouse, Lever, Workday, iCIMS) with "coming soon" indicators for planned integrations.
- **FR-TRUST-06 [Should]:** Landing page SHOULD include press/media section: mentions in publications, awards, podcast appearances, founder interviews (post-launch).
- **FR-TRUST-07 [Should]:** Landing page SHOULD include case studies structure: problem → solution → results format with specific metrics (e.g., "3x interview rate in 60 days").
- **FR-TRUST-08 [Must]:** Landing page MUST include trust badges: "No data sold", "Privacy-first", "Evidence-backed", "GDPR compliant" badges in footer and key sections.

### Technical Excellence

- **FR-TECH-01 [Must]:** Landing page MUST implement security headers: Content-Security-Policy (restrictive), Strict-Transport-Security, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin).
- **FR-TECH-02 [Must]:** Landing page MUST implement progressive enhancement: core content accessible without JavaScript, enhanced experience with JS enabled, graceful degradation for older browsers.
- **FR-TECH-03 [Must]:** Landing page MUST implement error boundaries: catch React errors gracefully, display user-friendly error message, log error to monitoring service, offer retry option.
- **FR-TECH-04 [Must]:** Landing page MUST include branded 404 page: helpful message, search functionality, navigation links to popular pages, contact option, maintain brand consistency.
- **FR-TECH-05 [Must]:** Landing page MUST implement loading states: spinners for async actions, progress bars for multi-step processes, skeleton screens for content loading.
- **FR-TECH-06 [Must]:** Landing page MUST implement form validation: real-time feedback on input, inline error messages below fields, success states with confirmation, accessible error announcements.
- **FR-TECH-07 [Must]:** Landing page MUST implement bot protection: CAPTCHA on contact/signup forms (invisible reCAPTCHA v3), rate limiting on API endpoints (100 req/min per IP).
- **FR-TECH-08 [Must]:** Landing page MUST implement accessibility beyond WCAG: comprehensive ARIA labels, focus management for modals/drawers, screen reader testing with NVDA/VoiceOver, keyboard trap prevention.

### Growth Infrastructure

- **FR-GROW-01 [Must]:** Landing page MUST implement email capture: newsletter signup in footer, lead magnet download forms, exit intent capture (if implemented).
- **FR-GROW-02 [Should]:** Landing page SHOULD integrate with email service: connect to Resend/SendGrid/Mailchimp for email delivery, double opt-in for newsletters, unsubscribe handling.
- **FR-GROW-03 [Should]:** Landing page SHOULD support webinar/event promotion: registration forms, calendar integration (Add to Calendar buttons), reminder emails, replay access page.
- **FR-GROW-04 [Should]:** Landing page SHOULD include community links: Discord server invite, Slack community, forum link, GitHub repository (if open source components).
- **FR-GROW-05 [Should]:** Landing page SHOULD implement social sharing: Open Graph optimization for all pages, share buttons on blog posts (Twitter, LinkedIn, email), click-to-tweet quotes.
- **FR-GROW-06 [Should]:** Landing page SHOULD include partner/affiliate section: partner program overview, affiliate signup form, commission structure, partner dashboard link.
- **FR-GROW-07 [Should]:** Landing page SHOULD provide press kit: downloadable logo pack (SVG, PNG, dark/light versions), brand guidelines PDF, media contact form, high-res product screenshots.

### Monitoring & Optimization

- **FR-MON-01 [Must]:** Landing page MUST track conversion funnel: visitor → page view → CTA click → signup start → signup complete → first application, with drop-off rates at each stage.
- **FR-MON-02 [Must]:** Landing page MUST implement performance monitoring: Lighthouse CI in CI/CD pipeline, Web Vitals tracking in production, performance budgets with alerts.
- **FR-MON-03 [Must]:** Landing page MUST implement error tracking: Sentry or similar for JavaScript errors, source maps for debugging, error grouping and deduplication, alerting on error spikes.
- **FR-MON-04 [Must]:** Landing page MUST implement uptime monitoring: external monitoring service (Pingdom/UptimeRobot), multi-region checks, SMS/email alerts on downtime, status page.
- **FR-MON-05 [Should]:** Landing page SHOULD track A/B testing results: statistical significance calculation (p < 0.05), winner declaration automation, segment analysis (device, geography, time).
- **FR-MON-06 [Should]:** Landing page SHOULD implement heatmaps: click tracking on all interactive elements, scroll depth analysis, interaction recording (mouse movement, form fills) with user consent.
- **FR-MON-07 [Should]:** Landing page SHOULD implement session recording: user journey analysis with consent banner, ability to replay sessions for UX research, PII auto-redaction in recordings.

## Acceptance

- **AC-01 → FR-01:** Given a CareerClaim with evidence, when tailoring generates a statement, then the statement references the claim_id and evidence_id.
- **AC-02 → FR-02:** Given a job requiring US work authorization, when a candidate has no authorization set, then eligibility returns Unknown with reason and source.
- **AC-03 → FR-03:** Given an application form asking about disability, when the system encounters the field, then it blocks auto-fill and presents user-only input.
- **AC-04 → FR-04:** Given a successful ATS submission, when the connector returns confirmation, then a receipt is generated with job_version, field_hashes, and verification_status.
- **AC-05 → FR-05:** Given a submitted application to job X, when the user triggers apply again for job X, then the system returns the existing receipt without re-submitting.
- **AC-06 → FR-08:** Given an ATS timeout with no confirmation, when the workflow retries, then it does not re-submit but transitions to NEEDS_RECONCILIATION.
- **AC-07 → FR-ASM-01:** Given an application in DISCOVERED state, when eligibility check passes, then state transitions to ELIGIBILITY_CHECKED with audit log entry.
- **AC-08 → FR-ASM-03:** Given an application in EXECUTING state, when connector fails, then state transitions to FAILED_RETRYABLE with retry count incremented.
- **AC-09 → FR-FEC-02:** Given a failed submission, when user views failure details, then they see status, explanation, and recovery action.
- **AC-10 → FR-ACC-01:** Given a user navigating with keyboard only, when they complete the application flow, then all interactive elements are reachable and operable.
- **AC-11 → FR-ANA-02:** Given a product analytics event, when inspected, then it contains no PII, CV content, or sensitive application data.
- **AC-12 → FR-MKT-02:** Given a visitor lands on the homepage, when they scroll through the page, then they see: hero with tagline, 5 core differentiators, 4 target personas, 3 pricing tiers, signup CTA.
- **AC-13 → FR-MKT-03:** Given a visitor on mobile device, when they view the landing page, then all content is readable, CTAs are tappable, and layout doesn't require horizontal scrolling.
- **AC-14 → FR-MKT-04:** Given the landing page is indexed, when Google crawls it, then meta title, description, and structured data are present and accurate.
- **AC-15 → FR-MKT-05:** Given a visitor interacts with the landing page, when analytics are inspected, then page views, CTA clicks, and conversions are tracked without PII.
- **AC-16 → FR-MKT-08:** Given an institution administrator visits the landing page, when they navigate to the B2B section, then they see cohort management, aggregate reporting, privacy safeguards, and pricing information.
- **AC-17 → FR-PERF-01:** Given the landing page is loaded on a mid-tier mobile device on 4G, when measured with Lighthouse, then LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **AC-18 → FR-PERF-02:** Given images are displayed on the landing page, when inspected in network tab, then all images are served in WebP/AVIF format with appropriate sizes for viewport.
- **AC-19 → FR-SEO-01:** Given the landing page HTML, when validated with Google Rich Results Test, then all schema markup (Organization, Product, FAQ) passes validation with no errors.
- **AC-20 → FR-SEO-02:** Given a page URL is shared on social media, when preview is generated, then a branded Open Graph image (1200x630px) with title and description is displayed.
- **AC-21 → FR-CRO-01:** Given a visitor lands on the homepage, when they interact with the product demo, then they can explore the application flow without signing up.
- **AC-22 → FR-CRO-03:** Given a visitor uses the ROI calculator, when they input their current application volume, then they see estimated time saved and interview rate improvement.
- **AC-23 → FR-CRO-06:** Given a visitor interacts with the landing page, when analytics are inspected, then micro-conversions (form starts, video plays, demo interactions) are tracked.
- **AC-24 → FR-VIS-01:** Given the landing page is rendered, when inspected in browser dev tools, then all components use the marketing design system tokens consistently.
- **AC-25 → FR-VIS-04:** Given the landing page is loading, when content is being fetched, then skeleton screens are displayed with no layout shift.
- **AC-26 → FR-VIS-06:** Given a user has dark mode enabled in system preferences, when they visit the landing page, then dark theme is applied automatically.
- **AC-27 → FR-CONT-01:** Given the landing page content structure, when analyzed, then sections follow hierarchy: value prop → benefits → features → proof → CTA.
- **AC-28 → FR-TRUST-03:** Given a visitor clicks "How we handle your data", when the transparency page loads, then it clearly explains data collection, usage, storage, and deletion.
- **AC-29 → FR-TRUST-04:** Given sample outputs are displayed, when inspected, then all sensitive data (names, emails, addresses) is redacted.
- **AC-30 → FR-TECH-01:** Given the landing page HTTP response, when headers are inspected, then CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy are present and correctly configured.
- **AC-31 → FR-TECH-02:** Given JavaScript is disabled in the browser, when the landing page loads, then core content (hero, features, pricing) is still visible and readable.
- **AC-32 → FR-TECH-04:** Given a visitor navigates to a non-existent page, when the 404 page loads, then it displays a branded error page with search and navigation options.
- **AC-33 → FR-TECH-06:** Given a user fills out a signup form, when they enter invalid data, then real-time validation shows inline errors with accessible announcements.
- **AC-34 → FR-MON-01:** Given a visitor completes the signup flow, when the conversion funnel is analyzed, then all stages (visitor → page view → CTA click → signup start → signup complete) are tracked with timestamps.
- **AC-35 → FR-MON-02:** Given the landing page is deployed, when performance is monitored, then Lighthouse CI runs in CI/CD and Web Vitals are tracked in production with alerts on degradation.
- **AC-36 → FR-MON-03:** Given a JavaScript error occurs on the landing page, when error tracking is inspected, then the error is captured with stack trace, source map, and user context.

## Validation

- **Hypothesis:** Evidence-constrained applications produce higher interview rates → Method: A/B test with/without evidence constraint → Sample: TBD → Metric: Interview rate → Threshold: TBD
- **Hypothesis:** Eligibility gating reduces wasted applications → Method: Cohort comparison → Sample: TBD → Metric: Application-to-interview ratio → Threshold: TBD
- **Hypothesis:** Users accept Copilot approval friction → Method: Feature flag → Sample: TBD → Metric: Mode adoption + completion rate → Threshold: TBD

## Release Criteria

- 0 unsupported sensitive claims in evaluation suite
- 100% sensitive-field approval enforcement
- ≥95% supported-form field accuracy
- ≥98% receipt generation for supported connectors
- ≥95% duplicate prevention
- Tenant isolation penetration-tested with no unresolved critical findings
- Export/delete tested and functional
- Backup/restore and disaster recovery tested
- WCAG 2.2 AA critical journeys passing
- Every connector monitored with kill switch
- AI regression suite passing
- Privacy review complete
- Terms and integration review complete

## Risks & Decisions

| Risk | Mitigation | Status |
|------|-----------|--------|
| AI fabrication | Evidence-constrained generation | Working decision — needs validation |
| Wrong eligibility | Rules + provenance + Unknown fallback | Working decision |
| ATS changes | Versioned connectors + synthetic tests | Working decision |
| Duplicate submissions | Idempotency + DB uniqueness | Working decision |
| Sensitive-data exposure | Isolated vault + RBAC | Working decision |
| Prompt injection | Untrusted-content isolation | Working decision |
| User distrust | Explainability + receipts | Working decision |
| High AI cost | Model routing + caching | Working decision |
| B2B privacy concerns | Aggregate-only reporting | Working decision |

**Open questions:**
- Search Pass price ($39/30 days) not validated

**Approved decisions (2026-01-15):**
- Eligibility false-positive threshold: ≤2% (G-04)
- Autopilot evidence coverage threshold: ≥80% (G-09)
- Organization minimum cohort size for reporting: ≥5 participants (G-10)
