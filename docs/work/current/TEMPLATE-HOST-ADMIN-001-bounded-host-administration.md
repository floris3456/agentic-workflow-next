# Template-maintenance task progress

## Task ID

TEMPLATE-HOST-ADMIN-001

## Status

completed

## Task-start template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Review-base template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Previous rejected handoffs

- developer: `bd287bca8b7b9861f91e2d5c9243c4c5165834f9`
- template-development: `13a274fc373eef286b09c6d6889bda2255be5425`

## Public-safe task brief

Implement a bounded, repository-owned host-administration capability for the
reusable workflow so the Workspace Maintenance Agent can safely inspect and
recover the repository's existing OpenCode bridge service without gaining
arbitrary host access.

Key corrections implemented in this review cycle:
1. Admin socket confinement and file safety:
   - Constrained socket path strictly to `dirname(state_file)/admin.sock`.
   - Added parent directory validation (`0700` mode, real directory).
   - Ensured existing regular files and symlinks are never unlinked during server
     start; only verified socket files are cleaned up.
2. Systemd service identity binding:
   - `workspace_bridge_start` requires an explicit operator-registered `service_unit`.
   - Service identity is strictly validated against `WorkingDirectory` and `ExecStart`
     referencing the exact private configuration.
   - Removed guessed service names from start path; unified with `watch-developer-sync.sh`.
3. Stopped-bridge SQLite state inspection:
   - Replaced flawed fallback queries with exact queries against the real
     production `BridgeState` schema (`commands`, `requests`, `github_outbox`,
     `response_deliveries`, `task_sessions`, `scout_sessions`).
   - Added schema validation (`sqlite_master`); schema drift or query failure
     fails closed to blocked, never silently zeroed.
   - Applied production terminal session semantics (`session.idle`, `session.error`, `terminal`).
4. Post-start health verification:
   - Required post-start proofs before reporting success: systemd unit active,
     admin endpoint reachable, status successful, instance and repository identity
     matching expected installation, and fresh heartbeat.
5. Registration ambiguity defense:
   - Rejected duplicate matching registrations even when instance IDs match.
6. Permission boundary:
   - Set `workspace_bridge_start` permission to `ask`.
   - `workspace_bridge_inspect` and `workspace_bridge_reconcile` set to `allow`.
   - Updated runtime inventory validator to assert effective permissions.
7. Developer synchronization proof:
   - `checkStartingSafe` verifies canonical repository identity, `developer` branch,
     clean tree, local HEAD equality with `@{upstream}`, and zero ahead/behind counts.
8. Documentation and configuration updates:
   - Updated operator documentation, examples, AS-BUILT, and deviations.
9. Real-host acceptance status:
   - Tested real host inspection and reconciliation on the active installation.
   - Distinguished fixture-tested start behavior from live non-destructive testing.
10. Architectural boundary documentation:
    - Documented that `workspace_bridge_start` resides inside the Workspace Maintenance
      plugin, which requires a separate external host supervisor if recovery of a
      dead bridge is needed from a purely remote web orchestrator.

## Current objective

Handoff of corrected source ranges and change package for independent review.

## Current position

Source corrections pushed to `developer` (`c6b747f00ad7509c1340fc11fca1466abb8eb1f9`)
and `template-development`; all tests and validators passing.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..3b66f1dde50e355e9d405799b2f1e8828d7963d9`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Developer checks:
  - `tools/opencode-bridge`: TypeScript build and `npm test` passed 123 tests.
  - `./scripts/validate-repository.sh` passed.
  - `git diff --check` passed cleanly.
  - Pushed to `origin/developer` at `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`.
- Template-development checks:
  - `node --test tests/*.test.mjs` passed 20 test suites.
  - `./scripts/validate-template-development.sh` passed full validation (including real pinned OpenCode 1.18.16 inventory and permission validation).
  - `git diff --check` passed cleanly.

## Interpretation

All 10 review findings have been resolved with strict fail-closed guarantees and comprehensive tests.

## Attempts

1. Fixed admin socket file safety and parent permissions on `developer`.
2. Unified `service_unit` in `config.ts` and `watch-developer-sync.sh`.
3. Updated `workspace-maintenance-host.mjs` on `template-development` with real `BridgeState` queries, `ask` permission, post-start health checks, strict unit bindings, and developer synchronization proof.
4. Expanded test suite with 20 test suites on `template-development` and 123 tests on `developer`.

## Changed approach

Corrected all review findings as requested.

## Checks

- `developer`: `npm test` (123 tests) and `./scripts/validate-repository.sh` passed.
- `template-development`: `node --test tests/*.test.mjs` (20 tests) and `./scripts/validate-template-development.sh` passed.
- `git diff --check`: clean across all branches.

## Blockers / required decisions

None for this task. The dead-bridge remote self-recovery limitation is documented as a design boundary.

## Remaining work

Awaiting independent review of the corrected handoff.

## Next action

Handoff.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `tools/opencode-bridge/README.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`

## Last handoff commit

13a274fc373eef286b09c6d6889bda2255be5425
