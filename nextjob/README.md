# NextJob

<div align="center">

### Apply with Proof.

**The trustworthy AI career agent that converts verified career evidence into eligible, high-quality applications and measurable interview outcomes.**

[![Status: Seed MVP](https://img.shields.io/badge/Status-Seed_MVP-amber)](docs/PRD.md)
[![Evidence: Validation-ready](https://img.shields.io/badge/Evidence-Validation--ready-amber)](docs/PRD.md#validation)
[![Delivery: Build-ready](https://img.shields.io/badge/Delivery-Build--ready-emerald)](TASKS.md)
[![Requirements: 122](https://img.shields.io/badge/Requirements-122-blue)](docs/PRD.md)
[![Tasks: 111](https://img.shields.io/badge/Tasks-111-blue)](TASKS.md)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2_AA-blue)](docs/PRD.md#accessibility--localization)

[Documentation](#documentation) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## 🎯 The Problem

Job seekers face:
- **Fragmented discovery** with irrelevant opportunities
- **Repetitive applications** with poor personalization
- **AI hallucination** — tools inventing experience candidates don't have
- **Work-authorization uncertainty** causing wasted effort
- **Unsafe auto-apply** tools creating duplicate submissions
- **No outcome learning** from application results
- **Privacy concerns** — institutions lack visibility without exposing personal data

## 💡 The Solution

NextJob is an AI career agent that:

1. **Understands the candidate** → builds a verified Career Graph from CV and evidence
2. **Finds eligible jobs** → eligibility gating before ranking (never applies where ineligible)
3. **Ranks opportunities** → explains why each job fits with evidence-backed reasoning
4. **Tailors applications** → generates resume variants, cover letters, and answers from verified evidence only
5. **Manages approvals** → risk-based automation with human control over sensitive decisions
6. **Applies safely** → verified submission receipts with proof of what was submitted
7. **Tracks outcomes** → monitors interview rates and learns what works
8. **Prepares for interviews** → generates talking points and STAR examples from evidence

## 🔒 Core Differentiators

| Feature | What It Means | Why It Matters |
|---------|---------------|----------------|
| **Evidence-backed Career Graph** | Every claim traces to verified proof | No hallucinated experience |
| **Eligibility before application** | System checks eligibility before ranking | Never wastes time on ineligible jobs |
| **No fabricated claims** | AI constrained to verified evidence | Trustworthy applications |
| **Risk-based automation** | Sensitive answers require explicit approval | User control over consequential decisions |
| **Verified submission receipts** | Proof of every application submitted | Transparency and accountability |
| **Global capability transparency** | Clear labels for what works where | No misleading "global support" claims |
| **Privacy-first B2B** | Aggregate-only reporting for institutions | Protects candidate privacy |

## 📊 Current Status

<table>
<tr>
<td width="50%">

### Evidence Readiness
**Status:** Validation-ready

Material problem, customer, and value assumptions require real-world validation experiments before market claims.

**Next:** Commission validation experiments (see [PRD §Validation](docs/PRD.md#validation))

</td>
<td width="50%">

### Delivery Readiness
**Status:** Build-ready

MVP requirements, UX flows, architecture, and acceptance criteria are sufficient to begin implementation.

**Next:** Start [T-01: Initialize repository structure](TASKS.md#phase-1-environment--infrastructure)

</td>
</tr>
</table>

## 📚 Documentation

### Core Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [**Product Requirements**](docs/PRD.md) | What we're building and why | ✅ Complete (122 requirements) |
| [**Technical Design**](docs/TECH.md) | How we build it | ✅ Complete (approved stack) |
| [**Design System**](docs/DESIGN.md) | Visual identity and components | ✅ Complete (YAML tokens) |
| [**Agent Instructions**](AGENTS.md) | Rules for AI agents and developers | ✅ Complete |
| [**Implementation Tasks**](TASKS.md) | Dependency-ordered task list | ✅ Complete (111 tasks, 33 phases) |

### Requirement Coverage

- **122 functional requirements** across 17 categories
- **36 acceptance criteria** with Given/When/Then format
- **111 implementation tasks** organized in 33 phases
- **100% traceability** from requirements → acceptance → tasks

### Key Sections

- [Onboarding Requirements](docs/PRD.md#onboarding-requirements) — CV import, verification, preferences
- [Application State Machine](docs/PRD.md#application-state-machine) — Lifecycle from discovery to outcome
- [Failure & Edge Cases](docs/PRD.md#failure--edge-cases) — 22 explicit edge case handlers
- [Accessibility & Localization](docs/PRD.md#accessibility--localization) — WCAG 2.2 AA compliance
- [Marketing & Landing Page](docs/PRD.md#marketing--landing-page) — World-class conversion optimization
- [Performance Excellence](docs/PRD.md#performance-excellence) — Core Web Vitals targets
- [Advanced SEO](docs/PRD.md#advanced-seo) — Schema markup, AI search optimization
- [Security & Privacy](docs/TECH.md#security--privacy) — Tenant isolation, encryption, audit

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Clients                                  │
│  Web App (Next.js)  │  Browser Extension (WXT)  │  B2B Portal │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Edge / API   │
                    │  Auth + Rate  │
                    └───────┬───────┘
                            │
        ┌───────────────────▼───────────────────┐
        │        Modular Monolith (Fastify)      │
        │                                        │
        │  Identity  │  Career Graph  │  Evidence │
        │  Jobs      │  Eligibility   │  Matching │
        │  Tailoring │  Policy/Risk   │  Approvals│
        │  Applications │  Receipts   │  Outcomes │
        │  Organizations │  Billing   │  Notifs   │
        └───────────────────┬───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │  Temporal │      │ AI Gateway│      │ PostgreSQL│
  │  Workers  │      │ + Models  │      │ + pgvector│
  └───────────┘      └───────────┘      └───────────┘
```

See [Technical Design](docs/TECH.md#architecture) for full diagram and details.

## 🛠️ Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Web** | Next.js + TypeScript | ✅ Approved |
| **UI** | shadcn/ui + Radix + Tailwind | ✅ Approved |
| **Backend** | Fastify | ✅ Approved |
| **Database** | PostgreSQL + pgvector | ✅ Approved |
| **Workflow** | Temporal | ✅ Approved |
| **AI** | Vercel AI SDK + provider abstraction | ✅ Approved |
| **Extension** | WXT | ✅ Approved |
| **Infrastructure** | AWS + Vercel | ✅ Approved |

See [Technical Design §Stack](docs/TECH.md#stack) for complete list with rationale.

## 🚀 Getting Started

> **Status:** Pre-implementation. No runnable code yet.

### For Developers

1. **Read the docs** — Start with [PRD.md](docs/PRD.md) to understand the product
2. **Review architecture** — Check [TECH.md](docs/TECH.md) for technical decisions
3. **Understand tasks** — Browse [TASKS.md](TASKS.md) for implementation plan
4. **Follow agent rules** — See [AGENTS.md](AGENTS.md) for development guidelines

### First Task

**T-01: Initialize repository structure**
- Create monorepo with `apps/web`, `apps/extension`, `packages/*`
- Set up package.json files in each workspace
- Configure TypeScript and monorepo tooling
- Estimated effort: 2 hours

See [TASKS.md §Phase 1](TASKS.md#phase-1-environment--infrastructure) for details.

## 🗺️ Roadmap

### Phase 1 — MVP (Current)
Identity, Career Graph, evidence, jobs, eligibility, matching, tailoring, risk engine, approvals, browser extension, ATS execution, receipts, tracker, organizations, billing, admin console, analytics, marketing landing page.

### Phase 2 — Next
Email outcome detection, interview preparation, additional ATS connectors, localization, experimentation framework.

### Phase 3 — Future
Safe Autopilot mode, outcome-informed ranking, expanded eligibility rules, B2B integrations, Career Vault.

See [TASKS.md](TASKS.md) for detailed task breakdown across all 33 phases.

## 🤝 Contributing

### Before You Start

1. Read [AGENTS.md](AGENTS.md) — understand the rules and boundaries
2. Check [TASKS.md](TASKS.md) — find an unblocked task
3. Review [PRD.md](docs/PRD.md) — understand the requirements
4. Check [TECH.md](docs/TECH.md) — understand the architecture

### Development Workflow

1. **Pick a task** — start with T-01 (repository initialization)
2. **Create a branch** — `feature/T-XX-task-name`
3. **Implement** — follow AGENTS.md rules
4. **Test** — ensure all acceptance criteria pass
5. **Document** — update relevant docs if needed
6. **Submit PR** — request review from maintainers

### Rules

- Every generated factual statement MUST trace to verified evidence
- Eligibility MUST run before ranking
- Sensitive fields MUST be user-only
- No PII in prompts or analytics
- All external actions MUST be idempotent
- Every automated action MUST be explainable

See [AGENTS.md](AGENTS.md) for complete rules.

## 🔐 Security & Privacy

### Security Commitments

- ✅ TLS everywhere, encryption at rest
- ✅ Tenant isolation with penetration testing
- ✅ RBAC with least privilege
- ✅ Sensitive data vault for high-risk fields
- ✅ PII redaction before AI prompts
- ✅ Prompt-injection defenses
- ✅ Immutable audit events

### Privacy Rights

Users can:
- View all stored data
- Correct inaccurate data
- Export all data (machine-readable)
- Delete all data
- Revoke consent
- Disconnect integrations
- Disable learning from their data
- Control retention periods

**Commitment:** Private candidate data is never sold or used for recruiter advertising.

See [PRD.md §Privacy Requirements](docs/PRD.md) and [TECH.md §Security & Privacy](docs/TECH.md#security--privacy) for details.

## 📋 External Actions

These actions require owner approval before proceeding:

| Action | Owner | Evidence | Completion Criterion |
|--------|-------|----------|---------------------|
| Commission tenant isolation penetration test | Security Team | Pen test report | No unresolved critical findings |
| Validate Search Pass pricing ($39/30 days) | Product Owner | Pricing experiment results | WTP validated with statistical significance |
| Approve eligibility false-positive threshold | Product Owner | Signed PRD.md | Threshold documented and accepted |

## 📈 Metrics & Goals

### North Star Metric

**Verified Qualified Interview Rate**

```
Verified Qualified Interviews
─────────────────────────────
Eligible Verified Applications
```

### Key Performance Indicators

| Metric | Target | Purpose |
|--------|--------|---------|
| Activation rate | TBD | Product onboarding quality |
| Eligibility false-positive rate | ≤2% | Matching safety |
| Unsupported-claim rate | 0 | AI truthfulness |
| Verified submission rate | ≥98% | Execution reliability |
| Duplicate prevention | ≥95% | Execution safety |
| Interview lift vs control | TBD | Actual product value |

See [PRD.md §Goals](docs/PRD.md#goals) for complete list.

## 📄 License

To be determined. All rights reserved until license is selected.

## 🙏 Acknowledgments

NextJob is built on the shoulders of:
- **Open-source community** — Next.js, Fastify, Temporal, PostgreSQL, and many more
- **AI research** — Evidence-constrained generation, structured output validation
- **Career coaching best practices** — STAR method, evidence-based applications
- **Privacy research** — GDPR compliance, data minimization principles

## 📞 Contact

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](#) (to be created)
- **Discussions:** [GitHub Discussions](#) (to be created)

---

<div align="center">

**Built with trust, transparency, and verified evidence.**

[Documentation](#documentation) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>
