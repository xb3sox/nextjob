## What

- Links the issue this PR resolves: `Refs T-XX` / `Closes #NN`
- One task = one PR. If this touches two issues, split it.

## Why

<!-- One or two sentences. The issue holds the detail; this holds the intent. -->

## Evidence

Paste the command output that proves the acceptance criteria:

```bash
bun run typecheck
bun run lint
bun x vitest run --maxWorkers 2
bun run build
```

## Risk and rollback

- Risk:
- Rollback: revert this commit (no data migration / yes, see below)

## Checklist

- [ ] Scope matches the linked issue; no unrelated refactors
- [ ] No secrets, PII, or CV content added to code, tests, prompts, or logs
- [ ] Protected paths untouched (`docs/PRD.md`, `docs/TECH.md`, `evals/`, policy precedence, eligibility final rules) — or approved by the owner
- [ ] `TASKS.md` updated if this completes a task
- [ ] Agent-authored: <!-- yes/no. If yes, name the agent and the tool/token used -->
