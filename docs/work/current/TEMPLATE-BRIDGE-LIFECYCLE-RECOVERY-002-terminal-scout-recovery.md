# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

## Status

In progress

## Task-start template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Review-base template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Public-safe task brief

Correct two bridge lifecycle defects found during full promotion review: mapped developer sessions can finish without a recoverable terminal projection when durable/legacy terminal events are missed, and Scout sessions created after service startup are mapped but do not start their recovery observer until a bridge restart. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract finding is not part of this source correction.

## Current objective

Add developer canonical terminal recovery and immediate recovery observation for newly created Scout sessions, with focused regressions and full proportional bridge/repository validation.

## Current position

Remote developer is exactly `326e9c402f571b82f6497c4da0f9d3722b553dba`. Canonical source-control issue #49 exists but is not yet admitted. Three read-only promotion-review Scouts (#46-#48) are mapped on the exact pre-fix developer SHA and remain projected `starting`; source inspection shows new Scout sessions are only enrolled in `startScoutRecovery()` during service startup. The prior real developer task #45 also proved `task.status` can stay stale after a terminal assistant handoff because `runSession` has no developer canonical terminal fallback and `sync.recover` only retries durable history plus interactions.

## Source ranges

- developer: `326e9c402f571b82f6497c4da0f9d3722b553dba..pending`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- `RecoveryCoordinator.runSession()` only recovers durable session history and watches durable session SSE; it has no canonical terminal lane for developer sessions.
- `recoverScoutCanonical()` and `runScoutSession()` already provide an idempotent canonical fallback for Scout sessions using live status plus latest assistant completion.
- `BridgeService.run()` starts `startScoutRecovery()` only for Scout sessions already persisted at bridge startup.
- `RequestExecutor` maps a new Scout during `scout.start` but exposes no callback that starts the per-Scout recovery observer after that mapping.
- Three Scouts launched during promotion review reproduce this post-start gap: their start requests succeeded, but repeated `scout.status` reads remain `starting` with no projected response while the bridge heartbeat advances.
- Prior task #45 reproduces the developer terminal gap: live session status became inactive and the latest assistant message was terminal/completed, but `task.status` stayed `starting` and `sync.recover` did not materialize a terminal event.
- Two accidental placeholder issues (#50 and #51) were created while selecting the GitHub file-write tool; both were immediately closed `not_planned` and caused no branch or source mutation.

## Interpretation

The two lifecycle defects share the same reliability boundary: terminal/session observation must be started and recoverable independently of receiving one particular SSE/durable event. The smallest safe correction is to give mapped developer sessions an exact terminal canonical proof analogous to Scout recovery, and to enroll each newly mapped Scout in its recovery observer exactly once immediately after successful start.

## Attempts

1. Full promotion review established the exact current candidate and CI state.
2. Three focused read-only Scouts were launched on the exact candidate tree; they remain nonterminal and exposed the new-Scout recovery-start gap.
3. Direct source review confirmed the developer canonical-terminal asymmetry and the new-Scout observer-start omission.
4. Canonical issue #49 was created for the bounded source correction.
5. Placeholder issues #50/#51 were mistakenly created during tool selection and immediately closed `not_planned`; no source ref moved.

## Changed approach

The earlier fast-completion correction remains independently reviewed and packaged. This is a separate promotion-readiness correction discovered by broader review; it does not reopen or rewrite the prior task.

## Checks

- Exact developer/template-development/main/web refs reread before source work.
- Exact `runSession`, `recoverOnce`, `recoverScoutCanonical`, `runScoutSession`, `BridgeService.startScoutRecovery`, service startup wiring, and `RequestExecutor.scout.start` behavior inspected remotely.
- Real issue #45 and Scout #46-#48 lifecycle evidence reconciled against source.

## Blockers / required decisions

None for this bounded lifecycle correction.

## Remaining work

Admit one guarded Luna developer route from exact developer SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`, implement/tests/checks/handoff, independently review the new source range, verify the watcher/bridge restart recovers the three existing Scout sessions, then resume the promotion review. The separate Node floor mismatch and developer-task finalization gate remain to resolve afterward.

## Next action

Bind issue #49 to one guarded Luna start from exact developer SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`.

## Relevant durable records

- Source correction issue #49
- Promotion review Scouts #46, #47, #48
- Prior developer terminal evidence issue #45
- Prior reviewed developer handoff `326e9c402f571b82f6497c4da0f9d3722b553dba`
- Prior maintenance package `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`

## Last handoff commit

None
