# Task progress

## Task ID

`TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002`

## Status

Implementation and requested validation complete; substantive correction ready to commit.

## Task-start developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Review-base developer SHA

`326e9c402f571b82f6497c4da0f9d3722b553dba`

## Original task brief

Implement the bounded bridge lifecycle correction for TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002 from exact guarded developer SHA 326e9c402f571b82f6497c4da0f9d3722b553dba. Follow root AGENTS.md and all triggered repository skills. Two confirmed defects: (1) mapped developer terminal delivery can be permanently missed when durable/legacy terminal events are absent; runSession/recoverOnce have no strict canonical terminal fallback, as reproduced by prior task #45 where session.status became inactive and latest assistant message was terminal but task.status remained starting even after sync.recover. Add an idempotent developer canonical terminal proof analogous to Scout canonical recovery: exact mapped session, no outstanding ambiguity, inactive/idle status plus structurally terminal latest assistant completion; busy/retry/tool-calls/nonterminal/malformed/unavailable evidence must not terminalize. Synthesize at most one stable terminal event and let the existing atomic response-delivery path handle projection/publication; never prompt, restart, route, or create a session. Integrate it into normal per-developer recovery and explicit recoverOnce so a missed terminal event is recoverable. (2) Scout sessions launched after bridge startup are mapped by scout.start but never enrolled in startScoutRecovery until service restart. Start the recovery observer immediately once a new Scout has been successfully mapped/prompted, exactly once/idempotently, while preserving startup recovery for historical sessions and all hardened Scout boundaries. Add focused regressions that prove: developer inactive+terminal message with absent durable terminal event recovers exactly once and task/result state becomes terminal; busy/retry/nonterminal/tool-calls/malformed proof does not synthesize terminal; repeated recovery/restart does not duplicate; newly started Scout begins its recovery watcher without bridge restart and terminal Scout response is captured/published; existing startup Scout recovery remains valid. Preserve current permission/interaction recovery, claim-before-delivery, public projection, no-replay semantics, and trust boundaries. Do not modify main or web-orchestration. Do not address the separate Node minimum-version contract in this task. Run focused tests, full bridge tests, validate-agent-system, validate-opencode-bridge, validate-repository, git diff --check, push every commit, and create/push the normal task-record-only developer handoff.

## Current objective

Correct the confirmed Scout session-persistence lifecycle gap by preserving private OpenCode data/state across trusted Scout runtime replacement without allowing mutable persistence to become config, plugin, instruction, or executable authority.

## Current position

This same-task continuation started from exact synchronized developer and prior handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`. The Scout installer now derives a sibling persistence root, preserves only XDG data/state there across complete trusted-runtime replacement, keeps HOME/config/cache/tmp/PATH authority in the replaceable runtime, validates persistence containment and filesystem structure, and migrates legacy isolated OAuth into the persistent auth location. All requested focused/full, real-runtime smoke, agent-system, bridge-package, and repository validation passes.

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
- Before this continuation correction, `installScoutRuntime` created OpenCode data/state beneath the runtime root and then deleted that root on every apply reinstall.
- `ScoutServerProcess` also pointed XDG data/state into that replaceable root, so SQLite Scout mappings and immutable snapshots could outlive the OpenCode session/message evidence needed by startup recovery.
- The runtime now derives `<scout_runtime_root>-persistence`; install and active readiness checks require its root/data/state tree to be owner-private, non-symlink, structurally regular, outside repository containment, and non-overlapping with the runtime.
- Reinstall still removes and recreates the trusted runtime/config/dependency tree, HOME, cache, and temp. XDG data/state alone point to the persistence sibling; config, PATH, managed config, plugins, external skills, project config, and instructions remain controlled by the immutable runtime and launch flags.
- OAuth configuration prefers the persistent refreshed file, accepts the legacy runtime-data path only to seed a missing persistent file, and removes stale OAuth when API-key mode is selected.
- Install and launch require the configured persistence root to equal the derived runtime sibling, revalidate persistent OAuth shape/private mode, and refuse any post-install persistent OAuth file in API-key mode.
- The reinstall regression maps a Scout before replacement, retains terminal message evidence in persistence, verifies trusted runtime replacement, recovers/publishes one canonical response after reopening bridge state, and proves no duplicate on repeated recovery/restart.
- Existing immediate new-Scout recovery enrollment remains covered and passed in focused/full runs.

## Interpretation

Deriving the persistence sibling from the configured runtime root avoids a new caller-controlled trust path and supports automatic migration. Preserving only OpenCode data/state is narrower than preserving the old runtime root wholesale: trusted config/binaries and all startup-authority locations are still replaced and revalidated, while session/message and OAuth refresh evidence remain available for startup recovery.

## Attempts

No abandoned implementation route. The first focused run exposed one pre-existing status assertion that expected the missing-runtime diagnostic before the new missing-persistence diagnostic; readiness check order was restored so an absent runtime retains its established public blocker while installed runtimes still validate persistence before launch.

## Changed approach

Fresh same-task steering adds the confirmed Scout persistence correction after the developer second-terminal fix. It does not relaunch historical Scouts, alter snapshot verification/fallback boundaries, or address the separate Node-floor and path-synthesis blockers.

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
- Scout persistence focused build plus config/recovery/runtime/Scout tests: passed 42/42.
- Full `npm test`: passed 104/104.
- `npm run test:scout-runtime-smoke`: installed, started/probed twice, reinstalled, then started/probed twice again with real pinned OpenCode `1.18.16`; compatible.
- `node scripts/validate-agent-system.mjs`: passed after final source/test changes.
- `./scripts/validate-opencode-bridge.sh`: contracts/package, bridge 104/104, and template-branch 8/8 passed after final source/test changes.
- `./scripts/validate-repository.sh`: pre-implementation, agent-system, research/evidence, hooks, bridge 104/104, and template-branch 8/8 passed after final source/test changes.
- `git diff --check`: passed after implementation, tests, and durable-record updates.
- Final credential-boundary focused build/config/Scout tests: passed 8/8.
- Final full `npm test`: passed 104/104 after credential-boundary assertions.
- Final `npm run test:scout-runtime-smoke`: reinstalled, started/probed idempotently before and after reinstall, and passed with real pinned OpenCode `1.18.16`.
- Final sequential agent-system, bridge-package, and repository validators passed; bridge tests passed 104/104 in each package/repository validation and template-branch tests passed 8/8.

## Blockers / required decisions

None observed.

## Remaining work

Commit and push the substantive correction with its tests and durable records, then update this record with the pushed source SHA and create/push a new task-record-only handoff snapshot.

## Next action

Run final status/diff inspection, then commit and push the substantive correction.

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
- `tools/opencode-bridge/src/scout-server.ts`
- `tools/opencode-bridge/src/config.ts`

## Last handoff commit

`9ca25b8b6f9036744cb61845039f9185deb9e78f`
