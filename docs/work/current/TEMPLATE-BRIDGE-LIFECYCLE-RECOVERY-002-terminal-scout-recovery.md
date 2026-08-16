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

Correct two bridge lifecycle defects found during full promotion review: mapped developer sessions can finish without a recoverable terminal projection when durable/legacy terminal events are missed, and Scout sessions created after service startup are mapped but do not start their recovery observer until a bridge restart. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract and recurring developer path-synthesis findings are not part of this source correction.

## Current objective

Add developer canonical terminal recovery and immediate recovery observation for newly created Scout sessions, with focused regressions and full proportional bridge/repository validation.

## Current position

Canonical issue #49 is bound to one Luna/small-developer route on exact guarded developer SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`. Start sequence 1 command `dcb850fd-3fe6-45e2-9a25-3fafef644a1c` succeeded and mapped one same developer session. No developer commit is remote yet.

The route repeatedly synthesized the same invalid sibling checkout basename despite existing repository-relative developer guidance. Three initial `external_directory` events (`permission-39`, `permission-40`, `permission-41`) targeted the invalid sibling root. Sequence 2 rejected `permission-39`; its continuation recovery was `clean / session-progressing`. A live sequence-3 `permission.list` then returned `[]`, proving the initial permission set cleared; vanished aliases were not replayed. Live sequence 4 returned inactive status with no commit, so one bounded same-session steer (sequence 5) instructed Luna to continue the existing task using only repository-relative paths. After that steer Luna synthesized the invalid sibling again for `docs/architecture/*` as `permission-42`; sequence 6 rejected it and continuation recovery again returned `clean / session-progressing`.

Live sequence 7 subsequently proved the same session `busy`, so no route change or second steer was issued. After an observation interval, live sequence 8 again proved the same session `busy`. A later read-only session metadata request (sequence 9) was issued only to distinguish useful activity from a stale busy projection; no new interaction or source mutation was introduced by orchestration. Remote `developer` remains exactly the guarded base as of the latest read.

Three read-only promotion-review Scouts (#46-#48) remain mapped on the exact pre-fix developer SHA and are not yet absorbed. Their stuck `starting` projections are part of the reproduced new-Scout recovery-start defect; their start requests will not be replayed.

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
- The current Luna route reproduces the previously observed wrong sibling path synthesis even though `.opencode/agents/small-developer.md` explicitly requires repository-relative paths and forbids reconstructing or walking sibling checkout paths. This is a separate promotion-readiness defect and is not being silently folded into this lifecycle patch.
- Two accidental placeholder issues (#50 and #51) were created while selecting the GitHub file-write tool; both were immediately closed `not_planned` and caused no branch or source mutation.

## Interpretation

The two lifecycle defects share the same reliability boundary: terminal/session observation must be started and recoverable independently of receiving one particular SSE/durable event. The smallest safe correction is to give mapped developer sessions an exact terminal canonical proof analogous to Scout recovery, and to enroll each newly mapped Scout in its recovery observer exactly once immediately after successful start.

The recurring invalid sibling path synthesis is now independently reproduced after the earlier prompt-only guidance change and must be treated as a separate promotion blocker rather than assumed fixed. It does not justify granting external access or widening this task.

## Attempts

1. Full promotion review established the exact candidate, successful developer CI, and promotion-sensitive boundaries.
2. Three focused read-only Scouts were launched on the exact candidate tree; they remain nonterminal and exposed the new-Scout recovery-start gap.
3. Direct source review confirmed the developer canonical-terminal asymmetry and the new-Scout observer-start omission.
4. Canonical issue #49 was created and one guarded Luna route started from exact developer SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`.
5. Initial wrong-sibling permission set was reconciled without replay: permission-39 rejected, then live permission list proved empty.
6. Stable inactive/no-commit evidence justified one same-session steer; no replacement start/session occurred.
7. A later wrong-sibling `permission-42` was rejected; continuation resumed naturally and two later live status reads proved the session busy, so no route change was made.
8. Placeholder issues #50/#51 were mistakenly created during tool selection and immediately closed `not_planned`; no source ref moved.

## Changed approach

The earlier fast-completion correction remains independently reviewed and packaged. This is a separate promotion-readiness correction discovered by broader review; it does not reopen or rewrite the prior task. The recurring path-synthesis defect is also separated from this lifecycle correction so one source mutation remains bounded and reviewable.

## Checks

- Exact developer/template-development/main/web refs reread before source work.
- Exact `runSession`, `recoverOnce`, `recoverScoutCanonical`, `runScoutSession`, `BridgeService.startScoutRecovery`, service startup wiring, and `RequestExecutor.scout.start` behavior inspected remotely.
- Real issue #45 and Scout #46-#48 lifecycle evidence reconciled against source.
- Live interaction queue was explicitly reconciled after the initial permission burst; no vanished permission was replayed.
- Same-session continuation after both permission rejections returned `clean / session-progressing`.
- Live OpenCode status sequences 7 and 8 independently proved `session-81` busy after the second rejection.

## Blockers / required decisions

None for the bounded lifecycle correction while the mapped developer session is live-busy. Promotion remains blocked independently by the lifecycle defects under repair, the recurring wrong-sibling path synthesis, the Node minimum-version contract mismatch, and unresolved finalization/review boundaries.

## Remaining work

Observe the active Luna route without interference while live progress continues; receive its pushed task/implementation/handoff commits; independently review the exact source range and CI; prove watcher/bridge synchronization/restart; reconcile the three pre-existing Scout sessions and absorb their reports. Then package this lifecycle correction on template-development. Afterward separately resolve the Node-floor contract and wrong-sibling path-synthesis blocker, reconcile developer task finalization, and repeat the full `main -> developer` promotion review before any human approval request.

## Next action

Watch remote `developer` and issue #49 for a pushed task/implementation commit or a genuine new interaction. Do not steer or route while live status remains busy.

## Relevant durable records

- Source correction issue #49
- Start command `dcb850fd-3fe6-45e2-9a25-3fafef644a1c`
- Initial permission reply `5ba9f82b-f4be-4b50-9ab6-f32893310683`
- Permission-list proof `82a21c50-b01d-4b15-828f-2c97604a1ab6`
- First live inactive proof `71c52b82-1f92-4fab-a955-6218352c1a42`
- Same-session steer `3f0e9de4-1490-4d25-81a8-032c240a2cef`
- Second permission reply `a4c1db29-41f2-49fb-9ef2-536401237dcb`
- Live busy proofs `87d8ee74-c258-4600-9d61-5a2dd1046291` and `999bc9b8-1246-4aac-850b-d6e042382441`
- Read-only live session metadata command `e857e8fe-18fc-45e7-9cf2-5bc312c19139`
- Promotion review Scouts #46, #47, #48
- Prior developer terminal evidence issue #45
- Prior reviewed developer handoff `326e9c402f571b82f6497c4da0f9d3722b553dba`
- Prior maintenance package `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`

## Last handoff commit

None
