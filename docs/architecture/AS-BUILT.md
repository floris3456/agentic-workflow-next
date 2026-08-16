# Template-maintenance AS-BUILT

## Purpose

The `template-development` branch is the durable cross-branch ledger for work on
the reusable agentic workflow template. It provides compaction-safe template-task
continuity, exact provenance across independent source branches, portable
upstream/downstream change transfer, and separation from project implementation
history.

## Authority model

- Remote source refs are authoritative implementation evidence.
- `source-lock.json` is the ledger's last reconciled source snapshot and package
  review-base lock. It moves only through the tracked package/reconciliation
  procedure after the prior snapshot has been embedded in the package.
- Component AS-BUILT/deviation records stay on the source branch beside the code
  they describe; this file records the cross-branch maintenance architecture.
- Task records, developer/Scout/bridge reports, CI, and orchestration notes are
  procedural memory or evidence, never human acceptance.
- Human approval of one exact reviewed `developer` SHA is the only authority that
  advances `main`.

## Branch contents

This branch contains maintenance instructions, provenance, design/decision
records, task records, deterministic change packages, tests, validation, and Git
synchronization hooks. It contains no copy of `developer`, `main`,
`web-orchestration-only/**`, bridge implementation, or downstream project source.
Source histories are never merged into this ledger.

## Source execution

Actual edits stay on the authoritative `developer` and `web-orchestration`
branches. The web orchestrator selects the route proportionally:

- bounded direct connected-GitHub edits when exact paths/edits are known and
  remote readback plus focused checks can prove the outcome more simply;
- isolated/local or delegated source execution when repository context/tools,
  interacting edits, generation/tests, uncertainty, or independent
  implementation materially improves confidence.

Only one mutating source route runs at a time. Read-only Scouts may overlap when
the hardened Scout boundary is ready. Each source branch keeps its own task,
AS-BUILT/deviation, synchronization, and validation contract. Every changed source
range is independently reviewed against exact remote GitHub.

## Acceptance-test CI reachability

Acceptance-critical executable tests owned by an authoritative branch are
reachable through that branch's canonical push-triggered validation path. This
lets a web orchestrator publish an exact source SHA and obtain authoritative
remote execution even when its own local Git/HTTP/Node environment cannot reach
GitHub.

The current authoritative branches satisfy that invariant as follows:

- `developer`: `.github/workflows/validate-repository.yml` runs on pushes to
  `developer` and reaches the repository validator, bridge tests, and
  `tests/template-branches.test.mjs` through the canonical validation scripts.
- `web-orchestration`: `.github/workflows/validate-web-orchestration.yml` runs on
  pushes to `web-orchestration`, executes
  `web-orchestration-only/validate-package.mjs`, then uses bare `node --test` so
  normal future Node test files are discovered without workflow edits. The
  workflow has read-only contents permission and does not persist checkout
  credentials.
- `template-development`: `.github/workflows/validate-template-development.yml`
  runs on pushes to `template-development` and reaches the ledger validator plus
  `tests/change-package.test.mjs` through
  `scripts/validate-template-development.sh`.

The web-orchestrator template-maintenance Source carries the reusable invariant.
Its executable Node acceptance suite mechanically checks the web workflow's push
trigger, read-only permission/credential posture, canonical validator command,
and discovery-mode test command without coupling the standalone package validator
to repository-root layout.

## Template task continuity

Explicit reusable-template work creates or resumes one public-safe
`docs/work/current/<task-id>-<slug>.md` record before consequential source
publication. It replaces ordinary web task-context continuity for the whole
template task. The record keeps exact live refs, source ranges, material
observations/interpretations, route/active-work state, publication/recovery state,
checks, blockers, decisions, remaining work, and next action when applicable.

A successful working-cycle handoff is not finalization. Finalization preserves the
approved task-record Git blob unchanged when moving it to the same basename under
`docs/work/archive/`; collision or blob mismatch is refused.

## Change packages

`scripts/create-change-package.mjs` produces one directory per task containing
`manifest.json`, `developer.patch`, and `web-orchestration.patch`. New packages
use manifest schema 2.

Before output, the generator:

1. validates `source-lock.json` and authenticates the supplied checkout's origin
   as the same canonical GitHub repository;
2. requires requested source bases to equal the locked review bases;
3. creates a sterile temporary bare repository with isolated Git configuration
   and no interactive credential prompt;
4. fetches current canonical `developer` and `web-orchestration` tips;
5. requires each exact reviewed package head to belong to the fetched canonical
   branch history, with the locked base an ancestor of the reviewed head and the
   reviewed head an ancestor of/equal to the current tip; and
6. generates range metadata and patch bytes only from fetched canonical objects,
   never caller-supplied objects and never by silently widening to unrelated later
   commits.

The schema-2 manifest embeds the exact old source-lock snapshot and digest,
observed canonical tips, reviewed-head relationship markers, exact ranges, sorted
changed paths, and per-patch SHA-256 values. `package_sha256` binds the stable
manifest core plus both raw patch streams with a versioned domain separator.
`scripts/change-package-lib.mjs` is the shared offline verifier used by generation,
application, and ledger validation.

Historical schema-1 packages remain integrity-compatible only after their
original range/per-patch checks pass and are explicitly not provenance-verified.
Full 40-character commits remain mandatory. A non-empty output directory is
refused. The generator never writes source branches.

`scripts/apply-change-package.mjs` validates the package, requires the downstream
checkout's exact matching branch and clean tree, and runs `git apply --check`.
Only explicit `--apply` changes the working tree; it does not commit, push, merge,
or promote. Patch conflict is an explicit adaptation task, never permission to
silently alter canonical package contents.

## Synchronization

Tracked ledger hooks permit commits only on `template-development`. The
post-commit hook immediately pushes the branch. A failed push records private Git
recovery state and blocks further commits. The recovery script preserves the
failed commit and allows only the repository's guarded fast-forward or one
conflict-free exact-head recovery path; it never rewrites remote history.

## Generated repositories

Template creation includes all branches. Generated histories may be unrelated;
the project's source lock maintains the relationship to the canonical template.
Reviewed template changes transfer as deterministic content patches, never by
merging the ledger or independent source histories.

## Current web-orchestrator Project package

The `web-orchestration` source installs minimal permanent developer instructions
plus **five conditionally routed Project Sources**:

1. `skill-workflow.md` — ordinary lookup/research/review, proportional scouting,
   direct-versus-delegated implementation, exact review/correction, and
   conditional finalization.
2. `skill-recovery.md` — exceptional issue/command/publication/agent/Git
   reconciliation with strict ambiguous-mutation no-replay semantics.
3. `skill-template-maintenance.md` — reusable-template continuity, source work,
   source-lock/package provenance, downstream transfer, and template finalization.
4. `skill-promotion.md` — human-triggered exact-SHA guarded `developer` to `main`
   promotion only.
5. `skill-prompt-creation.md` — one self-contained context-transfer and prompt-
   engineering skill containing destinations, missions, evidence roles, and the
   retained craft toolbox.

The previous MCP-ON/MCP-OFF architecture and model-name mapping are retired.
Capabilities constrain the action that needs them rather than defining a global
mode. Connected GitHub, public web/GitHub, Scouts, direct mutation, delegation,
and other specialized capabilities are selected locally only when they serve the
human's outcome. If a capability is unavailable, only the dependent action is
unavailable; safe independent work and the strongest justified predecessor
outcome continue without simulating the missing effect.

Permanent instructions retain only stable role/evidence, proportionality,
authority/safety, capability-local execution, completion, and the five-row
procedure router. Detailed bridge, Scout, recovery, finalization, promotion, and
prompt craft mechanics live in their conditionally loaded skill owner.

## Ordinary task continuity

`web-orchestration-only/task-context/**` remains the public-safe continuity owner
for consequential ordinary orchestration tasks. The new template records
`Material capability limits` only when an unavailable action/evidence source
actually affects the task. It does not snapshot the transient tool surface or
persist a global orchestration mode. Existing historical records remain truthful
history and may retain old mode terminology; they are not rewritten merely to
match current architecture.

## Prompt creation as built

Prompt creation remains context transfer across an execution boundary, but its
former core/destination/mission/craft Source split is collapsed into one skill
because all four components always co-triggered.

The skill retains:

- fresh web-orchestrator, direct OpenCode, and evidence-bounded other explicit
  receiver handling;
- investigation/research, review, implementation/change, reproduce/test,
  continue/recover, and template-maintenance-transfer missions;
- Observed / Interpretation / Requested outcome separation;
- target-repository versus external-prior-art source roles;
- prompt minimality and receiver-owned protocol omission;
- context/evidence organization;
- adaptive decomposition/planning;
- exploration/anchoring control;
- examples/demonstrations;
- targeted verification/uncertainty;
- tool/action framing;
- output/interface shaping; and
- evaluation-driven optimization only for recurring prompt systems with
  representative evaluations.

Craft is applied only for a material failure mode when its likely benefit exceeds
attention/token/rigidity/autonomy cost. Applying no extra craft technique is a
normal result. Prompt craft never changes destination capability, mission,
evidence meaning, source roles, human authority, or receiver-owned workflow and
never requests private chain-of-thought/hidden scratch work.

## Trust boundaries

The independent read-only Scout runtime remains fail-closed. The inspected ref is
untrusted evidence and may not control checkout hooks, executable extensions,
system instructions, model/permission policy, repository-instruction injection,
LSP/package-manager/process side effects, or filesystem access outside the exact
requested view. If that hardened runtime is unavailable, the orchestrator uses
exact direct inspection rather than falling back to ordinary developer OpenCode
or ref-owned instructions.

Package schema 2 closes the complementary cross-branch provenance boundary:
locked bases plus exact reviewed heads define the package range; freshly fetched
canonical history proves the reviewed heads belong to the source branches without
including later unrelated commits; fetched objects define patch bytes; and the
package digest binds lock/provenance plus both patches.

## Current provenance dependency

`TEMPLATE-TRUST-BOUNDARY-001` completed its reviewed source hardening but is still
blocked on genuine networked schema-2 package generation. Therefore
`source-lock.json` deliberately remains at that task's prior review bases until
the tracked generator embeds the snapshot and reconciliation completes. Later
source work, including `TEMPLATE-CAPABILITY-ORCHESTRATION-001` and
`TEMPLATE-CI-REACHABILITY-001`, records exact live ranges but must not silently
move or widen that lock. This is an explicit package ordering dependency, not
permission to fabricate package bytes.

## Verification

- `web-orchestration-only/validate-package.mjs` enforces the exact five-Source
  Project inventory, capability-local permanent semantics, routed triggers,
  unified prompt destinations/missions/evidence/craft, hardened Scout boundary,
  recovery no-replay, template-maintenance provenance, human exact-SHA
  promotion, bridge-envelope shapes, public safety, and new task-context schema.
- `web-orchestration-only/validate-package.test.mjs` provides focused negative
  fixtures for those architectural boundaries and a CI-contract test for the
  branch-owned push workflow.
- `web-orchestration` push Actions run `31917651395` succeeded at exact source SHA
  `3891a17bd62b8e4871310766f2a05175aa42cf87`: the checkout used non-persisted
  credentials under read-only contents permission, the canonical package
  validator passed, and discovery-mode `node --test` passed all 16 tests.
- `scripts/validate-template-development.mjs` validates ledger structure, source
  lock, task/archive rules, forbidden source-tree absence, executable bits, and
  committed change packages through the shared verifier.
- `tests/change-package.test.mjs` covers deterministic schema-2 generation,
  deceptive origin/wrong-base/forged-head rejection, later canonical branch
  advance, provenance/patch/package tamper detection, schema-1 compatibility, and
  downstream dry-run/application boundaries.
- `scripts/validate-template-development.sh` runs the ledger/package checks plus
  `git diff --check`.

Historical maintenance decisions and implementation exercises remain in their
exact task records and Git history. This AS-BUILT describes the current system;
it does not rewrite historical procedure into current truth.
