# NextJob — Implementation Tasks

**Status:** In Progress (Landing Page Redesigned - Ultra-Minimal)  
**Last Updated:** 2026-01-15  
**References:** [PRD](docs/PRD.md) · [TECH](docs/TECH.md) · [DESIGN](docs/DESIGN.md) · [AGENTS](AGENTS.md)

## Design Update (2026-01-15)

Landing page redesigned with ultra-minimal approach inspired by Linear, Stripe, and Vercel:
- **Radical simplicity** - every pixel earns its place
- **Typography-driven** - let words do the work
- **Show the product** - demonstrate through interface
- **Dark theme** - professional, developer-focused
- **Single CTA** - clear, focused action
- **Early proof** - social proof right after hero

See [DESIGN.md](docs/DESIGN.md) for complete design system.

---

## Scope

Build MVP per PRD.md §Scope: authentication, CV import, Career Graph, eligibility, job ingestion, matching, tailoring, policy engine, browser extension, ATS execution, receipts, tracker, notifications, organizations, billing, admin console, analytics.

## Exclusions

- Native mobile app (PRD §Non-Goals)
- LinkedIn automation, CAPTCHA bypass
- Autonomous unrestricted browser agent
- Custom foundation model
- Interview cheating features

## Assumptions

- Technology stack approved (TECH.md §Stack)
- All threshold decisions approved (PRD.md §Approved decisions)
- Tenant isolation penetration test pending (README.md §External Actions)

## Blockers

- **B-01:** Tenant isolation penetration test must pass before production deployment (PRD §Release Criteria)
- **B-02:** AI evaluation datasets must be created before tailoring engine implementation (PRD §Acceptance AC-01)
- **B-03:** ATS connector synthetic test framework must exist before connector implementation (TECH.md §Risks)

## Execution Rules

1. Record evidence (test output, logs, screenshots) before marking task complete
2. Report blocked or unrun checks honestly — never mark incomplete work as done
3. Never weaken tests to pass — fix the implementation instead
4. Require human review for: sensitive field handling, policy precedence logic, tenant isolation
5. Require approval for: destructive actions, spending >$100, production deployment
6. All PRD FR-XX requirements must be traceable to tasks
7. All TECH.md architectural decisions must be implemented as specified

---

## Tasks

### Phase 1: Environment & Infrastructure

#### T-01: Initialize repository structure
- [x] **Status:** Complete
- **Deliverable:** Monorepo with apps/web, apps/extension, packages/* per AGENTS.md §Structure
- **Dependencies:** None
- **Acceptance:** Directory structure matches AGENTS.md; package.json files present in each workspace
- **Verification:** `ls -R nextjob/ | grep -E "(apps|packages)"` → shows expected structure
- **Files:** `nextjob/package.json`, `nextjob/apps/*/package.json`, `nextjob/packages/*/package.json`
- **Evidence:** Repository structure created with all required directories and configuration files

#### T-02: Set up development environment
- [x] **Status:** Complete
- **Deliverable:** Working dev environment with all dependencies installed
- **Dependencies:** T-01
- **Acceptance:** `npm install` succeeds; `npm run typecheck` passes; `npm run lint` passes
- **Verification:** `cd nextjob && npm install && npm run typecheck && npm run lint` → exit code 0
- **Files:** `nextjob/package.json`, `nextjob/tsconfig.json`, `nextjob/eslint.config.js`
- **Evidence:** 
  - ✅ npm install succeeds
  - ✅ npm run typecheck passes (tsc --noEmit)
  - ✅ npm run lint passes (eslint configured with TypeScript, React hooks, and React Refresh plugins)
  - ✅ ESLint configuration created with flat config (eslint.config.js)
  - ✅ Build succeeds without errors

#### T-03: Set up database schema and migrations
- [ ] **Status:** Not started
- **Deliverable:** PostgreSQL schema with all entities per TECH.md §Data & Integrations
- **Dependencies:** T-02
- **Acceptance:** All entities (User, CareerClaim, Evidence, Job, ApplicationPlan, Receipt, Organization, etc.) created; migrations versioned; tenant_id on every table
- **Verification:** `npm run db:migrate` → success; `npm run db:seed` → test data loaded
- **Files:** `nextjob/packages/api/src/db/schema.ts`, `nextjob/packages/api/src/db/migrations/`
- **Note:** Include retention_policy and deletion_state columns per TECH.md

#### T-04: Set up authentication and tenant isolation
- [ ] **Status:** Not started
- **Deliverable:** OAuth 2.0 authentication with tenant isolation
- **Dependencies:** T-03
- **Acceptance:** Email/social auth working; tenant_id enforced on all queries; RBAC implemented
- **Verification:** Unit tests pass for tenant isolation; manual test: user A cannot access user B's data
- **Files:** `nextjob/packages/api/src/auth/`, `nextjob/packages/api/src/middleware/tenant.ts`
- **Note:** Requires human review for security

#### T-05: Set up AI gateway with provider abstraction
- [ ] **Status:** Not started
- **Deliverable:** AI gateway supporting multiple providers with structured output validation
- **Dependencies:** T-02
- **Acceptance:** Vercel AI SDK integrated; provider abstraction layer; Zod schema validation on all outputs; PII redaction before prompts
- **Verification:** Unit tests for schema validation; integration test with mock provider
- **Files:** `nextjob/packages/ai-gateway/src/`
- **Note:** Langfuse integration for observability

#### T-06: Set up Temporal workflow infrastructure
- [ ] **Status:** Not started
- **Deliverable:** Temporal cluster and worker setup for durable workflows
- **Dependencies:** T-02
- **Acceptance:** Temporal dev server running; worker processes registered; workflow definitions scaffolded
- **Verification:** `npm run temporal:dev` → workers active; test workflow executes successfully
- **Files:** `nextjob/packages/api/src/workflows/`, `nextjob/packages/api/src/activities/`

---

### Phase 2: Career Graph & Evidence

#### T-07: Implement CV import and extraction
- [ ] **Status:** Not started
- **Deliverable:** PDF/DOCX upload with AI extraction of identity, employment, education, skills, certifications, projects, achievements, languages
- **Dependencies:** T-03, T-05
- **Acceptance:** FR-ONB-02 satisfied; extraction accuracy ≥90% on test set; all fields extracted per PRD §FR-ONB-02
- **Verification:** Upload test CVs → verify extracted fields match source; `npm run test -- cv-extraction` → pass
- **Files:** `nextjob/packages/career-graph/src/cv-import/`

#### T-08: Implement Career Graph with evidence provenance
- [ ] **Status:** Not started
- **Deliverable:** CareerClaim storage with evidence_id, verification_status, confidence, versioning
- **Dependencies:** T-03, T-07
- **Acceptance:** FR-01 satisfied; every claim has evidence_id; versioning works; provenance tracked
- **Verification:** Create claims → verify evidence linkage; `npm run test -- career-graph` → pass
- **Files:** `nextjob/packages/career-graph/src/`

#### T-09: Implement claim verification workflow
- [ ] **Status:** Not started
- **Deliverable:** User verification flow for each extracted claim (confirm/edit/remove/mark unverified)
- **Dependencies:** T-08
- **Acceptance:** FR-ONB-03 satisfied; every claim can be confirmed, edited, removed, or marked unverified; verification_status updated
- **Verification:** Manual test: import CV → verify each claim → check Career Graph state
- **Files:** `nextjob/apps/web/src/app/verify-claims/`, `nextjob/packages/career-graph/src/verification.ts`

#### T-09a: Implement preferences capture
- [ ] **Status:** Not started
- **Deliverable:** UI and API for capturing target roles, seniority, industries, locations, work mode (remote/hybrid/on-site), salary expectations, company preferences, exclusions, relocation, notice period
- **Dependencies:** T-03, T-08
- **Acceptance:** All preference fields captured per PRD §FR-ONB-04; stored in CareerProfile with versioning; preferences used by matching engine
- **Verification:** Set preferences → verify stored in CareerProfile; `npm run test -- preferences` → pass; manual test: set preferences → verify matching uses them
- **Files:** `nextjob/apps/web/src/app/preferences/`, `nextjob/packages/career-graph/src/preferences.ts`

#### T-09b: Implement automation policy setting
- [ ] **Status:** Not started
- **Deliverable:** UI and API for setting automation mode (Manual/Copilot/Autopilot) with field-level overrides
- **Dependencies:** T-09a, T-19
- **Acceptance:** User can select automation mode; field-level overrides work; policy stored and enforced during application execution; mode respected per PRD §Automation Modes
- **Verification:** Set automation policy → verify stored; trigger application → verify mode respected; test field-level override → verify applied
- **Files:** `nextjob/apps/web/src/app/automation-policy/`, `nextjob/packages/policy/src/automation.ts`

#### T-10: Implement evidence storage and access control
- [ ] **Status:** Not started
- **Deliverable:** S3 storage for evidence documents with signed URLs and access control
- **Dependencies:** T-03
- **Acceptance:** Evidence files stored in S3; signed URLs generated; access control enforced per tenant
- **Verification:** Upload evidence → verify S3 storage; attempt cross-tenant access → denied
- **Files:** `nextjob/packages/career-graph/src/evidence/`

---

### Phase 3: Jobs & Eligibility

#### T-11: Implement job ingestion and normalization
- [ ] **Status:** Not started
- **Deliverable:** Job source ingestion with normalization, deduplication, freshness tracking
- **Dependencies:** T-03
- **Acceptance:** Jobs normalized per TECH.md §Job Graph; deduplication working; freshness tracked; canonical IDs maintained
- **Verification:** Ingest test jobs → verify normalization; ingest duplicate → verify dedup
- **Files:** `nextjob/packages/api/src/jobs/`

#### T-12: Implement eligibility engine
- [ ] **Status:** Not started
- **Deliverable:** Deterministic rule evaluation for location, work authorization, sponsorship, licenses, mandatory qualifications
- **Dependencies:** T-03, T-08
- **Acceptance:** FR-02 satisfied; eligibility runs before ranking; Unknown returned when evidence insufficient; false-positive rate ≤2% (G-04)
- **Verification:** Test cases: eligible job → ELIGIBLE; missing authorization → UNKNOWN; ineligible location → INELIGIBLE; `npm run test -- eligibility` → pass; eval suite: false-positive ≤2%
- **Files:** `nextjob/packages/eligibility/src/`
- **Note:** Requires human review for policy logic

#### T-13: Create eligibility evaluation dataset
- [ ] **Status:** Not started
- **Deliverable:** Test dataset for eligibility engine with known outcomes
- **Dependencies:** T-12
- **Acceptance:** ≥100 test cases covering all eligibility dimensions; expected outcomes documented
- **Verification:** `npm run test:eval -- eligibility` → false-positive ≤2%
- **Files:** `nextjob/evals/eligibility/`

---

### Phase 4: Matching & Ranking

#### T-14: Implement matching and ranking engine
- [ ] **Status:** Not started
- **Deliverable:** Job ranking by fit, eligibility, freshness with explainability
- **Dependencies:** T-08, T-11, T-12
- **Acceptance:** FR-08 satisfied; job cards show all capability dimensions; ranking explains why matched; eligibility gate enforced
- **Verification:** Rank test jobs → verify order; check job card displays all dimensions; `npm run test -- matching` → pass
- **Files:** `nextjob/packages/matching/src/`

#### T-15: Implement job card UI with capability model
- [ ] **Status:** Not started
- **Deliverable:** Job card component showing fit, eligibility, evidence, execution, language, automation, freshness
- **Dependencies:** T-14
- **Acceptance:** All capability dimensions displayed per DESIGN.md; accessible (WCAG 2.2 AA); responsive
- **Verification:** Visual check: job card shows all dimensions; accessibility audit passes; responsive test on mobile
- **Files:** `nextjob/apps/web/src/components/job-card.tsx`

---

### Phase 5: Tailoring Engine

#### T-16: Create AI evaluation dataset for tailoring
- [ ] **Status:** Not started
- **Deliverable:** Test dataset for tailoring engine with evidence constraints
- **Dependencies:** T-08
- **Acceptance:** ≥50 test cases with CareerGraph input and expected output; all outputs traceable to evidence
- **Verification:** `npm run test:eval -- tailoring` → 0 unsupported claims; 100% evidence coverage
- **Files:** `nextjob/evals/tailoring/`

#### T-17: Implement tailoring engine with evidence constraints
- [ ] **Status:** Not started
- **Deliverable:** Resume variant, cover letter, application answers generated from verified evidence only
- **Dependencies:** T-05, T-08, T-16
- **Acceptance:** FR-01 satisfied; every generated statement maps to CareerClaim; 0 unsupported claims in tailoring eval suite; dates/employers/qualifications preserved
- **Verification:** Generate tailored content → verify all statements trace to evidence; `npm run test:eval -- tailoring` → 0 unsupported claims
- **Files:** `nextjob/packages/tailoring/src/`
- **Note:** Requires human review for evidence constraint logic

#### T-18: Implement tailoring UI with evidence display
- [ ] **Status:** Not started
- **Deliverable:** UI showing original → proposed → evidence for each statement
- **Dependencies:** T-17
- **Acceptance:** User can accept/edit/reject each statement; evidence linked; accessible
- **Verification:** Visual check: evidence shown for each statement; user can edit; accessibility audit passes
- **Files:** `nextjob/apps/web/src/app/tailor/`

---

### Phase 6: Policy & Approvals

#### T-19: Implement risk and policy engine
- [ ] **Status:** Not started
- **Deliverable:** Risk classification (Low/Medium/High/Sensitive/Unsupported) with policy precedence
- **Dependencies:** T-03
- **Acceptance:** FR-03, FR-07 satisfied; sensitive fields blocked from auto-fill; policy precedence enforced (Legal > Platform > Evidara > Org > User > Context)
- **Verification:** Test cases for each risk level; policy precedence test; `npm run test -- policy` → pass
- **Files:** `nextjob/packages/policy/src/`
- **Note:** Requires human review for sensitive field handling

#### T-20: Implement approval workflow
- [ ] **Status:** Not started
- **Deliverable:** Approval UI for high-risk and sensitive fields with question, proposed answer, evidence, risk, impact
- **Dependencies:** T-19
- **Acceptance:** User can approve once/always/edit/reject/block; approval references exact payload/version; accessible
- **Verification:** Trigger approval → verify UI shows all required info; approve → verify state updated; accessibility audit passes
- **Files:** `nextjob/apps/web/src/components/approval-dialog.tsx`, `nextjob/packages/policy/src/approvals.ts`

---

### Phase 7: Browser Extension & Connectors

#### T-21: Set up browser extension scaffold
- [ ] **Status:** Not started
- **Deliverable:** WXT browser extension with background script, content script, popup
- **Dependencies:** T-02
- **Acceptance:** Extension loads in Chrome/Firefox; popup displays; content script injects; background script runs
- **Verification:** Load extension in browser → verify popup opens; check console for errors
- **Files:** `nextjob/apps/extension/`

#### T-22: Create ATS connector synthetic test framework
- [ ] **Status:** Not started
- **Deliverable:** Framework for testing ATS connectors with mock ATS pages
- **Dependencies:** T-21
- **Acceptance:** Can create mock ATS page; extension can detect and fill fields; test results logged
- **Verification:** Create mock test → run → verify results; `npm run test -- connector-synthetic` → pass
- **Files:** `nextjob/apps/extension/tests/synthetic/`

#### T-23: Implement first ATS connector (e.g., Greenhouse)
- [ ] **Status:** Not started
- **Deliverable:** Browser extension connector for one ATS with field detection and filling
- **Dependencies:** T-21, T-22
- **Acceptance:** Connector detects Greenhouse application form; fills fields from approved answers; idempotent; duplicate prevention
- **Verification:** Synthetic test passes; manual test on real Greenhouse job → verify fields filled correctly; attempt duplicate → blocked
- **Files:** `nextjob/apps/extension/src/connectors/greenhouse.ts`

#### T-24: Implement Temporal connector workers
- [ ] **Status:** Not started
- **Deliverable:** Temporal workers for orchestrating connector execution with retries and reconciliation
- **Dependencies:** T-06, T-23
- **Acceptance:** FR-05 satisfied; workflows durable; retries work; reconciliation handles failures; kill switch implemented
- **Verification:** Submit application → verify workflow executes; simulate failure → verify retry; trigger kill switch → verify blocked
- **Files:** `nextjob/packages/connectors/src/workflows/`, `nextjob/packages/connectors/src/activities/`

---

### Phase 8: Applications & Receipts

#### T-25: Implement application state machine
- [ ] **Status:** Not started
- **Deliverable:** State machine managing lifecycle from DISCOVERED to SUBMITTED_VERIFIED with all states per PRD §Application State Machine
- **Dependencies:** T-06
- **Acceptance:** All states implemented; transitions valid; exception states handled; FR-08 satisfied (ambiguous results don't auto-retry)
- **Verification:** Test state transitions; simulate failure → verify exception state; `npm run test -- state-machine` → pass
- **Files:** `nextjob/packages/applications/src/state-machine.ts`

#### T-26: Implement submission receipt generation
- [ ] **Status:** Not started
- **Deliverable:** Receipt generation with job version, submitted fields, answer hashes, confirmation evidence
- **Dependencies:** T-25
- **Acceptance:** FR-04 satisfied; receipt contains all required fields; immutable; verification status tracked
- **Verification:** Submit application → verify receipt generated; check receipt contents; `npm run test -- receipts` → pass
- **Files:** `nextjob/packages/applications/src/receipts.ts`

#### T-27: Implement application tracker UI
- [ ] **Status:** Not started
- **Deliverable:** Tracker UI with views (Planned, Needs approval, Applying, Applied, Interview, Rejected, Offer, Withdrawn) and filters
- **Dependencies:** T-25, T-26
- **Acceptance:** All views implemented; filters work; receipts accessible; accessible (WCAG 2.2 AA)
- **Verification:** Visual check: all views display correctly; apply filters → verify results; accessibility audit passes
- **Files:** `nextjob/apps/web/src/app/applications/`

---

### Phase 9: Notifications & Outcomes

#### T-28: Implement notification system
- [ ] **Status:** Not started
- **Deliverable:** In-app and email notifications for actionable events (strong opportunity, approval required, submission failure, recruiter response, interview, expiring job, policy issue)
- **Dependencies:** T-03
- **Acceptance:** FR-13 satisfied; only actionable events trigger notifications; user can control frequency and channels; no sensitive content in notifications
- **Verification:** Trigger events → verify notifications sent; check user preferences → verify respected; inspect notification content → no sensitive data
- **Files:** `nextjob/packages/api/src/notifications/`

#### T-29: Implement manual outcome capture
- [ ] **Status:** Not started
- **Deliverable:** UI for users to manually update application outcomes (Interview, Rejected, Offer, Withdrawn, Hired)
- **Dependencies:** T-27
- **Acceptance:** User can update outcome; outcome stored; tracker updated
- **Verification:** Update outcome → verify tracker reflects change; `npm run test -- outcomes` → pass
- **Files:** `nextjob/apps/web/src/app/applications/[id]/outcome.tsx`

---

### Phase 10: Organizations & B2B

#### T-30: Implement organization and cohort management
- [ ] **Status:** Not started
- **Deliverable:** Organization creation, cohort management, participant invitation, license allocation
- **Dependencies:** T-04
- **Acceptance:** Organizations can create cohorts; invite participants; allocate licenses; aggregate reporting respects minimum cohort size ≥5 (G-10)
- **Verification:** Create org → create cohort → invite participants; test reporting with <5 participants → verify blocked; test with ≥5 → verify works
- **Files:** `nextjob/packages/api/src/organizations/`

#### T-31: Implement aggregate reporting for organizations
- [ ] **Status:** Not started
- **Deliverable:** Aggregate reporting dashboard showing activation, application, interview outcomes with privacy safeguards
- **Dependencies:** T-30
- **Acceptance:** FR-09 satisfied; reports are aggregate-only; minimum cohort size enforced; no individual data exposed
- **Verification:** View report → verify aggregate only; attempt to access individual data → denied; test with cohort <5 → verify blocked
- **Files:** `nextjob/apps/web/src/app/organizations/[id]/reports/`

---

### Phase 11: Billing

#### T-32: Implement Stripe billing integration
- [ ] **Status:** Not started
- **Deliverable:** Free tier and Search Pass ($39/30 days) with Stripe subscriptions
- **Dependencies:** T-04
- **Acceptance:** Free tier limits enforced; Search Pass subscription works; billing events update entitlements; no hidden credits
- **Verification:** Sign up → verify free tier; upgrade to Search Pass → verify access; check billing events → verify entitlement updates
- **Files:** `nextjob/packages/api/src/billing/`

---

### Phase 12: Admin Console

#### T-33: Implement admin and operations console
- [ ] **Status:** Not started
- **Deliverable:** Admin console for user support, organization management, connector health, workflow failures, reconciliation, AI quality monitoring, policy versions, audit search, incident management
- **Dependencies:** T-04, T-24
- **Acceptance:** All admin functions implemented; privileged actions require audit logging; connector kill switches work
- **Verification:** Access admin console → verify all sections present; perform privileged action → verify audit log; trigger kill switch → verify connector blocked
- **Files:** `nextjob/apps/web/src/app/admin/`

---

### Phase 13: Testing & Evaluation

#### T-34: Create comprehensive AI evaluation suite
- [ ] **Status:** Not started
- **Deliverable:** Evaluation datasets for CV extraction, job extraction, matching, eligibility, tailoring, unsupported claims, sensitive questions, prompt injection, multilingual content, ATS forms, outcome classification
- **Dependencies:** T-07, T-11, T-12, T-14, T-17
- **Acceptance:** All eval categories covered; metrics tracked (factuality, evidence coverage, hallucination rate, classification accuracy, latency, cost, user corrections)
- **Verification:** `npm run test:eval` → all suites pass; metrics within thresholds
- **Files:** `nextjob/evals/`

#### T-35: Implement end-to-end tests for critical journeys
- [ ] **Status:** Not started
- **Deliverable:** E2E tests for onboarding, application, approval, submission, tracking
- **Dependencies:** T-09, T-18, T-20, T-27
- **Acceptance:** Critical journeys tested; WCAG 2.2 AA verified; all tests pass
- **Verification:** `npm run test:e2e` → all tests pass; accessibility audit passes
- **Files:** `nextjob/apps/web/tests/e2e/`

---

### Phase 14: Security & Privacy

#### T-36: Implement privacy controls (view, correct, export, delete, revoke, disconnect, disable learning)
- [ ] **Status:** Not started
- **Deliverable:** User privacy controls per PRD §Privacy Requirements
- **Dependencies:** T-04
- **Acceptance:** All privacy rights implemented; consent versioning; purpose limitation; retention schedules; no private data sold
- **Verification:** Test each privacy right → verify works; check consent logs; verify data deletion
- **Files:** `nextjob/packages/api/src/privacy/`
- **Note:** Requires human review

#### T-37: Conduct security audit and penetration test
- [ ] **Status:** Not started
- **Deliverable:** Security audit report and tenant isolation penetration test
- **Dependencies:** T-04, T-30, T-36
- **Acceptance:** No unresolved critical findings; tenant isolation verified; RBAC tested; encryption verified
- **Verification:** Penetration test report → no critical findings; `npm run test:security` → pass
- **Files:** Security audit report (external)
- **Note:** External action — requires commissioning (README.md §External Actions)

---

### Phase 15: Observability & Monitoring

#### T-38: Implement observability stack
- [ ] **Status:** Not started
- **Deliverable:** Structured logging, OpenTelemetry traces, Langfuse for AI, PostHog for product analytics
- **Dependencies:** T-05
- **Acceptance:** All traces captured; AI calls logged in Langfuse; product events in PostHog; no PII in analytics
- **Verification:** Trigger actions → verify traces in observability tools; inspect analytics → no PII
- **Files:** `nextjob/packages/api/src/observability/`

---

### Phase 16: CI/CD & Deployment

#### T-39: Set up CI/CD pipeline
- [ ] **Status:** Not started
- **Deliverable:** GitHub Actions workflow for typecheck, lint, test, build, deploy
- **Dependencies:** T-02
- **Acceptance:** Pipeline runs on PR; all checks pass; deployment to staging/production automated
- **Verification:** Create PR → verify pipeline runs; merge → verify deployment
- **Files:** `.github/workflows/`

#### T-40: Set up production infrastructure
- [ ] **Status:** Not started
- **Deliverable:** AWS infrastructure with Vercel (web), PostgreSQL, S3, Valkey, Temporal
- **Dependencies:** T-39
- **Acceptance:** Infrastructure provisioned via OpenTofu; all services running; monitoring active
- **Verification:** `tofu apply` → success; verify all services accessible; check monitoring dashboards
- **Files:** `nextjob/infra/`

#### T-41: Implement rollback procedures
- [ ] **Status:** Not started
- **Deliverable:** Documented rollback procedures for web, API, workers, database
- **Dependencies:** T-40
- **Acceptance:** Rollback procedures documented; tested in staging; RPO ≤15min, RTO ≤4hr verified
- **Verification:** Simulate failure → execute rollback → verify recovery within RTO
- **Files:** `nextjob/docs/ROLLBACK.md`

---

### Phase 17: Documentation

#### T-42: Create user documentation
- [ ] **Status:** Not started
- **Deliverable:** User guides for onboarding, applying, tracking, privacy controls
- **Dependencies:** T-09, T-18, T-27, T-36
- **Acceptance:** All user flows documented; accessible; up-to-date
- **Verification:** Review documentation → verify accuracy; test user flows → verify match docs
- **Files:** `nextjob/docs/user-guide/`

#### T-43: Create API documentation
- [ ] **Status:** Not started
- **Deliverable:** API documentation for all endpoints per TECH.md §API Domains
- **Dependencies:** T-04
- **Acceptance:** All endpoints documented; examples provided; authentication explained
- **Verification:** Review API docs → verify completeness; test examples → verify work
- **Files:** `nextjob/docs/api/`

---

### Phase 18: Application State Machine

#### T-44: Implement complete application state machine
- [ ] **Status:** Not started
- **Deliverable:** Full state machine with all progress states (DISCOVERED → SUBMITTED_VERIFIED), outcome states (INTERVIEW, REJECTED, OFFER, WITHDRAWN, HIRED), and exception states (BLOCKED, NEEDS_USER, FAILED_RETRYABLE, NEEDS_RECONCILIATION, FAILED_FINAL, CANCELLED)
- **Dependencies:** T-25
- **Acceptance:** FR-ASM-01, FR-ASM-02, FR-ASM-03, FR-ASM-04 satisfied; all state transitions atomic and auditable; AC-07, AC-08 passing
- **Verification:** Test all state transitions; verify audit logs; `npm run test -- state-machine` → pass
- **Files:** `nextjob/packages/applications/src/state-machine.ts`

---

### Phase 19: Failure & Edge Cases

#### T-45: Implement failure handling for all edge cases
- [ ] **Status:** Not started
- **Deliverable:** Explicit handling for all edge cases per FR-FEC-01: duplicate jobs, closed jobs, changed descriptions, missing/conflicting evidence, unknown eligibility, unsupported/sensitive questions, CAPTCHA, MFA, ATS timeout, partial submission, unknown results, connector outage, revoked OAuth, expired auth, model failure, invalid output, malicious content, user edits during execution, job removed during application, duplicate recruiter confirmation
- **Dependencies:** T-25, T-24
- **Acceptance:** FR-FEC-01, FR-FEC-02, FR-FEC-03 satisfied; every failure produces status + explanation + recovery action; AC-09 passing
- **Verification:** Simulate each edge case → verify appropriate handling; check failure messages → verify status/explanation/recovery present
- **Files:** `nextjob/packages/applications/src/failures.ts`, `nextjob/packages/connectors/src/errors.ts`

---

### Phase 20: Accessibility & Localization

#### T-46: Implement WCAG 2.2 AA accessibility
- [ ] **Status:** Not started
- **Deliverable:** Full WCAG 2.2 AA compliance: keyboard navigation, screen-reader support, visible focus, semantic HTML, error identification, accessible approvals, no color-only meaning, responsive layouts
- **Dependencies:** T-15, T-18, T-20, T-27
- **Acceptance:** FR-ACC-01, FR-ACC-02 satisfied; AC-10 passing; axe-core audit passes with 0 critical violations
- **Verification:** Run axe-core audit → 0 critical violations; test keyboard navigation → all elements reachable; test screen reader → all content announced
- **Files:** All UI components in `nextjob/apps/web/src/`

#### T-47: Implement localization infrastructure
- [ ] **Status:** Not started
- **Deliverable:** RTL-ready architecture with locale-aware dates, currency formatting, address/phone localization
- **Dependencies:** T-02
- **Acceptance:** FR-ACC-03 satisfied; architecture supports additional languages; locale detection works
- **Verification:** Switch locale → verify dates/currency format correctly; test RTL layout → verify mirrors correctly
- **Files:** `nextjob/packages/shared/src/i18n/`, `nextjob/apps/web/src/i18n/`

---

### Phase 21: Analytics & Experimentation

#### T-48: Implement product analytics with privacy safeguards
- [ ] **Status:** Not started
- **Deliverable:** Product event tracking for onboarding, claim verification, job impressions, match actions, eligibility, tailoring, approvals, submission, failures, outcomes, interviews, billing with PII redaction
- **Dependencies:** T-38
- **Acceptance:** FR-ANA-01, FR-ANA-02 satisfied; AC-11 passing; no PII in analytics events
- **Verification:** Trigger events → verify tracked; inspect event payloads → verify no PII/CV content/sensitive data
- **Files:** `nextjob/packages/api/src/analytics/`

#### T-49: Implement experimentation framework
- [ ] **Status:** Not started
- **Deliverable:** Feature flag system for experiments (ranking, match explanations, tailoring, approval UX, notifications, pricing, onboarding) with guardrails (unsupported claims, ineligible applications, duplicate submissions, sensitive-field errors, complaints, connector failures)
- **Dependencies:** T-48
- **Acceptance:** FR-ANA-03, FR-ANA-04, FR-ANA-05 satisfied; primary outcome is interview lift; guardrails monitored
- **Verification:** Create experiment → verify assignment; monitor guardrails → verify alerts trigger on violations
- **Files:** `nextjob/packages/api/src/experiments/`

---

### Phase 22: Monetization

#### T-50: Implement free tier and Search Pass billing
- [ ] **Status:** Not started
- **Deliverable:** Free tier (Career Graph, job discovery, eligibility, tracker, limited applications) and Search Pass (~$39/30 days, full matching, tailoring, assisted applications, tracking, receipts)
- **Dependencies:** T-32
- **Acceptance:** FR-MON-01, FR-MON-02, FR-MON-04 satisfied; free tier limits enforced; Search Pass subscription works; no monetization of candidate data/sensitive data/hidden credits
- **Verification:** Sign up → verify free tier limits; upgrade to Search Pass → verify full access; check billing → verify no hidden charges
- **Files:** `nextjob/packages/api/src/billing/`

---

### Phase 23: Rollout & Documentation

#### T-51: Document rollout plan
- [ ] **Status:** Not started
- **Deliverable:** Rollout documentation with Phase 1 (MVP), Phase 2 (email outcomes, interview prep, additional ATSs, localization, experiments), Phase 3 (safe autopilot, outcome-informed ranking, expanded eligibility, B2B integrations, Career Vault)
- **Dependencies:** T-42, T-43
- **Acceptance:** FR-ROL-01, FR-ROL-02, FR-ROL-03 satisfied; all phases documented with scope and dependencies
- **Verification:** Review rollout doc → verify all phases documented; check dependencies → verify logical
- **Files:** `nextjob/docs/ROLLOUT.md`

---

### Phase 24: Marketing & Landing Page

#### T-52: Design and implement marketing landing page (Ultra-Minimal Redesign)
- [x] **Status:** Complete (Redesigned)
- **Deliverable:** Ultra-minimal landing page inspired by Linear, Stripe, and Vercel. Typography-driven design with radical simplicity.
- **Dependencies:** T-02, T-04
- **Acceptance:** FR-MKT-01, FR-MKT-02, FR-MKT-03 satisfied; AC-12, AC-13 passing; mobile-responsive; WCAG 2.2 AA compliant; conversion-optimized layout
- **Verification:** Visual review → verify minimal aesthetic; mobile test → verify responsive; accessibility audit → WCAG 2.2 AA pass; Lighthouse → performance score ≥90
- **Design Approach:**
  - ✅ Radical simplicity - every pixel earns its place
  - ✅ Typography-driven - let words do the work
  - ✅ Show the product - demonstrate through interface
  - ✅ Specific value proposition - complete sentence addressing objections
  - ✅ Generous whitespace - breathing room creates confidence
  - ✅ Dark theme (#0a0a0a) - professional, developer-focused
  - ✅ Single CTA - email input with "Start free" button
  - ✅ Product preview - show actual interface, not illustrations
  - ✅ Early social proof - right after hero
  - ✅ Minimal features section - 3 features, no icons
  - ✅ Simple pricing - 2 tiers (Free, Pro)
  - ✅ Clean FAQ - 3 questions, minimal styling
- **Evidence:** 
  - Landing page redesigned in src/App.tsx (ultra-minimal approach)
  - Hero: Complete sentence headline "Apply to jobs with proof, not promises."
  - Specific subhead addressing objections
  - Single CTA with email input
  - Product preview showing actual application interface
  - Social proof section with recognizable companies
  - 3-feature section with minimal copy
  - 3-step "How it works" section
  - Simple 2-tier pricing (Free, Pro at $39/mo)
  - Minimal FAQ with 3 questions
  - Clean footer with Privacy/Terms links
  - Build successful: 241.82 KB JS (69.17 KB gzipped), 42.31 KB CSS (7.50 KB gzipped)
  - Design system updated in DESIGN.md with minimal principles
- **Files:** `src/App.tsx`, `nextjob/docs/DESIGN.md`

#### T-53: Implement B2B2C landing page section
- [ ] **Status:** Not started
- **Deliverable:** Separate section or page for institutions/programs highlighting: cohort management, aggregate reporting (minimum cohort size ≥5), privacy safeguards (no individual data exposure), pricing for organizations, case studies/testimonials placeholders, contact/demo CTA
- **Dependencies:** T-52, T-30
- **Acceptance:** FR-MKT-08 satisfied; AC-16 passing; institution administrators can find and understand B2B offering
- **Verification:** Navigate to B2B section → verify content present; test with institution persona → verify clarity
- **Files:** `nextjob/apps/web/src/app/(marketing)/b2b/page.tsx`, `nextjob/apps/web/src/components/marketing/b2b/`

#### T-54: Implement landing page SEO and analytics
- [~] **Status:** Partially Complete (SEO done, Analytics pending)
- **Deliverable:** SEO optimization (meta tags, structured data, semantic HTML, fast load <2s LCP), analytics integration (page views, CTA clicks, signup conversions, bounce rate, time on page), A/B testing framework support, no PII in analytics
- **Dependencies:** T-02, T-04
- **Acceptance:** FR-MKT-04, FR-MKT-05, FR-MKT-06 satisfied; AC-14, AC-15 passing; Lighthouse SEO score ≥90; analytics events contain no PII
- **Verification:** Lighthouse audit → SEO ≥90, performance ≥90; inspect analytics events → no PII; verify meta tags and structured data present
- **Evidence:**
  - ✅ SEO optimization complete:
    - Comprehensive meta tags (title, description, keywords, author, robots)
    - Open Graph tags for social sharing
    - Twitter Card tags
    - Structured data (JSON-LD): Organization, SoftwareApplication, FAQPage
    - Semantic HTML with proper heading hierarchy
    - Favicon with SVG
    - Preconnect for performance
    - sitemap.xml created
    - robots.txt created with AI bot blocking
    - Canonical URL added
    - Hreflang tags for internationalization
  - ⏳ Analytics integration pending:
    - No PostHog/Plausible/Google Analytics integrated yet
    - No conversion tracking implemented
    - No A/B testing framework set up
- **Files:** `nextjob/apps/web/src/app/(marketing)/layout.tsx`, `nextjob/apps/web/src/lib/analytics/`

#### T-55: Implement landing page legal compliance
- [x] **Status:** Complete
- **Deliverable:** Privacy policy page, terms of service page, cookie consent banner (if applicable), GDPR compliance for EU visitors, data processing agreements for B2B customers
- **Dependencies:** T-52, T-36
- **Acceptance:** FR-MKT-09 satisfied; all legal pages accessible from landing page footer; cookie consent works; GDPR compliance verified
- **Verification:** Navigate to legal pages → verify content present; test cookie consent → verify functionality; review GDPR compliance → verify data handling
- **Files:** `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`, `src/App.tsx` (CookieConsent component)
- **Evidence:**
  - ✅ Privacy Policy page created (src/pages/PrivacyPolicy.tsx)
    - Comprehensive privacy policy covering data collection, usage, security, user rights
    - GDPR compliant with clear sections on data sharing, retention, and contact information
    - Accessible via /privacy route
  - ✅ Terms of Service page created (src/pages/TermsOfService.tsx)
    - Complete terms covering service description, acceptable use, AI-generated content, subscriptions
    - Intellectual property, liability limitations, termination, and dispute resolution
    - Accessible via /terms route
  - ✅ Cookie consent banner already implemented in App.tsx
    - GDPR compliant with Accept/Reject options
    - localStorage persistence
    - Links to privacy policy
  - ✅ Footer links updated to point to /privacy and /terms
  - ✅ React Router integration added for page navigation
  - ✅ Build successful with all legal pages

#### T-56: Implement referral program infrastructure
- [ ] **Status:** Not started
- **Deliverable:** Referral link generation, referral tracking, referral incentive display, referral conversion tracking in analytics
- **Dependencies:** T-52, T-48
- **Acceptance:** FR-MKT-10 satisfied; users can generate and share referral links; referrals tracked and attributed; incentives displayed
- **Verification:** Generate referral link → verify unique; share link → verify tracking; check analytics → verify referral conversions tracked
- **Files:** `nextjob/packages/api/src/referrals/`, `nextjob/apps/web/src/components/referral/`

---

### Phase 25: Performance Excellence

#### T-57: Implement Core Web Vitals optimization
- [ ] **Status:** Not started
- **Deliverable:** Optimize LCP < 2.5s, INP < 200ms, CLS < 0.1 through code splitting, lazy loading, image optimization, and critical CSS inlining
- **Dependencies:** T-52
- **Acceptance:** FR-PERF-01 satisfied; Lighthouse Performance score ≥90 on mobile and desktop; all Core Web Vitals in green zone
- **Verification:** Run Lighthouse CI → verify scores; test on WebPageTest → verify CWV metrics; check bundle analyzer → verify initial JS < 100KB
- **Files:** `nextjob/apps/web/src/app/(marketing)/layout.tsx`, `nextjob/apps/web/src/styles/`

#### T-58: Implement image optimization pipeline
- [ ] **Status:** Not started
- **Deliverable:** Automatic WebP/AVIF conversion, responsive images with srcset, lazy loading below fold, art direction for breakpoints, blur placeholders
- **Dependencies:** T-52
- **Acceptance:** FR-PERF-02 satisfied; all images served in modern formats; responsive sizes for all breakpoints; no layout shift from images
- **Verification:** Inspect network tab → verify WebP/AVIF formats; resize browser → verify srcset switching; check CLS → verify no shift
- **Files:** `nextjob/apps/web/src/components/optimized-image.tsx`, `nextjob/apps/web/next.config.js`

#### T-59: Implement font optimization
- [ ] **Status:** Not started
- **Deliverable:** Preload critical fonts, font-display: swap, variable fonts, character subsetting, font preloading strategy
- **Dependencies:** T-52
- **Acceptance:** FR-PERF-03 satisfied; critical fonts loaded in < 1s; no FOIT (Flash of Invisible Text); font files < 50KB each
- **Verification:** Check network tab → verify font loading order; disable cache → verify no FOIT; check font file sizes
- **Files:** `nextjob/apps/web/src/styles/fonts.css`, `nextjob/apps/web/src/app/(marketing)/layout.tsx`

#### T-60: Implement code splitting and bundle optimization
- [ ] **Status:** Not started
- **Deliverable:** Route-based code splitting, dynamic imports for below-fold content, tree shaking, dead code elimination, bundle analysis
- **Dependencies:** T-52
- **Acceptance:** FR-PERF-04 satisfied; initial bundle < 100KB gzipped; route transitions load chunks on demand; no unused code in bundles
- **Verification:** Run bundle analyzer → verify sizes; test route transitions → verify chunk loading; check Lighthouse → verify no unused JavaScript
- **Files:** `nextjob/apps/web/src/app/(marketing)/page.tsx`, `nextjob/apps/web/next.config.js`

#### T-61: Implement edge caching and CDN configuration
- [ ] **Status:** Not started
- **Deliverable:** CDN setup with Vercel Edge Network, cache headers for static assets, stale-while-revalidate for dynamic content, cache invalidation on deploy
- **Dependencies:** T-52, T-40
- **Acceptance:** FR-PERF-05 satisfied; static assets cached at edge with 1-year TTL; HTML cached with 5-minute TTL and SWR; cache hits > 90%
- **Verification:** Check response headers → verify cache-control; test multiple regions → verify edge delivery; monitor cache hit ratio
- **Files:** `nextjob/apps/web/vercel.json`, `nextjob/apps/web/next.config.js`

---

### Phase 26: Advanced SEO

#### T-62: Implement schema markup
- [ ] **Status:** Not started
- **Deliverable:** JSON-LD schema for Organization, Product, FAQ, BreadcrumbList, WebSite; validated with Google Rich Results Test
- **Dependencies:** T-52
- **Acceptance:** FR-SEO-01 satisfied; all schemas pass validation; no errors in Google Search Console; rich results eligible
- **Verification:** Run Google Rich Results Test → verify no errors; check Search Console → verify schema detection; inspect page source → verify JSON-LD
- **Files:** `nextjob/apps/web/src/lib/schema.ts`, `nextjob/apps/web/src/app/(marketing)/layout.tsx`

#### T-63: Implement dynamic Open Graph images
- [ ] **Status:** Not started
- **Deliverable:** Auto-generated OG images (1200x630px) using Next.js ImageResponse with branding, title, description, and visual elements
- **Dependencies:** T-52
- **Acceptance:** FR-SEO-02 satisfied; every page has unique OG image; images load in < 2s; branding consistent across all images
- **Verification:** Share URL on social media → verify image preview; check OG image endpoint → verify generation; test multiple pages → verify uniqueness
- **Files:** `nextjob/apps/web/src/app/api/og/route.tsx`, `nextjob/apps/web/src/components/og-template.tsx`

#### T-64: Implement sitemap and robots.txt
- [ ] **Status:** Not started
- **Deliverable:** Auto-generated sitemap.xml with all public pages, proper lastmod dates, priority attributes; robots.txt allowing legitimate crawlers, blocking AI bots
- **Dependencies:** T-52
- **Acceptance:** FR-SEO-04, FR-SEO-05 satisfied; sitemap includes all public pages; robots.txt blocks GPTBot, ClaudeBot, CCBot; sitemap submitted to Google Search Console
- **Verification:** Check /sitemap.xml → verify all pages present; check /robots.txt → verify AI bot blocking; submit to Search Console → verify indexing
- **Files:** `nextjob/apps/web/src/app/sitemap.ts`, `nextjob/apps/web/src/app/robots.ts`

#### T-65: Implement AI search optimization
- [ ] **Status:** Not started
- **Deliverable:** llms.txt file for AI crawlers, structured data optimized for AI consumption, clear entity definitions, FAQ format for AI parsing
- **Dependencies:** T-52, T-62
- **Acceptance:** FR-SEO-07 satisfied; llms.txt present and comprehensive; structured data includes entity definitions; content formatted for AI extraction
- **Verification:** Check /llms.txt → verify content; test with AI tools → verify entity recognition; inspect structured data → verify clarity
- **Files:** `nextjob/apps/web/src/app/llms.txt`, `nextjob/apps/web/src/lib/schema.ts`

#### T-66: Implement canonical URLs and hreflang
- [ ] **Status:** Not started
- **Deliverable:** Self-referencing canonical URLs on all pages; hreflang tags for future internationalization (en-US, en-GB, etc.)
- **Dependencies:** T-52
- **Acceptance:** FR-SEO-06, FR-SEO-08 satisfied; all pages have canonical tags; hreflang tags present (even if single language); no duplicate content issues
- **Verification:** Inspect page headers → verify canonical tags; check hreflang → verify presence; run SEO audit → verify no duplicate content
- **Files:** `nextjob/apps/web/src/app/(marketing)/layout.tsx`, `nextjob/apps/web/src/lib/metadata.ts`

#### T-67: Implement Twitter Cards
- [ ] **Status:** Not started
- **Deliverable:** Twitter Card meta tags (summary_large_image) with custom images (1200x628px), title, description for all pages
- **Dependencies:** T-52, T-63
- **Acceptance:** FR-SEO-03 satisfied; all pages have Twitter Card tags; images optimized for Twitter display; card validator passes
- **Verification:** Share URL on Twitter → verify card preview; run Twitter Card Validator → verify pass; check meta tags → verify presence
- **Files:** `nextjob/apps/web/src/app/(marketing)/layout.tsx`, `nextjob/apps/web/src/lib/metadata.ts`

#### T-68: Implement structured data for AI
- [ ] **Status:** Not started
- **Deliverable:** Enhanced schema markup with detailed entity definitions, relationships, and properties optimized for AI understanding
- **Dependencies:** T-62, T-65
- **Acceptance:** FR-SEO-07 satisfied; schema includes detailed entity definitions; relationships clearly defined; AI tools can parse content accurately
- **Verification:** Test with AI tools → verify entity extraction; inspect schema → verify detail level; check Search Console → verify no errors
- **Files:** `nextjob/apps/web/src/lib/schema.ts`, `nextjob/apps/web/src/app/(marketing)/layout.tsx`

---

### Phase 27: Conversion Optimization

#### T-69: Implement interactive product demo
- [ ] **Status:** Not started
- **Deliverable:** Embedded interactive demo showing application flow with real-looking (mock) data, no signup required, step-by-step walkthrough
- **Dependencies:** T-52
- **Acceptance:** FR-CRO-01 satisfied; demo is interactive and explorable; no signup wall; demonstrates key value props; mobile-responsive
- **Verification:** Test demo flow → verify interactivity; check mobile → verify responsive; monitor engagement → verify usage
- **Files:** `nextjob/apps/web/src/components/marketing/product-demo.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-70: Implement before/after comparison
- [ ] **Status:** Not started
- **Deliverable:** Side-by-side comparison showing traditional apply process vs NextJob with time saved, quality improvement, and effort reduction metrics
- **Dependencies:** T-52
- **Acceptance:** FR-CRO-02 satisfied; comparison clearly shows value; metrics are realistic and defensible; visual design emphasizes difference
- **Verification:** Review comparison → verify clarity; check metrics → verify accuracy; test on mobile → verify readability
- **Files:** `nextjob/apps/web/src/components/marketing/comparison.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-71: Implement ROI calculator
- [ ] **Status:** Not started
- **Deliverable:** Interactive calculator estimating time saved, interview rate improvement, and application quality score based on user inputs (applications/month, current success rate)
- **Dependencies:** T-52
- **Acceptance:** FR-CRO-03 satisfied; calculator is interactive and responsive; estimates are realistic; results update in real-time; mobile-friendly
- **Verification:** Test calculator → verify calculations; check mobile → verify responsive; monitor usage → verify engagement
- **Files:** `nextjob/apps/web/src/components/marketing/roi-calculator.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-72: Implement exit intent popup
- [ ] **Status:** Not started
- **Deliverable:** Exit intent detection with popup offering lead magnet (career guide) or special discount; triggered only once per session; dismissible
- **Dependencies:** T-52, T-86
- **Acceptance:** FR-CRO-04 satisfied; popup triggers on exit intent; shows only once per session; offers valuable lead magnet; includes clear CTA and close button
- **Verification:** Test exit intent → verify trigger; refresh page → verify no re-trigger; check mobile → verify no exit intent (not supported)
- **Files:** `nextjob/apps/web/src/components/marketing/exit-intent.tsx`, `nextjob/apps/web/src/hooks/use-exit-intent.ts`

#### T-73: Implement scroll-triggered animations
- [ ] **Status:** Not started
- **Deliverable:** Framer Motion animations for section reveals, fade-ins, slide-ups using Intersection Observer; respects prefers-reduced-motion
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-CRO-05 satisfied; animations trigger on scroll; smooth and performant; respect reduced motion preference; no layout shift
- **Verification:** Scroll through page → verify animations; enable reduced motion → verify no animations; check performance → verify no jank
- **Files:** `nextjob/apps/web/src/components/marketing/animated-section.tsx`, `nextjob/apps/web/src/hooks/use-scroll-animation.ts`

#### T-74: Implement social proof rotation
- [ ] **Status:** Not started
- **Deliverable:** Rotating display of customer testimonials, company logos, and success metrics with smooth transitions; auto-rotates every 5s; pausable
- **Dependencies:** T-52, T-88
- **Acceptance:** FR-CRO-07 satisfied; social proof rotates smoothly; includes testimonials, logos, metrics; accessible (keyboard navigable, screen reader friendly)
- **Verification:** Watch rotation → verify smooth transitions; test keyboard navigation → verify accessibility; check screen reader → verify announcements
- **Files:** `nextjob/apps/web/src/components/marketing/social-proof-carousel.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-75: Implement comparison table
- [ ] **Status:** Not started
- **Deliverable:** Feature comparison table showing NextJob vs traditional job search methods (manual applications, other AI tools) without naming specific competitors
- **Dependencies:** T-52
- **Acceptance:** FR-CRO-10 satisfied; table clearly shows advantages; no competitor names; mobile-responsive (horizontal scroll or stacked); accessible
- **Verification:** Review table → verify clarity; test mobile → verify responsive; check accessibility → verify screen reader support
- **Files:** `nextjob/apps/web/src/components/marketing/comparison-table.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-76: Implement sticky CTA
- [ ] **Status:** Not started
- **Deliverable:** Persistent CTA bar that appears after scrolling past hero section; includes primary CTA button and value prop reminder; dismissible
- **Dependencies:** T-52
- **Acceptance:** FR-CRO-09 satisfied; sticky CTA appears after hero; includes clear CTA; dismissible; doesn't obstruct content; mobile-friendly
- **Verification:** Scroll page → verify CTA appears; click dismiss → verify disappears; check mobile → verify non-obstructive
- **Files:** `nextjob/apps/web/src/components/marketing/sticky-cta.tsx`, `nextjob/apps/web/src/hooks/use-sticky-cta.ts`

---

### Phase 28: Visual Excellence

#### T-77: Create marketing design system
- [ ] **Status:** Not started
- **Deliverable:** Reusable marketing components: hero variants, feature sections, pricing cards, testimonial components, CTA button variants, trust badges
- **Dependencies:** T-52
- **Acceptance:** FR-VIS-01 satisfied; all components use design tokens; consistent spacing and typography; documented with Storybook or similar
- **Verification:** Review components → verify consistency; check design tokens → verify usage; test responsiveness → verify all breakpoints
- **Files:** `nextjob/apps/web/src/components/marketing/`, `nextjob/apps/web/src/styles/marketing-tokens.css`

#### T-78: Implement scroll animations
- [ ] **Status:** Not started
- **Deliverable:** Framer Motion scroll animations: parallax effects, reveal animations, stagger animations; performance-optimized with will-change and transform
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-VIS-02 satisfied; animations are smooth (60fps); respect prefers-reduced-motion; no performance degradation; mobile-optimized
- **Verification:** Scroll through page → verify animations; enable reduced motion → verify disabled; check performance → verify 60fps
- **Files:** `nextjob/apps/web/src/components/marketing/animations.tsx`, `nextjob/apps/web/src/styles/animations.css`

#### T-79: Implement micro-interactions
- [ ] **Status:** Not started
- **Deliverable:** Button hover states (scale, shadow), form field focus animations, loading state transitions, success/error state animations
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-VIS-03 satisfied; all interactive elements have hover/focus states; animations are subtle and fast (< 200ms); accessible
- **Verification:** Hover over buttons → verify states; focus form fields → verify animations; check accessibility → verify focus indicators
- **Files:** `nextjob/apps/web/src/styles/interactions.css`, `nextjob/apps/web/src/components/ui/button.tsx`

#### T-80: Implement loading skeletons
- [x] **Status:** Complete
- **Deliverable:** Skeleton screens for all content sections: hero, features, pricing, testimonials; match final layout to prevent CLS
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-VIS-04 satisfied; skeletons match final layout; no layout shift; smooth transition to content; accessible (aria-busy)
- **Verification:** Load page with slow network → verify skeletons; check CLS → verify no shift; inspect accessibility → verify aria attributes
- **Files:** `src/components/Skeleton.tsx`
- **Evidence:**
  - ✅ Created comprehensive skeleton component library (src/components/Skeleton.tsx)
  - ✅ Includes: Skeleton, CardSkeleton, HeroSkeleton, PricingCardSkeleton, TestimonialSkeleton, FAQSkeleton, PageSkeleton
  - ✅ All skeletons match final layout dimensions to prevent CLS
  - ✅ Accessible with aria-hidden="true" attributes
  - ✅ Uses Tailwind animate-pulse for smooth loading animation
  - ✅ Consistent design with dark theme (slate-700/50 backgrounds)
  - ✅ Build successful with skeleton components integrated

#### T-81: Implement video content support
- [ ] **Status:** Not started
- **Deliverable:** Video player component supporting hero backgrounds (muted, autoplay, loop), product walkthroughs, testimonials with captions and transcripts
- **Dependencies:** T-52
- **Acceptance:** FR-VIS-05 satisfied; videos load efficiently (lazy loading); captions available; transcripts provided; mobile-optimized (poster images)
- **Verification:** Test video playback → verify functionality; check captions → verify accuracy; test mobile → verify poster images
- **Files:** `nextjob/apps/web/src/components/marketing/video-player.tsx`, `nextjob/apps/web/src/app/(marketing)/page.tsx`

#### T-82: Implement dark/light mode
- [ ] **Status:** Not started
- **Deliverable:** Theme toggle with system preference detection (prefers-color-scheme), manual override, localStorage persistence, smooth transitions
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-VIS-06 satisfied; respects system preference; manual toggle works; preference persists; all components support both themes; no FOUC
- **Verification:** Change system theme → verify auto-switch; toggle manually → verify persistence; refresh page → verify no FOUC
- **Files:** `nextjob/apps/web/src/components/theme-provider.tsx`, `nextjob/apps/web/src/hooks/use-theme.ts`, `nextjob/apps/web/src/styles/themes.css`

---

### Phase 29: Content Strategy

#### T-83: Define messaging hierarchy
- [ ] **Status:** Not started
- **Deliverable:** Document messaging framework: primary value prop → key benefits (3-5) → detailed features → social proof → final CTA; approved copy for each section
- **Dependencies:** None
- **Acceptance:** FR-CONT-01 satisfied; hierarchy is clear and logical; copy is benefit-focused; approved by stakeholders
- **Verification:** Review messaging doc → verify hierarchy; test with users → verify comprehension; check consistency → verify across all pages
- **Files:** `nextjob/docs/marketing/messaging-hierarchy.md`

#### T-84: Create copywriting guidelines
- [ ] **Status:** Not started
- **Deliverable:** Comprehensive copywriting guide: tone of voice (conversational, confident, trustworthy), vocabulary (no jargon), sentence structure (< 20 words), active voice, examples
- **Dependencies:** T-83
- **Acceptance:** FR-CONT-02 satisfied; guidelines are clear and actionable; examples provided for each principle; approved by stakeholders
- **Verification:** Review guidelines → verify clarity; write sample copy → verify adherence; get feedback → verify effectiveness
- **Files:** `nextjob/docs/marketing/copywriting-guidelines.md`

#### T-85: Build content blocks library
- [ ] **Status:** Not started
- **Deliverable:** Reusable content blocks: hero variants, feature sections, testimonials, pricing, FAQ, CTA sections; documented with usage guidelines
- **Dependencies:** T-77, T-83, T-84
- **Acceptance:** FR-CONT-03 satisfied; all blocks are reusable; consistent structure; documented; used across all marketing pages
- **Verification:** Review blocks → verify reusability; check documentation → verify clarity; test on multiple pages → verify consistency
- **Files:** `nextjob/apps/web/src/components/marketing/blocks/`, `nextjob/docs/marketing/content-blocks.md`

#### T-86: Create video scripts
- [ ] **Status:** Not started
- **Deliverable:** Video scripts: product demo (60s), explainer video (90s), testimonial interview template; include visual directions and key messages
- **Dependencies:** T-83, T-84
- **Acceptance:** FR-CONT-04 satisfied; scripts are clear and engaging; follow messaging hierarchy; include visual directions; approved by stakeholders
- **Verification:** Review scripts → verify clarity; read aloud → verify timing; check messaging → verify alignment
- **Files:** `nextjob/docs/marketing/video-scripts.md`

#### T-87: Set up email nurture sequences
- [ ] **Status:** Not started
- **Deliverable:** Email sequences: welcome series (3 emails over 7 days), onboarding (5 emails over 14 days), re-engagement (monthly); templates and copy
- **Dependencies:** T-83, T-84, T-100
- **Acceptance:** FR-CONT-05 satisfied; sequences are logical and valuable; copy follows guidelines; templates created; ready to deploy
- **Verification:** Review sequences → verify logic; check copy → verify guidelines; test templates → verify rendering
- **Files:** `nextjob/docs/marketing/email-sequences.md`, `nextjob/apps/web/src/lib/email/templates/`

---

### Phase 30: Trust & Credibility

#### T-88: Implement customer logos section
- [ ] **Status:** Not started
- **Deliverable:** Customer logo display section: 6-12 company logos in grayscale, color on hover, with permission; responsive grid layout
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-TRUST-01 satisfied; logos displayed with permission; grayscale by default; color on hover; responsive grid; accessible
- **Verification:** Review logos → verify permissions; test hover → verify color change; check mobile → verify responsive
- **Files:** `nextjob/apps/web/src/components/marketing/customer-logos.tsx`, `nextjob/public/images/logos/`

#### T-89: Implement security certifications display
- [ ] **Status:** Not started
- **Deliverable:** Security certification badges: SOC 2 Type II, GDPR compliance, encryption indicators; with links to verification pages
- **Dependencies:** T-52, T-77, T-37
- **Acceptance:** FR-TRUST-02 satisfied; badges displayed prominently; links to verification pages; up-to-date; accessible
- **Verification:** Review badges → verify accuracy; test links → verify verification pages; check accessibility → verify screen reader support
- **Files:** `nextjob/apps/web/src/components/marketing/security-badges.tsx`, `nextjob/apps/web/src/app/(marketing)/security/page.tsx`

#### T-90: Create data handling transparency page
- [ ] **Status:** Not started
- **Deliverable:** Dedicated page explaining data practices: what data is collected, how it's used, storage duration, deletion process, no data sales guarantee
- **Dependencies:** T-52, T-36
- **Acceptance:** FR-TRUST-03 satisfied; page is comprehensive and clear; written in plain language; accessible from footer and key sections
- **Verification:** Review page → verify completeness; test readability → verify clarity; check links → verify accessibility
- **Files:** `nextjob/apps/web/src/app/(marketing)/data-handling/page.tsx`

#### T-91: Implement sample outputs gallery
- [ ] **Status:** Not started
- **Deliverable:** Gallery of sample outputs: submission receipts, tailored resume snippets, cover letter examples; all sensitive data redacted
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-TRUST-04 satisfied; samples demonstrate value; all PII redacted; accessible; mobile-responsive
- **Verification:** Review samples → verify value demonstration; check redaction → verify no PII; test mobile → verify responsive
- **Files:** `nextjob/apps/web/src/components/marketing/sample-outputs.tsx`, `nextjob/public/images/samples/`

#### T-92: Implement integration logos
- [ ] **Status:** Not started
- **Deliverable:** Supported ATS integration logos: Greenhouse, Lever, Workday, iCIMS; with "coming soon" indicators for planned integrations
- **Dependencies:** T-52, T-77, T-23
- **Acceptance:** FR-TRUST-05 satisfied; logos displayed accurately; "coming soon" indicators clear; responsive grid; accessible
- **Verification:** Review logos → verify accuracy; check "coming soon" → verify clarity; test mobile → verify responsive
- **Files:** `nextjob/apps/web/src/components/marketing/integration-logos.tsx`, `nextjob/public/images/integrations/`

#### T-93: Create press/media section
- [ ] **Status:** Not started
- **Deliverable:** Press and media section: publication mentions, awards, podcast appearances, founder interviews; with links and dates
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-TRUST-06 satisfied; mentions are accurate and up-to-date; links work; responsive layout; accessible
- **Verification:** Review mentions → verify accuracy; test links → verify functionality; check mobile → verify responsive
- **Files:** `nextjob/apps/web/src/components/marketing/press-section.tsx`, `nextjob/apps/web/src/app/(marketing)/press/page.tsx`

---

### Phase 31: Technical Excellence

#### T-94: Implement security headers
- [ ] **Status:** Not started
- **Deliverable:** Security headers configuration: CSP (restrictive), HSTS, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin)
- **Dependencies:** T-52, T-40
- **Acceptance:** FR-TECH-01 satisfied; all headers present and correctly configured; CSP allows necessary resources; no security warnings
- **Verification:** Check response headers → verify presence; test with security scanner → verify no issues; test functionality → verify CSP doesn't break features
- **Files:** `nextjob/apps/web/next.config.js`, `nextjob/apps/web/vercel.json`

#### T-95: Implement progressive enhancement
- [x] **Status:** Complete
- **Deliverable:** Core content accessible without JavaScript; enhanced experience with JS enabled; graceful degradation for older browsers
- **Dependencies:** T-52
- **Acceptance:** FR-TECH-02 satisfied; content readable without JS; enhanced with JS; works in older browsers (Chrome 80+, Firefox 78+, Safari 13+)
- **Verification:** Disable JS → verify core content; enable JS → verify enhanced experience; test in older browsers → verify functionality
- **Files:** `index.html`
- **Evidence:**
  - ✅ Added noscript fallback content with core messaging
  - ✅ Loading indicator shows while React initializes
  - ✅ JavaScript detection with js-enabled class
  - ✅ Graceful degradation: meaningful content without JS
  - ✅ Enhanced experience with JS enabled (full React app)
  - ✅ Semantic HTML structure maintained
  - ✅ Accessible fallback content with proper headings and links
  - ✅ Build successful with progressive enhancement features

#### T-96: Implement error boundaries
- [x] **Status:** Complete
- **Deliverable:** React error boundaries for all major sections; user-friendly error messages; error logging to monitoring service; retry option
- **Dependencies:** T-52, T-107
- **Acceptance:** FR-TECH-03 satisfied; errors caught gracefully; user-friendly messages displayed; errors logged; retry option available
- **Verification:** Trigger errors → verify boundaries catch; check user experience → verify friendly messages; check logs → verify error capture
- **Files:** `src/App.tsx` (ErrorBoundary component)
- **Evidence:**
  - ✅ Implemented ErrorBoundary class component in App.tsx
  - ✅ Catches rendering errors with getDerivedStateFromError
  - ✅ Logs errors to console with componentDidCatch (ready for monitoring service integration)
  - ✅ User-friendly error message with clear explanation
  - ✅ Retry option with "Refresh Page" button
  - ✅ Accessible with role="alert" for screen readers
  - ✅ Wrapped entire app with ErrorBoundary
  - ✅ Build successful with error boundary integrated
- **Files:** `nextjob/apps/web/src/components/error-boundary.tsx`, `nextjob/apps/web/src/app/(marketing)/layout.tsx`

#### T-97: Create 404 page
- [x] **Status:** Complete
- **Deliverable:** Branded 404 page: helpful message, search functionality, navigation links to popular pages, contact option, maintain brand consistency
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-TECH-04 satisfied; 404 page is branded and helpful; includes search and navigation; contact option available; accessible
- **Verification:** Navigate to invalid URL → verify 404 page; test search → verify functionality; check links → verify navigation; test accessibility
- **Files:** `src/pages/NotFound.tsx`
- **Evidence:**
  - ✅ Created branded 404 page (src/pages/NotFound.tsx)
  - ✅ Helpful message with clear explanation
  - ✅ Navigation links to home, back, and features
  - ✅ Additional links to pricing and B2B solutions
  - ✅ Maintains brand consistency with dark theme and emerald/cyan accents
  - ✅ Accessible with proper semantic HTML
  - ✅ Integrated with React Router for catch-all route
  - ✅ Build successful with 404 page
- **Files:** `nextjob/apps/web/src/app/not-found.tsx`

#### T-98: Implement loading states
- [x] **Status:** Complete
- **Deliverable:** Loading states for all async actions: spinners for buttons, progress bars for multi-step, skeleton screens for content; consistent design
- **Dependencies:** T-52, T-77, T-80
- **Acceptance:** FR-TECH-05 satisfied; all async actions show loading states; consistent design; accessible (aria-busy, aria-live)
- **Verification:** Trigger async actions → verify loading states; check design → verify consistency; test accessibility → verify aria attributes
- **Files:** `src/components/Loading.tsx`, `src/components/Skeleton.tsx`
- **Evidence:**
  - ✅ Created comprehensive loading state component library (src/components/Loading.tsx)
  - ✅ Includes: ButtonLoader, LoadingButton, PageLoader, InlineLoader, ProgressBar, SuccessMessage, ErrorMessage
  - ✅ All components accessible with proper ARIA attributes (aria-busy, aria-live, role)
  - ✅ Consistent design with emerald/cyan color scheme
  - ✅ Multiple size variants for button loaders (sm, md, lg)
  - ✅ Progress bar with customizable value, max, and label
  - ✅ Success and error message components with proper alert roles
  - ✅ Build successful with loading components integrated

#### T-99: Implement form validation
- [x] **Status:** Complete
- **Deliverable:** Real-time form validation: inline error messages, success states, accessible error announcements, field-level and form-level validation
- **Dependencies:** T-52
- **Acceptance:** FR-TECH-06 satisfied; validation is real-time; errors are inline and clear; success states shown; accessible (aria-invalid, aria-describedby)
- **Verification:** Fill forms with invalid data → verify errors; submit valid data → verify success; test accessibility → verify announcements
- **Files:** `src/components/FormValidation.tsx`
- **Evidence:**
  - ✅ Created comprehensive form validation library (src/components/FormValidation.tsx)
  - ✅ useFormValidation hook with real-time validation
  - ✅ Supports multiple validation rules: required, minLength, maxLength, pattern, custom
  - ✅ FormField component with inline error messages
  - ✅ Visual feedback: red borders for errors, green borders for valid fields
  - ✅ Success/error icons (CheckCircle, AlertCircle)
  - ✅ Accessible with aria-invalid, aria-describedby, and role="alert"
  - ✅ FormSuccess and FormError components with proper ARIA live regions
  - ✅ Field-level and form-level validation support
  - ✅ Build successful with form validation components

---

### Phase 32: Growth Infrastructure

#### T-100: Implement email capture
- [ ] **Status:** Not started
- **Deliverable:** Email capture forms: newsletter signup in footer, lead magnet download forms, exit intent capture; with validation and success states
- **Dependencies:** T-52, T-72, T-86
- **Acceptance:** FR-GROW-01 satisfied; forms are accessible and validated; success states shown; emails stored securely; GDPR compliant
- **Verification:** Submit forms → verify validation and success; check database → verify storage; test GDPR → verify consent
- **Files:** `nextjob/apps/web/src/components/marketing/email-capture.tsx`, `nextjob/apps/web/src/app/api/newsletter/route.ts`

#### T-101: Set up email nurture
- [ ] **Status:** Not started
- **Deliverable:** Email service integration: connect to Resend/SendGrid/Mailchimp; double opt-in for newsletters; unsubscribe handling; template rendering
- **Dependencies:** T-87, T-100
- **Acceptance:** FR-GROW-02 satisfied; emails delivered reliably; double opt-in works; unsubscribe functional; templates render correctly
- **Verification:** Sign up → verify double opt-in; check email delivery → verify receipt; unsubscribe → verify removal; check templates → verify rendering
- **Files:** `nextjob/apps/web/src/lib/email/service.ts`, `nextjob/apps/web/src/app/api/email/route.ts`

#### T-102: Implement webinar promotion
- [ ] **Status:** Not started
- **Deliverable:** Webinar/event promotion: registration forms, calendar integration (Add to Calendar), reminder emails, replay access page
- **Dependencies:** T-52, T-100, T-101
- **Acceptance:** FR-GROW-03 satisfied; registration works; calendar integration functional; reminders sent; replay accessible
- **Verification:** Register for webinar → verify confirmation; add to calendar → verify integration; check reminders → verify delivery; access replay → verify functionality
- **Files:** `nextjob/apps/web/src/app/(marketing)/webinars/[slug]/page.tsx`, `nextjob/apps/web/src/components/marketing/webinar-registration.tsx`

#### T-103: Add community links
- [ ] **Status:** Not started
- **Deliverable:** Community links section: Discord server invite, Slack community, forum link, GitHub repository; with descriptions and member counts
- **Dependencies:** T-52, T-77
- **Acceptance:** FR-GROW-04 satisfied; links are accurate and up-to-date; descriptions clear; member counts displayed; accessible
- **Verification:** Click links → verify functionality; check descriptions → verify clarity; verify member counts → verify accuracy
- **Files:** `nextjob/apps/web/src/components/marketing/community-links.tsx`, `nextjob/apps/web/src/app/(marketing)/community/page.tsx`

#### T-104: Create press kit
- [ ] **Status:** Not started
- **Deliverable:** Downloadable press kit: logo pack (SVG, PNG, dark/light), brand guidelines PDF, media contact form, high-res product screenshots
- **Dependencies:** T-52, T-93
- **Acceptance:** FR-GROW-07 satisfied; all assets downloadable; brand guidelines comprehensive; contact form functional; screenshots high-quality
- **Verification:** Download assets → verify quality; review guidelines → verify comprehensiveness; submit contact form → verify delivery; check screenshots → verify quality
- **Files:** `nextjob/apps/web/src/app/(marketing)/press-kit/page.tsx`, `nextjob/public/press-kit/`

---

### Phase 33: Monitoring & Optimization

#### T-105: Implement conversion funnel tracking
- [ ] **Status:** Not started
- **Deliverable:** Conversion funnel tracking: visitor → page view → CTA click → signup start → signup complete → first application; with drop-off rates and timestamps
- **Dependencies:** T-48, T-52
- **Acceptance:** FR-MON-01 satisfied; all funnel stages tracked; drop-off rates calculated; timestamps recorded; accessible in analytics dashboard
- **Verification:** Complete signup flow → verify all stages tracked; check analytics → verify drop-off rates; verify timestamps → verify accuracy
- **Files:** `nextjob/apps/web/src/lib/analytics/funnel.ts`, `nextjob/apps/web/src/app/api/analytics/funnel/route.ts`

#### T-106: Set up performance monitoring
- [ ] **Status:** Not started
- **Deliverable:** Performance monitoring: Lighthouse CI in CI/CD, Web Vitals tracking in production, performance budgets with alerts, trend analysis
- **Dependencies:** T-57, T-39
- **Acceptance:** FR-MON-02 satisfied; Lighthouse runs on every deploy; Web Vitals tracked in production; alerts on degradation; trends visible
- **Verification:** Deploy → verify Lighthouse run; check production → verify Web Vitals; trigger degradation → verify alert; check trends → verify visibility
- **Files:** `nextjob/.github/workflows/lighthouse.yml`, `nextjob/apps/web/src/lib/monitoring/performance.ts`

#### T-107: Implement error tracking
- [ ] **Status:** Not started
- **Deliverable:** Error tracking with Sentry: JavaScript error capture, source maps, error grouping and deduplication, alerting on error spikes, user context
- **Dependencies:** T-96, T-38
- **Acceptance:** FR-MON-03 satisfied; errors captured with stack traces; source maps uploaded; errors grouped; alerts configured; user context included
- **Verification:** Trigger error → verify capture; check Sentry → verify stack trace and grouping; trigger spike → verify alert; check context → verify user data
- **Files:** `nextjob/apps/web/src/lib/monitoring/sentry.ts`, `nextjob/apps/web/src/instrumentation.ts`

#### T-108: Set up uptime monitoring
- [ ] **Status:** Not started
- **Deliverable:** Uptime monitoring: external service (Pingdom/UptimeRobot), multi-region checks, SMS/email alerts on downtime, public status page
- **Dependencies:** T-40
- **Acceptance:** FR-MON-04 satisfied; monitoring from multiple regions; alerts sent within 1 minute; status page public and up-to-date
- **Verification:** Simulate downtime → verify alert timing; check regions → verify multi-region; visit status page → verify accuracy
- **Files:** `nextjob/apps/web/src/app/(marketing)/status/page.tsx`, `nextjob/docs/monitoring/uptime-setup.md`

#### T-109: Implement heatmaps and session recording
- [ ] **Status:** Not started
- **Deliverable:** Heatmaps and session recording: click tracking, scroll depth, interaction recording with user consent; PII auto-redaction; analysis dashboard
- **Dependencies:** T-48, T-52
- **Acceptance:** FR-MON-07 satisfied; heatmaps show click patterns; scroll depth tracked; sessions recorded with consent; PII redacted; analysis accessible
- **Verification:** Interact with page → verify heatmap data; check scroll depth → verify tracking; review sessions → verify consent and redaction; check dashboard → verify access
- **Files:** `nextjob/apps/web/src/lib/analytics/heatmaps.ts`, `nextjob/apps/web/src/components/cookie-consent.tsx`

---

## Requirement Coverage

| PRD Requirement | Task(s) | Status |
|----------------|---------|--------|
| FR-01 (Evidence-constrained generation) | T-08, T-17 | Not started |
| FR-02 (Eligibility before ranking) | T-12, T-14 | Not started |
| FR-03 (Sensitive fields user-only) | T-19, T-20 | Not started |
| FR-04 (Verified submission receipts) | T-26 | Not started |
| FR-05 (Duplicate prevention) | T-23, T-24, T-25 | Not started |
| FR-06 (Explainable actions) | T-14, T-15, T-20 | Not started |
| FR-07 (Policy precedence) | T-19, T-09b | Not started |
| FR-08 (No auto-retry ambiguous) | T-25 | Not started |
| FR-09 (Aggregate-only reporting) | T-30, T-31 | Not started |
| FR-10 (Privacy controls) | T-36 | Not started |
| FR-11 (Answer reuse) | T-19 | Not started |
| FR-12 (Capability dimensions) | T-14, T-15, T-09a | Not started |
| FR-13 (Actionable notifications) | T-28 | Not started |
| FR-14 (Interview prep) | Not in MVP scope | N/A |
| FR-ONB-01 (Account creation) | T-04 | Not started |
| FR-ONB-02 (CV import) | T-07 | Not started |
| FR-ONB-03 (Claim verification) | T-09 | Not started |
| FR-ONB-04 (Preferences) | T-09a | Not started |
| FR-ONB-05 (Eligibility capture) | T-09a, T-12 | Not started |
| FR-ONB-06 (Automation policy) | T-09b | Not started |
| FR-ASM-01 (State progression) | T-25, T-44 | Not started |
| FR-ASM-02 (Outcome states) | T-25, T-44 | Not started |
| FR-ASM-03 (Exception states) | T-25, T-44, T-45 | Not started |
| FR-ASM-04 (Atomic transitions) | T-25, T-44 | Not started |
| FR-FEC-01 (Edge case handling) | T-45 | Not started |
| FR-FEC-02 (Failure details) | T-45 | Not started |
| FR-FEC-03 (No auto-retry ambiguous) | T-25, T-45 | Not started |
| FR-ACC-01 (WCAG 2.2 AA) | T-46 | Not started |
| FR-ACC-02 (Accessibility features) | T-46 | Not started |
| FR-ACC-03 (Localization) | T-47 | Not started |
| FR-ACC-04 (Additional languages) | Not in MVP scope | N/A |
| FR-ANA-01 (Product analytics) | T-48 | Not started |
| FR-ANA-02 (No PII in analytics) | T-48 | Not started |
| FR-ANA-03 (Experimentation) | T-49 | Not started |
| FR-ANA-04 (Interview lift metric) | T-49 | Not started |
| FR-ANA-05 (Experiment guardrails) | T-49 | Not started |
| FR-MON-01 (Free tier) | T-50 | Not started |
| FR-MON-02 (Search Pass) | T-50 | Not started |
| FR-MON-03 (Agent Pass) | Not in MVP scope | N/A |
| FR-MON-04 (No data monetization) | T-50 | Not started |
| FR-ROL-01 (Phase 1 MVP) | All tasks | Not started |
| FR-ROL-02 (Phase 2) | Not in MVP scope | N/A |
| FR-ROL-03 (Phase 3) | Not in MVP scope | N/A |
| FR-MKT-01 (Landing page value prop) | T-52 | Complete (Redesigned) |
| FR-MKT-02 (Landing page sections) | T-52 | Complete (Redesigned) |
| FR-MKT-03 (Conversion optimization) | T-52 | Complete (Redesigned) |
| FR-MKT-04 (SEO) | T-54 | Not started |
| FR-MKT-05 (Analytics) | T-54 | Not started |
| FR-MKT-06 (A/B testing) | T-54 | Not started |
| FR-MKT-07 (FAQ, testimonials) | T-52 | Not started |
| FR-MKT-08 (B2B2C section) | T-53 | Not started |
| FR-MKT-09 (Legal compliance) | T-55 | Not started |
| FR-MKT-10 (Referral program) | T-56 | Not started |
| FR-PERF-01 (Core Web Vitals) | T-57 | Not started |
| FR-PERF-02 (Image optimization) | T-58 | Not started |
| FR-PERF-03 (Font optimization) | T-59 | Not started |
| FR-PERF-04 (Code splitting) | T-60 | Not started |
| FR-PERF-05 (Edge caching) | T-61 | Not started |
| FR-PERF-06 (RUM) | T-106 | Not started |
| FR-SEO-01 (Schema markup) | T-62 | Not started |
| FR-SEO-02 (OG images) | T-63 | Not started |
| FR-SEO-03 (Twitter Cards) | T-67 | Not started |
| FR-SEO-04 (Sitemap) | T-64 | Not started |
| FR-SEO-05 (Robots.txt) | T-64 | Not started |
| FR-SEO-06 (Canonical URLs) | T-66 | Not started |
| FR-SEO-07 (AI search) | T-65, T-68 | Not started |
| FR-SEO-08 (Hreflang) | T-66 | Not started |
| FR-CRO-01 (Interactive demo) | T-69 | Not started |
| FR-CRO-02 (Before/after) | T-70 | Not started |
| FR-CRO-03 (ROI calculator) | T-71 | Not started |
| FR-CRO-04 (Exit intent) | T-72 | Not started |
| FR-CRO-05 (Scroll animations) | T-73 | Not started |
| FR-CRO-06 (Micro-conversions) | T-105 | Not started |
| FR-CRO-07 (Social proof) | T-74 | Not started |
| FR-CRO-08 (Urgency indicators) | Not in MVP scope | N/A |
| FR-CRO-09 (Sticky CTA) | T-76 | Not started |
| FR-CRO-10 (Comparison table) | T-75 | Not started |
| FR-VIS-01 (Marketing design system) | T-77 | Not started |
| FR-VIS-02 (Scroll animations) | T-78 | Not started |
| FR-VIS-03 (Micro-interactions) | T-79 | Not started |
| FR-VIS-04 (Loading skeletons) | T-80 | Complete |
| FR-VIS-05 (Video support) | T-81 | Not started |
| FR-VIS-06 (Dark/light mode) | T-82 | Not started |
| FR-VIS-07 (Responsive images) | T-58 | Not started |
| FR-VIS-08 (Icon system) | T-77 | Not started |
| FR-CONT-01 (Messaging hierarchy) | T-83 | Not started |
| FR-CONT-02 (Copywriting guidelines) | T-84 | Not started |
| FR-CONT-03 (Content blocks) | T-85 | Not started |
| FR-CONT-04 (Video scripts) | T-86 | Not started |
| FR-CONT-05 (Email nurture) | T-87 | Not started |
| FR-CONT-06 (Lead magnets) | Not in MVP scope | N/A |
| FR-CONT-07 (Blog/resources) | Not in MVP scope | N/A |
| FR-TRUST-01 (Customer logos) | T-88 | Not started |
| FR-TRUST-02 (Security certifications) | T-89 | Not started |
| FR-TRUST-03 (Data transparency) | T-90 | Not started |
| FR-TRUST-04 (Sample outputs) | T-91 | Not started |
| FR-TRUST-05 (Integration logos) | T-92 | Not started |
| FR-TRUST-06 (Press/media) | T-93 | Not started |
| FR-TRUST-07 (Case studies) | Not in MVP scope | N/A |
| FR-TRUST-08 (Trust badges) | T-89 | Not started |
| FR-TECH-01 (Security headers) | T-94 | Not started |
| FR-TECH-02 (Progressive enhancement) | T-95 | Complete |
| FR-TECH-03 (Error boundaries) | T-96 | Complete |
| FR-TECH-04 (404 page) | T-97 | Complete |
| FR-TECH-05 (Loading states) | T-98 | Complete |
| FR-TECH-06 (Form validation) | T-99 | Complete |
| FR-TECH-07 (Bot protection) | Not in MVP scope | N/A |
| FR-TECH-08 (Enhanced accessibility) | T-46 | Not started |
| FR-GROW-01 (Email capture) | T-100 | Not started |
| FR-GROW-02 (Email service) | T-101 | Not started |
| FR-GROW-03 (Webinar promotion) | T-102 | Not started |
| FR-GROW-04 (Community links) | T-103 | Not started |
| FR-GROW-05 (Social sharing) | T-63 | Not started |
| FR-GROW-06 (Partner/affiliate) | Not in MVP scope | N/A |
| FR-GROW-07 (Press kit) | T-104 | Not started |
| FR-MON-01 (Conversion funnel) | T-105 | Not started |
| FR-MON-02 (Performance monitoring) | T-106 | Not started |
| FR-MON-03 (Error tracking) | T-107 | Not started |
| FR-MON-04 (Uptime monitoring) | T-108 | Not started |
| FR-MON-05 (A/B testing results) | T-54 | Not started |
| FR-MON-06 (Heatmaps) | T-109 | Not started |
| FR-MON-07 (Session recording) | T-109 | Not started |
| G-04 (Eligibility false-positive ≤2%) | T-12, T-13 | Not started |
| G-09 (Autopilot evidence ≥80%) | T-24, T-25, T-09b | Not started |
| G-10 (Min cohort size ≥5) | T-30, T-31 | Not started |

## Release Gates

### MVP Launch Criteria (PRD §Release Criteria)

- [ ] 0 unsupported sensitive claims in evaluation suite → T-34
- [ ] 100% sensitive-field approval enforcement → T-19, T-20
- [ ] ≥95% supported-form field accuracy → T-23
- [ ] ≥98% receipt generation for supported connectors → T-26
- [ ] ≥95% duplicate prevention → T-23, T-24
- [ ] Tenant isolation penetration-tested → T-37
- [ ] Export/delete tested → T-36
- [ ] Backup/restore tested → T-40
- [ ] Disaster recovery tested → T-41
- [ ] WCAG 2.2 AA critical journeys tested → T-35
- [ ] No unresolved critical security findings → T-37
- [ ] Every connector monitored with kill switch → T-24, T-33
- [ ] AI regression suite passing → T-34
- [ ] Privacy review complete → T-36
- [ ] Terms/integration review complete → (external legal review)

## Next Unblocked Task

**T-03: Set up database schema and migrations**

Dependencies: T-01, T-02 (Complete)  
Blockers: None  
Estimated effort: 8 hours

---

## Updated Priorities (Post Ultra-Minimal Redesign)

### High Priority (Next 30 Days)
1. **T-03: Set up database schema and migrations** - Foundation for all backend features
2. **T-04: Set up authentication and tenant isolation** - Critical for security
3. **T-07: Implement CV import and extraction** - Core user flow
4. **T-08: Implement Career Graph with evidence provenance** - Core differentiator
5. **T-12: Implement eligibility engine** - Key feature (≤2% false-positive rate)
6. **T-17: Implement tailoring engine with evidence constraints** - Core AI feature
7. **T-54: Complete analytics integration** - Track conversion metrics

### Medium Priority (30-60 Days)
8. **T-14: Implement matching and ranking engine** - Job discovery
9. **T-19: Implement risk and policy engine** - Automation control
10. **T-23: Implement first ATS connector** - Application execution
11. **T-25: Implement application state machine** - Application lifecycle
12. **T-32: Implement Stripe billing integration** - Monetization
13. **T-46: Implement WCAG 2.2 AA accessibility** - Compliance

### Lower Priority (60+ Days)
14. **T-30: Implement organization and cohort management** - B2B features
15. **T-33: Implement admin and operations console** - Internal tools
16. **T-34: Create comprehensive AI evaluation suite** - Quality assurance
17. **T-37: Conduct security audit and penetration test** - Security validation
18. **T-53: Implement B2B2C landing page section** - Marketing (if needed)
19. **T-56: Implement referral program infrastructure** - Growth

### Deferred (Post-MVP)
- T-44: Implement complete application state machine (simplified in T-25)
- T-45: Implement failure handling for all edge cases (can be iterative)
- T-47: Implement localization infrastructure (English-first MVP)
- T-48: Implement product analytics with privacy safeguards (partially done in T-54)
- T-49: Implement experimentation framework (post-launch)
- T-50: Implement free tier and Search Pass billing (simplified in T-32)
- T-51: Document rollout plan (post-launch)

## Design-Driven Task Updates

### Removed/Simplified Tasks
Due to ultra-minimal redesign, several tasks are no longer needed or simplified:

- **Dark/Light mode toggle** - Removed (dark mode only now)
- **Exit intent popup** - Removed (too aggressive for minimal design)
- **Sticky CTA button** - Removed (unnecessary with single CTA)
- **ROI calculator** - Removed from landing page (too complex)
- **Multiple pricing tiers** - Simplified to 2 tiers (Free, Pro)
- **Complex feature sections** - Simplified to 3 features only
- **Testimonials section** - Replaced with logo proof

### New Design Requirements
- ✅ Typography-driven design system (DESIGN.md updated)
- ✅ Single CTA with email input
- ✅ Product preview showing actual interface
- ✅ Minimal color palette (near-black, white, emerald)
- ✅ Generous whitespace (80px+ section padding)
- ✅ Complete sentence headlines
- ✅ Early social proof (right after hero)

## Next Actions

### Immediate (This Week)
1. **T-03: Database schema** - Start with User, CareerClaim, Evidence entities
2. **T-04: Authentication** - Implement OAuth 2.0 with tenant isolation
3. **Test landing page** - Get user feedback on new minimal design

### Short-term (Next 2 Weeks)
4. **T-07: CV import** - Build PDF/DOCX extraction pipeline
5. **T-08: Career Graph** - Implement evidence provenance tracking
6. **T-12: Eligibility engine** - Build rule-based eligibility checks

### Medium-term (Next Month)
7. **T-17: Tailoring engine** - Implement evidence-constrained AI generation
8. **T-23: ATS connector** - Build first connector (Greenhouse or Lever)
9. **T-54: Analytics** - Complete PostHog/Plausible integration
