# Working an issue with Jules

Jules (jules.google.com) is Google's asynchronous coding agent: it clones a repo into a VM, works
on a task, and opens a pull request for review. This page is the operating contract for using it
on NextJob.

## 1. Prerequisites (one-time, human)

1. Sign in at jules.google.com with the GitHub account that owns the repo (`xb3sox`).
2. Install the **Jules GitHub app** and grant it access to `nextjob` only.
3. Confirm it took: `nextjob` appears in the Jules repo picker, and adding the `jules` label to a
   test issue produces a Jules run within a minute.

Installation state cannot be confirmed from this repo's API surface: `repos/xb3sox/nextjob/assignees`
returned only `xb3sox` when checked, which is consistent with the app not being installed, but the
label trigger is the real test.

Smoke-test it once on the first bounded issue you dispatch, before sending a batch. #63 (code
splitting) served as that issue on 2026-10-25. If no Jules run appears, the app is not on the
repository: stop, that is a human fix.

## 2. Dispatch

**A label is the trigger.** Per the [Jules changelog](https://jules.google/docs/changelog/2025-06-26/):
"Add the label 'jules' to any GitHub issue to start a task in Jules. That's it — label on, task live."

Four preconditions. All four, every time:

1. No branch or merged PR already contains the work.
2. The whole diff fits 400 changed lines. Otherwise split into sub-issues first.
3. No credential, deployment, or secret is involved.
4. It shares no file with another in-flight issue. `index.html` is the usual collision.

Then:

```bash
gh issue edit <number> --add-label jules
gh project item-edit 11 --owner xb3sox --url <issue-url> --field Status --value "In Progress"
```

Jules clones `main`, works the issue, and opens a PR. On PR open, set `Status` → `In Review`.

Assignment is not required, and the label name is not configurable — `agent:jules` would never fire,
which is why this repo renamed it to `jules`.

The label is deliberately **not** pre-applied to ready issues: otherwise installing the app could
retroactively start twenty-two tasks. Ready work is found by excluding `jules-queued` and `human`;
adding `jules` is always a deliberate dispatch.

**Concurrency.** Free plan runs three tasks at once, fifteen a day. Hold at two open agent PRs;
review bandwidth, not quota, is the real limit.

Optional: from the Jules UI you can also start a task from the issue URL directly.

Do **not** add `jules` to an issue also carrying `jules-queued` (blocked) or `human` (needs a decision).

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
