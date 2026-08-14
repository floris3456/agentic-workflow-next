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

The ledger task is initialized before source edits. Exact live refs match the source lock.

## Source ranges

- `developer`: `be315eec10030b3d4499a05b823739a2631cb897..be315eec10030b3d4499a05b823739a2631cb897` (expected unchanged)
- `web-orchestration`: `b9814d5c7ae1cfb2f6068c19f08c03850e9b8874..pending`

## Observed

- The current package correctly preserves a required publication after three failed attempts, but tells the orchestrator to emit `RESUME REQUIRED` immediately.
- A transient connector refusal that succeeds in a later window should not interrupt safe independent inspection, waiting, review, or other already-planned work.
- Work that depends on the unpublished effect must remain paused, and accepted or ambiguous mutations must never be replayed.

## Interpretation

Treat connector delivery like a small schedulable queue: read back, attempt up to three times, park it while doing meaningful nondependent work, then retry at the next natural checkpoint. `RESUME REQUIRED` remains available for genuinely active or ambiguous agent state, not connector delivery alone.

## Attempts

None.

## Changed approach

None.

## Checks

- Local template-development HEAD equals live `origin/template-development`.
- Live `main`, `developer`, and `web-orchestration` equal the exact source lock.
- All tracked source worktrees are clean; the pre-existing untracked web `tools/` directory remains out of scope.

## Blockers / required decisions

None.

## Remaining work

- Commit and push this start record.
- Implement and validate the minimal Project policy correction.
- Push and review the web source range.
- Generate and validate the exact change package, reconcile ledger records, and push the completed handoff.

## Next action

Commit the start record, then edit the isolated `web-orchestration` worktree.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/decisions/0001-template-development-ledger.md`
- `docs/deviations.md`

## Last handoff commit

None
