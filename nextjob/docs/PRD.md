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
