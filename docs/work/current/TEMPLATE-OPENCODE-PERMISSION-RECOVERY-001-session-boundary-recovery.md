# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001

## Status

In progress

## Task-start template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Review-base template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Public-safe task brief

Harden delegated developer sessions so normal work inside the exact configured developer repository root avoids unnecessary external-directory approval, genuine outside-worktree access remains orchestrator-gated, repository tasks do not wander through parent/sibling directories, and resolved interactions can recover a genuinely non-progressing same session without replay or scope expansion.

## Current objective

Finish and independently review the developer-side permission boundary and bounded post-interaction continuation recovery.

## Current position

The guarded Luna route on issue #44 produced implementation commit `908d660755e00f3539dc2f7cbe2673c48664de92` and handoff snapshot `af19f527390972c5f84dd2d82c40249feb2b3231`. Independent review found one defect: the first implementation could nudge immediately on a single post-reply `idle` observation, which did not prove the session remained non-progressing. Same-session correction command sequence 9 was delivered; Luna is actively correcting that finding. No second session or start replay was used.

## Source ranges

- developer maintenance start: `ceb9e053c40bc586551069bff1fbfe8c051dcb55`
- developer delegated implementation base after repaired bookkeeping mistake: `29d59fb15bbdd31b59205c691deb4ddd167ade78`
- first reviewed handoff candidate: `af19f527390972c5f84dd2d82c40249feb2b3231`
- corrected developer handoff: pending
- web-orchestration: unchanged at `1f53ce62fba87ba9677b86d3837a008717aa4c24`

## Observed

- Repeat adapter series produced 9/10 clean passes; run 03 required same-session steering after resolved external-directory interactions.
- Pinned OpenCode behavior keeps ordinary in-working-directory operations normal while `external_directory` represents an outside-worktree boundary; the implementation keeps it at `ask` rather than broadly allowing it.
- The first implementation added repository-relative guidance, durable one-shot interaction recovery state, focused tests, and architecture/protocol records; its reported repository validation passed 92 bridge tests and 8 branch tests.
- Independent source review found `continueAfterInteraction` would nudge on the first `idle` status after a reply, without a grace/recheck proving continued non-progress.
- Live OpenCode status can show fresh tool activity even when durable projected task state remains `starting`; stale projected state alone is not stall evidence.

## Interpretation

The correct recovery boundary is: resolve interactions, allow normal resumption, observe a bounded period or equivalent positive no-progress proof, and only then claim one same-session continuation nudge. Any live progress means no recovery nudge.

## Attempts

- Created an empty `__noop__` file accidentally on `developer`; the exact known effect was immediately removed by a normal follow-up commit, with no force/reset/history rewrite. The repaired SHA `29d59fb15bbdd31b59205c691deb4ddd167ade78` became the guarded developer base.
- Initial Luna implementation reached `af19f527390972c5f84dd2d82c40249feb2b3231`.
- Review correction was sent to the same mapped Luna session; no duplicate execution occurred.

## Changed approach

The initial immediate-idle recovery design was rejected during independent review. Recovery now requires bounded evidence that the session remains non-progressing before any nudge.

## Checks

- Exact live refs and issue lifecycle independently read from remote GitHub.
- First implementation range `29d59fb15bbdd31b59205c691deb4ddd167ade78..af19f527390972c5f84dd2d82c40249feb2b3231` inspected; changed paths match the requested bridge/config/guidance/tests/docs scope.
- First handoff commit exists remotely and is task-record-only.
- Final corrected checks and exact range review remain pending.

## Blockers / required decisions

None.

## Remaining work

- Receive the corrected same-session handoff.
- Independently review the correction and exact final developer range.
- Reconcile source-lock and close the control issue after the route is terminal and absorbed.

## Next action

Observe the existing Luna correction to terminal state; do not replay or create a replacement route.

## Relevant durable records

- Issue #44
- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/README.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`

## Last handoff commit

None
