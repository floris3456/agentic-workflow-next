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

Correct only the canonical recovery evidence-method metadata identified by independent review and lock both method strings with focused assertions; do not change lifecycle behavior or scope.

## Current position

The lifecycle implementation and focused regressions are committed and pushed at developer `9c1ae8a445cbf53db7af3905aefd471470c6cac6`, with handoff snapshot `305c72cd87bff6d9cccf91b97f78e87af241efd3`. The metadata correction and focused assertions are pushed at developer `0362e24a363d9f905234283666b3f840983a6ef1`; no lifecycle behavior changed. This continuation cycle starts from the previous handoff snapshot `a12855280dc35a10aded89cd3db2989fad84bcc4` and has no further implementation work.

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

## Interpretation

The review correction changes only persisted evidence labels: Scout will name `session.status+session.messages`, and developer will name `permission.list+question.list+session.status+session.messages`. Focused payload assertions will prevent future drift; proof calls, terminal decisions, delivery, projection, and Scout enrollment remain unchanged.

## Attempts

None in this correction cycle.

## Changed approach

Independent review steering narrowed the work to evidence-metadata truthfulness and regression assertions; no lifecycle implementation route is being changed.

## Checks

- Prior-cycle focused/full bridge and repository validation passed at handoff snapshot `305c72cd87bff6d9cccf91b97f78e87af241efd3`.
- Correction-cycle focused recovery/Scout build and tests: passed 34/34.
- `./scripts/validate-opencode-bridge.sh`: contracts/package, bridge 99/99, and template-branch 8/8 passed.
- `./scripts/validate-repository.sh`: pre-implementation, agent-system, research/evidence, hooks, bridge 99/99, and template-branch 8/8 passed.
- `git diff --check`: passed immediately before the correction commit.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active at continuation-cycle start.

## Blockers / required decisions

None observed.

## Remaining work

No implementation work remains in this correction cycle. The new task-record-only handoff snapshot still must be created and pushed.

## Next action

Run final diff/status inspection, then create/push the new task-record-only handoff snapshot; do not edit after its successful push in this cycle.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/deviations.md`
- `tools/opencode-bridge/src/recovery.ts`
- `tools/opencode-bridge/src/service.ts`
- `tools/opencode-bridge/src/scout.ts`

## Last handoff commit

`a12855280dc35a10aded89cd3db2989fad84bcc4`
