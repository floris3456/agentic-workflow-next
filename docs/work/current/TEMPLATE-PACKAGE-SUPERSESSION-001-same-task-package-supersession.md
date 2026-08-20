# Template-maintenance task progress

## Task ID

TEMPLATE-PACKAGE-SUPERSESSION-001

## Status

needs decision

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

Package and hand off same-task change package supersession with exact task-family
exclusion, strict path-based supersedes validation, repaired Host Admin rev4
package, and public-safety audit.

## Current position

Implemented explicit package supersession and chain validation in
`scripts/create-change-package.mjs`, `scripts/apply-change-package.mjs`,
`scripts/change-package-lib.mjs`, and `tests/change-package.test.mjs`; updated
`docs/architecture/AS-BUILT.md`, `docs/design/template-maintenance-workflow.md`,
`.opencode/skills/template-maintenance/SKILL.md`, and `docs/deviations.md`;
generated and verified corrected active packages
`changes/TEMPLATE-HOST-ADMIN-001.rev4/` (returning to exact original reviewed
Host Admin endpoints) and `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev4/`;
independently verified normal Workspace Maintenance tool route through repository
verification into OpenCode session; all 20 test suites and full repository
validation passing.

## Source ranges

- `template-development`: `af4813144c15e5f4f93a39c61e8453d8571d5b94..f5f385df14a52a14a86c976a2af75afc59d0bbc7`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Observed

- Task-package-family filtering is defined canonically by `isTaskPackagePath(path, taskId)` and excludes all exact task family revisions while retaining near-collision task names.
- `supersedes.package_path` requires exact `changes/<dir>` syntax and resolves strictly without digest fallback.
- Storing superseding packages in distinct revision directories (e.g. `changes/<task-id>.rev4/`) with explicit `supersedes` bindings preserves historical package evidence while enabling deterministic active package resolution.
- Host Admin rev4 cleanly isolates Host Admin source changes from later package-supersession work.

## Interpretation

Excluding the task's own package storage paths during diff generation for `template-development` preserves the full task range semantics while ensuring that `template-development.patch` contains only genuine template changes. Explicit supersession chains bind historical package digests and allow acyclic, strictly increasing revision graphs.

## Attempts

1. Identified the package supersession blocker across `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` and `TEMPLATE-HOST-ADMIN-001`.
2. Implemented `isTaskPackagePath` predicate and literal pathspec generation in `scripts/create-change-package.mjs`.
3. Added `--supersedes` and `--revision` to `create-change-package.mjs`, `validatePackageSupersessionChain` and `resolveLatestChangePackage` in `change-package-lib.mjs`, and `--task-id` auto-resolution in `apply-change-package.mjs`.
4. Updated `tests/change-package.test.mjs` to add comprehensive deterministic coverage of multi-revision supersession lifecycle (v1 -> rev2 -> rev3), near-collision path retention, strict supersedes path resolution, and fail-closed handling of tampered, missing, duplicate, non-increasing, cyclic, and cross-task supersession.
5. Generated and validated active packages `changes/TEMPLATE-HOST-ADMIN-001.rev4/` and `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev4/`.
6. Verified normal Workspace Maintenance tool route through repository verification into an OpenCode session.

## Changed approach

None.

## Checks

- `node --test tests/change-package.test.mjs` passed (7/7 tests).
- `./scripts/validate-template-development.sh` passed (20/20 tests + pinned OpenCode 1.18.16 inventory + raw session ID prevention check).
- `git diff --check` passed cleanly.

## Blockers / required decisions

1. **Historical Git residue decision:** An older historical package commit (`changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev2/`) in `template-development` history contains a previously published runtime identifier. All mutable records and new packages have been cleaned and validated to prevent runtime identifier persistence, and historical packages were left immutable per non-destructive workflow rules. Complete removal of that historical data from Git history requires an explicit human decision and authorization for history rewriting.

## Remaining work

None.

## Next action

Handoff with status `needs decision` regarding historical Git residue.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001/manifest.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev2/manifest.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev3/manifest.json`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev4/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev2/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev3/manifest.json`
- `changes/TEMPLATE-HOST-ADMIN-001.rev4/manifest.json`

## Last handoff commit

f5f385df14a52a14a86c976a2af75afc59d0bbc7
