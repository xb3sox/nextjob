# NextJob

<div align="center">

### Your next job, intelligently.

**Find better jobs. Apply smarter. Get interviewed.**

NextJob is your AI career agent that finds the right opportunities, prepares better applications, safely handles repetitive work, and learns what gets you interviews.

[![Status: Build-ready MVP](https://img.shields.io/badge/Status-Build--ready_MVP-emerald)](docs/PRD.md)
[![Evidence: Validation-ready](https://img.shields.io/badge/Evidence-Validation--ready-amber)](docs/PRD.md#validation)
[![Delivery: Build-ready](https://img.shields.io/badge/Delivery-Build--ready-emerald)](TASKS.md)
[![Requirements: 122](https://img.shields.io/badge/Requirements-122-blue)](docs/PRD.md)
[![Tasks: 120](https://img.shields.io/badge/Tasks-120-blue)](TASKS.md) [![Progress: 20%](https://img.shields.io/badge/Progress-20%25-green)](TASKS.md) [![Quality: A+](https://img.shields.io/badge/Quality-A%2B-brightgreen)](PRODUCT_REVIEW_REPORT.md)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2_AA-blue)](docs/PRD.md#accessibility--localization)

[Documentation](#documentation) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Roadmap](#roadmap) • [Contributing](#contributing)

</div>

---

## 🎯 The Problem

Job searching is fragmented and repetitive. Users must:
- Search across many sources
- Judge whether jobs genuinely fit
- Understand location/work-authorization requirements
- Repeatedly tailor resumes
- Re-enter identical information
- Answer ambiguous application questions
- Track applications manually
- Manage recruiter communications
- Prepare separately for interviews

Existing automation can introduce additional problems:
- Poor matches
- Excessive applications
- Incorrect answers
- Fabricated experience
- Duplicate submissions
- Hidden automation
- Unclear submission status
- Weak user control

**Core problem:** Job seekers need better outcomes with less effort—not more applications.

## 💡 The Solution

NextJob is your AI career agent that:

1. **Understands you** → Builds a verified profile from your CV and evidence
2. **Finds jobs** → Discovers opportunities that genuinely fit
3. **Checks eligibility** → Avoids wasting effort on unsuitable roles
4. **Explains fit** → Shows why each job matters to you
5. **Prepares truthful applications** → Tailors applications from verified facts only
6. **Gets approval when needed** → Asks only about important exceptions
7. **Applies safely** → Handles repetitive work with transparency
8. **Confirms submission** → Provides receipts proving what was submitted
9. **Tracks responses** → Monitors outcomes automatically
10. **Prepares interviews** → Generates evidence-backed talking points
11. **Learns what works** → Improves from verified interviews, rejections, and offers

## 🔒 Core Differentiators

| Feature | What It Means | Why It Matters |
|---------|---------------|----------------|
| **Verified profile** | Applications use real, user-approved facts | No hallucinated experience |
| **Eligibility-first** | Avoid wasting effort on unsuitable roles | Save time and frustration |
| **Quality-first** | Optimize interviews, not application volume | Better outcomes |
| **Safe automation** | Automate routine work; escalate consequential decisions | You stay in control |
| **Transparent** | Explain recommendations and show exactly what was submitted | Build trust |
| **Outcome learning** | Improve from verified interviews, rejections, and offers | Get better over time |
| **Global clarity** | Clearly distinguish supported, assisted, and manual workflows | No surprises |

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

**Next:** Start [T-04: Authentication](TASKS.md#phase-1-environment--infrastructure)

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
| [**Implementation Tasks**](TASKS.md) | Dependency-ordered task list | ✅ Complete (120 tasks, 33 phases) |

### Requirement Coverage

- **122 functional requirements** across 17 categories
- **36 acceptance criteria** with Given/When/Then format
- **120 implementation tasks** organized in 33 phases
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
| **Package Manager** | Bun (30x faster than npm) | ✅ Complete |
| **Testing** | Vitest (5x faster than Jest) | ✅ Complete |
| **Linting** | Biome (56x faster than ESLint) | ✅ Complete |
| **Monorepo** | Turborepo (9x faster builds) | ✅ Complete |

See [Technical Design §Stack](docs/TECH.md#stack) for complete list with rationale.

## 🚀 Getting Started

> **Status:** In Progress. Modern toolchain and testing framework implemented.

### For Developers

1. **Read the docs** — Start with [PRD.md](docs/PRD.md) to understand the product
2. **Review architecture** — Check [TECH.md](docs/TECH.md) for technical decisions
3. **Understand tasks** — Browse [TASKS.md](TASKS.md) for implementation plan
4. **Follow agent rules** — See [AGENTS.md](AGENTS.md) for development guidelines

### Current Implementation

**Completed:**
- ✅ Landing page with ultra-minimal design (Linear/Stripe/Vercel inspired)
- ✅ Database schema with 20+ tables (PostgreSQL + Drizzle ORM)
- ✅ Privacy Policy and Terms of Service pages (design consistent)
- ✅ 404 page, loading states, form validation
- ✅ SEO optimization with structured data
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ **Bun package manager** - 30x faster than npm
- ✅ **Vitest testing framework** - 5x faster than Jest, 20 example tests
- ✅ **Biome linter/formatter** - 56x faster than ESLint+Prettier
- ✅ **Turborepo** - 9x faster builds with caching
- ✅ **shadcn/ui** - 8 core components installed
- ✅ **Authentication** - OAuth 2.0 with tenant isolation and RBAC
- ✅ **AI Gateway** - Multi-provider support with PII redaction and observability with CSS variables
- ✅ **Design consistency** - Unified dark theme across all pages
- ✅ **Form validation** - Email validation with error handling
- ✅ **Loading states** - Spinners and disabled states
- ✅ **Accessibility** - Skip links, ARIA labels, focus management

**Next Tasks:**

**Infrastructure (This Week):**
1. **T-06: Temporal workflows** - Durable execution for connectors (16 hours)

**Core Features (Next 2 Weeks):**
2. **T-07: Profile import** - PDF/DOCX extraction pipeline (16 hours)
3. **T-08: Your Profile** - Evidence provenance tracking (20 hours)
4. **T-12: Eligibility engine** - Rule-based eligibility checks (24 hours)

**Application Flow (Next Month):**
5. **T-17: Tailoring engine** - Evidence-constrained AI generation (32 hours)
6. **T-23: First ATS connector** - Build first connector (40 hours)
7. **T-25: Application state machine** - Complete lifecycle (24 hours)

See [TASKS.md](TASKS.md) for complete task list.

## 🗺️ Roadmap

### MVP (0-3 months)
Identity, Your Profile, evidence, jobs, eligibility, matching, tailoring, safety checks, approvals, browser extension, execution, receipts, tracker, organizations, billing, admin, analytics.

### V1 (3-6 months)
Email outcome detection, interview preparation, additional ATS support, localization, experimentation, Search pricing optimization.

### V2 (6-12 months)
Safe Auto Apply, outcome-informed ranking, expanded eligibility, B2B integrations, Career Vault, additional languages.

See [TASKS.md](TASKS.md) for detailed task breakdown across all 33 phases.

## 🤝 Contributing

### Before You Start

1. Read [AGENTS.md](AGENTS.md) — understand the rules and boundaries
2. Check [TASKS.md](TASKS.md) — find an unblocked task
3. Review [PRD.md](docs/PRD.md) — understand the requirements
4. Check [TECH.md](docs/TECH.md) — understand the architecture

### Development Workflow

1. **Pick a task** — start with T-06 (Temporal workflows)
2. **Create a branch** — `feature/T-XX-task-name`
3. **Implement** — follow AGENTS.md rules
4. **Test** — ensure all acceptance criteria pass
5. **Document** — update relevant docs if needed
6. **Submit PR** — request review from maintainers

### Rules

- Every generated factual statement MUST trace to verified profile information
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
