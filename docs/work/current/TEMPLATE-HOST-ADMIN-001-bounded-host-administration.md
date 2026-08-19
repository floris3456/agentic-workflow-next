# Template-maintenance task progress

## Task ID

TEMPLATE-HOST-ADMIN-001

## Status

completed

## Task-start template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Review-base template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Public-safe task brief

Implement a bounded, repository-owned host-administration capability for the
reusable workflow so the Workspace Maintenance Agent can safely inspect and
recover the repository's existing OpenCode bridge service without gaining
arbitrary host access.

Key requirements:
1. Expose operations conceptually equivalent to:
   - `workspace_bridge_inspect`: inspects the existing bridge installation
     associated with this exact repository, returning bounded public-safe status.
   - `workspace_bridge_start`: idempotently starts the existing registered bridge
     service when stopped, without accepting unit names or running bootstrap/dispose.
   - `workspace_bridge_reconcile`: asks the running bridge to perform its normal
     canonical recovery and response delivery pass for mapped sessions.
2. Maintain strict containment:
   - Model supplies no unit names, paths, DBus addresses, or command arguments.
   - Private installation is derived deterministically from canonical repository
     identity and operator-owned host registry/configuration.
   - DBus, XDG runtime, host environment, and credentials remain inside the trusted
     broker and are never exposed to `workspace_exec` or the model.
   - Fail closed on ambiguous registration, identity mismatch, or missing config.
3. Tests and verification:
   - Adversarial and positive unit tests for inspection, start, reconciliation, and
     path/identity containment.
   - Real-machine acceptance test distinguishable from CI fixtures.
   - Durable architecture, AS-BUILT, deviations, and operator documentation updates.

## Current objective

Complete task-progress snapshot and change package handoff for TEMPLATE-HOST-ADMIN-001.

## Current position

Source implementation, tests, validation, change package creation, and source-lock update complete.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..3b66f1dde50e355e9d405799b2f1e8828d7963d9`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..bd287bca8b7b9861f91e2d5c9243c4c5165834f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Developer implementation on `developer` (`bd287bca8b7b9861f91e2d5c9243c4c5165834f9`):
  - Created `tools/opencode-bridge/src/admin.ts` with `BridgeAdminServer` (Unix domain socket `admin.sock` mode 0600) and `BridgeAdminClient`.
  - Added `adminSocketFile` and `serviceUnit` to `BridgeConfig` schema.
  - Implemented `reconcile()` on `BridgeService` and added `reconcileBridge` helper.
  - Added `opencode-bridge reconcile` CLI command and updated `opencode-bridge status` to query live admin socket when available.
  - Added unit test suite in `tools/opencode-bridge/tests/admin.test.ts` (121 total tests passing).
  - Pushed to `origin/developer` at `bd287bca8b7b9861f91e2d5c9243c4c5165834f9`.
- Template-development implementation on `template-development` (`3b66f1dde50e355e9d405799b2f1e8828d7963d9`):
  - Created `scripts/workspace-maintenance-host.mjs` with `SystemdUserClient`, `HostBridgeRegistry`, `HostBridgeAdminClient`, and `WorkspaceBridgeBroker`.
  - Added `bridgeInspect()`, `bridgeStart()`, and `bridgeReconcile()` to `WorkspaceMaintenanceGate`.
  - Added `workspace_bridge_inspect`, `workspace_bridge_start`, and `workspace_bridge_reconcile` tools to `.opencode/plugins/workspace-maintenance.ts`.
  - Allowed tools in `.opencode/agents/workspace-maintainer.md` and `.opencode/agents/small-workspace-maintainer.md`.
  - Added positive, adversarial, and real-host acceptance unit tests in `tests/workspace-bridge-host.test.mjs` (17 test suites passing).
  - Updated `docs/architecture/AS-BUILT.md`, `docs/deviations.md`, and `.opencode/skills/workspace-maintenance/SKILL.md`.
  - Pushed to `origin/template-development` at `3b66f1dde50e355e9d405799b2f1e8828d7963d9`.
- Change package `changes/TEMPLATE-HOST-ADMIN-001/` created and verified with schema 3 manifest.
- Source snapshot updated in `source-lock.json`.

## Interpretation

All requirements of the bounded host-administration capability are satisfied. The Workspace Maintenance Agent can inspect, start, and reconcile the bridge without arbitrary host access, unit name injection, path injection, DBus leakage, or credential exposure.

## Attempts

1. Implemented bridge admin socket server/client on `developer` and ran test suite: 121 tests passed.
2. Implemented host bridge broker and workspace tools on `template-development` and ran test suite: 17 tests passed.
3. Ran full template-development validation including pinned OpenCode runtime inventory check: passed.
4. Created provenance-verified change package and updated source lock: passed.

## Changed approach

None.

## Checks

- `developer`: `npm test` passed (121 tests); `./scripts/validate-repository.sh` passed.
- `template-development`: `node --test tests/*.test.mjs` passed (17 tests); `./scripts/validate-template-development.sh` passed.
- `git diff --check`: clean on both branches.
- Change package validation: `changes/TEMPLATE-HOST-ADMIN-001/` verified against schema 3.

## Blockers / required decisions

None.

## Remaining work

None for this task.

## Next action

Handoff.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`

## Last handoff commit

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7
