# Template-maintenance task progress

## Task ID

TEMPLATE-PACKAGE-SUPERSESSION-001

## Status

completed

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

Package and hand off same-task change package supersession.

## Current position

Implemented explicit package supersession and chain validation in
`scripts/create-change-package.mjs`, `scripts/apply-change-package.mjs`,
`scripts/change-package-lib.mjs`, and `tests/change-package.test.mjs`; updated
`docs/architecture/AS-BUILT.md`, `docs/design/template-maintenance-workflow.md`,
`.opencode/skills/template-maintenance/SKILL.md`, and `docs/deviations.md`;
regenerated and verified corrected `changes/TEMPLATE-HOST-ADMIN-001.rev2/`
coexisting with historical `changes/TEMPLATE-HOST-ADMIN-001/`; independently
verified normal Workspace Maintenance tool route through repository verification
into OpenCode session; all 20 test suites and full repository validation passing.

## Source ranges

- `template-development`: `af4813144c15e5f4f93a39c61e8453d8571d5b94..HEAD`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Prior package generation strictly failed when any `changes/<task-id>/**` path appeared in `template.paths`.
- When a task undergoes a review correction cycle following an earlier handoff package commit, that earlier package is part of the `template-development` history between the task base and the new correction head.
- Excluding `:(exclude)changes/<task-id>*` when computing `template-development.patch` and `template.paths` allows full cumulative patch generation from the original base to the new head without contaminating the patch with historical package bytes.
- Storing superseding packages in distinct revision directories (e.g. `changes/<task-id>.rev2/`) with explicit `supersedes` bindings preserves historical package evidence while enabling deterministic active package resolution.

## Interpretation

Excluding the task's own package storage path during diff generation for `template-development` preserves the full task range semantics (from original task base to final reviewed head) while ensuring that `template-development.patch` contains only the genuine template changes and zero package self-storage. Explicit supersession chains bind historical package digests and allow acyclic, strictly increasing revision graphs.

## Attempts

1. Identified the package supersession blocker across `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` and `TEMPLATE-HOST-ADMIN-001`.
2. Implemented `excludePrefix` support in `range()` within `scripts/create-change-package.mjs`.
3. Added `--supersedes` and `--revision` to `create-change-package.mjs`, `validatePackageSupersessionChain` and `resolveLatestChangePackage` in `change-package-lib.mjs`, and `--task-id` auto-resolution in `apply-change-package.mjs`.
4. Updated `tests/change-package.test.mjs` to add comprehensive deterministic coverage of the persisted package lifecycle, supersession relations, downstream selection, and fail-closed handling of tampered, missing, duplicate, non-increasing, cyclic, and cross-task supersession.
5. Generated and validated `changes/TEMPLATE-HOST-ADMIN-001.rev2/` coexisting with historical `changes/TEMPLATE-HOST-ADMIN-001/`.
6. Verified normal Workspace Maintenance tool route through repository verification into an OpenCode session.

## Changed approach

None.

## Checks

- `node --test tests/change-package.test.mjs` passed (6/6 tests).
- `./scripts/validate-template-development.sh` passed (20/20 tests + pinned OpenCode 1.18.16 inventory).
- `git diff --check` passed cleanly.

## Blockers / required decisions

None.

## Remaining work

None.

## Next action

Handoff with status `completed`.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001/manifest.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev2/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev2/manifest.json`

## Last handoff commit

82d7e533d3da484b84f40895c066ddf4a5af9179
