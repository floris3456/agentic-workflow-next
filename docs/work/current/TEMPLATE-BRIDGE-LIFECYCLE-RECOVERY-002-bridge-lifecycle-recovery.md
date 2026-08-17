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

Close the bounded acceptance-proof gap by making the real no-model Scout runtime smoke prove that pinned OpenCode `1.18.16` reloads the exact same API-created session from persistent XDG data/state after trusted runtime reinstall.

## Current position

This same-task review correction started from exact clean synchronized handoff `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b`; the persistence source remains `14b1bc2a6ec95dac3e932881c2ca6a649a199064`, and the bounded real-smoke correction is committed and pushed at developer `1a7794342b56e8fcafbf6cb0eb1246ee4722017d`. The extended smoke creates and reads one real no-model OpenCode session and its empty messages, stops Scout, proves the trusted runtime was replaced, restarts/reprobes, and reads the exact same session ID and empty messages. No persistence implementation or unit recovery semantics changed.

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
- Independent review observed that the real runtime smoke did not exercise OpenCode's actual session store: its persisted terminal fixture and exactly-once recovery client are unit-level fakes, while the real smoke only reinstalled and probed compatibility.
- The corrected real smoke created a session through pinned OpenCode `1.18.16`, retrieved its exact ID and zero messages before reinstall, removed an injected runtime marker through reinstall, then retrieved the same ID and zero messages after restart while the exact compatibility probe remained true.

## Interpretation

Deriving the persistence sibling from the configured runtime root avoids a new caller-controlled trust path and supports automatic migration. Preserving only OpenCode data/state is narrower than preserving the old runtime root wholesale: trusted config/binaries and all startup-authority locations are still replaced and revalidated, while session/message and OAuth refresh evidence remain available for startup recovery.

The acceptance gap can be closed without changing persistence design by creating a harmless session through the real Scout API, reading its exact ID and empty messages before reinstall, then reading that same ID and messages after an independently proven runtime replacement and restart.

## Attempts

No abandoned implementation route. The first focused run exposed one pre-existing status assertion that expected the missing-runtime diagnostic before the new missing-persistence diagnostic; readiness check order was restored so an absent runtime retains its established public blocker while installed runtimes still validate persistence before launch.

## Changed approach

Fresh same-task steering adds the confirmed Scout persistence correction after the developer second-terminal fix. It does not relaunch historical Scouts, alter snapshot verification/fallback boundaries, or address the separate Node-floor and path-synthesis blockers. Independent review at handoff `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b` then narrowed the remaining work to real pinned-runtime session persistence evidence; the persistence design and existing unit recovery semantics remain unchanged unless that smoke exposes a defect.

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
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active at real-smoke correction start.
- Exact continuation check: local `developer`, `HEAD`, and `origin/developer` all matched `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b` with a clean tree.
- Corrected `npm run test:scout-runtime-smoke`: passed against real pinned OpenCode `1.18.16`; exact session ID survived runtime replacement/restart, messages were readable with count zero before/after, the runtime marker was removed, and compatibility remained true.
- Focused build plus config/recovery/Scout-runtime/Scout/workflow tests: passed 45/45; existing canonical terminal and exactly-once coverage remained green.
- Full `npm test`: passed 104/104.
- Final sequential `node scripts/validate-agent-system.mjs`, `./scripts/validate-opencode-bridge.sh`, and `./scripts/validate-repository.sh`: passed; bridge tests passed 104/104 in package/repository validation and template-branch tests passed 8/8.

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
- `tools/opencode-bridge/src/scout-server.ts`
- `tools/opencode-bridge/src/config.ts`

## Last handoff commit

`fc2cdb9567ade7ec24dc5e82c0ba27869caea59b`
