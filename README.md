<div align="center">

# NextJob

**Your next job, intelligently.**

An AI career agent that turns verified career evidence into roles that actually fit — and
applications you can prove were submitted. No fabricated experience.

[![CI](https://github.com/xb3sox/nextjob/actions/workflows/ci.yml/badge.svg)](https://github.com/xb3sox/nextjob/actions/workflows/ci.yml)
[![Runtime](https://img.shields.io/badge/runtime-Bun_1.3.11-black)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](tsconfig.json)
[![A11y](https://img.shields.io/badge/a11y_target-WCAG_2.2_AA-blue)](docs/PRD.md#accessibility--localization)
[![License](https://img.shields.io/badge/license-proprietary-lightgrey)](#license)

![NextJob — verified career evidence in, eligible applications out](public/og-image.png)

[Quick start](#quick-start) · [Status](#status) · [Architecture](#architecture) ·
[Roadmap](#roadmap) · [Docs](#documentation) · [Contributing](#contributing)

</div>

## Why NextJob

Job search rewards volume over fit: hundreds of applications, weak matches, and AI-written claims
nobody can verify. NextJob optimises one metric instead — the **verified qualified interview rate**:
confirmed interviews divided by eligible, verified applications.

- **Verified, not generated** — every factual statement traces to a user-approved claim with
  evidence provenance.
- **Eligible first** — location, work-authorisation, and requirement checks run *before* ranking, so
  effort is not wasted on roles you cannot take.
- **In your control** — automation escalates consequential decisions for approval and returns a
  receipt of exactly what was submitted.

### How it works

1. **Import** a CV; extracted claims become a profile you review and approve.
2. **Check eligibility**, then **rank** remaining roles with an explanation of the fit.
3. **Tailor** applications using only approved evidence, with the source shown beside each change.
4. **Submit** through assisted or manual flows, then record outcomes to improve future rankings.

Automation coverage grows by phase: current code stops at eligibility, matching, and tailoring
review. Automated application submission is roadmap (see [`TASKS.md`](TASKS.md)), not a shipped
capability — treat anything implying hands-off auto-apply as unbuilt.

## Status

Early MVP. The SPA deploys and runs with two workspace packages; the backend service packages are
implemented and tested but are not called at runtime by any client yet. Supabase is used for
authentication only — the app stores no job, profile, or application data server-side today.

| Surface | State |
| --- | --- |
| `src/` — web app | Vite + React 18 SPA: landing, auth (Supabase), dashboard, tailoring review. Gated in CI by typecheck, lint, tests, and a production build. |
| `extension/` — browser extension | WXT MV3 scaffold: popup, background, content scripts. Builds `chrome-mv3` only; requests just `activeTab` and `storage`. Not published. |
| Packages used by the SPA | `@nextjob/tailoring` (engine drives the review UI) and `@nextjob/shared` (i18n types), imported at runtime. |
| Packages not yet wired | `packages/api` (Fastify + Temporal), `profile`, `ai-gateway`, `applications`. Strict-typechecked and unit-tested in CI, but the SPA does not import them. |
| Database | Drizzle schema (`packages/api/src/db/schema.ts`) with 7 tables and a committed initial migration under `packages/api/drizzle/`. No seed data yet. |
| Deploy | Vercel is the live target: `.github/workflows/deploy-vercel.yml` deploys on a `v*` tag after the full gate set. Cloudflare Workers stays a manual, opt-in path. |

`docs/TECH.md` describes the target architecture, including a future Next.js `apps/web`. That
directory does not exist — [`AGENTS.md` §Structure](AGENTS.md#structure) maps task paths onto
today's tree.

## Quick start

**Requires:** [Bun](https://bun.sh) 1.3.11 (pinned via `packageManager`). Optional: Node 22+ for
`bun run hooks:install`, which shells out to `node`, and the Supabase CLI for local auth.

```bash
git clone https://github.com/xb3sox/nextjob.git
cd nextjob

bun install --frozen-lockfile   # bun.lock is the only lockfile
bun run dev                     # http://localhost:3000
```

The landing page renders without configuration. Authentication needs credentials:

```bash
cp .env.example .env
# VITE_SUPABASE_URL=https://<project>.supabase.co
# VITE_SUPABASE_ANON_KEY=<anon key>
```

Or run Supabase locally (`supabase start`, then copy the URL and anon key from `supabase status`;
the local API listens on port 54321).

On Windows, run these in Git Bash or WSL, or use `Copy-Item .env.example .env` in PowerShell.
The SPA targets current evergreen browsers; there is no IE or legacy-Safari support.

**Verify it works:** `http://localhost:3000` shows the landing page, `bun run build` exits 0, and
after filling `.env` the missing-configuration banner on `/login` disappears.

### Troubleshooting

- **Port 3000 is taken** — Vite runs with `strictPort`, so it fails instead of drifting. Free the
  port or change `server.port` in `vite.config.js`.
- **Install fails with a lockfile mismatch** — you are on `bun.lock`; delete any `package-lock.json`
  created by `npm`/`npx` and reinstall with Bun.
- **Auth calls fail in the console** — `.env` values are missing or the anon key belongs to another
  project. Only `VITE_*` variables reach the browser bundle; never put a service-role key there.
- **Lint rewrites unrelated files** — `bunx biome` resolves a newer version than `bun.lock`. Always
  use `bun run lint`.
- **`db:migrate` reports a missing connection URL** — `DATABASE_URL` is not set. Pass it inline:
  `DATABASE_URL=postgres://user:pass@host:5432/db bun run db:migrate`. Use a direct connection
  rather than a transaction pooler, so migrations are not run through it.

### Extension

```bash
bun run build:extension         # or: cd extension && bun run dev
```

Load the unpacked build WXT writes under `extension/.output/` via `chrome://extensions` →
*Load unpacked*.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Vite dev server on port 3000 |
| `bun run build` | Production build: SPA (`dist/`) + extension |
| `bun run preview` | Serve the production build locally |
| `bun run typecheck` | `wxt prepare` + strict `tsc` for app and extension |
| `bun run lint` / `lint:fix` | Biome lint + format check / safe autofix |
| `bun run test` | Vitest in watch mode (projects: `node`, `dom`) |
| `bunx vitest run` | Full suite once, as CI runs it |
| `bunx vitest run src/components/JobCard.test.tsx` | Single test file |
| `bun run test:eval` | AI evaluation suites in `evals/` |
| `bun run test:coverage` | Coverage report (V8) |
| `bun run db:generate` | Generate SQL migrations from the Drizzle schema |
| `DATABASE_URL=… bun run db:migrate` | Apply pending migrations |
| `bun run registry:build` | Rebuild the shadcn registry into `public/r/` |
| `bun run hooks:install` | Install the `pre-push` guard that blocks direct pushes to `main` |

Add a dependency to a workspace package by editing that package's `package.json`, then run
`bun install` at the root. `packages/api` has no manifest; it is typechecked directly from its
`tsconfig.json`.

## Quality gates

CI (`.github/workflows/ci.yml`) runs on every pull request to `main` and must pass:

```bash
bun run typecheck                                      # app + extension
bunx tsc --noEmit -p packages/<name>/tsconfig.json     # every package
bun run lint                                           # warnings tolerated, errors block
bun audit --audit-level=critical                       # blocking; high advisories reported only
bun run build
bunx vitest run --maxWorkers 2
```

Additional expectations before a feature merges — eval regression, accessibility, security, privacy
controls — are listed in [`AGENTS.md` §Completion Gates](AGENTS.md#completion-gates).

## Repository layout

```
├── src/                    Vite + React 18 SPA (the shipped application)
│   ├── pages/              landing, auth/*, dashboard, tailor, legal
│   ├── components/         JobCard, WaitlistForm, ui/ (shadcn)
│   ├── contexts/           AuthContext (Supabase session)
│   ├── i18n/               locale context, en/es/ar/he dictionaries, RTL support
│   └── lib/                supabase client, cn(), redirect helpers
├── packages/
│   ├── api/                Fastify app, Temporal workflows, eligibility +
│   │                       matching engines; drizzle/ holds committed migrations
│   ├── profile/            claims, evidence storage, import/extraction,
│   │                       preferences, verification, automation policy
│   ├── tailoring/          evidence-constrained generation
│   ├── ai-gateway/         model routing, Zod schemas, PII redaction
│   ├── applications/       application state machine, receipts
│   └── shared/             shared types (i18n, common contracts)
├── extension/              WXT browser extension (MV3)
├── evals/                  evaluation datasets and harnesses (protected)
├── registry/ · public/r/   custom shadcn registry
├── supabase/               local stack configuration
├── scripts/                git hooks and repository tooling
├── docs/                   PRD, TECH, DESIGN, API reference
├── public/                 static assets, robots.txt, sitemap.xml
├── drizzle.config.ts       Drizzle Kit config (schema -> packages/api/drizzle)
└── AGENTS.md · TASKS.md    engineering contract and backlog
```

## Architecture

```mermaid
flowchart LR
  subgraph shipped["Shipping today"]
    Web["Web SPA<br/>Vite · React 18"] --> Auth["Supabase Auth"]
    Web --> Pkg["@nextjob/tailoring<br/>@nextjob/shared"]
  end
  subgraph planned["In repo, not wired to the SPA"]
    API["Fastify API<br/>+ Temporal"] --> DB[("PostgreSQL<br/>+ pgvector")]
    API --> AI["AI gateway<br/>multi-provider"]
  end
  Ext["Extension<br/>WXT MV3 scaffold"] -.->|planned| API
  Web -.->|no runtime import yet| API
```

In words: the browser app uses Supabase for identity and imports two workspace packages for
tailoring and shared types. The Fastify service, its Temporal workflows, PostgreSQL/pgvector
storage, and the AI gateway exist in-repo but are not called by any client at runtime yet; the
extension is a separate client that will talk to the API directly.

Design constraints that shape the system: tenant isolation with RBAC, immutable audit events,
idempotent external actions, and evidence-constrained generation validated by Zod schemas. Details
in [`docs/TECH.md`](docs/TECH.md).

## Roadmap

Tracked as GitHub milestones, not dates: **MVP** = one real application submitted end-to-end;
**Beta** = ten external users. Open work lives on the
[roadmap board](https://github.com/users/xb3sox/projects/11) and in [`TASKS.md`](TASKS.md).
The issue → PR → release flow, labels, and issue contract are in
[`docs/OPERATING_MODEL.md`](docs/OPERATING_MODEL.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | Product requirements, flows, acceptance criteria |
| [`docs/TECH.md`](docs/TECH.md) | Technical design, stack decisions, security model |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design system and design tokens |
| [`docs/api/`](docs/api/README.md) | REST API reference and OpenAPI schema |
| [`docs/OPERATING_MODEL.md`](docs/OPERATING_MODEL.md) | Issue → PR → release flow, project fields |
| [`docs/JULES.md`](docs/JULES.md) | Running the Jules agent on this repo |
| [`AGENTS.md`](AGENTS.md) | Engineering rules, agent contract, repo conventions |
| [`TASKS.md`](TASKS.md) | Dependency-ordered implementation backlog |

## Contributing

1. Read [`AGENTS.md`](AGENTS.md) and check the
   [roadmap board](https://github.com/users/xb3sox/projects/11), then pick an unblocked task from
   [`TASKS.md`](TASKS.md). Bugs and tasks are filed through the repository's issue forms — blank
   issues are disabled.
2. Branch from `main`: `feature/T-XX-short-name`. One task per PR — no unrelated refactors.
3. Run the [quality gates](#quality-gates) locally and paste the output in the PR's Evidence
   section.
4. Disclosure in the PR template is required for agent-authored work (name the agent and tool).
5. Protected paths need owner approval: `docs/PRD.md`, `docs/TECH.md`, `evals/`, eligibility and
   policy rules.

Non-negotiable invariants:

- Generated facts must trace to a verified claim; unknown eligibility never becomes "eligible".
- Eligibility runs before ranking; every automated action is idempotent and explainable.
- Sensitive fields (demographics, disability, health) are user-only and never sent to models or
  analytics.
- No secrets, PII, or CV content in code, tests, prompts, logs, or analytics.

## Security and privacy

Report vulnerabilities privately via [`SECURITY.md`](SECURITY.md) — never in a public issue.

- **Least privilege** — the extension requests only `activeTab` and `storage`, and only `VITE_*`
  configuration reaches the browser bundle; service-role keys stay server-side.
- **Data rights** — candidates can access, correct, export, and delete their data. Private candidate
  data is never sold or used for recruiter advertising.
- **Legal** — the app ships [privacy](src/pages/PrivacyPolicy.tsx) and
  [terms](src/pages/TermsOfService.tsx) pages at `/privacy` and `/terms`.

## License

Proprietary — see [`LICENSE`](LICENSE). All rights reserved; no license is granted until one is
selected. Third-party dependencies remain under their own licenses.
