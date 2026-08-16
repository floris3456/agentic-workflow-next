# Template-maintenance task progress

## Task ID

TEMPLATE-SOURCE-LOCK-SIMPLIFY-001

## Status

in progress

## Task-start template-development SHA

8391a21842a7c2d3d545f0addb6bc3ca38a4b40c

## Review-base template-development SHA

8391a21842a7c2d3d545f0addb6bc3ca38a4b40c

## Public-safe task brief

Simplify template-maintenance provenance so `source-lock.json` is the latest reconciled canonical source snapshot rather than a package review-base lock. Packages must keep exact reviewed range endpoints and canonical-remote provenance, but package generation must not require range bases to equal the repository source snapshot or require an older lock to be embedded before the snapshot can advance. Update the current source snapshot directly from independently verified canonical refs, update durable procedure/design records and tests, preserve existing package integrity/provenance properties that remain relevant, and do not modify or promote `main`.

## Current objective

Remove the old-lock-before-package ordering dependency without weakening exact reviewed-range or canonical-remote provenance checks.

## Current position

Exact task-start refs:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `980486182c0ed8a213842477b9b1754de360a430`
- `web-orchestration`: `3891a17bd62b8e4871310766f2a05175aa42cf87`
- `template-development`: `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c`

The current generator requires developer/web range bases to equal `source-lock.json`, and schema-2 validation requires the embedded source lock to equal both range bases. Current durable records therefore treat the lock as an old review-base snapshot and serialize package reconciliation behind it.

## Source ranges

- `main`: unchanged; no promotion authorized.
- `developer`: no change expected.
- `web-orchestration`: pending from `3891a17bd62b8e4871310766f2a05175aa42cf87` for procedure-source wording only.
- `template-development`: pending after task start for generator/validator/tests/source snapshot and durable records.

## Observed

- Canonical remote fetch already independently proves reviewed heads belong to their authoritative branch histories and generates patch bytes from fetched canonical objects.
- Range ancestry already proves each supplied base is an ancestor of its reviewed head.
- Therefore requiring each range base to equal the repository source snapshot is not needed for canonical provenance; it only imposes package ordering.
- `source-lock.json` currently contains the older developer/web review bases from `TEMPLATE-TRUST-BOUNDARY-001` rather than current canonical source heads.

## Interpretation

A sound simplification is to retain schema-2 canonical fetch, exact base/head ranges, ancestry, patch digests, canonical-tip observations, embedded source-snapshot digest, and package binding while removing only the equality between package range bases and the repository source snapshot. The source snapshot can then advance directly from exact canonical refs without waiting for package generation.

## Attempts

None yet.

## Changed approach

None.

## Checks

- Re-established exact current `main`, `developer`, `web-orchestration`, and `template-development` refs.
- Inspected current package generator, shared validator library, change-package tests, source lock, and predecessor blocked task record.

## Blockers / required decisions

None. The human explicitly selected the simplified source-snapshot model.

## Remaining work

Update the web-orchestrator maintenance Source, update generator/shared validation/tests and durable template-maintenance records, advance `source-lock.json` to exact current source refs, run canonical push CI, independently review exact changed ranges, and reconcile predecessor task records whose old ordering blocker is removed.

## Next action

Publish the web-orchestrator procedure-source change first, verify its canonical push CI, then update the template-development provenance implementation and source snapshot.

## Relevant durable records

- `source-lock.json`
- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `tests/change-package.test.mjs`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/architecture/AS-BUILT.md`
- `docs/work/current/TEMPLATE-TRUST-BOUNDARY-001-provenance-scout-isolation.md`
- `docs/work/current/TEMPLATE-CI-REACHABILITY-001-branch-push-ci.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`

## Last handoff commit

None
