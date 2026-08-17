# Task progress

## Task ID

`TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002`

## Status

Ready for handoff.

## Task-start developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Review-base developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Original task brief

Implement the bounded bridge lifecycle correction for TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002 from exact guarded developer SHA 326e9c402f571b82f6497c4da0f9d3722b553dba. Follow root AGENTS.md and all triggered repository skills. Two confirmed defects: (1) mapped developer terminal delivery can be permanently missed when durable/legacy terminal events are absent; runSession/recoverOnce have no strict canonical terminal fallback, as reproduced by prior task #45 where session.status became inactive and latest assistant message was terminal but task.status remained starting even after sync.recover. Add an idempotent developer canonical terminal proof analogous to Scout canonical recovery: exact mapped session, no outstanding ambiguity, inactive/idle status plus structurally terminal latest assistant completion; busy/retry/tool-calls/nonterminal/malformed/unavailable evidence must not terminalize. Synthesize at most one stable terminal event and let the existing atomic response-delivery path handle projection/publication; never prompt, restart, route, or create a session. Integrate it into normal per-developer recovery and explicit recoverOnce so a missed terminal event is recoverable. (2) Scout sessions launched after bridge startup are mapped by scout.start but never enrolled in startScoutRecovery until service restart. Start the recovery observer immediately once a new Scout has been successfully mapped/prompted, exactly once/idempotently, while preserving startup recovery for historical sessions and all hardened Scout boundaries. Add focused regressions that prove: developer inactive+terminal message with absent durable terminal event recovers exactly once and task/result state becomes terminal; busy/retry/nonterminal/tool-calls/malformed proof does not synthesize terminal; repeated recovery/restart does not duplicate; newly started Scout begins its recovery watcher without bridge restart and terminal Scout response is captured/published; existing startup Scout recovery remains valid. Preserve current permission/interaction recovery, claim-before-delivery, public projection, no-replay semantics, and trust boundaries. Do not modify main or web-orchestration. Do not address the separate Node minimum-version contract in this task. Run focused tests, full bridge tests, validate-agent-system, validate-opencode-bridge, validate-repository, git diff --check, push every commit, and create/push the normal task-record-only developer handoff.

## Current objective

Correct the confirmed same-session second-terminal lifecycle gap: only after proven steer/finalize/route prompt delivery, reactivate the exact mapped developer session and race-safely re-enroll its recovery observer so a later missed terminal event remains canonically recoverable exactly once.

## Current position

This same-task continuation started from synchronized developer `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`, after prior task handoff `5dad89af63057545677e47d546783184b5e8c65d`. The source correction is committed and pushed at developer `6527f78ac9735b038f2f3febad025eb626734b6d`. It reactivates only the exact mapped task/session after successful follow-up prompt delivery, atomically updates the route agent where applicable, coalesces re-enrollment behind an ending prior observer, and prevents duplicate prior terminal delivery from undoing reactivation. All focused, full bridge, agent-system, bridge-package, and repository validation requested for this cycle passes.

## Observed

- At task start, `RecoveryCoordinator.recoverScoutCanonical` already proved a mapped Scout terminal state from session status and the latest assistant message, then persisted through the existing event/delivery path.
- At task start, `RecoveryCoordinator.runSession` and `recoverOnce` recovered durable history but did not perform an equivalent canonical terminal proof for mapped developer sessions; they now do.
- `BridgeService` still starts historical developer and Scout recovery observers during service startup.
- `ScoutRuntime.start` now invokes the service callback after a new Scout is mapped and successfully prompted, while the callback guard keeps enrollment idempotent.
- The first full bridge test run after implementation exposed only test-fixture issues: a callback inferred `number` instead of `void`, one boundary fixture reused an issue number, and one existing cursor assertion did not include the new proof's interaction-list reads.
- After those fixes, the bridge suite passed 99/99 tests, including the new developer proof boundaries/restart delivery and immediate Scout enrollment/capture regressions.
- Independent review confirmed the lifecycle behavior is bounded but identified that the two canonical `recovery.method` strings do not match their actual proof request paths.
- The correction now labels Scout proof inputs as `session.status+session.messages` and developer proof inputs as `permission.list+question.list+session.status+session.messages`; focused assertions inspect both persisted payloads.
- `AS-BUILT.md` already described these proof inputs truthfully, so no durable implementation-record text change was needed for this metadata-only correction.
- Before this continuation correction, successful `steer`, `finalize`, and `route` prompts did not change a mapped task session's persisted terminal state or request a new recovery observer.
- The prior observer registry guard could reject a follow-up enrollment while the old promise was still present, then delete that promise without preserving the enrollment request.
- Reprocessing the first canonical terminal event after reactivation reached an existing response-delivery row; the state layer nevertheless reapplied its terminal state before this correction.
- Successful follow-up commands now reactivate the exact mapping to `starting` after prompt delivery returns, while a failed prompt leaves terminal state unchanged.
- A pending re-enrollment is coalesced while the prior observer is present and launches after that exact promise exits; immediate re-enrollment occurs when no observer remains.
- A focused second-terminal regression proves first canonical delivery, stale first-completion deduplication, the ending-observer race, a distinct second canonical delivery, and no duplicate after explicit recovery or database restart.

## Interpretation

The smallest robust route requires both post-delivery state reactivation and an observer-registry handoff. Reactivation alone could either be immediately reversed by the previously recorded terminal event or leave no canonical proof running when the second completion arrives. Coalescing one pending factory behind the current observer preserves exactly one active observer per key and closes the finishing-promise race without creating or replacing an OpenCode session.

## Attempts

No abandoned implementation route. The first focused build found one `exactOptionalPropertyTypes` declaration mismatch in the new observer registry; changing the callback field to an explicit union resolved it without changing behavior.

## Changed approach

Fresh same-task steering expanded the correction from evidence metadata to the confirmed second-terminal lifecycle defect. Prior canonical proof behavior and corrected `recovery.method` assertions are retained; the new work is limited to proven follow-up prompt paths, exact-session state, observer enrollment, and associated regressions.

## Checks

- Prior-cycle focused/full bridge and repository validation passed at handoff snapshot `305c72cd87bff6d9cccf91b97f78e87af241efd3`.
- Correction-cycle focused recovery/Scout build and tests: passed 34/34.
- `./scripts/validate-opencode-bridge.sh`: contracts/package, bridge 99/99, and template-branch 8/8 passed.
- `./scripts/validate-repository.sh`: pre-implementation, agent-system, research/evidence, hooks, bridge 99/99, and template-branch 8/8 passed.
- `git diff --check`: passed immediately before the correction commit.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active at continuation-cycle start.
- Focused TypeScript build plus recovery/workflow tests: passed 24/24.
- Full `npm test`: passed 102/102.
- `node scripts/validate-agent-system.mjs`: passed.
- `./scripts/validate-opencode-bridge.sh`: contracts/package, bridge 102/102, and template-branch 8/8 passed.
- `./scripts/validate-repository.sh`: pre-implementation, agent-system, research/evidence, hooks, bridge 102/102, and template-branch 8/8 passed.
- `git diff --check`: passed after implementation and record updates.

## Blockers / required decisions

None observed.

## Remaining work

No implementation work remains. Create and push the required new task-record-only handoff snapshot.

## Next action

Run final task-record diff/status inspection, then create and push the handoff snapshot; do not edit or run another tool after its successful push in this cycle.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/deviations.md`
- `tools/opencode-bridge/src/recovery.ts`
- `tools/opencode-bridge/src/service.ts`
- `tools/opencode-bridge/src/commands.ts`
- `tools/opencode-bridge/src/state.ts`
- `tools/opencode-bridge/src/recovery-observer.ts`
- `tools/opencode-bridge/src/scout.ts`

## Last handoff commit

`5dad89af63057545677e47d546783184b5e8c65d`
