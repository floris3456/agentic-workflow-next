# Task progress

## Task ID

AGENT-SYSTEM-001

## Status

In progress

## Task-start developer SHA

45794a60c7980408673854cbe22aaf17cf7dff3e

## Review-base developer SHA

45794a60c7980408673854cbe22aaf17cf7dff3e

## Original task brief

Add a general-purpose, public-safe ChatGPT Project installation package to the independent orchestration branch. Retain only procedures reusable across projects, generalize repository identities and assumptions, and verify that all repository branches remain project-agnostic.

## Current objective

Generalize the reusable Project instructions and orchestration procedures, persist them only under the orchestration namespace, and reconcile implementation-branch documentation with that new repository fact.

## Current position

The supplied package has been inventoried. Its Project instruction file and shared/MCP-ON/MCP-OFF procedures are structurally reusable, but repository identities, historical evidence assumptions, installation wording, and branch documentation require generalization.

## Observed

- The target worktree is clean on `developer` and synchronized with `origin/developer`.
- The target remote has independent `main`, `developer`, and `web-orchestration` branches.
- The supplied Project package contains one instruction file and nineteen focused procedure files.
- Existing implementation documentation states that web operating instructions live outside Git.

## Interpretation

A public-safe installation source can live under `web-orchestration-only/**` without making orchestration memory authoritative or allowing implementation agents to depend on that branch. Implementation documentation must distinguish the branch-hosted installation source from private live Project state.

## Attempts

None.

## Changed approach

None.

## Checks

- Remote refs fetched.
- Source package paths inventoried.
- Reusable Project files read and classified.

## Blockers / required decisions

None.

## Remaining work

- Create generalized Project installation files on `web-orchestration`.
- Update implementation-branch architecture and AS-BUILT records.
- Add deterministic validation for the orchestration package where appropriate.
- Scan all branches for residual project identifiers and validate independent history.

## Next action

Commit this task start, then build the generalized orchestration package in an isolated worktree.

## Relevant durable records

- `docs/architecture/agent-system.md`
- `docs/architecture/repository-layout.md`
- `docs/architecture/AS-BUILT.md`
- `web-orchestration-only/README.md`

## Last handoff commit

None
