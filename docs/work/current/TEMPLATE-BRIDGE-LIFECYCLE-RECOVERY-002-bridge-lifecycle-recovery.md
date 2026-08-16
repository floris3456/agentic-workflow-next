# Task progress

## Task ID

`TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002`

## Status

In progress.

## Task-start developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Review-base developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Original task brief

Implement the bounded bridge lifecycle correction for TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002 from exact guarded developer SHA 326e9c402f571b82f6497c4da0f9d3722b553dba. Follow root AGENTS.md and all triggered repository skills. Two confirmed defects: (1) mapped developer terminal delivery can be permanently missed when durable/legacy terminal events are absent; runSession/recoverOnce have no strict canonical terminal fallback, as reproduced by prior task #45 where session.status became inactive and latest assistant message was terminal but task.status remained starting even after sync.recover. Add an idempotent developer canonical terminal proof analogous to Scout canonical recovery: exact mapped session, no outstanding ambiguity, inactive/idle status plus structurally terminal latest assistant completion; busy/retry/tool-calls/nonterminal/malformed/unavailable evidence must not terminalize. Synthesize at most one stable terminal event and let the existing atomic response-delivery path handle projection/publication; never prompt, restart, route, or create a session. Integrate it into normal per-developer recovery and explicit recoverOnce so a missed terminal event is recoverable. (2) Scout sessions launched after bridge startup are mapped by scout.start but never enrolled in startScoutRecovery until service restart. Start the recovery observer immediately once a new Scout has been successfully mapped/prompted, exactly once/idempotently, while preserving startup recovery for historical sessions and all hardened Scout boundaries. Add focused regressions that prove: developer inactive+terminal message with absent durable terminal event recovers exactly once and task/result state becomes terminal; busy/retry/nonterminal/tool-calls/malformed proof does not synthesize terminal; repeated recovery/restart does not duplicate; newly started Scout begins its recovery watcher without bridge restart and terminal Scout response is captured/published; existing startup Scout recovery remains valid. Preserve current permission/interaction recovery, claim-before-delivery, public projection, no-replay semantics, and trust boundaries. Do not modify main or web-orchestration. Do not address the separate Node minimum-version contract in this task. Run focused tests, full bridge tests, validate-agent-system, validate-opencode-bridge, validate-repository, git diff --check, push every commit, and create/push the normal task-record-only developer handoff.

## Current objective

Implement the two bounded bridge lifecycle corrections and their focused regressions without changing acceptance, promotion, or trust boundaries.

## Current position

Implementation and focused regressions are present in the working tree. The developer canonical proof is integrated into `runSession` and `recoverOnce`; Scout enrollment is wired after successful mapping/prompting and retains startup enumeration for historical sessions. Durable records now describe the corrected behavior. Required validation has passed. The implementation has not yet been committed or pushed.

## Observed

- At task start, `RecoveryCoordinator.recoverScoutCanonical` already proved a mapped Scout terminal state from session status and the latest assistant message, then persisted through the existing event/delivery path.
- At task start, `RecoveryCoordinator.runSession` and `recoverOnce` recovered durable history but did not perform an equivalent canonical terminal proof for mapped developer sessions; they now do.
- `BridgeService` still starts historical developer and Scout recovery observers during service startup.
- `ScoutRuntime.start` now invokes the service callback after a new Scout is mapped and successfully prompted, while the callback guard keeps enrollment idempotent.
- The first full bridge test run after implementation exposed only test-fixture issues: a callback inferred `number` instead of `void`, one boundary fixture reused an issue number, and one existing cursor assertion did not include the new proof's interaction-list reads.
- After those fixes, the bridge suite passed 99/99 tests, including the new developer proof boundaries/restart delivery and immediate Scout enrollment/capture regressions.

## Interpretation

The bounded repair uses a developer-specific proof that first rules out exact-session pending interactions, then requires an inactive/idle status and structurally terminal matching assistant completion. It persists one deterministic canonical event through `recordEvent` and `terminalResponseDelivery`, so existing projection/publication and retry semantics remain authoritative. Scout enrollment is an idempotent service callback after successful mapping and prompting, while startup enumeration remains unchanged.

## Attempts

- Initial build/test attempt: `npm --prefix tools/opencode-bridge test` stopped at TypeScript test typing and fixture setup/assertion failures; the route was corrected without changing the implementation strategy.
- Corrected full bridge test attempt: `npm --prefix tools/opencode-bridge test` passed 99/99.

## Changed approach

None.

## Checks

- Focused recovery/Scout build and tests (`npm --prefix tools/opencode-bridge run build && node --test --test-concurrency=1 tools/opencode-bridge/dist/tests/recovery.test.js tools/opencode-bridge/dist/tests/scout.test.js`): passed 34/34.
- Full bridge tests (`npm --prefix tools/opencode-bridge test`): passed 99/99.
- `node scripts/validate-agent-system.mjs`: passed.
- `./scripts/validate-opencode-bridge.sh`: contracts/package, bridge 99/99, and template-branch 8/8 passed.
- `./scripts/validate-repository.sh`: pre-implementation, agent-system, research/evidence, hooks, bridge 99/99, and template-branch 8/8 passed.
- `git diff --check`: passed before the final source/record status update; rerun before commit.

## Blockers / required decisions

None observed. Required repository-wide validation and synchronization remain.

## Remaining work

- Run all requested checks, push each commit, and create the task-record-only handoff snapshot.

## Next action

Rerun `git diff --check`, inspect the final status, then commit and immediately push the implementation plus current records.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/deviations.md`
- `tools/opencode-bridge/src/recovery.ts`
- `tools/opencode-bridge/src/service.ts`
- `tools/opencode-bridge/src/scout.ts`

## Last handoff commit

`None`
