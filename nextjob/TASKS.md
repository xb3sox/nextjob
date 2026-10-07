# NextJob — Implementation Tasks

**Status:** Pre-implementation  
**Last Updated:** 2026-01-15  
**References:** [PRD](docs/PRD.md) · [TECH](docs/TECH.md) · [DESIGN](docs/DESIGN.md) · [AGENTS](AGENTS.md)

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
- [ ] **Status:** Not started
- **Deliverable:** Monorepo with apps/web, apps/extension, packages/* per AGENTS.md §Structure
- **Dependencies:** None
- **Acceptance:** Directory structure matches AGENTS.md; package.json files present in each workspace
- **Verification:** `ls -R nextjob/ | grep -E "(apps|packages)"` → shows expected structure
- **Files:** `nextjob/package.json`, `nextjob/apps/*/package.json`, `nextjob/packages/*/package.json`

#### T-02: Set up development environment
- [ ] **Status:** Not started
- **Deliverable:** Working dev environment with all dependencies installed
- **Dependencies:** T-01
- **Acceptance:** `npm install` succeeds; `npm run typecheck` passes; `npm run lint` passes
- **Verification:** `cd nextjob && npm install && npm run typecheck && npm run lint` → exit code 0
- **Files:** `nextjob/package.json`, `nextjob/tsconfig.json`

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

**T-01: Initialize repository structure**

Dependencies: None  
Blockers: None  
Estimated effort: 2 hours
