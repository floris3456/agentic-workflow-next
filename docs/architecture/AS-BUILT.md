# Template-maintenance AS-BUILT

## Purpose

The `template-development` branch is the durable cross-branch ledger for work on
the reusable agentic workflow template. It provides template-task
continuity, exact provenance across independent source branches, portable
upstream/downstream change transfer when requested, and separation from project
implementation history. Context continuity relies on zero compaction, retaining
the last 5,000 raw chat tokens and re-reading durable repository records.

## Authority model

- Remote source refs are authoritative implementation evidence.
- `source-lock.json` is the ledger's latest reconciled canonical source snapshot.
  It may advance directly from independently verified exact remote refs and is
  not a package review-base lock. Package task records and manifests own their
  exact reviewed base/head ranges independently.
- Component AS-BUILT/deviation records stay on the source branch beside the code
  they describe; this file records the cross-branch maintenance architecture.
- Task records, developer reports, CI, and orchestration notes are procedural
  evidence, never human acceptance.
- Human approval of one exact reviewed `developer` SHA is the only authority that
  advances `main`.

## Branch contents

This branch contains maintenance instructions, provenance, design/decision
records, task records, deterministic change packages, tests, validation, Git
synchronization hooks, and the template-development-rooted Workspace Maintenance
Agent/runtime. It contains no copy of `developer`, `main`,
`web-orchestration-only/**`, retired bridge transport implementation, or downstream project source.
Source histories are never merged into this independent branch.

## Source execution

Product and Project-package edits stay on the authoritative `developer`
and `web-orchestration` branches. The maintenance agent/runtime and portable
package machinery are the explicit template-development-owned implementation.
The web orchestrator selects source routes proportionally:

- default substantive development uses the Dual developer route (`dual`), where
  the lead developer designs the concrete implementation and Spark executes
  implementation/testing;
- `small` for very simple bounded local work with trivial or no testing;
- `heavy` for difficult/important but still small bounded work; and
- Workspace Maintenance when the template-development-rooted authority and
  verified cross-worktree tool boundary are the appropriate execution surface.

Only one mutating source route runs at a time. Direct work executing inside a
source branch's own authoritative context follows that branch's normal task,
AS-BUILT/deviation, synchronization, validation, and handoff procedure. Workspace
Maintenance is route-sensitive instead: it keeps its template-development-rooted
instruction authority while reading target rules as evidence and applying the
relevant compatibility/output obligations to the branch state it produces. Every
changed source range is independently reviewed against exact remote GitHub.

## Workspace Maintenance Agent

Workspace Maintenance exposes only the public routes `small` and `heavy`.
`small` maps to `small-workspace-maintainer`; `heavy` maps to
`workspace-maintainer`. The web orchestrator selects the route and neither agent
selects or recommends its own escalation. Workspace Maintenance never substitutes
for Dual or Spark. Both agents keep their OpenCode project rooted in the registered
`template-development` worktree for the whole session.
Unlike the generic `template-maintainer` source route, they do not enter another
worktree's OpenCode context or inherit that target's agent workflow. Their stable
repository instruction authority is the template-development root `AGENTS.md`,
the selected agent definition, the `workspace-maintenance` skill, and the bounded
web-orchestrator request.

Target `AGENTS.md`, skills, agent definitions, durable-record rules, and other
instruction-shaped files remain important target evidence. Workspace reads and
applies requirements that are relevant to the branch state it produces, including
applicable public safety, `main` authority, synchronization, file placement and
format, durable AS-BUILT/deviation truth, and validation/check requirements.
Reading those files does not transfer instruction authority or automatically
trigger target agent selection, target skills as controlling procedure, target
task lifecycle, or target handoff shape. A target-specific durable record may be
created or updated as an output artifact when required without converting the
Workspace agent into the target branch's normal agent.

If the bounded task intentionally changes a target rule itself, Workspace reads
the current rule to understand existing behavior and compatibility impact, then
executes the authorized rule change under Workspace authority. The old rule is
evidence of the contract being changed, not authority to veto its own requested
modification. Conversely, when adding a missing file under an existing target
contract, Workspace follows the applicable placement, naming, format,
durable-record, and validation requirements for that file.

The template-development-owned OpenCode plugin exposes `workspace_list`,
`workspace_inspect`, `workspace_read`, `workspace_write`, `workspace_delete`,
`workspace_glob`, `workspace_grep`, `workspace_exec`, `workspace_publish`,
The agent uses a real default-deny permission inventory, explicitly allows only
these tools plus structured questions, and denies every skill before allowing
only `workspace-maintenance`. Built-in task, shell, read/edit, web, planning, and
external-directory capabilities therefore remain denied. No parent-directory
allow rule or host-specific path is tracked. `.opencode/package.json` pins both
OpenCode and `@opencode-ai/plugin` to `1.18.16`; generated dependencies and
lockfiles remain ignored.

Every tool invocation starts from the active template-development directory and
derives NUL-delimited porcelain inventory from `git worktree list`. Eligibility
requires a real non-symlink registered worktree, the same canonical Git common
directory and exact origin as the instruction root, matching inventory/current
branch and HEAD, and readable status/upstream state. Target inputs are branch
names or unambiguous exact detached HEADs, never paths. Stale, foreign,
unregistered, similarly named, symlinked, escaping, and ambiguous targets fail
closed. Public tool results identify targets by branch/ref and SHA and omit
host-local worktree paths.

File tools reject `.git`, absolute/traversing paths, symlink components, binary
or oversized reads, and non-regular mutations. Mutating file and command tools
require the exact HEAD and SHA-256 status digest returned by inspection, so
unobserved local movement blocks the operation. `workspace_exec` runs the
explicit executable/argument array inside a non-root Linux Bubblewrap namespace,
not merely at a selected cwd. Only the verified worktree is writable; its exact
Git common/worktree metadata and fixed system roots are read-only. The exact Node
executable already hosting the trusted gate is separately mounted read-only at
`/runtime/node`, without exposing its host installation tree or host `PATH`.
Network, the remaining host filesystem, inherited environment, credentials, and
host temp state are absent. Repository-relative executables remain inside that
namespace, and arbitrary Git options cannot reach foreign repositories or
persist ref/config changes outside it.

Commit/push is a separate fixed `workspace_publish` broker, not arbitrary Git
authority. It rejects `main`, detached or unsynchronized branches, canonical-tip
advance, alternate objects, replace refs, hooks, filters/encodings, signing,
transport/config redirection, force updates, and agent-supplied Git arguments. It
commits exactly the inspected non-main worktree state, pushes only the resulting
commit to the matching branch/ref on the verified credential-free GitHub origin,
and independently reads that ref back. Any post-commit failure writes the
branch-owned synchronization marker. Host credential handling is confined to
that broker's fixed Git invocation; sandboxed commands never receive it. Absolute
local origins exist only behind an explicit host-registered temporary-fixture
option used by adversarial tests.

Registered access is technical capability only. A `main` worktree is inspectable
and technically reachable when registered, but consequential main mutation or
promotion still requires the repository's existing explicit human exact-SHA
authority.

A Workspace-routed task returns the branch-neutral Workspace completion shape.
Publishing a target such as `developer` does not create a second developer-agent
handoff obligation; the web orchestrator independently reviews the exact pushed
target SHA and the applicable target constraints.

## Acceptance-test CI reachability

Acceptance-critical executable tests owned by an authoritative branch are
reachable through that branch's canonical push-triggered validation path. This
lets a web orchestrator publish an exact source SHA and obtain authoritative
remote execution even when its own local Git/HTTP/Node environment cannot reach
GitHub.

The current authoritative branches satisfy that invariant as follows:

- `developer`: `.github/workflows/validate-repository.yml` runs on pushes to
  `developer` and reaches the repository validator and
  `tests/template-branches.test.mjs` through the canonical validation scripts.
- `web-orchestration`: `.github/workflows/validate-web-orchestration.yml` runs on
  pushes to `web-orchestration`, executes
  `web-orchestration-only/validate-package.mjs`, then uses bare `node --test` so
  normal future Node test files are discovered without workflow edits. The
  workflow has read-only contents permission and does not persist checkout
  credentials.
- `template-development`: `.github/workflows/validate-template-development.yml`
  runs on pushes to `template-development`, installs Bubblewrap plus the exact
  pinned OpenCode runtime, and reaches ledger/package/containment fixtures plus a
  real agent/plugin/skill/tool inventory check through
  `scripts/validate-template-development.sh`. On the ephemeral Ubuntu 24.04
  runner it disables the one-boot AppArmor unprivileged-user-namespace
  restriction so Bubblewrap's real namespace boundary executes; the containment
  fixture is not skipped or replaced with a cwd-only fallback.

The web-orchestrator template-maintenance Source carries the reusable invariant.
Its executable Node acceptance suite mechanically checks the web workflow's push
trigger, read-only permission/credential posture, canonical validator command,
and discovery-mode test command without coupling the standalone package validator
to repository-root layout.

## Template task continuity

Explicit reusable-template work uses one stable canonical task record
`docs/work/current/<task-id>-<slug>.md` as instruction authority. Optional
separate concise task progress `docs/work/current/<task-id>-progress.md` captures
resumable execution state (current position, observations, checks run, blockers,
remaining work, next action) when needed for continuity across sessions. Context
retention uses zero compaction, retaining the last 5,000 raw chat tokens and
instructing agents to re-read durable repository records.

A successful working-cycle handoff is not finalization. Archival is an optional,
non-blocking move of the completed task record to `docs/work/archive/`; collision
or blob mismatch is refused.

## Source snapshot

`source-lock.json` records the latest reconciled exact canonical refs for `main`,
`developer`, and `web-orchestration`, plus the last actual package metadata. It is
updated only from independently verified remote refs at meaningful maintenance
checkpoints. A stale snapshot is an observation to reconcile; it does not define,
freeze, widen, or block a task's reviewed package range.

Package creation neither consumes nor advances the source snapshot. This removes
the former old-lock-before-package ordering dependency while keeping task review
bases explicit in task records and package manifests.

## Change packages

`scripts/create-change-package.mjs` produces one directory per task containing
`manifest.json`, `template-development.patch`, `developer.patch`, and
`web-orchestration.patch`. New packages use manifest schema 3. Packaging is
conditional upon transfer or release request.

Before output, the generator:

1. validates `source-lock.json` and authenticates the supplied checkout's origin
   as the same canonical GitHub repository;
2. creates a sterile temporary bare repository with isolated Git configuration
   and no interactive credential prompt;
3. fetches current canonical `template-development`, `developer`, and
   `web-orchestration` tips;
4. requires each exact supplied range base and reviewed head to resolve from the
   fetched canonical object database, requires the base to be an ancestor of the
   reviewed head, and requires the reviewed head to be an ancestor of/equal to
   the current branch tip; and
5. excludes all ledger-only package storage paths beneath `changes/**` when diffing
   `template-development` so package storage is never transferred inside another
   package; and
6. generates range metadata and patch bytes only from fetched canonical objects,
   never caller-supplied objects and never by silently widening to unrelated later
   commits.

The schema-3 manifest embeds the generation-time `source-lock.json` snapshot and
digest as provenance context, observed canonical tips, reviewed-head relationship
markers, exact task ranges, sorted changed paths, and per-patch SHA-256 values.
When a package supersedes an earlier package for the same task, the historical
package remains immutable in its original directory and the superseding package
is created in a distinct directory (e.g. `changes/<task-id>.rev2/`). The manifest
records its `revision` number and a `supersedes` object binding the exact
relative path, revision, and `package_sha256` of the superseded package.
`package_sha256` binds the stable manifest core (including supersession metadata)
plus all three raw patch streams with a versioned domain separator.
`scripts/change-package-lib.mjs` is the shared offline verifier used by
generation, application, and ledger validation; it verifies supersession chains
for acyclicity, strictly increasing revisions, digest integrity, and unambiguous
active package resolution.

Historical schema-1 packages remain integrity-compatible only after their
original range/per-patch checks pass and are explicitly not provenance-verified.
Existing schema-2 packages remain valid because packages that previously used the
source snapshot as their range bases are a valid subset of the new independent-
snapshot contract. Full 40-character commits remain mandatory. A non-empty output
directory is refused. The generator never writes source branches.

`scripts/apply-change-package.mjs` validates the package and supports all three
matching downstream branches, including `template-development`. It accepts an
explicit `--package` directory or resolves the latest active package via
`--task-id`, requires the exact matching branch and a clean tree, then runs
`git apply --check`. Only explicit `--apply` changes the working tree; it does
not commit, push, merge, or promote. Every branch's own review/commit/push
process remains authoritative. Patch conflict is an explicit adaptation task,
never permission to silently alter canonical package contents.

## Synchronization and recovery

Tracked ledger hooks permit commits only on `template-development`. Automatic
push-after-every-commit is removed; push occurs when remote durability, review,
CI, transfer, or checkpoint evidence is useful. If an ambiguous mutation occurs,
dependent mutation is halted until process/session/local Git/remote Git state
are reconciled from evidence without automatic replay. The recovery script
preserves the failed commit and allows only the repository's guarded
fast-forward or one conflict-free exact-head recovery path; it never rewrites
remote history.

## Generated repositories

Template creation includes all branches. Generated histories may be unrelated;
the project's source lock maintains the relationship to the canonical template.
Reviewed template changes transfer as deterministic content patches, never by
merging the ledger or independent source histories.

## Current web-orchestrator Project package

The `web-orchestration` source installs minimal permanent developer instructions
plus **five conditionally routed Project Sources**:

1. `skill-workflow.md` — ordinary lookup/research/review, route selection
   (default substantive `dual`, shortcuts `small`/`heavy`), direct-versus-delegated
   implementation, exact review/correction, and conditional finalization.
2. `skill-recovery.md` — exceptional issue/command/publication/agent/Git
   reconciliation with strict ambiguous-mutation no-replay semantics.
3. `skill-template-maintenance.md` — reusable-template continuity, source work,
   current source-snapshot/package provenance, downstream transfer, and template
   finalization.
4. `skill-promotion.md` — human-triggered exact-SHA guarded `developer` to `main`
   promotion only.
5. `skill-prompt-creation.md` — one self-contained context-transfer and prompt-
   engineering skill containing destinations, missions, evidence roles, and the
   retained craft toolbox.

The permanent instructions retain only stable role/evidence, proportionality,
authority/safety, capability-local execution, completion, and the procedure
router. Detailed mechanics live in their conditionally loaded skill owner.

The permanent completion boundary is a hard final-response gate: every launched
route must be terminal and absorbed with publications, visible interactions, and
claimed remote effects reconciled. Active, unknown, indeterminate, or otherwise
unresolved work without a genuine human-owned decision keeps the orchestrator in
reconciliation; elapsed time, routine delay, response length, and token/tool use
are not blockers or completion conditions. Package validation pins that rule.

## Ordinary task continuity

`web-orchestration-only/task-context/**` remains the public-safe continuity owner
for consequential ordinary orchestration tasks. Context uses zero compaction,
retaining the last 5,000 raw chat tokens and re-reading durable records.

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

The read-only inspection boundaries remain fail-closed. The inspected ref is
untrusted evidence and may not control checkout hooks, executable extensions,
system instructions, model/permission policy, repository-instruction injection,
LSP/package-manager/process side effects, or filesystem access outside the exact
requested view.

Package schema 3 closes the complementary cross-branch provenance boundary for
all three ranges: exact task bases plus exact reviewed heads define package
membership; freshly fetched canonical history proves those endpoints and their
ancestry without including later unrelated commits; fetched objects define patch
bytes; the template-development self-package guard avoids circular history; and
the package digest binds provenance context plus all three patches. The source
snapshot is useful generation-time context, not an authority that defines
package membership or a self-referential commit identity.

## Verification

- `web-orchestration-only/validate-package.mjs` enforces the exact five-Source
  Project inventory, capability-local permanent semantics, routed triggers,
  unified prompt destinations/missions/evidence/craft, recovery no-replay,
  template-maintenance provenance, human exact-SHA promotion, public safety,
  and new task-context schema.
- `scripts/validate-template-development.mjs` validates ledger structure, source
  snapshot shape, task rules, forbidden source-tree absence, executable bits,
  both Workspace route identities, the route-sensitive target-rule authority
  contract, and committed change packages through the shared verifier.
- `tests/change-package.test.mjs` covers deterministic schema-3 three-range
  generation with a source snapshot intentionally independent from range bases,
  deceptive origin, wrong/non-ancestor bases, forged heads, later canonical
  advance, self-package rejection, provenance/template-patch/package tampering,
  schema-1 compatibility, and clean template/developer dry-run/application.
- `tests/workspace-maintenance.test.mjs` creates harmless temporary canonical and
  foreign repositories plus registered worktrees. It proves registered developer
  and main access, stable template instruction root while operating on a target
  with conflicting instruction files, exact preflight read/write/delete, and
  Bubblewrap-contained command execution. Harmless sentinels prove outside
  read/write, foreign Git routing, symlink, injected-secret, network, local-origin,
  main-publication, transport-redirection, and stale-remote boundaries.
- `tests/workspace-target-rules.test.mjs` protects the stable-Workspace-authority
  plus applicable-target-constraints distinction, the missing-file and
  rule-modification examples, and the one-Workspace-handoff rule for target
  publication.
- `scripts/validate-workspace-opencode-runtime.mjs` starts real OpenCode `1.18.16`
  with sterile local state and queries its agent, skill, and tool inventories. It
  proves the rooted custom agent/plugin load and evaluates the runtime's ordered
  permissions so forbidden tools and every other discovered skill resolve deny.
- `scripts/validate-template-development.sh` runs the ledger/package/containment
  and real-runtime checks plus `git diff --check`.

Historical maintenance decisions and implementation exercises remain in their
exact task records and Git history. This AS-BUILT describes the current system;
it does not rewrite historical procedure into current truth.
