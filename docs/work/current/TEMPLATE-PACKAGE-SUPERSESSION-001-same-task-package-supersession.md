# Template-maintenance task progress

## Task ID

TEMPLATE-PACKAGE-SUPERSESSION-001

## Status

in_progress

## Task-start template-development SHA

af4813144c15e5f4f93a39c61e8453d8571d5b94

## Review-base template-development SHA

af4813144c15e5f4f93a39c61e8453d8571d5b94

## Public-safe task brief

Implement same-task change package supersession in the template maintenance
package machinery (`create-change-package.mjs`) by excluding the task's own
`changes/<task-id>/**` storage path when generating `template-development.patch`
and changed paths. This enables corrected/regenerated change packages for tasks
whose earlier rejected or intermediate package commits are already present in
`template-development` history, without circular self-reference errors or manual
package editing. Add comprehensive deterministic tests and update durable
architecture, design, and deviation records.

## Current objective

Implement and test package supersession in `scripts/create-change-package.mjs`
and `tests/change-package.test.mjs`, update durable records, and produce the
provenance schema 3 package.

## Current position

Task record created at task-start `template-development` SHA
`af4813144c15e5f4f93a39c61e8453d8571d5b94`. Canonical refs established:
`developer=c6b747f00ad7509c1340fc11fca1466abb8eb1f9`,
`web-orchestration=7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`,
`main=6127611113dfdb66f93a0cfd2d355359aa370833`.

## Source ranges

- `template-development`: `af4813144c15e5f4f93a39c61e8453d8571d5b94..HEAD`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Prior package generation strictly failed when any `changes/<task-id>/**` path appeared in `template.paths`.
- When a task undergoes a review correction cycle following an earlier handoff package commit, that earlier package is part of the `template-development` history between the task base and the new correction head.
- Excluding `:(exclude)changes/<task-id>` when computing `template-development.patch` and `template.paths` allows full cumulative patch generation from the original base to the new head without contaminating the patch with historical package bytes.

## Interpretation

Excluding the task's own package storage path during diff generation for `template-development` preserves the full task range semantics (from original task base to final reviewed head) while ensuring that `template-development.patch` contains only the genuine template changes and zero package self-storage.

## Attempts

1. Identified the package supersession blocker across `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` and `TEMPLATE-HOST-ADMIN-001`.
2. Implemented `excludePrefix` support in `range()` within `scripts/create-change-package.mjs`.
3. Updated `tests/change-package.test.mjs` to add deterministic coverage of same-task package supersession, proving that intermediate package commits are excluded and subsequent template corrections are accurately captured and applicable downstream.

## Changed approach

None.

## Checks

- `node --test tests/change-package.test.mjs` passed (6/6 tests).
- `./scripts/validate-template-development.sh` passed (20/20 tests + pinned OpenCode 1.18.16 inventory).
- `git diff --check` passed cleanly.

## Blockers / required decisions

None.

## Remaining work

1. Apply changes to `scripts/create-change-package.mjs`, `tests/change-package.test.mjs`, `docs/architecture/AS-BUILT.md`, `docs/design/template-maintenance-workflow.md`, and `docs/deviations.md`.
2. Run full validation suite.
3. Commit implementation and create change package.
4. Finalize task progress and push.

## Next action

Apply code and durable record modifications.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

None
