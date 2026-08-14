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

The tree contains only maintenance instructions, provenance, decisions, records,
change packages, tests, validation, and local Git synchronization hooks. It
contains no copy of `developer`, `main`, `web-orchestration-only/**`, bridge
implementation, or downstream project source.

## Source execution

Actual edits stay on the authoritative source branches. The orchestrator selects
the route proportionally: a bounded direct connected-GitHub edit is appropriate
when exact paths and edits are already known and remote readback plus focused
checks can prove the outcome more simply; isolated source worktrees are used when
local repository context/tools, interacting implementation, generation/tests, or
uncertainty materially improve confidence. Either route must keep the source
branch's normal task/durable records current and produce an exact remote range for
independent review. Existing source worktrees may be reused only after verifying
the correct repository, branch, cleanliness, and remote synchronization.

The ledger records the exact canonical repository, source bases, candidate heads,
review state, and downstream application heads regardless of execution route.

## Change packages

`scripts/create-change-package.mjs` produces one directory per task containing:

- `manifest.json` with schema version, task ID, canonical repository, UTC
  creation time, exact base/head refs, and sorted changed paths;
- `developer.patch`, an exact binary/full-index diff for the reviewed developer
  range; and
- `web-orchestration.patch`, the equivalent independent web range.

The generator requires full 40-character commits, verifies objects and ancestry,
and refuses a non-empty output directory. It never writes source branches.
Generated `*.patch` files are excluded from source whitespace diagnostics because
unified-diff syntax uses space-prefixed blank context lines; manifest SHA-256 and
`git apply --check` validate their exact bytes and applicability instead.

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

The first end-to-end maintenance exercise, `TEMPLATE-SMOKE-RESPONSE-001`, used
the ledger before diagnosis, changed both independent source branches, and
produced `changes/TEMPLATE-SMOKE-RESPONSE-001/` from exact pushed ranges. Both
patches dry-run apply from their recorded bases, demonstrating that the ledger
provides compaction continuity and a portable downstream update without copying
or merging source histories.

`TEMPLATE-ORCHESTRATOR-CONTINUITY-001` is the first ordinary maintenance task to
use the system. It records an unchanged developer range and a Project-package
range through `b9814d5c7ae1cfb2f6068c19f08c03850e9b8874`, adds ADR-0001, and
packages the exact web change without materializing source in this branch.

`TEMPLATE-CONNECTOR-SCHEDULING-001` records an unchanged developer range and a
Project-package correction through
`7c1a0094e77ce3fcf06515bf49b3c09b6696d9f8`. Connector delivery pending is now
a scheduler state: only dependent work pauses, meaningful independent work
continues, and the same required publication receives another bounded delivery
window at a later checkpoint. Connector delivery alone cannot produce a
`RESUME REQUIRED` checkpoint.

`TEMPLATE-PROJECT-MAINTENANCE-ROUTE-001` adds the missing web-orchestrator route
into the ledger that already owns reusable-template work. Explicit template
evaluation or maintenance now uses one task record under `docs/work/current/**`
on `template-development` instead of duplicating ordinary web task context. The
Project package has one focused MCP-ON Source and permanent trigger; its current
request may replace routine template defaults but not platform, public-safety,
no-replay, authority, or human exact-SHA boundaries. The exact developer and web
source ranges are packaged together without merging their histories.

`TEMPLATE-DIRECT-DEVELOPER-001` makes source execution itself proportional. The
web orchestrator may directly edit a bounded, exact-known `developer` change when
connected GitHub and focused checks are the shortest route that proves it; work
that benefits materially from local repository context/tools, broader
exploration, interacting implementation, nontrivial generation/tests, or
independent developer execution remains delegated. Direct and delegated mutation
routes never overlap, and both retain exact remote review and human-only `main`
promotion.

`TEMPLATE-PROMPT-CREATION-001` adds context-transfer prompt creation to the
Project package without coupling it to one orchestration mode. The package now
contains eleven Project Sources: nine user-facing routed Sources and two support
Sources. `skill-prompt-creation.md` is the single cross-mode route; it composes a
destination profile with a mission profile, transfers only receiver-needed task
state, and preserves Observed versus Interpretation versus Requested outcome.
`skill-prompt-destinations.md` and `skill-prompt-missions.md` are support Sources
loaded by the core rather than independent router entries. Initial destinations
are fresh MCP-ON, fresh MCP-OFF, and direct OpenCode; initial missions include
research, review, implementation, reproduce/test, continuation/recovery, and
template-maintenance transfer. The destination describes the future receiver and
never changes the current chat's effective mode. General prompt-craft methodology
remains intentionally deferred to a separately evolving layer.
