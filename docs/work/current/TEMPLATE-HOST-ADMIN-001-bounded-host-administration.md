# Template-maintenance task progress

## Task ID

TEMPLATE-HOST-ADMIN-001

## Status

in_progress

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

Design and implement the host-administration broker in both `developer` (bridge
admin/status/reconcile IPC/capabilities) and `template-development` (workspace gate
tools, validation, tests, and documentation).

## Current position

Task record initialized; live remote refs confirmed.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..HEAD`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Live canonical remote refs:
  - `origin/main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
  - `origin/developer`: `784337f93f7b3042047c8fde898e1414dc8285b2`
  - `origin/web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
  - `origin/template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7`
- Both `developer` and `template-development` worktrees are clean and up to date with origin.
- Current 118 bridge tests on `developer` pass.
- Workspace maintenance unit tests on `template-development` pass.

## Interpretation

The host broker should consist of:
1. On `developer` (bridge runtime):
   - A private local admin server (Unix domain socket `admin.sock` beneath the private git dir `opencode-bridge/<instance-id>/admin.sock`, mode 0600) exposed while `BridgeService` runs.
   - Supported admin requests: `status` and `reconcile`.
   - `reconcile` runs `recoverOnce()`, recovers terminal response deliveries, flushes the outbox, and returns bounded status.
   - CLI support: `opencode-bridge status` and `opencode-bridge reconcile`.
   - Systemd user service integration support and bridge config resolution.
2. On `template-development` (workspace gate & plugin):
   - Host bridge broker (`scripts/workspace-maintenance-host.mjs` / `workspace-maintenance-bridge.mjs`):
     - Deterministic registry lookup in `$AGENTIC_WORKFLOW_CONFIG_DIR` or `~/.config/agentic-workflow/`.
     - Matches canonical repository identity (`gitHost`, `owner`, `repository`) and verifies `repositoryRoot` shares the exact Git common directory and origin remote.
     - Inspects systemd user service status via deterministic unit resolution or config specification, verifying WorkingDirectory / ExecStart.
     - Inspects running bridge via `admin.sock` (or stopped state via private state file).
     - Starts stopped service via `systemctl --user start <unit>` without accepting user-controlled arguments, verifying post-start health.
     - Triggers `reconcile` on the running bridge via `admin.sock`.
     - Redacts all host paths, credentials, and internal details from public output.
   - Workspace tools:
     - `workspace_bridge_inspect()`
     - `workspace_bridge_start()`
     - `workspace_bridge_reconcile()`
   - Agent definition, permission schema, skill, and validation updates.

## Attempts

None yet.

## Changed approach

None.

## Checks

- Initial `node --test tests/*.test.mjs` on `template-development` passed.
- Initial `npm test` on `tools/opencode-bridge` in `developer` passed.

## Blockers / required decisions

None.

## Remaining work

1. Implement admin socket server and IPC in `tools/opencode-bridge` on `developer`.
2. Implement host broker in `scripts/workspace-maintenance-host.mjs` (or `workspace-maintenance-bridge.mjs`) on `template-development`.
3. Add `workspace_bridge_*` tools in `.opencode/plugins/workspace-maintenance.ts` and update permissions/agents.
4. Add comprehensive unit and adversarial tests.
5. Add real host acceptance test.
6. Update documentation (AS-BUILT, deviations, operator docs).
7. Validate and verify.

## Next action

Implement bridge admin socket and reconcile logic in `developer` worktree.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`

## Last handoff commit

None
