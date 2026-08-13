# Task progress

## Task ID

BRIDGE-SMOKE-RECOVERY-002

## Status

in progress

## Task-start developer SHA

`04a6387b457dcecb2b862d5dcb111d3cb73a1fef`

## Review-base developer SHA

`04a6387b457dcecb2b862d5dcb111d3cb73a1fef`

## Original task brief

> I think the developer got stuck or the bridge didn't relay properly.

## Current objective

Diagnose the credentialed smoke failure, safely reconcile its bridge tasks, fix
the confirmed interaction/handoff failure modes, and apply only independently
verified behavior-preserving simplifications from the supplied audit.

## Current position

The disposable issues are reconciled and closed. Developer-side runtime,
recovery, state, agent, tests, contracts, and implementation records are updated
and pass focused exact-runtime validation; the coherent commit/push remains.

## Observed

- Issue #10's trusted bridge comment exposed `permission-3`; the web smoke agent
  did not answer it and instead issued sequenced status commands.
- The pending developer tool used a misspelled external working directory, so
  OpenCode correctly requested `external_directory` permission.
- Rejecting that permission resumed the session. The developer completed and
  pushed the two authorized smoke files at handoff
  `04a6387b457dcecb2b862d5dcb111d3cb73a1fef`.
- The developer created one additional handoff-record commit after its first
  handoff snapshot instead of treating that pushed snapshot as a terminal cycle
  boundary.
- Abort and stale-guard recovery completed; issues #10 and #11 are closed, and
  no repository ref other than `developer` changed during the smoke.
- Repository ambiguity threw before all request processing and before restart
  command recovery, so it could suppress the reads needed to resolve ambiguity.
- All interrupted request kinds became `indeterminate`, although
  `command.status`, `task.status`, and `scout.status` are local durable reads.
- Runtime compatibility compared the pinned manifest to the same object supplied
  by every production caller; live drift was already enforced by exact version
  and raw OpenAPI hash.
- A whole-project canonical reconciliation snapshot was stored without a
  production consumer, while its pending permission/question lists could instead
  repair a missed interaction publication.
- `task_sequences` duplicated accepted command-ledger authority.

## Interpretation

The bridge relayed the interaction correctly. The actionable defects are the
web procedure's handling of unexpected visible interactions, the developer
handoff boundary wording/enforcement, and the independently reproduced recovery
and state-model problems above. Cryptographic identities, public projection,
exact-SHA guards, Scout isolation, generic parity/PTY, and outbox durability do
not cause this failure and remain intact.

## Attempts

- Bounded issue readback established the exact pending permission before any
  recovery mutation.
- One task-correlated `permission.reply=reject` resumed the developer without
  replacing or replaying its command.
- One abort and one sequence-free guard lookup completed cleanup without
  executing the stale guard mutation.
- The first repository-root `npm test` validation invocation failed with the
  expected missing `package.json`; it was an incorrect working-directory
  invocation and was replaced with the component validation script.

## Changed approach

The initial relay-failure hypothesis was abandoned after the durable event,
delivered outbox row, and trusted issue comment all proved successful transport.
Implementation now targets consumer handling and handoff finality, plus only
reviewer suggestions confirmed directly in the repository.

- Repository ambiguity now freezes command dispatch, including restart-recovered
  accepted commands, while still admitting and executing recovery requests and
  independent Scouts.
- Interrupted local status requests return to `accepted` and recompute from
  SQLite under the same UUID; only interrupted `scout.start` stays
  `indeterminate` and no-replay.
- Pending mapped permissions/questions now receive stable cross-lane interaction
  identity and idempotent publication repair. The unused aggregate canonical
  snapshot is no longer produced; its legacy table remains readable for existing
  databases.
- Accepted command rows are the only active sequence authority. The legacy
  `task_sequences` table remains physically present for deployed schema
  compatibility but is no longer read or written.
- Runtime compatibility now uses live health/version and exact raw OpenAPI hash.
  Manifest comparison remains an offline upgrade diagnostic.
- The developer agents and handoff skills now make a successful handoff-snapshot
  push the last tool action of its working cycle.

## Checks

- Live issue #10: interaction, developer terminal response, and abort observed.
- Live issue #11: original guarded command remained `pre-ledger-rejected`.
- Direct Git range review: smoke handoff changed only the two authorized files.
- Local and remote `developer` both resolve to
  `04a6387b457dcecb2b862d5dcb111d3cb73a1fef` at task start.
- Exact Node `22.13.0` `./scripts/validate-opencode-bridge.sh`: passed; bridge
  test suite 71/71 and branch-initializer suite 8/8.
- Exact Node `22.13.0` `node scripts/validate-agent-system.mjs`: passed.
- `git diff --check`: passed.

## Blockers / required decisions

None.

## Remaining work

- Commit and push the coherent developer-side implementation.
- Tighten the web smoke interaction procedure.
- Reconcile Project/package instructions and validators where a smaller design
  preserves the same safety behavior.
- Update durable implementation records, run exact-runtime validation, deploy
  if runtime code changes, and synchronize both independent branches.

## Next action

Commit and push the developer-side implementation with current AS-BUILT and
protocol records, then implement the independent Project/package changes.

## Relevant durable records

- `contracts/opencode-bridge/protocol.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/design-record.md`
- `tools/opencode-bridge/AS-BUILT.md`
- external `WEB-ORCHESTRATOR-REDESIGN-001-deviations.md`

## Last handoff commit

None
