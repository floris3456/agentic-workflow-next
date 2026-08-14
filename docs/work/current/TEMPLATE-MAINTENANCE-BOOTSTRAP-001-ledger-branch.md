# Template-maintenance task progress

## Task ID

TEMPLATE-MAINTENANCE-BOOTSTRAP-001

## Status

Completed

## Task-start template-development SHA

8ee1064ea8ee32713215cba0cecbf5852d09a935

## Review-base template-development SHA

8ee1064ea8ee32713215cba0cecbf5852d09a935

## Public-safe task brief

Build a self-contained `template-development` maintenance ledger, then use it for a separate smoke-response diagnosis based on operator-provided external evidence without persisting host-local source details.

## Current objective

Replace the bootstrap integration snapshot with a self-contained maintenance
ledger and deterministic upstream/downstream transfer workflow.

## Current position

The ledger-only tree, source provenance, dedicated task/AS-BUILT/design/deviation
records, maintainer agent/skill, synchronization hooks, change-package tools,
tests, validator, and CI workflow are implemented and locally validated. The
discarded bootstrap full-copy history is prepared for a one-time exact-lease,
tree-preserving replacement so the branch begins as a self-contained ledger.

## Source ranges

- Ledger bootstrap: `8ee1064ea8ee32713215cba0cecbf5852d09a935..HEAD`.
- Developer source: unchanged; the existing template already instructs generated
  projects to include all branches.
- Web-orchestration source: unchanged; no Project runtime behavior is needed to
  make this independent ledger available.

## Observed

- `main=6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer=ccfa12dc2783c7e8fc336abc503e083b69112a71`.
- `web-orchestration=04e111dd874c2f431805b52b3eb24c6b04de95b8`.
- The bootstrap commit contains a full tree union, which is not the approved
  steady-state branch shape.
- GitHub template generation copies selected branch tips but does not preserve a
  usable upstream relationship for future template updates.

## Interpretation

Keep only maintenance records and tools on this branch. Actual template code and
component AS-BUILT truth remain on their authoritative source branches. The
ledger correlates exact refs, task state, review, and portable patches.

## Attempts

- An initial full-tree workbench was created before the user clarified the
  desired separation. That approach was abandoned before any implementation
  commit beyond the bootstrap snapshot.

## Changed approach

Use a lightweight coordination branch plus exact upstream worktrees and
path-scoped patches. Do not duplicate or merge source trees.

## Checks

- Bootstrap remote and local refs match at the task-start SHA.
- Developer and web-orchestration tracked worktrees are clean; the web worktree's
  pre-existing untracked `tools/` directory remains untouched.
- `./scripts/validate-template-development.sh` passed: structural validator,
  3/3 deterministic package tests, and `git diff --check`.

## Blockers / required decisions

None.

## Remaining work

None for the ledger implementation. The separate smoke-response diagnosis starts
as a new task after the exact ledger root is pushed and verified.

## Next action

Start `TEMPLATE-SMOKE-RESPONSE-001` on this branch using the new workflow.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`

## Last handoff commit

None
