# Task progress

## Task ID
TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001

## Status
Completed

## Task-start developer SHA
29d59fb15bbdd31b59205c691deb4ddd167ade78

## Review-base developer SHA
29d59fb15bbdd31b59205c691deb4ddd167ade78

## Original task brief
Implement the developer-side source work for TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001 from exact guarded developer SHA 29d59fb15bbdd31b59205c691deb4ddd167ade78. Follow root AGENTS.md and all triggered repository skills. Investigate repeat-canary run-03 as evidence, then use the pinned OpenCode 1.18.16 configuration/permission contract rather than guessing syntax. Required outcomes: (1) normal filesystem/shell work inside the exact configured developer repository root is pre-authorized and should not surface unnecessary external_directory approvals; (2) genuine access outside that exact worktree remains approval-gated and visible to the orchestrator, including bridge/local-runtime maintenance when explicitly needed; broad parent-directory access must not be silently allowed; (3) strengthen the small-developer instructions so repository tasks do not walk parent directories to rediscover the repository and do not widen scope when a path is missing; (4) after permission.reply or question.reply, add bounded automatic same-session continuation recovery when the mapped live developer session has no outstanding interactions and remains non-progressing: at most one idempotent continuation nudge per resolved-interaction episode, never replay start, never create a replacement session, never change scope, and publish public-safe recovery evidence so clean versus recovered completion is distinguishable; (5) fail closed if session/interactions/state cannot be proven safe; (6) preserve question/permission semantics, no-replay behavior, Scout isolation, and human-only promotion authority. Add focused tests for contained-path permission behavior, outside-worktree approval preservation, parent-walk guidance/validation as appropriate, one-shot post-interaction recovery, no recovery while interactions remain outstanding, no duplicate nudge, and no new session/start replay. Update protocol/README/AS-BUILT/deviations where material. Run proportional repository checks, push every commit, create/push the dedicated developer handoff snapshot, and return exactly the canonical six-field developer response. Do not modify main or web-orchestration and do not finalize/archive the task record in this working cycle.

## Current objective
Implement the bounded developer-side permission configuration, repository-scope guidance/validation, and same-session post-interaction recovery contract without weakening approval, isolation, replay, or promotion boundaries. Correct the recovery race by requiring bounded post-interaction grace and a recheck before a one-shot continuation nudge.

## Current position
The corrected implementation and durable records are pushed at
`c857762c327ff9f86bd0f3afd055116ba650f23b`. The same mapped correction route
was independently reconciled and absorbed without a second session or start.
The clean synchronized runtime loaded that revision, passed the focused real
same-session interaction/control acceptance, and remains healthy. Only this
dedicated task-record handoff snapshot remains.

## Observed
- Task start was synchronized at `29d59fb15bbdd31b59205c691deb4ddd167ade78`;
  after implementation push, `developer` and `origin/developer` both resolve to
  `908d660755e00f3539dc2f7cbe2673c48664de92`.
- Tracked workflow hooks pass `./scripts/bootstrap-agent-workflow.sh --check`.
- Existing repeat-canary task records are present under `docs/work/current/`.
- The pinned OpenCode `debug config` resolves root `external_directory` to
  `ask`; no root read/edit/bash broad allow was added, and the small-developer
  route inherits that approval boundary.
- `npm test` passes 92 bridge tests after adding persisted interaction episodes,
  one-shot continuation claims, command-result recovery outcomes, and scope
  guidance/config tests.
- `node scripts/validate-agent-system.mjs`, `./scripts/validate-opencode-bridge.sh`,
  and `./scripts/validate-repository.sh` all passed; the latter included 92
  bridge tests and 8 branch-initializer tests.
- `git diff --check`: passed.
- The review identified that the first `session.status` value of `idle` was
  treated as sufficient proof for a nudge, allowing a race with automatic
  resumption. This correction cycle starts from the synchronized handoff
  snapshot and adds a bounded grace/recheck proof.
- Live session-35 evidence showed the configured directory/root were correct.
  The three unnecessary approvals came from consecutive `read` tool inputs that
  manually retyped the developer checkout basename without `workflow`; the
  immediately preceding shell tool used the exact configured root successfully.
  This was agent path synthesis, not bridge configuration or cwd corruption.
- The corrected coordinator waits one second after initial live non-progress,
  then repeats both interaction lists, mapped-session status, and the session's
  live activity timestamp. `busy`/`retry` or changed activity returns clean;
  only stable live non-progress can reach the existing durable claim.
- Sequence 22 and both existing status requests were consumed without replay;
  `question.list` returned empty. Durable state and GitHub projection agree, with
  no pending command, request, response delivery, or outbox work.
- The delayed issue-44 read was outside the configured 5-second active cadence,
  but the paginated ETag route consumed the page-2 comments correctly after the
  bridge's fail-closed GitHub retry window. The prior transient error was cleared
  on success and could not be reproduced; no polling source defect is proven.
- Correction commit `c857762c327ff9f86bd0f3afd055116ba650f23b` is pushed and
  independently resolves from the remote `developer` ref.
- The sync watcher rebuilt from a clean synchronized checkout and restarted only
  the bridge service. The new process reported compatible OpenCode `1.18.16`;
  heartbeat and `last_poll_at` advanced, `last_error` was clear, no command,
  request, response-delivery, or outbox work was pending, and Scout stayed ready.
- A real session-35 canary read `AGENTS.md` in-worktree and produced no permission
  request, then asked `question-9`. Fresh sequence 23 replied through issue #44;
  continuation was reported `clean`, both interaction queues cleared, and the
  same session automatically returned `The canary continued.` No manual post-
  reply steer, recovery nudge, start replay, or replacement session occurred.
- A fresh sequence-free `task.status` request reached durable `succeeded` about
  2.7 seconds after its GitHub comment, within the configured 5-second active
  cadence; bot acknowledgement/success and durable state agree.

## Interpretation
The implementation must be made against the existing bridge/runtime source and its durable records; no branch other than `developer` is part of this local task.

## Attempts
1. Inspected repeat-canary run-03, bridge state/recovery/command/service code,
   the operation manifest, and the pinned OpenCode configuration behavior.
2. Implemented a schema-4 interaction table with task/session/kind binding,
   resolution state, and durable `not-attempted`/`claimed`/`sent` continuation
   state. Recovery now validates both pending interaction lists and exact mapped
   session status, then sends only one same-session continuation nudge when the
   session is idle. It never starts or replaces a session or changes route.
3. Added command, recovery, state, workflow, configuration, and guidance tests;
   updated protocol, README, architecture, AS-BUILT, and agent-system records.
4. The first focused test run exposed only test-fixture mismatches (the prompt
   path used `/api` instead of the manifest's `/session` path and a multiline
   guidance assertion); both were corrected and the full component suite passed.
5. Review correction: replace the single post-reply idle observation with a
   bounded post-interaction grace followed by a second interaction/status proof;
   transient resumption must return clean without claiming or nudging.
6. Reconciled the original session, issue commands, durable state, services, and
   preserved dirty files before takeover; the route was terminal and absorbed,
   not replaced.
7. Replaced the initial correction with a coordinator-local one-second grace,
   second interaction/status proof, and live session-activity comparison. Added
   stable idle/inactive, transient idle-to-busy, idle-with-activity, restart
   duplicate, outstanding-interaction, live-busy, and no-start coverage.
8. Tightened path guidance to copy the exact live `cwd`/root when an absolute
   path is required, rather than reconstructing the checkout basename.

## Changed approach
The supplied official OpenCode permission finding steered the implementation
away from any broad `external_directory` allow rule. Root config now sets that
permission to `ask`, while normal in-worktree operations retain server
defaults. Small-developer guidance uses repository-relative paths and stops on
missing paths instead of walking parents/siblings or widening scope. Recovery
uses persisted interaction mapping and a pre-delivery one-shot claim; uncertain
proof or delivery blocks without replay.
The review correction preserves that claim boundary and adds a bounded live-
activity recheck so an initial idle/inactive observation cannot race normal
automatic resumption. The path correction targets the observed synthesis cause;
it does not weaken `external_directory: ask`. Poller code is unchanged because
pagination/cache/admission behavior reconciled and no source defect reproduced.

## Checks
- Initial synchronization: clean `developer` worktree at the guarded SHA; remote matches local.
- `./scripts/bootstrap-agent-workflow.sh --check`: passed.
- `npm run build` in `tools/opencode-bridge`: passed.
- `npm test` in `tools/opencode-bridge`: passed, 92/92 tests.
- Pinned OpenCode `1.18.16` `debug config`: resolved `external_directory: ask`,
  with no root read/edit/bash broad permission override.
- `node scripts/validate-agent-system.mjs`: passed.
- `./scripts/validate-opencode-bridge.sh`: passed, including 92/92 bridge
  tests.
- `./scripts/validate-repository.sh`: passed, including research, structure,
  agent-system, bridge, 92/92 bridge tests, and 8/8 branch tests.
- `git diff --check`: passed.
- Current focused recovery tests: 7/7 passed, including stable idle/inactive,
  transient idle-to-busy, changed live activity, restart duplicate, outstanding
  interaction, live busy, and unproven-state fail-closed behavior.
- Current scope/workflow tests: 3/3 passed.
- Current `node scripts/validate-agent-system.mjs`: passed.
- Current `git diff --check`: passed.
- Current `npm --prefix tools/opencode-bridge test`: passed, 95/95.
- Current `./scripts/validate-opencode-bridge.sh`: passed.
- Current `./scripts/validate-repository.sh`: passed, including 95/95 bridge
  tests and 8/8 branch-initializer tests.
- A supervised read-only `git ls-remote` proved the repository runtime route can
  reach the exact remote developer head `af19f527390972c5f84dd2d82c40249feb2b3231`.
- Remote readback: `developer` resolves to
  `c857762c327ff9f86bd0f3afd055116ba650f23b`.
- Clean synchronized runtime acceptance: compatible OpenCode `1.18.16`, live
  bridge process, advancing heartbeat/poll time, clear error, empty work queues,
  healthy Scout, zero in-worktree permissions, same-session question reply and
  clean automatic continuation, and fresh sequence-free read consumed in about
  2.7 seconds.
- Previous implementation and handoff commits through
  `af19f527390972c5f84dd2d82c40249feb2b3231` are pushed successfully; local
  `HEAD` and `origin/developer` match that SHA at cycle start.

## Blockers / required decisions
None.

## Remaining work
None for this developer-side handoff.

## Next action
Create and push the dedicated task-progress-only handoff snapshot, then return
the canonical six fields without further developer-cycle work.

## Relevant durable records
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/deviations.md`
- `docs/work/current/ADAPTER-REPEAT-03-CFFD06DD595E-repeat-canary.md`
- `research/WORKFLOW.md`

## Last handoff commit
af19f527390972c5f84dd2d82c40249feb2b3231
