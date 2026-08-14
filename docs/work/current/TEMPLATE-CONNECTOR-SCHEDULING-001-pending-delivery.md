# Template-maintenance task progress

## Task ID

TEMPLATE-CONNECTOR-SCHEDULING-001

## Status

In progress

## Task-start template-development SHA

a597da0d7835a15830bb1763b6c0e86e5bb975f0

## Review-base template-development SHA

a597da0d7835a15830bb1763b6c0e86e5bb975f0

## Original task brief

> No resume required should not be allowed. Connector-delivery-pending means try other actions first that you were doing anyways and do that command 1-3 times again after those.

## Current objective

Make connector-delivery-pending a nonterminal scheduling state: continue safe independent work, then retry the same logical publication for another bounded window without returning `RESUME REQUIRED` solely because delivery was transiently blocked.

## Current position

The isolated web-orchestration source range is implemented, validated, pushed,
and remotely confirmed. The exact range is ready to package in this ledger.

## Source ranges

- `developer`: `be315eec10030b3d4499a05b823739a2631cb897..be315eec10030b3d4499a05b823739a2631cb897` (expected unchanged)
- `web-orchestration`: `b9814d5c7ae1cfb2f6068c19f08c03850e9b8874..7c1a0094e77ce3fcf06515bf49b3c09b6696d9f8`

## Observed

- The current package correctly preserves a required publication after three failed attempts, but tells the orchestrator to emit `RESUME REQUIRED` immediately.
- A transient connector refusal that succeeds in a later window should not interrupt safe independent inspection, waiting, review, or other already-planned work.
- Work that depends on the unpublished effect must remain paused, and accepted or ambiguous mutations must never be replayed.

## Interpretation

Treat connector delivery like a small schedulable queue: read back, attempt up to three times, park it while doing meaningful nondependent work, then retry at the next natural checkpoint. `RESUME REQUIRED` remains available for genuinely active or ambiguous agent state, not connector delivery alone.

## Attempts

- The first focused-validation command referenced a temporary Node 22.13.0 path
  that no longer existed. An existing exact Node 22.13.0 binary was found in the
  npm cache and used for every reported exact-runtime check.

## Changed approach

None.

## Checks

- Local template-development HEAD equals live `origin/template-development`.
- Live `main` and `developer` remain equal to the exact source lock;
  `web-orchestration` advanced only through the reviewed task range.
- Exact Node 22.13.0 Project validation passed.
- Project tests passed 21/21.
- Developer cross-branch integration validation passed.
- `git diff --check` passed for the web worktree and staged source commits.
- The pre-existing untracked web `tools/` directory remains preserved and out of scope.

## Blockers / required decisions

None.

## Remaining work

- Generate and validate the exact change package, reconcile ledger records, and push the completed handoff.

## Next action

Generate the exact two-branch change package and reconcile the source lock and durable ledger records.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/decisions/0001-template-development-ledger.md`
- `docs/deviations.md`

## Last handoff commit

None
