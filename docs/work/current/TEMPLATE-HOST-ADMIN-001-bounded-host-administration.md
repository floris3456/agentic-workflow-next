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

The capability remains intentionally narrow: no caller-supplied service names,
arbitrary `systemctl`, DBus addresses, host paths, private configuration
contents, or raw SQLite access. Service mutation is start-only, bridge
reconciliation may operate only on already-mapped state, and `main` promotion is
outside this task.

## Current objective

Preserve the independently corrected host-administration source while leaving the
same-task portable package explicitly blocked until the package-supersession
architecture is separately defined.

## Current position

Exact canonical source refs independently re-established before the residual
correction cycle were:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- correction-cycle `template-development` start:
  `6993a62f1fd87bdc53320d6547823749598e4fa4`

The residual `template-development` source findings have now been corrected and
independently reviewed through exact remote GitHub evidence. The last substantive
correction/documentation head before this task-record reconciliation was
`f8da4fe76d5a003fb8d5c25c1d44089ebd4cf959`.

The overall template-maintenance task remains blocked because the existing
schema-3 package format cannot represent a corrected same-task range once the
previously rejected package storage is already in that range. No new or rewritten
package has been produced.

## Source ranges

- `template-development`: `d274bd8fe41af2ed88b9d00074c1a0e9dc3ca3b7..HEAD`
- residual correction review range:
  `6993a62f1fd87bdc53320d6547823749598e4fa4..HEAD`
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
   `docs/deviations.md` now state the live-read, exact service binding,
   identity/health, and explicit live-mutation boundaries. The cross-branch
   `docs/architecture/AS-BUILT.md` remained accurate at its architecture level and
   did not require a material rewrite for these implementation-level corrections.

### Package state

- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json` remains the package from the
  previously rejected implementation and does not represent the corrected source.
- Schema-3 generation rejects a reviewed `template-development` range containing
  its own `changes/<task-id>/**` storage path. Because the rejected package is
  already in this task's history, corrected same-task regeneration remains
  mechanically undefined under the current schema.
- The historical package has not been overwritten, hand-edited, reinterpreted,
  or silently superseded.

## Interpretation

The bounded-host-administration source now addresses the independently observed
residual safety defects without widening Bubblewrap, exposing arbitrary host
administration, or changing `developer`, `web-orchestration`, or `main`.

The remaining package blocker is an independent transfer/provenance design gap,
not evidence that the corrected host-broker source should be reverted. Source and
portable-package completion are therefore represented separately.

The live developer freshness proof deliberately uses the credential-isolated Git
verification environment. A private/authenticated origin that cannot be read in
that environment will fail `starting_safe` closed rather than borrowing ambient
host credentials. Supporting authenticated private-origin freshness would require
an explicitly bounded credential design and is not added by this correction.

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
   the current bridge resolver established that the failure occurred in the
   template-development worktree/root preflight before `session.create`; no
   Workspace Maintenance session or delegated repository mutation was created.
5. The task then switched capability-locally to bounded connected-GitHub edits on
   `template-development`. The correction commits before this record were:
   - `0e2e3426fedb5032553d2ba374e5866f11398ee1` — corrected task continuity
   - `93e7fb8f983f8bad73289e2b10a339a6a0fa3cdf` — host broker hardening
   - `8b5cd634a67dd1648cc26b7d629e24657d6e9469` — focused regression coverage
   - `757d97b771a106b63aedb0409726e7dff464dd6e` — opt-in live acceptance split
   - `6effae9d5133f0032a1e0fc1b007ebb40ae32fad` — Workspace Maintenance contract
   - `f8da4fe76d5a003fb8d5c25c1d44089ebd4cf959` — deviation/architecture record

## Changed approach

The failed Workspace Maintenance route is terminal and was not replayed. Because
only that execution surface was unavailable, the correction cycle used bounded
connected-GitHub edits on `template-development`, followed by exact remote
readback and independent source review. `developer`, `web-orchestration`, `main`,
and the existing change package remained outside the mutation route.

## Checks

Observed correction-cycle evidence:

- Exact remote diff review confirmed the residual correction range is confined to
  the host broker, its regression/opt-in acceptance tests, Workspace Maintenance
  procedure, deviation record, and this task record.
- Focused executable verification passed for the effective `ExecStart --config`
  parser: missing, wrong, substring-only, and duplicate config arguments reject;
  the modeled serialized `systemctl show` representation accepts only the exact
  registered path.
- A Git fixture independently demonstrated that the live `ls-remote` proof
  rejects a stale local developer checkout even while its local
  `origin/developer` tracking ref still equals local `HEAD`.
- Reproduced host-broker execution against isolated local Git/admin/systemd
  fixtures passed the high-risk behaviors: stopped/start-safe inspection,
  service-binding rejection, wrong-identity active endpoint blocking with no
  reconcile call, healthy already-active start/reconcile, and stale-live-developer
  rejection.
- `scripts/validate-template-development.sh` at the exact reviewed source still
  invokes `node scripts/validate-template-development.mjs`,
  `node --test tests/*.test.mjs`, the pinned OpenCode runtime validator, and
  `git diff --check`.
- `.github/workflows/validate-template-development.yml` still triggers that
  canonical validator on pushes to `template-development`.

Evidence limitation:

- The available connected GitHub surface did not expose the push-triggered
  Actions run/check result for the correction head, so the full canonical
  validation run is **not** claimed as independently observed or passed here.
- Earlier developer/template-development check reports remain historical
  perceived results rather than independent acceptance evidence.

## Blockers / required decisions

1. **Same-task change package supersession:** schema 3 has no defined mechanism to
   regenerate this same task after an earlier rejected package-storage commit is
   already inside the corrected source history. Package publication remains
   blocked; no package-schema redesign is authorized in this task.
2. **Dead-bridge remote recovery:** the Workspace Maintenance plugin cannot itself
   be invoked through a completely dead bridge. A separate always-available host
   supervisor/control plane would be required for fully remote dead-bridge
   recovery and remains outside this task.
3. **Installed Workspace route:** the attempted Workspace Maintenance start
   failed bridge repository-root verification before session creation. That host
   runtime route remains unavailable until its registered repository/worktree root
   is reconciled; it did not block the bounded direct source correction.
4. **Full CI observation:** the canonical push workflow exists, but its exact
   correction-head run result was not observable through the currently available
   connected Actions surface. This is an evidence limitation, not a claimed pass.

## Remaining work

1. Define an explicit same-task package-supersession/versioning design before any
   corrected portable package for `TEMPLATE-HOST-ADMIN-001` can be generated.
2. If private/authenticated downstream origins must support live start-safety
   freshness, design a bounded credential-aware read path rather than inheriting
   ambient credentials implicitly.
3. Reconcile the installed Workspace Maintenance repository-root registration if
   that execution route is needed again.
4. Observe or re-run the full canonical template-development validation when an
   execution/check surface exposes its exact result; do not infer it from the
   workflow definition.
5. Add a very lightweight read-only operator dashboard/status view that makes
   repository-root/worktree registration mismatches, bridge/service health,
   start-safety state, and the current blocking reason easy to see without
   exposing arbitrary host administration or private configuration contents.

## Next action

Keep corrected source on `template-development` and leave package publication
blocked. Do not regenerate or edit the historical package, do not mutate
`developer` or `web-orchestration` for this residual correction, and do not
promote `main`. A separate bounded maintenance task is required to solve
same-task package supersession before this task can produce a completed portable
handoff.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `docs/work/current/TEMPLATE-HOST-ADMIN-001-bounded-host-administration.md`
- `source-lock.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`

## Last handoff commit

13a274fc373eef286b09c6d6889bda2255be5425
