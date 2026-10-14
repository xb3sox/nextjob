---
name: Jules Worker Task
about: Machine-executable task contract for Jules autonomous coding agent
title: '[TASK]: '
labels: ['agent:jules', 'status:ready']
assignees: []
---

## Task Identity
- **Task ID:** T-XX
- **Target Package:** `packages/<package-name>`
- **PRD Reference:** PRD §Scope FR-XX
- **TECH Reference:** TECH §Architecture

## Goal
A concise statement of what this module does.

## Inputs & Output Contracts (Zod Schemas)
```typescript
// Explicit input and output types
```

## Dependencies & Imports
- Import shared types from `packages/api/src/...` or local types.
- Export all public functions from `src/index.ts`.

## Acceptance Criteria
- [ ] AC-1: Given ..., When ..., Then ...
- [ ] AC-2: Given ..., When ..., Then ...

## Verification Commands
```bash
bun test packages/<package-name>
bun run typecheck
```
