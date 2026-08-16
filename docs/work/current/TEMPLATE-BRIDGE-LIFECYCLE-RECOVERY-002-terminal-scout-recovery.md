# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

## Status

Blocked on local bridge observation; same-session Sol route is published but unacknowledged

## Task-start template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Review-base template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Public-safe task brief

Correct bridge lifecycle defects found during full promotion review: recover missed mapped-developer terminal handoffs canonically, start recovery for newly launched Scout sessions without a bridge restart, and preserve recoverability across later same-session review/finalization/route prompts. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract and recurring developer path-synthesis findings are not part of this source correction.

## Current objective

Reconcile the already-published same-session Sol route without replay, then finish the confirmed second-terminal lifecycle correction: a successful follow-up prompt on an already-terminal mapped developer session must reactivate durable task state and ensure its recovery observer is enrolled/re-enrolled so a missed later terminal handoff is recoverable exactly once.

## Current position

Canonical issue #49 remains the single mutating source route. It is bound to one existing mapped developer session originally started with Luna/small-developer from exact guarded developer SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`; no replacement start/session has occurred.

The initial lifecycle implementation is remote at `9c1ae8a445cbf53db7af3905aefd471470c6cac6`, followed by task-record-only handoff `305c72cd87bff6d9cccf91b97f78e87af241efd3`. Independent review found evidence-method metadata drift; same-session sequence 15 corrected it at source commit `0362e24a363d9f905234283666b3f840983a6ef1`, with focused assertions and repository CI success, followed by task-record-only handoff `a12855280dc35a10aded89cd3db2989fad84bcc4`.

Independent review then confirmed a deeper continuation edge: after a recorded terminal handoff, normal `steer`/`finalize`/`route` prompts the same session but do not move persisted task state back to nonterminal or reliably re-enroll per-session recovery. `recoverDeveloperCanonical()` skips already-terminal mapped state and `runSession()` can already have exited, so a missed second terminal handoff is not recoverable. Sequence 17 (`34780ecf-8a40-47df-b4db-1fc69d4eb90f`) successfully delivered that exact correction brief to the same session.

Luna did not implement the requested second-terminal fix. Instead it produced another task-record-only handoff `5dad89af63057545677e47d546783184b5e8c65d` whose record explicitly says there was no further implementation work. Live sequence 21 (`3b7b5141-22d5-41f1-943a-57e0f03d3fd9`) then returned `session.status = {}`, proving the same session inactive with the confirmed source defect still present.

Sequence 22 route command `e9a777cb-8e35-4a33-985a-52e553bc05e2` was posted exactly once on #49 to keep the same task/session and switch the implementation agent to Sol/large-developer with the bounded second-terminal correction brief. The marker is valid OWNER-authored control input but remains unacknowledged: no bot `accepted`, `applying`, terminal, or rejected marker exists. It must not be replayed and no sequence 23 may be posted while its admission is unknown.

The last remotely recoverable bridge heartbeat in the existing task-status evidence is `1786923580448` (`2026-08-16T23:39:40.448Z`). The sequence-22 route marker was created later at `2026-08-16T23:46:50Z`. Therefore remote GitHub cannot prove the local bridge process polled after the route was published. The latest issue `updated_at` remains the sequence-22 marker time, and remote `developer` remains `5dad89af63057545677e47d546783184b5e8c65d`. Local bridge status/log observation is now required before any restart or further command.

The route earlier repeatedly synthesized an invalid sibling checkout basename despite repository-relative guidance. Initial `external_directory` aliases `permission-39`, `permission-40`, `permission-41` targeted that invalid sibling; sequence 2 rejected `permission-39`, and a later live `permission.list` proved the set cleared without replaying vanished aliases. After one bounded same-session continuation steer, `permission-42` repeated the invalid sibling path for `docs/architecture/*`; sequence 6 rejected it and continuation recovery returned clean. This recurring path-synthesis problem is a separate promotion blocker and is not being fixed by the current lifecycle patch.

Three read-only promotion-review Scouts (#46-#48) remain bound to their original exact-ref start requests and are not yet absorbed. Their stuck `starting` projections reproduced the new-Scout recovery-start gap; those starts will never be replayed.

## Source ranges

- developer: `326e9c402f571b82f6497c4da0f9d3722b553dba..pending-final-handoff`
- initial implementation: `326e9c402f571b82f6497c4da0f9d3722b553dba..9c1ae8a445cbf53db7af3905aefd471470c6cac6`
- metadata correction: `305c72cd87bff6d9cccf91b97f78e87af241efd3..0362e24a363d9f905234283666b3f840983a6ef1`
- current developer tip before Sol route admission: `5dad89af63057545677e47d546783184b5e8c65d`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Old `RecoveryCoordinator.runSession()` had no canonical terminal lane for developer sessions; real task #45 proved a terminal handoff could be missed permanently.
- Initial source fix adds strict developer canonical proof: no mapped-session pending permission/question, inactive/idle status, exact matching completed assistant message, reject busy/retry/tool-calls/nonterminal/malformed evidence, deterministic one-shot terminal event through existing delivery.
- New Scout enrollment is wired after successful Scout mapping/prompting while startup recovery remains for historical Scout sessions.
- Evidence-method metadata is now truthful and assertion-pinned: Scout uses `session.status+session.messages`; developer uses `permission.list+question.list+session.status+session.messages`.
- The remaining confirmed defect is post-terminal same-session continuation: `prompt()`/`changeRoute()` can successfully deliver later work while durable task state remains terminal and the old recovery promise may already be ending/ended.
- Luna failed to implement that remaining defect after sequence 17 and instead pushed a no-op task handoff; live inactive status after that handoff justified same-session route recovery to Sol.
- Sequence 22 has not been consumed remotely; the last known service heartbeat predates the route marker, so local service state is now an evidence boundary rather than ordinary delay.
- The current route independently reproduced the wrong sibling path synthesis after the earlier prompt-only guidance change.
- The separate tracked Node 22.13.0 floor remains inconsistent with Scout runtime production dependency `ini@7.0.0` requiring Node `^22.22.2 || ^24.15.0 || >=26`; this remains a separate promotion blocker.
- Two accidental placeholder issues (#50 and #51) were created during tool selection, immediately closed `not_planned`, and caused no branch/source mutation.

## Interpretation

The lifecycle task is not complete despite several handoff snapshots. The source is materially improved, but second-terminal recoverability is still missing and is part of the same developer-terminal recovery authority. Replaying start, replaying sequence 22, or replacing the mapped session would violate continuity. The safest next action is to inspect the local bridge process/status/logs to determine whether it polled after the route marker. Only if local evidence proves the bridge stopped before consuming sequence 22 may a service restart be considered; the route marker itself remains the one mutation to consume after restart.

The wrong-sibling path synthesis and Node runtime-floor mismatch are separate blockers that should be addressed only after this mutating lifecycle route becomes terminal and absorbed.

## Attempts

1. Full promotion review established the initial developer-terminal and new-Scout recovery gaps.
2. Three exact-ref read-only Scout starts reproduced the new-Scout observer-start gap; starts remain bound and unreplayed.
3. One guarded Luna route on #49 implemented the first lifecycle correction and passed focused/full repository checks.
4. Independent review corrected canonical recovery evidence metadata in the same session; source commit `0362e24a...` and CI passed.
5. Independent review found the second-terminal-after-review-steer gap and delivered sequence 17 in the same session.
6. Luna pushed only task-record handoff `5dad89af...` instead of source implementation. Live sequence 21 returned `{}` after that handoff, proving inactive/no-progress with the defect unresolved.
7. Sequence 22 routed the same session to Sol exactly once; it remains unacknowledged and has not been replayed.
8. Remote heartbeat/issue timestamps were reconciled and show the latest recoverable heartbeat predates sequence 22, creating a local-operator observation boundary.
9. Wrong-sibling permission bursts were rejected without widening scope or replaying vanished interactions.

## Changed approach

The intended same-session Sol route remains correct, but execution is paused at its unacknowledged admission boundary. Continue the same task/session only after local bridge observation proves how to recover the control loop without replaying sequence 22.

## Checks

- Exact developer/template-development/main/web refs were repeatedly reread during review.
- Initial lifecycle implementation exact range reviewed remotely.
- Developer canonical proof boundaries, Scout enrollment callback, startup recovery, and tests inspected directly.
- Metadata correction exact commit reviewed; repository Actions at `0362e24a...` succeeded.
- Task-record-only nature of handoffs `305c72cd...`, `a1285528...`, and `5dad89af...` verified remotely.
- Sequence 17 succeeded as same-session `steering-delivered`.
- Sequence 21 succeeded with live `session.status = {}` after the no-op handoff, establishing the recovery condition for agent routing.
- Sequence 22 marker was independently fetched with OWNER association and exact creation time `2026-08-16T23:46:50Z`; no bridge-authored status follows it.
- Last known task-status heartbeat converts to `2026-08-16T23:39:40.448Z`, before sequence 22.
- Developer `5dad89af...` repository validation workflow run `31979948854` succeeded.

## Blockers / required decisions

Blocked only on fresh local bridge observation. No human product/design decision is needed, but the orchestrator cannot observe the host-local bridge process, SQLite state, or systemd logs through GitHub. Do not restart blindly and do not replay sequence 22.

Promotion remains blocked independently by the unresolved lifecycle defect, recurring wrong-sibling path synthesis, Node runtime-floor mismatch, unresolved Scout reports, and developer/template finalization boundaries.

## Remaining work

1. Obtain fresh local bridge status after sequence-22 publication: current heartbeat, last_poll_at, last_error, pending commands/requests/outbox, PID, and repository-specific service state/logs if stale.
2. If local evidence proves the bridge stopped before consuming sequence 22 and there is no pending/indeterminate mutation, restart only the repository-specific bridge service and allow the existing sequence-22 marker to be consumed; never repost it.
3. Reconcile sequence 22 terminal state; receive Sol source correction and new task-record-only developer handoff; independently review exact range and CI.
4. Prove bridge synchronization/restart and reconcile the three original Scout sessions without replay; absorb/close Scout review issues.
5. Close #49 only after the source route is terminal/absorbed and lifecycle review is clean.
6. Generate/validate the exact lifecycle change package on template-development and reconcile source lock/handoff.
7. Separately resolve wrong-sibling path synthesis and Node runtime-floor mismatch.
8. Reconcile required developer/template finalization and repeat full `main -> developer` promotion review before any human exact-SHA approval request.

## Next action

Get one fresh host-local bridge status snapshot and compare `last_poll_at`/heartbeat with sequence-22 creation time `2026-08-16T23:46:50Z`; do not mutate the service until that comparison is known.

## Relevant durable records

- Source correction issue #49
- Start command `dcb850fd-3fe6-45e2-9a25-3fafef644a1c`
- Initial permission reply `5ba9f82b-f4be-4b50-9ab6-f32893310683`
- Permission-list proof `82a21c50-b01d-4b15-828f-2c97604a1ab6`
- First live inactive proof `71c52b82-1f92-4fab-a955-6218352c1a42`
- Same-session continuation steer `3f0e9de4-1490-4d25-81a8-032c240a2cef`
- Second permission reply `a4c1db29-41f2-49fb-9ef2-536401237dcb`
- Metadata correction steer `b86c0094-4f11-4b48-b4a5-5bd7d5045b0c`
- Second-terminal correction steer `34780ecf-8a40-47df-b4db-1fc69d4eb90f`
- Live inactive proof after no-op handoff `3b7b5141-22d5-41f1-943a-57e0f03d3fd9`
- Pending same-session Sol route `e9a777cb-8e35-4a33-985a-52e553bc05e2`
- Initial implementation `9c1ae8a445cbf53db7af3905aefd471470c6cac6`
- Metadata correction `0362e24a363d9f905234283666b3f840983a6ef1`
- Current developer tip/handoff `5dad89af63057545677e47d546783184b5e8c65d`
- Promotion review Scouts #46, #47, #48
- Prior developer terminal evidence issue #45
- Prior reviewed developer handoff `326e9c402f571b82f6497c4da0f9d3722b553dba`
- Prior maintenance package `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`

## Last handoff commit

None
