# Operating model

One page. How work moves through this repository, and what GitHub can and cannot enforce here.

## Flow

`Goal (milestone)` → `Project #11` → `Issue` → `PR` → `Release (tag)` → `Insights`

- **Goal** — a milestone is an outcome, not a phase. `MVP`: one real application submitted
  end-to-end. `Beta`: ten external users.
- **Project** — one project, four fields: `Status` (Todo / In Progress / Blocked / Done), `Phase`,
  `Priority` (P0–P2), `Size` (S/M/L). Seven views, all filtered `is:open` so finished work leaves
  the board:

  | View | Layout | Filter |
  | --- | --- | --- |
  | Backlog — by priority | Table | `is:open` |
  | Flow | Board | `is:open` |
  | Ready to dispatch | Table | `is:open -label:"jules-queued" -label:"human" -label:"jules"` |
  | In flight | Table | `is:open label:"jules"` |
  | Blocked | Table | `is:open label:"jules-queued"` |
  | Needs a human | Table | `is:open label:"human"` |
  | By phase | Board | `is:open` |

  Grouping and sort order are per-view UI settings; the API only exposes name, layout and filter.
  - `Priority`: `P0` = MVP critical, `P1` = blocks two or more other tasks, `P2` = everything else.
    Recomputed when dependencies change, not by feel.
  - `Size`: assigned at dispatch by whoever picks the task up. Never bulk-filled — a guess made
    for 85 issues at once is worse than an empty field.
- **Issue** — one task, one owner, one PR. Body carries deliverable, scope, acceptance checklist,
  verification commands, files, definition of done. Decompose with sub-issues; express
  ordering with native "blocked by", not prose.
- **PR** — one issue, one squash commit. Template requires the linked issue, evidence, and an
  agent-authored flag.
- **Release** — tag `v0.x.y` + generated notes; deploy only from a tag.
- **Insights** — lead time, cycle time, first-pass CI, agent merge rate.

## Labels — eight, nothing else

`type:bug` · `type:feature` · `type:chore` · `jules` · `jules-queued` ·
`human` · `needs-triage` · `release-blocker`

Phase lives in the `Phase` field, not in labels — one source of truth.

## Ownership

- `jules` — **dispatch trigger**: adding this exact label starts a task in the Jules GitHub App.
  It is never pre-applied; the repo keeps it off ready issues so installing the app cannot start
  twenty tasks at once.
- `jules-queued` — agent work, blocked on another issue. Do not dispatch yet.
- `human` — needs a person: approval, credentials, legal judgement, or an open decision.

**Ready work** = open, without `jules-queued` and without `human`.

Agents never push to `main`. Every agent change arrives as a PR with evidence, and a human merges.

## Gates

Locally and in CI: `bun run typecheck`, `bun run lint`, `bunx vitest run --maxWorkers 2`,
`bun run build`, plus `bun audit` (critical blocks, high reports).

## Enforcement on a free private repo

GitHub returns **403** for rulesets and branch protection on a private repo on the free plan
("Upgrade to GitHub Pro or make this repository public"), so nothing can block a merge. Two free
substitutes carry the load instead:

| Control | How | Weakness |
| --- | --- | --- |
| Red `main` | `.github/workflows/main-guard.yml` — on a failed CI run for `main`, it reverts the offending commit and opens a `type:bug` issue. Skips commits whose message starts with `Revert`, so it cannot loop. | Acts after the push, not before. A conflicting revert needs a human. |
| Direct push to `main` | `scripts/git-hooks/pre-push` — refuses `refs/heads/main`. Install per clone with `bun run hooks:install`; override with `ALLOW_MAIN_PUSH=1`. | Client-side only; a clone without the hook is not covered. |
| Agents | No token with write access to `main`; work arrives as PRs. | Policy, not a technical lock. |

Still impossible without Pro or a public repo:

| Desired control | Status |
| --- | --- |
| Required status check before merge | Not enforceable — red CI is a hard stop by convention |
| Required reviewer / CODEOWNERS enforcement | Advisory only (`.github/CODEOWNERS` documents intent) |
| Linear history, no force-push on `main` | Not enforceable |

Ranked alternatives if policy must be technically enforced: (1) make the repo public — rulesets
are free for public repositories; (2) GitHub Pro at $4/month for this account — unlocks rulesets
on private repos; (3) a second, public mirror whose CI gates promotion. Only the first two are
real enforcement; everything else is detection after the fact.

## Placeholders that are real

`docs/PRD.md`, `docs/TECH.md`, `evals/`, `packages/policy/`, `packages/eligibility/` are
protected. Whether or not GitHub enforces it, do not modify them without the owner's approval —
these define product truth, evaluation data, and safety rules.
