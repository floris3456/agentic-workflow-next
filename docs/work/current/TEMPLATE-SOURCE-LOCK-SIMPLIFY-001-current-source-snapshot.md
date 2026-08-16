# Template-maintenance task progress

## Task ID

TEMPLATE-SOURCE-LOCK-SIMPLIFY-001

## Status

source-snapshot simplification implemented, independently reviewed, and passing canonical push CI; portable change-package production and archive finalization remain pending on a legitimate networked maintainer execution surface

## Task-start template-development SHA

8391a21842a7c2d3d545f0addb6bc3ca38a4b40c

## Review-base template-development SHA

8391a21842a7c2d3d545f0addb6bc3ca38a4b40c

## Public-safe task brief

Simplify template-maintenance provenance so `source-lock.json` is the latest reconciled canonical source snapshot rather than a package review-base lock. Packages keep exact reviewed range endpoints and canonical-remote provenance, but package generation does not require range bases to equal the repository source snapshot or require an older lock to be embedded before the snapshot can advance. Update the current source snapshot directly from independently verified canonical refs, update durable procedure/design records and tests, preserve existing package integrity/provenance properties that remain relevant, and do not modify or promote `main`.

## Current objective

The requested architectural simplification is implemented and remotely validated. Preserve the exact reviewed source ranges and current source snapshot; produce this task's portable change package later through the tracked generator when a legitimate networked maintainer execution surface is available.

## Current position

Exact authoritative refs re-read after implementation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `980486182c0ed8a213842477b9b1754de360a430`
- `web-orchestration`: `1f53ce62fba87ba9677b86d3837a008717aa4c24`
- `template-development`: `5ad469b48e6620cf8b21748e97924e56065cf836` before this dedicated task-progress snapshot.

`source-lock.json` now records the first three exact canonical source refs above, with `last_reconciled_task` set to this task. It is no longer frozen by pending package work.

## Source ranges

- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion authorized.
- `developer`: unchanged at `980486182c0ed8a213842477b9b1754de360a430`.
- `web-orchestration`: `3891a17bd62b8e4871310766f2a05175aa42cf87..1f53ce62fba87ba9677b86d3837a008717aa4c24`.
- `template-development`: implementation/design range `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c..5ad469b48e6620cf8b21748e97924e56065cf836` before this dedicated handoff snapshot.

## Observed

- The previous schema-2 generator required developer/web package range bases to equal `source-lock.json`, and offline validation repeated that equality requirement.
- Canonical provenance did not depend on that equality: the generator already authenticates the repository origin, fetches authoritative branch objects into a sterile repository, resolves package endpoints from those objects, checks exact base-to-head ancestry, requires reviewed heads to remain ancestors of current canonical tips, and generates patch bytes from fetched canonical objects.
- `scripts/create-change-package.mjs` now removes only the source-snapshot/base equality gate. Each supplied base and head must still resolve exactly from the canonical fetch; a base must be an ancestor of its reviewed head; and the reviewed head must be an ancestor of the current canonical tip.
- `scripts/change-package-lib.mjs` no longer requires a schema-2 range base to equal the embedded source snapshot. It still validates the embedded snapshot itself, its canonical repository identity and digest, exact canonical-tip fields, reviewed-head relation markers, per-patch digests, and the package binding digest.
- `tests/change-package.test.mjs` now deliberately constructs a source snapshot whose developer ref is later than the package base. Generation succeeds for the older exact reviewed range, while a non-ancestor base, deceptive origin, and forged/local-only head still fail.
- Source-snapshot tampering, patch tampering, and package-binding tampering remain rejected. Historical schema-1 packages remain integrity-compatible but not provenance-verified. Existing schema-2 packages whose range bases equal their embedded snapshot remain valid as a subset of the new contract.
- `source-lock.json` was directly reconciled from exact canonical refs to main `6127611113dfdb66f93a0cfd2d355359aa370833`, developer `980486182c0ed8a213842477b9b1754de360a430`, and web-orchestration `1f53ce62fba87ba9677b86d3837a008717aa4c24` without generating a package first.
- The web-orchestrator template-maintenance Source and the repository-owned maintainer skill now both describe `source-lock.json` as a current source snapshot and package ranges as independent task evidence.
- The template-maintenance workflow design, AS-BUILT, package README, and provenance deviation record were updated consistently.
- Active `TEMPLATE-TRUST-BOUNDARY-001`, `TEMPLATE-CAPABILITY-ORCHESTRATION-001`, and `TEMPLATE-CI-REACHABILITY-001` records were reconciled so pending package generation no longer freezes the source snapshot or blocks later maintenance work.

## Interpretation

The simplified model preserves the useful provenance boundary while removing accidental serialization. Package membership is established by exact reviewed base/head ranges proven against freshly fetched canonical history. `source-lock.json` is baseline/context information about the latest reconciled canonical state, not authority over package membership.

This makes pending package production task-local: inability to run the generator leaves that package pending but does not make the repository's current source snapshot stale by design and does not force unrelated later tasks to wait.

## Attempts

- Used direct connected-GitHub source edits because the exact affected files and minimal semantic changes were known and both authoritative branches have canonical push CI.
- The first immediate Actions lookup after the web source push returned no run while event propagation was pending; a later read found the automatically triggered run and it completed successfully. No mutation was replayed.
- No package bytes were hand-built through GitHub APIs. The local execution environment still lacks the canonical Git network access required by the tracked package generator, so portable package production remains deferred to a legitimate maintainer execution surface.

## Changed approach

- Replaced the old “source lock is package review base and must be embedded before it advances” model with “source lock is latest reconciled canonical source snapshot”.
- Retained the existing manifest field name `provenance.source_lock` and schema version 2 for compatibility; its semantics are now generation-time source-snapshot provenance context rather than a required equality constraint on package bases.
- Kept exact package ranges explicit instead of deriving them from the current source snapshot.
- Removed stale ordering blockers from active task records rather than rewriting historical Git commits or pretending their earlier observations were never true.

## Checks

- Re-established exact `main`, `developer`, `web-orchestration`, and `template-development` refs before implementation and re-read authoritative source refs after implementation.
- Web exact range `3891a17bd62b8e4871310766f2a05175aa42cf87..1f53ce62fba87ba9677b86d3837a008717aa4c24` is one linear commit changing only `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`.
- Web push Actions run `31918151903` succeeded at exact source SHA `1f53ce62fba87ba9677b86d3837a008717aa4c24` through the branch's canonical read-only validation workflow.
- Template-development exact implementation/design range `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c..5ad469b48e6620cf8b21748e97924e56065cf836` is linear and changes only the package provenance implementation/tests, source snapshot, maintenance procedures/design/deviation records, and active task records whose ordering semantics changed.
- Exact remote readback confirms `create-change-package.mjs` still requires canonical endpoint resolution, base-to-head ancestry, and reviewed-head-to-current-tip ancestry while no longer comparing package bases to `source-lock.json`.
- Exact remote readback confirms `change-package-lib.mjs` still validates the embedded source snapshot/digest and package binding while no longer requiring range-base equality.
- Exact remote readback confirms the source snapshot contains the current independently verified source refs.
- Template-development push Actions run `31918358718` succeeded at exact SHA `5ad469b48e6620cf8b21748e97924e56065cf836`. Its job ran `./scripts/validate-template-development.sh`; the structural validator passed and all five package tests passed, including independent source-snapshot/package-base generation, deceptive-origin/non-ancestor-base/forged-head rejection, tamper detection, schema-1 compatibility, and downstream dry-run/application boundaries.
- `main` and `developer` remained unchanged throughout the task.

## Blockers / required decisions

No source architecture, implementation, review, validation, source-snapshot reconciliation, or ordering blocker remains.

The only incomplete template-maintenance stage is portable package production/finalization for this task itself. The tracked generator requires a legitimate execution surface with canonical Git network access. That limitation is task-local and does not block future maintenance work or source-snapshot reconciliation.

## Remaining work

On a legitimate networked maintainer execution surface, generate this task's package from its exact reviewed source ranges, validate and independently review the generated bytes, then perform normal archive finalization. No source-lock prerequisite or predecessor package ordering remains.

## Next action

Preserve the reviewed source heads and current snapshot. Generate this task's portable package when a legitimate maintainer execution surface is available; otherwise future template-maintenance tasks may proceed independently. Do not promote `main`.

## Relevant durable records

- `source-lock.json`
- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `tests/change-package.test.mjs`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `changes/README.md`
- `docs/work/current/TEMPLATE-TRUST-BOUNDARY-001-provenance-scout-isolation.md`
- `docs/work/current/TEMPLATE-CAPABILITY-ORCHESTRATION-001-capability-routing.md`
- `docs/work/current/TEMPLATE-CI-REACHABILITY-001-branch-push-ci.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- web Actions run `31918151903`
- template-development Actions run `31918358718`, job `95093948944`

## Last handoff commit

None. This task record update is the dedicated working-cycle handoff snapshot; its exact containing commit is returned by the orchestrator rather than self-referenced recursively.
