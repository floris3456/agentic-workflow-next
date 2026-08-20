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

The capability remains intentionally narrow: no caller-supplied service names,
arbitrary `systemctl`, DBus addresses, host paths, private configuration
contents, or raw SQLite access. Service mutation is start-only, bridge
reconciliation may operate only on already-mapped state, and `main` promotion is
outside this task.

## Current objective

Package and hand off the corrected bounded host-administration capability with
active rev4 change package and verified workspace maintenance tool route.

## Current position

Exact canonical source refs independently established:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `template-development`: `af4813144c15e5f4f93a39c61e8453d8571d5b94`

The bounded-host-administration source corrections have been completed and
verified across all branches. The active change package is
`changes/TEMPLATE-HOST-ADMIN-001.rev4/`, generated from the exact reviewed
source ranges without absorbing later unrelated work. Historical packages remain
immutable historical evidence.

The normal Workspace Maintenance tool route has been independently verified
through `TemplateDevelopmentWorktreeResolver` and pinned OpenCode 1.18.16 session
creation rooted in `template-development`.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..af4813144c15e5f4f93a39c61e8453d8571d5b94`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

### Earlier corrected source

- Previous rejected handoffs:
  - developer: `bd287bca8b7b9861f91e2d5c9243c4c5165834f9`
  - template-development: `13a274fc373eef286b09c6d6889bda2255be5425`
- Corrected developer source remains remotely present at
  `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`.
- Corrected template-development source from the earlier cycle is remotely
  present at `c8f35af1c9ad4e050cf2c8e792232ce4fb302500`, followed by the prior blocked
  task-record snapshot `6993a62f1fd87bdc53320d6547823749598e4fa4`.
- That earlier correction added socket confinement, explicit service-unit
  registration, production-schema stopped-state inspection, duplicate
  registration rejection, post-start admin probing, and
  `workspace_bridge_start: ask`.

### Residual independent-review findings and corrections

1. **Live canonical developer state:** the old `checkStartingSafe()` compared
   local `HEAD` only with the local `@{upstream}` tracking ref. It now additionally
   performs a non-mutating `git ls-remote --exit-code origin
   refs/heads/developer` and requires the live remote SHA to equal local `HEAD`.
   The operation does not fetch or update local refs.
2. **Already-active and fresh-start health:** one strict admin proof is now used
   for both paths. The endpoint must report the exact registered instance and
   repository, `running:true`, and a fresh heartbeat before start can report
   `already-running` or `started`. Missing identity fields fail closed.
3. **Inspection and reconciliation identity:** a reachable admin endpoint with
   wrong or missing identity is treated as untrusted. Inspection marks the state
   blocked rather than consuming that endpoint's counts, and reconciliation
   proves the same exact live identity and health before sending its fixed
   reconcile request.
4. **Systemd service binding:** effective `ExecStart` is now conservatively parsed
   and must contain exactly one `--config` argument whose following argument is
   the exact registered private configuration path. Missing, ambiguous, wrong, or
   substring-only matches fail closed. `WorkingDirectory` remains exact.
5. **Default validation is non-mutating:** the ordinary discovered real-host test
   now performs inspection only. Real host start/reconcile acceptance lives in
   `tests/workspace-bridge-host-live.acceptance.mjs` and requires explicit
   `AGENTIC_WORKFLOW_LIVE_BRIDGE_MUTATION_ACCEPTANCE=1`; it is not matched by the
   canonical `tests/*.test.mjs` default suite.
6. **Operator contract:** `.opencode/skills/workspace-maintenance/SKILL.md` and
   `docs/deviations.md` now state the live-read, exact service binding,\n   identity/health, and explicit live-mutation boundaries. The cross-branch
   `docs/architecture/AS-BUILT.md` remained accurate at its architecture level and
   did not require a material rewrite for these implementation-level corrections.

### Package state

- Historical packages (immutable historical evidence):
  - `changes/TEMPLATE-HOST-ADMIN-001/` (schema 3, rev 1, `package_sha256: 64354b1b...`, rejected during initial review)
  - `changes/TEMPLATE-HOST-ADMIN-001.rev2/` (schema 3, rev 2, superseded)
  - `changes/TEMPLATE-HOST-ADMIN-001.rev3/` (schema 3, rev 3, superseded; had widened range)
- Active package:
  - `changes/TEMPLATE-HOST-ADMIN-001.rev4/` (schema 3, rev 4, exact reviewed endpoints, `package_sha256: 6a5f48f6...`, supersedes rev 3)

### Workspace Maintenance tool route verification

- Repaired the host bridge repository/worktree registration.
- Verified `TemplateDevelopmentWorktreeResolver` against actual repository
  worktrees and pinned OpenCode 1.18.16 server.
- Verified a pinned OpenCode 1.18.16 session rooted in the registered
  template-development worktree succeeds, with full discovery of workspace tools
  and permissions.

## Interpretation

All 10 source defects have been corrected and verified across both branches. The
package supersession mechanism enables the active rev4 package to coexist with
historical packages while preserving immutable historical evidence and allowing
deterministic downstream resolution. The workspace maintenance execution route
is proven healthy.

## Attempts

1. Fixed admin socket file safety and parent permissions on `developer`.
2. Unified `service_unit` in `config.ts` and `watch-developer-sync.sh`.
3. Updated `workspace-maintenance-host.mjs` on `template-development` with real `BridgeState` queries, `ask` permission, post-start health checks, strict unit bindings, and developer synchronization proof.
4. Expanded test suite with 20 test suites on `template-development` and 123 tests on `developer`.
5. Implemented package supersession in `create-change-package.mjs` and `change-package-lib.mjs`.
6. Generated corrected active change package `changes/TEMPLATE-HOST-ADMIN-001.rev4/`.
7. Verified workspace tool route into actual OpenCode session.

## Changed approach

None.

## Checks

- `developer`: `npm test` (123 tests) and `./scripts/validate-repository.sh` passed.
- `template-development`: `node --test tests/*.test.mjs` (20 tests) and `./scripts/validate-template-development.sh` passed.
- `git diff --check`: clean across all branches.
- Real OpenCode 1.18.16 session verified rooted in `template-development`.

## Blockers / required decisions

None.

## Remaining work

None.

## Next action

Handoff with status `completed`.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `docs/work/current/TEMPLATE-HOST-ADMIN-001-bounded-host-administration.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev2/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev3/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev4/manifest.json`

## Last handoff commit

13a274fc373eef286b09c6d6889bda2255be5425
