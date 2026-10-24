# Operating model

One page. How work moves through this repository, and what GitHub can and cannot enforce here.

## Flow

`Goal (milestone)` → `Project #11` → `Issue` → `PR` → `Release (tag)` → `Insights`

- **Goal** — a milestone is an outcome, not a phase. `MVP`: one real application submitted
  end-to-end. `Beta`: ten external users.
- **Project** — one board, four fields: `Status` (Todo / In Progress / Blocked / Done), `Phase`,
  `Priority` (P0–P2), `Size` (S/M/L). Views: board, backlog, agent queue, blocked.
- **Issue** — one task, one owner, one PR. Body carries deliverable, scope, acceptance checklist,
  verification commands, files, definition of done. Decompose with sub-issues; express
  ordering with native "blocked by", not prose.
- **PR** — one issue, one squash commit. Template requires the linked issue, evidence, and an
  agent-authored flag.
- **Release** — tag `v0.x.y` + generated notes; deploy only from a tag.
- **Insights** — lead time, cycle time, first-pass CI, agent merge rate.

## Labels — eight, nothing else

`type:bug` · `type:feature` · `type:chore` · `agent:jules` · `agent:jules-queued` ·
`agent:human` · `needs-triage` · `release-blocker`

Phase lives in the `Phase` field, not in labels — one source of truth.

## Ownership

- `agent:jules` — ready for an agent: dependencies merged, acceptance testable in-repo.
- `agent:jules-queued` — agent work, blocked on another issue. Do not start.
- `agent:human` — needs a person: approval, credentials, legal judgement, or an open decision.

Agents never push to `main`. Every agent change arrives as a PR with evidence, and a human merges.

## Gates

Locally and in CI: `bun run typecheck`, `bun run lint`, `bunx vitest run --maxWorkers 2`,
`bun run build`, plus `bun audit` (critical blocks, high reports).

## What this repository cannot enforce

Private repo, free plan, personal account: GitHub returns **403** for rulesets and branch
protection, and environments/deployment approvals are Pro-gated. Therefore:

| Desired control | Status |
| --- | --- |
| Required status check before merge | Not enforceable — treat red CI as a hard stop by convention |
| Required reviewer / CODEOWNERS enforcement | Advisory only (`.github/CODEOWNERS` documents intent) |
| Linear history, no force-push on `main` | Not enforceable |
| Deploy approval gate | Not available — deploy is manual (`workflow_dispatch`) and uses repo-level secrets |

Substitutes: humans only merge green PRs, agents hold no write access to `main`, deploy stays
manual, and `CODEOWNERS` names the reviewer who must be pinged.

Unblocking all of it costs either GitHub Pro (rulesets on a private repo) or making the repo
public. Neither is a code change.

## Placeholders that are real

`docs/PRD.md`, `docs/TECH.md`, `evals/`, `packages/policy/`, `packages/eligibility/` are
protected. Whether or not GitHub enforces it, do not modify them without the owner's approval —
these define product truth, evaluation data, and safety rules.
