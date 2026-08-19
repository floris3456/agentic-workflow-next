# Template-maintenance task progress

## Task ID

TEMPLATE-HOST-ADMIN-001

## Status

blocked

## Task-start template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Review-base template-development SHA

d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7

## Public-safe task brief

Implement a bounded, repository-owned host-administration capability for the
reusable workflow so the Workspace Maintenance Agent can safely inspect and
recover the repository's existing OpenCode bridge service without gaining
arbitrary host access.

Key corrections implemented in this review correction cycle:
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

Record source-range corrections and document the same-task change package supersession blocker.

## Current position

Source corrections pushed to `developer` (`c6b747f00ad7509c1340fc11fca1466abb8eb1f9`)
and `template-development`; all tests and validators passing. Package publication
blocked on same-task package supersession.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..HEAD`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Previous rejected handoffs:
  - developer: `bd287bca8b7b9861f91e2d5c9243c4c5165834f9`
  - template-development: `13a274fc373eef286b09c6d6889bda2255be5425`
- Developer checks:
  - `tools/opencode-bridge`: TypeScript build and `npm test` passed 123 tests.
  - `./scripts/validate-repository.sh` passed.
  - `git diff --check` passed cleanly.
  - Pushed to `origin/developer` at `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`.
- Template-development checks:
  - `node --test tests/*.test.mjs` passed 20 test suites.
  - `./scripts/validate-template-development.sh` passed full validation (including real pinned OpenCode 1.18.16 inventory and permission validation).
  - `git diff --check` passed cleanly.
- Change package generation behavior:
  - `scripts/create-change-package.mjs` strictly rejects any `template-development` range containing `changes/<task-id>/**` package storage paths. Because the rejected handoff commit `13a274f` stored `changes/TEMPLATE-HOST-ADMIN-001/`, subsequent same-task package creation is mechanically rejected.

## Interpretation

All 10 source defects have been corrected and verified across both branches. Same-task change package supersession across an existing in-history package commit is mechanically undefined in schema 3 without package schema changes (which are excluded from scope). Following task instructions, package publication is marked blocked rather than inventing new semantics.

## Attempts

1. Fixed admin socket file safety and parent permissions on `developer`.
2. Unified `service_unit` in `config.ts` and `watch-developer-sync.sh`.
3. Updated `workspace-maintenance-host.mjs` on `template-development` with real `BridgeState` queries, `ask` permission, post-start health checks, strict unit bindings, and developer synchronization proof.
4. Expanded test suite with 20 test suites on `template-development` and 123 tests on `developer`.
5. Attempted change package regeneration; stopped when `create-change-package.mjs` rejected the range containing prior package storage.

## Changed approach

Left change package publication blocked per review instructions rather than hand-editing or inventing undefined supersession behavior.

## Checks

- `developer`: `npm test` (123 tests) and `./scripts/validate-repository.sh` passed.
- `template-development`: `node --test tests/*.test.mjs` (20 tests) and `./scripts/validate-template-development.sh` passed.
- `git diff --check`: clean across all branches.

## Blockers / required decisions

1. **Same-task change package supersession:** In schema 3, `create-change-package.mjs` strictly enforces that the reviewed `template-development` range does not contain its own `changes/<task-id>/**` package storage path. Because the earlier rejected handoff commit (`13a274fc373eef286b09c6d6889bda2255be5425`) stored `changes/TEMPLATE-HOST-ADMIN-001/`, any subsequent correction on the same task that builds upon that history contains `changes/TEMPLATE-HOST-ADMIN-001/**` in its task-start-to-head range. Same-task package supersession/regeneration mechanism is mechanically undefined in existing machinery and package schema redesign is explicitly excluded from scope. Per review instructions, package publication remains blocked rather than inventing new semantics or overwriting historical packages.
2. **Dead-bridge remote recovery:** `workspace_bridge_start` is hosted inside the Workspace Maintenance OpenCode plugin. When the bridge is dead, remote web-orchestrator callers who only interact via the bridge cannot invoke the tool without an external host supervisor or local human trigger.

## Remaining work

1. Resolution of same-task package supersession for rejected handoff cycles.
2. Independent review of the corrected developer ref `c6b747f00ad7509c1340fc11fca1466abb8eb1f9` and template-development corrections.

## Next action

Handoff with status `blocked` and exact blocker details.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `tools/opencode-bridge/README.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`

## Last handoff commit

13a274fc373eef286b09c6d6889bda2255be5425
