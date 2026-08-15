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

- `source-lock.json` is the ledger's last reconciled source snapshot. During an
  active maintenance task its source SHAs remain the review-base lock through
  package generation; reconciliation to new heads happens only after the package
  has embedded the prior snapshot.
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

- `manifest.json`;
- `developer.patch`, an exact binary/full-index diff for the reviewed developer
  range; and
- `web-orchestration.patch`, the equivalent independent web range.

New packages use manifest schema 2. Before any package output, the generator:

1. validates `source-lock.json` and authenticates the supplied checkout's `origin`
   as the same canonical GitHub repository;
2. requires the requested developer/web bases to equal the source-lock review
   bases;
3. creates a sterile temporary bare Git repository with isolated HOME/XDG/global
   Git configuration and no interactive credential prompt;
4. fetches the current canonical `developer` and `web-orchestration` branch tips
   directly from `source-lock.json`'s canonical repository URL;
5. requires each exact reviewed package head to resolve from that fetched
   canonical branch history and to be an ancestor of (or equal to) its observed
   current tip; the locked base must be an ancestor of the reviewed head; and
6. generates changed paths and patch bytes only from the fetched object database
   for the exact locked-base-to-reviewed-head range, never from the caller-
   supplied repository's objects and never by silently widening to later
   unrelated branch commits.

The schema-2 manifest embeds the exact source-lock snapshot, a SHA-256 of its
canonicalized JSON form, the observed canonical tips, explicit reviewed-head-
ancestor relationship markers, exact range metadata, sorted changed paths, and
each patch SHA-256. `package_sha256` then binds the stable manifest core and both
raw patch byte streams with a versioned domain separator.
`scripts/change-package-lib.mjs` is the shared offline verifier used by generation,
application, and ledger validation; it recomputes the source-lock, patch, range,
provenance-field, and package bindings without network access.

Historical schema-1 packages remain accepted for compatibility only after their
original range shape and per-patch SHA-256 checks pass. Their validation result is
explicitly integrity-only; they are not treated or reported as provenance-
verified schema 2 packages.

Full 40-character commits remain mandatory and a non-empty output directory is
refused. The generator never writes source branches. Generated `*.patch` files are
excluded from source whitespace diagnostics because unified-diff syntax uses
space-prefixed blank context lines; manifest/package SHA-256 and `git apply
--check` validate their exact bytes and applicability instead.

`scripts/apply-change-package.mjs` first runs the shared package validator,
requires the downstream checkout's exact matching branch and a clean tree, and
runs `git apply --check`. Only an explicit `--apply` updates the working tree. It
reports whether schema-2 provenance or only legacy schema-1 integrity was
verified. It does not commit, push, merge, or promote.

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

- `scripts/validate-template-development.mjs`: structure, source lock, task/archive
  rules, forbidden source-tree absence, executable bits, and every committed
  schema-1/schema-2 package through the shared verifier.
- `tests/change-package.test.mjs`: deterministic schema-2 generation from simulated
  canonical fetched history; deceptive-origin and wrong-base rejection;
  preservation of a reviewed head when the canonical branch later advances;
  local-only/forged-head rejection; provenance/patch/package-tamper rejection;
  legacy schema-1 compatibility; and downstream dry-run/application boundaries.
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
Project package without coupling it to one orchestration mode. The initial
package contained eleven Project Sources: nine user-facing routed Sources and two
support Sources. `skill-prompt-creation.md` is the single cross-mode route; it
composes a destination profile with a mission profile, transfers only receiver-
needed task state, and preserves Observed versus Interpretation versus Requested
outcome. `skill-prompt-destinations.md` and `skill-prompt-missions.md` are support
Sources loaded by the core rather than independent router entries. Initial
destinations are fresh MCP-ON, fresh MCP-OFF, and direct OpenCode; initial
missions include research, review, implementation, reproduce/test,
continuation/recovery, and template-maintenance transfer. The destination
describes the future receiver and never changes the current chat's effective
mode.

`TEMPLATE-PROMPT-CRAFT-001` completes that extension seam. The Project package now
contains twelve Sources: nine routed and three support. `skill-prompt-craft.md`
is support-only and applies after destination and mission resolution. It selects
only communication/scaffolding techniques that address a material task failure
mode, with workflow/authority above destination, destination above mission,
mission above task characteristics, and craft last; applying no additional
technique is valid. Conditional techniques cover context organization,
decomposition, alternatives/anchoring control, examples, targeted verification
and uncertainty, action framing, output shaping, and evaluation-driven
optimization for recurring prompts with representative evaluation cases.
Contraindications prevent craft from granting capabilities, choosing receiver-
owned routes, changing research-source roles or evidence meaning, taking human
approval/promotion decisions, demanding private chain-of-thought, or adding
ceremonial complexity.

The same task resolves two observed reliability gaps. First, when an originating
MCP-OFF chat creates a prompt for another execution context, prompt creation now
owns the final handoff shape; MCP-OFF capability/evidence/safety limits carry
forward, but its generic future-task schema and developer response contract do
not leak into the destination prompt unless explicitly requested. The exception
is stated both in the prompt core and at the MCP-OFF future-task decision point
so it does not depend on fragile cross-file inference. Second, permanent Project
instructions distinguish repository content writes from GitHub Issue control:
ordinary file/task-record/continuity writes use repository contents actions, and
Issue creation is reserved for an actual MCP-ON control/Scout route after its
required task-ID/open-issue reconciliation. The package validator and negative
tests enforce both boundaries without phrase-locking the craft taxonomy.

`TEMPLATE-TRUST-BOUNDARY-001` hardens the two reusable trust-transfer surfaces.
Developer source authenticates Git host plus owner/repository and runs read-only
Scouts through a separate pinned runtime with bridge-owned prompt/tools and
immutable exact-ref Git-object snapshots. On this ledger branch, package schema 2
closes the complementary provenance gap: locked review bases and exact reviewed
heads define the package range, freshly fetched current branch tips prove those
heads still belong to canonical branch history without pulling in later unrelated
commits, canonical fetched objects define the patch bytes, and an offline package
digest binds the embedded lock/provenance and both patches. Historical schema 1
remains compatibility-only rather than being silently upgraded in evidential
meaning.
