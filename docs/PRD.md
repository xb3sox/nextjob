# Product Requirements

## Overview

Job seekers face fragmented discovery, irrelevant opportunities, repetitive applications, AI hallucinating experience, work-authorization uncertainty, unsafe auto-apply tools, duplicate submissions, and no outcome learning. Institutions lack privacy-safe visibility into participant progress.

**Target customer:** Active professionals (P1), international candidates (P2), graduates (P3), career changers (P4), and institution-sponsored participants (P5) with program administrators (P6) and operations staff (P7).

**Value:** Convert verified career evidence into eligible, high-quality applications and measurable interview outcomes while keeping the user in control.

**Tagline:** Your next job, intelligently.

**Promise:** Find better jobs. Apply smarter. Get interviewed.

**Differentiation:** 
- Verified profile: applications use real, user-approved facts
- Eligibility-first: avoid wasting effort on unsuitable roles
- Quality-first: optimize interviews, not application volume
- Safe automation: automate routine work; escalate consequential decisions
- Transparent: explain recommendations and show exactly what was submitted
- Outcome learning: improve from verified interviews, rejections and offers
- Global clarity: clearly distinguish supported, assisted and manual workflows

## Evidence & Assumptions

- **Working decision:** Evidence-constrained generation produces higher interview rates than unconstrained AI. Requires validation.
- **Assumption:** Users will accept approval friction for sensitive fields. Requires validation.
- **Assumption:** Institutions will pay for aggregate-only cohort reporting. Requires validation.
- **Fact:** Current auto-apply tools generate duplicate submissions and fabricate claims (observed behavior in market).
- **Evidence gap:** No inspected data on willingness to pay for Search at $39/30 days.

## Goals

### User Goals
- Find relevant opportunities faster
- Understand why each job fits
- Avoid clearly unsuitable jobs
- Create stronger truthful applications
- Reduce repetitive work
- Maintain control over important decisions
- Know exactly what was submitted
- Track everything automatically
- Improve interview conversion

### Business Goals
- Strong activation and paid conversion
- High contribution margin
- Repeatable B2C acquisition
- Recurring B2B2C revenue
- Strong referral growth
- Defensible outcome and execution intelligence

### Metrics
- **G-01:** Increase qualified interview conversion → Verified Qualified Interview Rate → target TBD
- **G-02:** Reduce application effort → Approval effort per application → target TBD
- **G-03:** Prevent unsupported claims → Unsupported-claim rate = 0
- **G-04:** Prevent ineligible applications → Eligibility false-positive rate ≤ 2%
- **G-05:** Verify every submission → Verified submission rate ≥ 98%
- **G-06:** Prevent duplicate submissions → Duplicate prevention ≥ 95%
- **G-07:** Make every action explainable → 100% of automated actions have reason + source + evidence
- **G-08:** Support global candidates → Capability labels on every job card
- **G-09:** Autopilot safety → Profile coverage threshold before automatic submission
- **G-10:** Privacy-safe reporting → Minimum cohort size ≥ 5 participants for aggregate reporting

## Scope

### MVP

- Authentication (email/social)
- Profile import (PDF/DOCX) with extraction and verification
- Your Profile with evidence provenance
- Preferences and eligibility capture
- Job ingestion, normalization, deduplication
- Eligibility engine (location, authorization, sponsorship, licenses)
- Matching and ranking with explainability
- Tailoring engine (resume variant, cover letter, answers)
- Safety checks with approval workflow
- Browser extension for assisted ATS execution
- Submission receipts with verification
- Application tracker with state machine
- Manual outcome capture
- Notifications (in-app, email)
- Organizations, cohorts, aggregate reporting
- Billing (free + Search)
- Admin and operations console
- Analytics, audit, privacy controls

### Non-Goals

Mass application blasting, LinkedIn automation, CAPTCHA bypass, immigration/legal advice, employer ATS, recruiter marketplace, social network, native mobile application, unrestricted autonomous browser agent, custom foundation model, interview cheating, automated protected-characteristic answers, complex CRM, universal global application automation.

## Brand & Messaging

### Positioning
NextJob is your AI career agent that finds the right opportunities, prepares better applications, safely handles repetitive work, and learns what gets you interviews.

### Hero
**Find better jobs. Apply smarter. Get interviewed.**

NextJob finds opportunities that genuinely fit, prepares truthful tailored applications, and handles repetitive work while you stay in control.

**Primary CTA:** Find my best jobs  
**Secondary CTA:** See how it works

### Brand Pillars
- **Relevant** - Opportunities that genuinely fit
- **Truthful** - Applications based on verified facts
- **Effortless** - Repetitive work handled safely
- **Transparent** - Clear explanations and receipts

### Voice
Clear, calm, human, confident, helpful, honest

**Avoid:**
- AI hype
- Technical jargon
- Fear
- Fake urgency
- "Beat the ATS"
- "Guaranteed interview"
- "Apply to thousands"
- "Undetectable automation"

## Customer-Facing Language

| Internal | User-facing |
|----------|-------------|
| Career Graph | Your Profile |
| Evidence | Verified details |
| Eligibility Engine | Can I apply? |
| Matching Engine | Why it fits |
| Risk Engine | Safety checks |
| Application Plan | Application preview |
| Approval Queue | Needs your review |
| Submission Receipt | Application receipt |
| Outcome Graph | What's working |
| Copilot | Review & Apply |
| Autopilot | Auto Apply |
| Unsupported claim | Needs your input |
| Connector | Application method |

Technical terminology remains internal.

## Critical Flows

1. **Onboarding:** User → sign up → import CV → review profile → confirm important details → set job preferences → set work eligibility → choose automation preferences.

2. **Application:** Job discovered → eligibility checked (MUST pass or be Unknown) → ranked → reviewed → tailored from verified profile → safety check → approvals obtained → executed → receipt generated → tracked.

3. **Sensitive field:** Question detected → risk classified as Sensitive → system blocks auto-fill → user provides answer only → answer stored with scope and expiration.

4. **Failure recovery:** Connector timeout → state set to FAILED_RETRYABLE → exponential retry → if exhausted → NEEDS_RECONCILIATION → manual fallback available.

## Requirements

- **FR-01 [Must]:** Every generated factual statement MUST map to verified profile information with evidence_id.
- **FR-02 [Must]:** Eligibility MUST be evaluated before ranking. Unknown MUST NOT silently become Eligible.
- **FR-03 [Must]:** Sensitive fields (demographics, disability, health) MUST require explicit user-only input.
- **FR-04 [Must]:** Every verified submission MUST produce a receipt containing job version, submitted fields, answer hashes, and confirmation evidence.
- **FR-05 [Must]:** Duplicate applications MUST be prevented via idempotency keys and unique user+job constraints.
- **FR-06 [Must]:** Every automated action MUST be explainable with reason, source, rule_version, and confidence.
- **FR-07 [Must]:** Policy precedence MUST be enforced: Legal/Safety > Platform > NextJob > Organization > User > Context.
- **FR-08 [Must]:** Ambiguous external submission results MUST NOT automatically retry.
- **FR-09 [Must]:** Organization reporting MUST be aggregate-only with minimum cohort thresholds.
- **FR-10 [Must]:** Users MUST be able to view, export, correct, and delete their data.
- **FR-11 [Should]:** Application answers SHOULD be stored for reuse with scope, risk_level, and expiration.
- **FR-12 [Should]:** Job cards SHOULD display all capability dimensions (Can I apply?, Fit, Profile coverage, Application method, Language, Automation, Freshness).
- **FR-13 [Should]:** Notifications SHOULD be limited to meaningful actions only.
- **FR-14 [Could]:** Interview preparation MAY generate likely questions and evidence-backed talking points.

### Onboarding Requirements

- **FR-ONB-01 [Must]:** Account creation MUST support email and social authentication.
- **FR-ONB-02 [Must]:** Profile import MUST accept PDF/DOCX and extract employment, education, skills, achievements, projects, certifications, and languages.
- **FR-ONB-03 [Must]:** Every extracted fact MUST be confirmed, edited, removed, or left unverified by the user.
- **FR-ONB-04 [Must]:** Preferences MUST capture target roles, seniority, industries, locations, remote/hybrid/on-site, salary expectations, company preferences, exclusions, relocation, and notice period.
- **FR-ONB-05 [Must]:** Eligibility MUST capture explicit user-provided work authorization, sponsorship requirement, location restrictions, and clearance/licensing requirements.
- **FR-ONB-06 [Must]:** Automation preferences MUST allow user to select what NextJob handles automatically, what requires review, and what always requires approval.

### Application State Machine

- **FR-ASM-01 [Must]:** Applications MUST progress through states: DISCOVERED → NORMALIZED → ELIGIBILITY_CHECKED → MATCHED → PLANNED → TAILORED → POLICY_CHECKED → NEEDS_APPROVAL / READY → EXECUTING → SUBMITTED_UNVERIFIED → SUBMITTED_VERIFIED.
- **FR-ASM-02 [Must]:** Outcome states MUST include: INTERVIEW, REJECTED, OFFER, WITHDRAWN, HIRED.
- **FR-ASM-03 [Must]:** Exception states MUST include: BLOCKED, NEEDS_USER, FAILED_RETRYABLE, NEEDS_RECONCILIATION, FAILED_FINAL, CANCELLED.
- **FR-ASM-04 [Must]:** State transitions MUST be atomic and auditable.

### Failure & Edge Cases

- **FR-FEC-01 [Must]:** System MUST explicitly handle: duplicate jobs, closed jobs, changed job descriptions, missing evidence, conflicting evidence, unknown eligibility, unsupported questions, sensitive questions, CAPTCHA, MFA, ATS timeout, partial submission, unknown submission result, connector outage, revoked OAuth, expired authorization, model failure, invalid structured output, malicious job content, user edits during execution, job removed during application, duplicate recruiter confirmation.
- **FR-FEC-02 [Must]:** Every failure MUST produce: clear status + plain-language explanation + recovery action.
- **FR-FEC-03 [Must]:** Ambiguous external submissions MUST NOT automatically retry (FR-08).

### Accessibility & Localization

- **FR-ACC-01 [Must]:** All user interfaces MUST meet WCAG 2.2 AA.
- **FR-ACC-02 [Must]:** System MUST support: keyboard navigation, screen-reader support, visible focus, semantic HTML, error identification, accessible approvals, no color-only meaning, responsive layouts.
- **FR-ACC-03 [Should]:** System SHOULD be RTL-ready and support locale-aware dates, currency formatting, address/phone localization.
- **FR-ACC-04 [Could]:** Additional languages MAY be supported post-MVP (architecture supports it).

### Analytics & Experimentation

- **FR-ANA-01 [Must]:** System MUST track product events for: onboarding, profile verification, job impressions, match decisions, eligibility, tailoring, approvals, submission, failures, outcomes, interviews, billing.
- **FR-ANA-02 [Must]:** System MUST NOT send raw resumes, sensitive answers or private application content to product analytics.
- **FR-ANA-03 [Should]:** Experiments SHOULD test: ranking, match explanations, tailoring, approval UX, notifications, onboarding, pricing.
- **FR-ANA-04 [Must]:** Primary experiment outcome MUST be verified interview lift.
- **FR-ANA-05 [Must]:** Experiment guardrails MUST include: unsupported claims, ineligible applications, duplicate submissions, sensitive-field errors, complaints, connector failures.

### Monetization

- **FR-MON-01 [Must]:** Free tier MUST include: build profile, discover jobs, understand fit, track applications, limited application assistance.
- **FR-MON-02 [Must]:** Search (~$39/30 days) MUST include: full matching, tailored applications, application assistance, receipts, interview preparation.
- **FR-MON-03 [Should]:** Agent (next phase) SHOULD add: safe automated applications.
- **FR-MON-04 [Must]:** System MUST NOT monetize: hidden credits, token pricing, candidate-data monetization, pay-per-interview, fake guarantees.

### Rollout Plan

- **FR-ROL-01 [Must]:** MVP (0-3 months) MUST include: identity, profile/career claims, evidence, job ingestion, eligibility, matching, tailoring, safety checks, approvals, extension, execution, receipts, tracker, organizations, billing, admin, analytics.
- **FR-ROL-02 [Should]:** V1 (3-6 months) SHOULD add: email outcome detection, interview preparation, additional ATS support, localization, experimentation, Search pricing optimization.
- **FR-ROL-03 [Could]:** V2 (6-12 months) MAY add: safe Auto Apply, outcome-informed ranking, expanded eligibility, B2B integrations, Career Vault, additional languages.

### Marketing & Landing Page

- **FR-MKT-01 [Must]:** Landing page MUST clearly communicate value proposition: "Find better jobs. Apply smarter. Get interviewed."
- **FR-MKT-02 [Must]:** Landing page MUST display: hero section with tagline, core differentiators (verified profile, eligibility-first, quality-first, safe automation, transparent, outcome learning, global clarity), target personas, pricing tiers (Free, Search, Agent), social proof placeholders, clear CTAs (Find my best jobs, See how it works).
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

### Visual Excellence

- **FR-VIS-01 [Must]:** Landing page MUST implement marketing design system: hero components, feature sections, pricing cards, testimonial components, CTA button variants.
- **FR-VIS-02 [Should]:** Landing page SHOULD implement scroll animations: Framer Motion for reveal effects, parallax scrolling, smooth transitions between sections.
- **FR-VIS-03 [Should]:** Landing page SHOULD implement micro-interactions: button hover states with scale/shadow, form field focus animations, loading state transitions.
- **FR-VIS-04 [Must]:** Landing page MUST implement loading skeletons: content placeholders during data fetch to prevent layout shift and improve perceived performance.
- **FR-VIS-05 [Should]:** Landing page SHOULD support video content: hero video backgrounds (muted, autoplay, loop), product walkthrough videos, testimonial videos with captions.
- **FR-VIS-06 [Should]:** Landing page SHOULD implement dark/light mode: respect user preference via prefers-color-scheme, provide manual toggle, persist choice in localStorage.
- **FR-VIS-07 [Must]:** Landing page MUST implement responsive images: art direction using <picture> element with different crops for mobile/tablet/desktop.
- **FR-VIS-08 [Must]:** Landing page MUST use consistent icon system: Lucide icons throughout, consistent sizing (16px inline, 24px section headers, 32px hero), proper color inheritance.

### Technical Excellence

- **FR-TECH-01 [Must]:** Landing page MUST implement security headers: Content-Security-Policy (restrictive), Strict-Transport-Security, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin).
- **FR-TECH-02 [Must]:** Landing page MUST implement progressive enhancement: core content accessible without JavaScript, enhanced experience with JS enabled, graceful degradation for older browsers.
- **FR-TECH-03 [Must]:** Landing page MUST implement error boundaries: catch React errors gracefully, display user-friendly error message, log error to monitoring service, offer retry option.
- **FR-TECH-04 [Must]:** Landing page MUST include branded 404 page: helpful message, search functionality, navigation links to popular pages, contact option, maintain brand consistency.
- **FR-TECH-05 [Must]:** Landing page MUST implement loading states: spinners for async actions, progress bars for multi-step processes, skeleton screens for content loading.
- **FR-TECH-06 [Must]:** Landing page MUST implement form validation: real-time feedback on input, inline error messages below fields, success states with confirmation, accessible error announcements.
- **FR-TECH-07 [Must]:** Landing page MUST implement bot protection: CAPTCHA on contact/signup forms (invisible reCAPTCHA v3), rate limiting on API endpoints (100 req/min per IP).
- **FR-TECH-08 [Must]:** Landing page MUST implement accessibility beyond WCAG: comprehensive ARIA labels, focus management for modals/drawers, screen reader testing with NVDA/VoiceOver, keyboard trap prevention.

## Acceptance

- **AC-01 → FR-01:** Given verified profile information with evidence, when tailoring generates a statement, then the statement references the claim_id and evidence_id.
- **AC-02 → FR-02:** Given a job requiring US work authorization, when a candidate has no authorization set, then eligibility returns Unknown with reason and source.
- **AC-03 → FR-03:** Given an application form asking about disability, when the system encounters the field, then it blocks auto-fill and presents user-only input.
- **AC-04 → FR-04:** Given a successful ATS submission, when the connector returns confirmation, then a receipt is generated with job_version, field_hashes, and verification_status.
- **AC-05 → FR-05:** Given a submitted application to job X, when the user triggers apply again for job X, then the system returns the existing receipt without re-submitting.
- **AC-06 → FR-08:** Given an ATS timeout with no confirmation, when the workflow retries, then it does not re-submit but transitions to NEEDS_RECONCILIATION.
- **AC-07 → FR-ASM-01:** Given an application in DISCOVERED state, when eligibility check passes, then state transitions to ELIGIBILITY_CHECKED with audit log entry.
- **AC-08 → FR-ASM-03:** Given an application in EXECUTING state, when connector fails, then state transitions to FAILED_RETRYABLE with retry count incremented.
- **AC-09 → FR-FEC-02:** Given a failed submission, when user views failure details, then they see clear status, plain-language explanation, and recovery action.
- **AC-10 → FR-ACC-01:** Given a user navigating with keyboard only, when they complete the application flow, then all interactive elements are reachable and operable.
- **AC-11 → FR-ANA-02:** Given a product analytics event, when inspected, then it contains no raw resumes, sensitive answers, or private application content.
- **AC-12 → FR-MKT-02:** Given a visitor lands on the homepage, when they scroll through the page, then they see: hero with tagline, 7 core differentiators, 4 target personas, 3 pricing tiers, signup CTA.
- **AC-13 → FR-MKT-03:** Given a visitor on mobile device, when they view the landing page, then all content is readable, CTAs are tappable, and layout doesn't require horizontal scrolling.
- **AC-14 → FR-MKT-04:** Given the landing page is indexed, when Google crawls it, then meta title, description, and structured data are present and accurate.
- **AC-15 → FR-MKT-05:** Given a visitor interacts with the landing page, when analytics are inspected, then page views, CTA clicks, and conversions are tracked without PII.
- **AC-16 → FR-MKT-08:** Given an institution administrator visits the landing page, when they navigate to the B2B section, then they see cohort management, aggregate reporting, privacy safeguards, and pricing information.
- **AC-17 → FR-PERF-01:** Given the landing page is loaded on a mid-tier mobile device on 4G, when measured with Lighthouse, then LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **AC-18 → FR-PERF-02:** Given images are displayed on the landing page, when inspected in network tab, then all images are served in WebP/AVIF format with appropriate sizes for viewport.
- **AC-19 → FR-SEO-01:** Given the landing page HTML, when validated with Google Rich Results Test, then all schema markup (Organization, Product, FAQ) passes validation with no errors.
- **AC-20 → FR-SEO-02:** Given a page URL is shared on social media, when preview is generated, then a branded Open Graph image (1200x630px) with title and description is displayed.
- **AC-21 → FR-VIS-04:** Given the landing page is loading, when content is being fetched, then skeleton screens are displayed with no layout shift.
- **AC-22 → FR-TECH-01:** Given the landing page HTTP response, when headers are inspected, then CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy are present and correctly configured.
- **AC-23 → FR-TECH-02:** Given JavaScript is disabled in the browser, when the landing page loads, then core content (hero, features, pricing) is still visible and readable.
- **AC-24 → FR-TECH-04:** Given a visitor navigates to a non-existent page, when the 404 page loads, then it displays a branded error page with search and navigation options.

## Validation

- **Hypothesis:** Evidence-constrained applications produce higher interview rates → Method: A/B test with/without evidence constraint → Sample: TBD → Metric: Interview rate → Threshold: TBD
- **Hypothesis:** Eligibility gating reduces wasted applications → Method: Cohort comparison → Sample: TBD → Metric: Application-to-interview ratio → Threshold: TBD
- **Hypothesis:** Users accept approval friction for sensitive fields → Method: Feature flag → Sample: TBD → Metric: Mode adoption + completion rate → Threshold: TBD

## Release Criteria

- 0 unsupported sensitive claims in evaluation suite
- 100% sensitive-field approval enforcement
- ≥95% supported-form field accuracy
- ≥98% receipt generation on supported connectors
- ≥95% duplicate prevention
- Eligibility false-positive threshold approved
- Tenant isolation tested
- Export/delete tested
- Backup/restore tested
- Disaster recovery tested
- WCAG critical journeys tested
- No unresolved critical security findings
- Every connector monitored
- Every connector has kill switch
- AI regression suite passing
- Privacy review complete
- Integration/terms review complete

## Risks & Decisions

| Risk | Mitigation | Status |
|------|-----------|--------|
| AI fabrication | Verified-profile-only generation | Working decision — needs validation |
| Wrong eligibility | Rules + sources + Unknown fallback | Working decision |
| Poor matches | Outcome-based ranking | Working decision |
| ATS changes | Versioned connectors + synthetic tests | Working decision |
| Duplicate applications | Idempotency + uniqueness | Working decision |
| Platform restrictions | Supported/assisted/manual model | Working decision |
| Sensitive-data exposure | Isolated sensitive storage | Working decision |
| Prompt injection | Untrusted-content isolation | Working decision |
| Global inconsistency | Explicit capability labels | Working decision |
| User distrust | Explainability + receipts | Working decision |
| High AI cost | Routing + caching + deterministic logic | Working decision |
| B2B privacy concerns | Aggregate-only reporting | Working decision |

**Open questions:**
- Search price ($39/30 days) not validated

**Approved decisions (2026-01-15):**
- Eligibility false-positive threshold: ≤2% (G-04)
- Profile coverage threshold before automatic submission: ≥80% (G-09)
- Organization minimum cohort size for reporting: ≥5 participants (G-10)

## Definition of Ready

Development starts only when a feature has:
- User problem
- User story
- Scope
- UX flow
- Requirements
- Acceptance criteria
- Data requirements
- API requirements
- Permissions
- Safety/risk classification
- Analytics events
- Dependencies
- Edge cases

## Definition of Done

A feature is production-ready only when complete across:
UX → copy → accessibility → API → authorization → validation → AI safeguards → privacy → security → audit → analytics → error recovery → tests → observability → documentation → support readiness

## Final Product Thesis

NextJob should feel less like software you operate and more like a trusted career agent working for you.

**Find better jobs. Apply smarter. Get interviewed.**

The winning experience is simple:
NextJob finds the opportunities → explains why they matter → prepares the application → asks only when necessary → safely handles the rest → proves what happened → learns what gets results.
