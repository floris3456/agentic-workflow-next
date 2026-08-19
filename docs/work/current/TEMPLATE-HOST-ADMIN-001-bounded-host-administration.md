# Template-maintenance task progress

## Task ID

TEMPLATE-HOST-ADMIN-001

## Status

in progress

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

Finish the residual independent-review corrections on `template-development`
while preserving the already-corrected `developer` source and the existing
same-task package-supersession blocker.

## Current position

Exact canonical source refs independently re-established before this correction
cycle:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- correction-cycle `template-development` start:
  `6993a62f1fd87bdc53320d6547823749598e4fa4`

The previous correction materially fixed the original socket, registration,
SQLite-schema, permission, post-start, documentation, and service-name defects.
A later independent source review found a smaller residual set in the
`template-development` host broker and its tests. This record no longer treats
those source corrections as fully accepted.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..HEAD`
- `developer`: `784337f93f7b3042047c8fde898e1414dc8285b2..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

### Earlier corrected source

- Previous rejected handoffs:
  - developer: `bd287bca8b7b9861f91e2d5c9243c4c5165834f9`
  - template-development: `13a274fc373eef286b09c6d6889bda2255be5425`
- Corrected developer source is remotely present at
  `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`.
- Corrected template-development substantive source is remotely present at
  `c8f35af1c9ad4e050cf2c8e792232ce4fb302500`, followed by the prior blocked
  task-record snapshot `6993a62f1fd87bdc53320d6547823749598e4fa4`.
- The previous implementation added socket confinement, explicit service-unit
  registration, production-schema stopped-state inspection, duplicate
  registration rejection, post-start admin probing, and
  `workspace_bridge_start: ask`.

### Residual independent-review findings

1. `checkStartingSafe()` compares local `HEAD` to `@{upstream}` but does not
   contact the canonical remote first. A stale `origin/developer` tracking ref can
   therefore make a stale local developer checkout appear synchronized.
2. `workspace_bridge_start` uses strict post-start health checks only after a
   fresh systemd start. If the registered unit is already active, an available
   admin socket can return `already-running` through `inspect()` without proving
   the same exact instance/repository identity, `running:true`, and fresh
   heartbeat. The fresh-start identity checks also permit missing identity fields.
3. `workspace_bridge_reconcile` can send `reconcile` to any responsive socket at
   the derived path without first proving that the endpoint reports the exact
   registered instance and repository. `workspace_bridge_inspect` likewise must
   not trust wrong/missing endpoint identity as bridge state.
4. Systemd binding currently treats a missing `ExecStart` as acceptable and uses
   substring containment to match the private config path. Binding must prove the
   exact registered config is the effective `--config` argument and fail closed
   when the effective command cannot be proven.
5. The ordinary `node --test tests/*.test.mjs` real-host test can invoke
   `bridgeStart()` or `bridgeReconcile()` against the operator's actual bridge
   when host conditions happen to permit it. Because
   `scripts/validate-template-development.sh` runs that default suite, ordinary
   validation can perform a real host/control-plane mutation outside the
   `workspace_bridge_start: ask` interaction boundary. Default validation must
   remain read-only; any live start/reconcile acceptance must be a separate,
   explicit operator opt-in.

### Package state

- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json` remains the package from the
  previously rejected implementation and does not represent the corrected source.
- Schema-3 generation rejects a reviewed `template-development` range containing
  its own `changes/<task-id>/**` storage path. Because the rejected package is
  already in this task's history, corrected same-task regeneration remains
  mechanically undefined under the current schema.
- The historical package must not be overwritten, hand-edited, reinterpreted, or
  silently superseded.

## Interpretation

The bounded-host-administration architecture remains viable, but the current
`template-development` source is not yet accepted because the residual findings
weaken canonical synchronization proof, exact installation binding, and the
permission boundary around real host mutation. These are targeted source defects,
not a reason to widen Bubblewrap or grant general host administration.

The same-task package blocker is independent of these source corrections. Source
can be corrected and independently reviewed while portable package publication
remains blocked.

## Attempts

1. The prior correction cycle fixed the original high-risk host-admin defects and
   pushed source to both canonical branches.
2. A new bridge control issue was opened for this continuation after proving no
   existing `TEMPLATE-HOST-ADMIN-001` issue was bound.
3. Its first `workspace.start` marker was rejected before handler execution
   because an older mutating bridge issue was still open. That older issue's
   mapped developer session was independently verified terminal (`session.idle`)
   with a completed pushed handoff, then the stale issue was closed. The rejected
   marker was not replayed.
4. A fresh sequence-1 `workspace.start` was admitted and reached `applying`, then
   failed with `Bridge repository root verification failed`. Direct inspection of
   the current bridge resolver shows this failure occurs in the registered
   template-development worktree/root preflight before `session.create`; no
   Workspace Maintenance session or delegated repository mutation was created.

## Changed approach

The failed Workspace Maintenance route is terminal and is not being replayed.
Because only that execution surface is unavailable, the correction cycle has
switched to bounded connected-GitHub edits on `template-development`, with exact
remote readback and the branch's push-triggered validation used as independent
proof. `developer`, `web-orchestration`, `main`, and the existing change package
remain out of scope for mutation.

## Checks

Earlier developer/template-development check reports remain historical perceived
results only. This correction cycle will re-run and independently inspect the
current branch's canonical validation after the residual fixes are pushed.

Required correction-cycle checks:

- `node --test tests/*.test.mjs`
- `./scripts/validate-template-development.sh`
- `git diff --check`
- push-triggered `template-development` GitHub Actions validation

## Blockers / required decisions

1. **Same-task change package supersession:** schema 3 has no defined mechanism to
   regenerate this same task after an earlier rejected package-storage commit is
   already inside the corrected source history. Package publication remains
   blocked; no package-schema redesign is authorized in this task.
2. **Dead-bridge remote recovery:** the Workspace Maintenance plugin cannot itself
   be invoked through a completely dead bridge. A separate always-available host
   supervisor/control plane would be required for fully remote dead-bridge
   recovery and remains outside this task.
3. **Current installed Workspace route:** the attempted Workspace Maintenance
   start failed its bridge repository-root verification before session creation.
   This limits that execution route but does not block bounded direct source
   correction on `template-development`.

## Remaining work

1. Correct the five residual host-broker/test findings on `template-development`.
2. Add focused regressions for live canonical developer comparison, strict admin
   identity/health, exact effective `ExecStart --config` binding, and default
   real-host non-mutation.
3. Update AS-BUILT/deviations/operator-facing documentation to match the corrected
   boundary.
4. Run and independently inspect canonical validation and the exact remote diff.
5. Keep package publication blocked unless the same-task supersession design is
   separately resolved.

## Next action

Apply the bounded direct `template-development` corrections from the exact remote
state, then review the pushed range and canonical validation before deciding
whether the source is acceptable.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `docs/work/current/TEMPLATE-HOST-ADMIN-001-bounded-host-administration.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`

## Last handoff commit

13a274fc373eef286b09c6d6889bda2255be5425
