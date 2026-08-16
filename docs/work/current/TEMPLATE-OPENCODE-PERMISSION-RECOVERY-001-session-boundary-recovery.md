# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001

## Status

Blocked on local bridge service recovery

## Task-start template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Review-base template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Public-safe task brief

Harden delegated developer sessions so normal work inside the exact configured developer repository root avoids unnecessary external-directory approval, genuine outside-worktree access remains orchestrator-gated, repository tasks do not wander through parent/sibling directories, and resolved interactions can recover a genuinely non-progressing same session without replay or scope expansion.

## Current objective

Finish and independently review the developer-side permission boundary and bounded post-interaction continuation recovery.

## Current position

The guarded Luna route on issue #44 produced implementation commit `908d660755e00f3539dc2f7cbe2673c48664de92` and first handoff snapshot `af19f527390972c5f84dd2d82c40249feb2b3231`. Independent review found one defect: the first implementation could nudge immediately on a single post-reply `idle` observation rather than proving continued non-progress. The same mapped Luna session received the correction and began work. Its later tool turn exposed three unnecessary `external_directory` requests aimed at a misspelled sibling worktree basename (`agentic-work-template-developer`); one rejection succeeded and the remaining requests disappeared without replay. A live permission-list read then returned an empty queue. After that point the local bridge stopped polling GitHub: sequence 22 `question.list` and a sequence-free status request are published but have no bridge acknowledgement. Remote `developer` remains at `af19f527390972c5f84dd2d82c40249feb2b3231`. No second session, start replay, or overlapping source mutation has been launched.

## Source ranges

- developer maintenance start: `ceb9e053c40bc586551069bff1fbfe8c051dcb55`
- developer delegated implementation base after repaired bookkeeping mistake: `29d59fb15bbdd31b59205c691deb4ddd167ade78`
- first handoff candidate: `af19f527390972c5f84dd2d82c40249feb2b3231`
- corrected developer handoff: pending
- web-orchestration: unchanged at `1f53ce62fba87ba9677b86d3837a008717aa4c24`

## Observed

- Repeat adapter series produced 9/10 clean passes; run 03 required same-session steering after resolved external-directory interactions.
- Pinned OpenCode behavior keeps ordinary in-working-directory operations normal while `external_directory` represents an outside-worktree boundary; the implementation keeps it at `ask` rather than broadly allowing it.
- The first implementation added repository-relative guidance, durable one-shot interaction recovery state, focused tests, and architecture/protocol records; its reported repository validation passed 92 bridge tests and 8 branch tests.
- Independent source review found `continueAfterInteraction` would nudge on the first `idle` status after a reply, without a grace/recheck proving continued non-progress.
- Live OpenCode status can show fresh tool activity even when durable projected task state remains `starting`; stale projected state alone is not stall evidence.
- The correction session later waited on three `external_directory` requests whose targets used the misspelled sibling worktree basename rather than the configured current worktree. The request queue was reconciled to empty without replay.
- Sequence 20 permission reply ended `indeterminate` because the referenced request had already disappeared; it was not retried.
- Sequence 21 `permission.list` succeeded with `[]`.
- Sequence 22 `question.list` and sequence-free request `f0cc5e20-f4c8-449b-8f55-40e65aec11c5` remain unacknowledged after a bounded recovery interval, indicating the local bridge control loop is no longer polling GitHub.

## Interpretation

The correct recovery boundary is: resolve interactions, allow normal resumption, observe a bounded period or equivalent positive no-progress proof, and only then claim one same-session continuation nudge. Any live progress means no recovery nudge. The recurring unnecessary approvals are strongly associated with synthesized sibling-worktree paths rather than legitimate outside-worktree access. The current blocker is local bridge availability, not an unresolved design decision or permission choice.

## Attempts

- Created an empty `__noop__` file accidentally on `developer`; the exact known effect was immediately removed by a normal follow-up commit, with no force/reset/history rewrite. The repaired SHA `29d59fb15bbdd31b59205c691deb4ddd167ade78` became the guarded developer base.
- Initial Luna implementation reached `af19f527390972c5f84dd2d82c40249feb2b3231`.
- Review correction was sent to the same mapped Luna session; no duplicate execution occurred.
- Reconciled live status/messages and interactions without replay. Permission 24 was rejected; permission 23 disappeared before its reply and therefore produced an `indeterminate` 404; the next permission-list read proved the queue empty.
- Waited a bounded interval and posted one sequence-free command-status request for the unacknowledged sequence-22 read; the bridge did not answer either marker.

## Changed approach

The initial immediate-idle recovery design was rejected during independent review. Recovery now requires bounded evidence that the session remains non-progressing before any nudge. The developer route remains paused in place while the local bridge is recovered; no replacement route is permitted.

## Checks

- Exact live refs and issue lifecycle independently read from remote GitHub.
- First implementation range `29d59fb15bbdd31b59205c691deb4ddd167ade78..af19f527390972c5f84dd2d82c40249feb2b3231` inspected; changed paths match the requested bridge/config/guidance/tests/docs scope.
- First handoff commit exists remotely and is task-record-only.
- Permission queue was independently reconciled to empty through the bridge before it stopped polling.
- Final corrected checks and exact range review remain pending.

## Blockers / required decisions

Local operator must inspect/restart the supervised bridge service while preserving issue #44, the existing task binding, and the mapped Luna session. Do not replay sequence 22, create a replacement issue/session, or modify source through another route.

## Remaining work

- Recover local bridge polling and reconcile the already-published sequence-22/question-status markers.
- Resume the existing Luna session only as required by reconciled state.
- Receive and independently review the corrected developer handoff.
- Reconcile source-lock and close issue #44 after the route is terminal and absorbed.
- Only then begin the separate minimal `web-orchestration` final-response-gate maintenance task.

## Next action

Local operator bridge status/restart, then passive reconciliation of issue #44 before any new command.

## Relevant durable records

- Issue #44
- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/README.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`

## Last handoff commit

None
