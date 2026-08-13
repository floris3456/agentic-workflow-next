# Template-maintenance AS-BUILT

## Purpose

The `template-development` branch is the durable cross-branch ledger for work on
the reusable agentic workflow template. It exists in both the canonical template
and repositories generated with all branches included.

It solves four needs:

1. compaction-safe task continuity dedicated to template work;
2. exact provenance across independent template source branches;
3. portable upstream/downstream change transfer; and
4. separation from project/product implementation history.

## Authority model

- `source-lock.json` is the ledger's last reconciled source snapshot.
- Remote source refs are authoritative implementation evidence.
- Component AS-BUILT and deviations remain on the source branch beside the code
  they describe.
- This integrated AS-BUILT describes the maintenance system and cross-branch
  state; it does not reproduce component implementation details.
- Task records are procedural memory, not proof or acceptance.
- Human exact-SHA approval is still the only authority that advances `main`.

## Branch contents

The tree contains only maintenance instructions, provenance, records, change
packages, tests, validation, and local Git synchronization hooks. It contains no
copy of `developer`, `main`, `web-orchestration-only/**`, bridge implementation,
or downstream project source.

## Workspaces

Actual edits happen in isolated source worktrees. The ledger records the exact
canonical repository, source bases, candidate heads, review state, and downstream
application heads. Existing source worktrees may be reused only after verifying
the correct repository, branch, cleanliness, and remote synchronization.

## Change packages

`scripts/create-change-package.mjs` produces one directory per task containing:

- `manifest.json` with schema version, task ID, canonical repository, UTC
  creation time, exact base/head refs, and sorted changed paths;
- `developer.patch`, an exact binary/full-index diff for the reviewed developer
  range; and
- `web-orchestration.patch`, the equivalent independent web range.

The generator requires full 40-character commits, verifies objects and ancestry,
and refuses a non-empty output directory. It never writes source branches.

`scripts/apply-change-package.mjs` validates the manifest and selected patch,
requires the downstream checkout's exact matching branch and a clean tree, and
runs `git apply --check`. Only an explicit `--apply` updates the working tree. It
does not commit, push, merge, or promote.

## Synchronization

The tracked ledger hooks allow commits only on `template-development`. The
post-commit hook immediately pushes the same branch. A failed push writes a
branch-and-SHA marker in private Git state and blocks further commits. The
recovery script requires a clean checkout, verifies the marker and fetched remote
state, preserves the failed commit, and permits only fast-forward or one
conflict-free exact-head recovery merge. It never rewrites remote history.

## Generated repositories

GitHub template creation must include all branches. Generated histories may be
unrelated; this ledger does not depend on ancestry to the operational branches.
The project's source lock provides the ongoing relationship to the canonical
template. Template patches are reviewed and applied as content, never by merging
the ledger branch.

## Verification

- `scripts/validate-template-development.mjs`: structure, contracts, provenance,
  forbidden source-tree absence, executable bits, task/archive rules.
- `tests/change-package.test.mjs`: exact package creation, ancestry rejection,
  branch/cleanliness enforcement, dry-run non-mutation, and explicit application.
- `scripts/validate-template-development.sh`: both checks plus `git diff --check`.
