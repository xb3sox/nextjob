# Working an issue with Jules

Jules (jules.google.com) is Google's asynchronous coding agent: it clones a repo into a VM, works
on a task, and opens a pull request for review. This page is the operating contract for using it
on NextJob.

## 1. Prerequisites (one-time, human)

1. Sign in at jules.google.com with the GitHub account that owns the repo (`xb3sox`).
2. Install the **Jules GitHub app** and grant it access to `nextjob` only.
3. Confirm it took: `gh api repos/xb3sox/nextjob/assignees -q '.[].login'` starts returning
   `google-labs-jules` alongside `xb3sox`.

Until step 3 is true, nothing can be assigned to Jules — the API only lists `xb3sox` today.

## 2. Dispatch

Two routes, same result:

- **From the board:** open an issue labelled `agent:jules`, assign it to Jules. Use that label as
  the gate — it already means "dependencies merged, acceptance testable in-repo".
- **From Jules:** pick repository `nextjob`, branch `main`, and paste the issue URL plus the one-line
  goal. Prefer route one; the issue is the spec.

Do **not** dispatch `agent:jules-queued` (blocked) or `agent:human` (needs a decision first).

## 3. What the agent gets

| Source | What it provides |
| --- | --- |
| `AGENTS.md` | Rules, protected paths, gates, branch naming, stop conditions |
| The issue | Deliverable, scope, acceptance checklist, verification commands, files, definition of done |
| `docs/OPERATING_MODEL.md` | Flow, labels, fields, what the repo cannot enforce |
| CI | `typecheck`, `lint`, `bun audit` (critical), `build`, 600+ tests |

## 4. Agent obligations

- Branch `feat/<task-id>-<slug>` from `main`; one issue, one PR.
- Run the four gates and paste the output in the PR body.
- Touch only the files named in the issue. Protected paths need the owner's approval:
  `docs/PRD.md`, `docs/TECH.md`, `evals/`, `packages/policy/`, `packages/eligibility/`.
- Stop and comment instead of guessing when a dependency is unmerged, criteria conflict, or the
  work needs a credential or production action.
- Update `TASKS.md` when the task is complete, with its verification line.

## 5. Review loop

PR opened → human reviews (diff, evidence, no secrets/PII) → squash merge → issue closed → board
item moves to `Done`. Agents never merge and never push to `main`.

## 6. Fallback

The issue is the contract, not the agent. Any capable agent — or a person — can execute the same
brief. T-25 (#109 → PR #128) was executed this way as the first proof the briefs are self-sufficient.
