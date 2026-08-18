# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Security source correction implemented and independently reviewed at exact remote
implementation head `9d119a2432eacfe7c4655f18f6d40ebc34d1e2ef`.
The task remains **not complete**. A bounded model-routing bootstrap is now
explicitly authorized before the remaining security/package corrections: use the
existing Workspace Maintenance Agent once to replace the slow default Luna tier
with a verified Gemini Flash/high small tier, retain a Sol heavy tier, and add
small/heavy workspace-maintainer routes. Exact current CI evidence and safe
same-task package supersession remain unresolved. No `main` promotion is
authorized.

## Task-start template-development SHA

`7915a22248f11c8000622ffd761fb2a6e91e2359`

## Review-base template-development SHA

Prior completed handoff superseded by this review cycle:
`1f539586f382149a5d5a23bb62771165b880df0c`.

Review-reopen checkpoint:
`7cf68d1937b6d21a54bb022e67dec17e5f7b293b`.

## Public-safe task brief

Continue the same Workspace Maintenance Agent task without changing the task ID.
The already-reviewed security correction remains historical implementation
evidence. Before addressing the broader follow-up findings, perform one bounded
bootstrap change with the existing workspace-maintainer so future implementation
can use a faster small model by default:

1. replace Luna-backed developer/model roles with a verified Gemini Flash model at
   high reasoning for the small/default tier;
2. retain Sol as the heavy developer tier;
3. introduce distinct small and heavy Workspace Maintenance Agent routes, with
   Gemini Flash/high as small/default and Sol as heavy;
4. update the bridge/runtime/schema/tests/docs/validators needed for those routes
   to be real rather than documentation-only;
5. preserve independent web-orchestrator review and every existing exact-SHA
   human boundary over `main`.

Do not guess the Gemini provider/model identifier. Inspect the real pinned
OpenCode runtime/provider inventory and use the exact available identifier that
corresponds to the intended Gemini Flash model. If no suitable Gemini Flash model
is actually available, stop with evidence instead of substituting another model.

Keep the bootstrap single-writer and bounded. Do not treat it as resolving the
remaining workspace security findings, package supersession, branch protection,
or CI observability problems.

## Active continuation checkpoint

This task resumed from the exact remote `template-development` tip
`5e31fff24f8d78d8767b9e20d249bdd47061a894` after the authorized model-routing
bootstrap checkpoint. The working tree contains the bounded split-route edit:
`heavy-workspace-maintainer` retains the Sol model and
`small-workspace-maintainer` is the Gemini Flash route. No source tree or
downstream branch was copied or changed.

The pinned OpenCode `1.18.16` provider inventory parsed both agent definitions,
but the small route initially named `cliproxyapi/gemini-3.7-flash`; that provider
is not present in the inventory. The inventory does contain active
`llmgateway/gemini-3.7-flash` with reasoning and a `high` variant. The bounded
correction changed the small route to that exact available model and the focused
runtime check now resolves the expected provider/model and high reasoning tier.
The remaining split-route working-tree changes are not claimed as completed by
this narrow correction.

## Re-established source state before record checkpoint

At the model-routing bootstrap start, independent remote readback established:

- template-development: `b0cc4af37cd012e1bef6ae383aafdb0ae012b9e0`
- developer: `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

`source-lock.json` still exactly matches the live main/developer/web refs. Issue
#49 was independently reconciled as terminal: its mapped developer response was
`completed`, the session was idle, the exact handoff
`ba73b3b54febfdeadbff66262acaa7be12e5760e` exists remotely, and it reported no
blockers. The stale open issue was therefore closed as completed to release the
single mutating bridge lane without replay. Issue #53 remains the untouched
historical Scout-only acceptance issue. Issue #54 remains this task's canonical
public-safe continuation/control journal.

## Historical reviewed evidence

Previous reviewed package ranges remain historical evidence:

- template-development:
  `7915a22248f11c8000622ffd761fb2a6e91e2359..d509bf3fd0d3a4622d080f920aca6c122f77624d`
- developer:
  `ba73b3b54febfdeadbff66262acaa7be12e5760e..3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- web-orchestration:
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

Important previous checkpoints:

- template containment/runtime correction:
  `33227b741c0dc2909ed8ca8dc00ea1b28963febc`
- previous package-free reviewed template head:
  `d509bf3fd0d3a4622d080f920aca6c122f77624d`
- previous package storage/ledger commit:
  `66a8289fc112de4546ea9cee1933a8c056fd0ba7`
- previous template handoff:
  `1f539586f382149a5d5a23bb62771165b880df0c`
- developer real-runtime harness:
  `f455d6269678dbbab3783fd845ef26e0227c7ed7`
- developer OAuth/provider correction:
  `1b7fb2bce9d9bf23e107d808632066c62fe4c13c`
- unchanged developer handoff:
  `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`

Previous schema-3 package:

- directory: `changes/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001/`
- package binding:
  `78fbf87877d48810c527fbdb0a055d345bbeaa9cddff7efc4a9c0bf777df6d60`
- reported manifest SHA-256:
  `f0036c692c09f8ccb73d769ff0a520f437913ba559f5eeefb69346513fd42686`

## Current correction range

Exact independently compared implementation range:

`7cf68d1937b6d21a54bb022e67dec17e5f7b293b..9d119a2432eacfe7c4655f18f6d40ebc34d1e2ef`

It is linear, nine commits ahead, zero behind, and changes exactly six files:

- `scripts/workspace-maintenance-base.mjs`
- `scripts/workspace-maintenance-common.mjs`
- `scripts/workspace-maintenance-lib.mjs`
- `scripts/workspace-maintenance-publish.mjs`
- `scripts/workspace-maintenance-sandbox.mjs`
- `tests/workspace-maintenance-security.test.mjs`

No package bytes, `source-lock.json`, developer source, `main`, or web-orchestration
content changed in this implementation range.

## Implemented correction

### Workspace command confidentiality

The old arbitrary-command sandbox no longer mounts the real common Git directory
or real worktree Git directory. The compatibility facade now delegates to a
sanitized sandbox that:

- creates a temporary Git view containing only an explicit object pack for `HEAD`
  plus blobs referenced by the current index;
- uses `pack-objects --revs --stdout --no-reuse-object --no-sparse` with bitmap,
  sparse-pack, and path-walk reuse disabled, then builds a fresh pack index;
- creates only the selected current `HEAD`/branch ref and minimal Git config;
- copies only the current worktree index and, in split-index mode, only the exact
  shared index reported by `git rev-parse --shared-index-path`;
- read-only binds that sanitized view at `/git-view` and masks `/workspace/.git`
  with the sanitized directory/gitfile;
- retains the actual selected worktree writable at `/workspace`, unshares all
  namespaces/network, uses sterile HOME/XDG/tmp, fixed PATH/runtime, disables
  replacement refs, and fixes askpass programs to `/bin/false`;
- preserves repository-relative executable symlink-parent rejection through the
  pre-existing `secureParent` boundary.

Independent review found and corrected two secondary issues before freezing this
range: the first modular refactor had temporarily omitted `secureParent` from
repository-relative executable validation, and the first sanitized snapshot
copied every `sharedindex.*` file rather than only the current referenced split
index. Both are corrected in the exact implementation head.

### Workspace publication

The fixed host-side publisher now:

- inspects local repository config with includes disabled;
- detects `extensions.worktreeConfig=true` and then also inspects worktree config;
- rejects `url.*.insteadOf`, `url.*.pushInsteadOf`, `core.sshCommand`,
  `core.askPass`, include/includeIf, remote transport overrides, all
  `credential.*`, all `http.*`, alternates, replace refs, content filters, and
  working-tree encodings before publication side effects;
- pins `GIT_ASKPASS=/bin/false` and `SSH_ASKPASS=/bin/false` during publication as
  defense in depth;
- retains exact synchronized tracking-branch preflight, canonical pre-push
  `ls-remote`, no-force exact-ref push, canonical post-push readback, and
  synchronization-failure marker behavior;
- deliberately leaves the production canonical GitHub HTTPS-only origin
  restriction unchanged in this security cycle.

## Adversarial tests added

The new security fixture covers:

- a private sentinel beneath `.git/opencode-bridge/**`;
- a stale/decoy `sharedindex.*` sentinel in the selected worktree Git directory;
- a deliberately unreachable object containing a private sentinel;
- proof that arbitrary sandbox commands cannot enumerate/read those values;
- proof that `git cat-file` cannot recover the unreachable object;
- preservation of useful `git status`, staged `git diff`, and `git log` behavior;
- common-config `url.*.pushInsteadOf` rejection before a foreign ref can appear;
- worktree-config `url.*.pushInsteadOf` rejection before a foreign ref can appear;
- common-config `core.askPass` rejection before its sentinel program can execute;
- worktree-config `core.askPass` rejection before its sentinel program can
  execute.

The pre-existing workspace-maintenance suite continues to cover host environment
secret absence, loopback/network denial, outside reads/writes, symlink escape,
foreign `git -C`/`--git-dir`, nonpersistent sandbox ref updates, successful local
fixture publication, `main` denial, `pushurl` rejection, and stale canonical
heads.

## Checks and independent evidence

Before publication of the final two confidentiality refinements, local fixture
checks on the modular implementation established:

- syntax checks for the new runtime/test modules passed;
- all publication adversarial cases passed;
- a positive brokered local-fixture publication passed;
- basic read/write/glob/grep operations passed;
- a direct sanitized-snapshot check preserved status/cached-diff/log and excluded
  a deliberately unreachable object.

That local environment did not provide the non-root `/usr/bin/bwrap` execution
surface required for the complete namespace test, so it is not claimed as the
full tracked validation result.

The exact current workflow `.github/workflows/validate-template-development.yml`
is configured to run on every `template-development` push, installs Bubblewrap,
enables unprivileged namespaces, and executes the tracked full validator. The
current connected GitHub tool surface exposes workflow jobs only when a run ID is
already known and exposes commit-associated workflow discovery only for PR runs;
it does not expose push-triggered run listing or check-run lookup. Exact CI
success for the corrected implementation and subsequent record-only checkpoint is
therefore **UNKNOWN**, not inferred from the workflow definition.

Historical successful workflow runs `32081956594`, `32082204637`, and
`32082313822` remain historical evidence only and do not prove this new range.

## Package supersession blocker discovered in this cycle

The existing schema-3 package is a full task package whose template range is
`7915a22248f11c8000622ffd761fb2a6e91e2359..d509bf3fd0d3a4622d080f920aca6c122f77624d`.
The tracked generator deliberately rejects a template-development range that
contains `changes/<task-id>/**` so a package cannot contain its own generated
storage.

The new correction necessarily descends from the already-stored package commit.
Therefore a full same-task regeneration from the original template base now
contains historical `changes/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001/**` paths
and is rejected by the current generator. The tracked tests cover first-generation
self-reference rejection but define no same-task supersession procedure.

Using the previous handoff as a new template base would produce only a correction
delta. That is not accepted here as a replacement for the existing full package:
the apply tool checks patch applicability but does not require the target checkout
to equal the manifest base SHA, so a delta-only replacement could fail to carry
the original feature to a fresh downstream.

No package bytes have been hand-built or overwritten. The previous package remains
unchanged historical evidence.

## Attempts / route decisions

- Re-established all four exact refs before relying on the prior handoff.
- Reopened this same task in its canonical current record at
  `7cf68d1937b6d21a54bb022e67dec17e5f7b293b`.
- Created public-safe issue #54 under the same task ID; it is the canonical
  continuation/control journal for this task.
- Reconciled historical mutating issue #49 from durable public evidence: the
  mapped developer was idle with a correlated `completed` response, exact pushed
  handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e` exists remotely, and no blocker
  remained. #49 was closed as completed without replay or implementation change.
- Issue #53 remains untouched as historical Scout-only evidence.
- The original security correction used bounded connected-GitHub contents writes
  while #49 still occupied the mutating bridge lane.
- The next mutation route is now deliberately the existing Workspace Maintenance
  Agent on this same task, used only for the bounded model-routing bootstrap.

## Model-routing bootstrap acceptance boundary

This one bootstrap use of the current workspace-maintainer is accepted only under
a single-writer, clean/synchronized-target assumption. It does **not** resolve or
waive the broader independent-review findings around content-bound preflight,
canonical-origin binding, nested Git/special-file containment, pre-sandbox Git
behavior, publication ordering/locking, bridge-private state isolation, server-side
branch protection, or package supersession. Any unexpected target dirtiness,
branch movement, origin/config discrepancy, unrelated path, or inability to prove
the intended Gemini model identity must stop the bootstrap rather than widening
scope.

## Blockers / required decisions

1. **Model identity probe:** the exact Gemini Flash provider/model identifier in
   the real pinned OpenCode runtime is not yet independently established. The
   workspace route must inspect and prove it before editing model declarations.
2. **Exact current CI proof:** full push-triggered validation evidence for the
   earlier corrected template head remains UNKNOWN through the current connected
   check surface.
3. **Same-task schema-3 package supersession:** repository-owned behavior remains
   undefined after prior package storage. Do not replace or hand-build package
   bytes during the model-routing bootstrap.

No further human decision is required to perform the bounded bootstrap itself.
Any `main` promotion remains a separate explicit exact-SHA human decision and is
not authorized here.

## Remaining work

1. Run the existing Workspace Maintenance Agent for the bounded model-routing
   bootstrap: prove the Gemini Flash model identity; implement small/heavy
   developer and workspace-maintainer routes; update necessary bridge/runtime,
   schemas, validators, tests, and durable records; run proportional checks; push
   exact affected non-main branches.
2. Independently review every pushed range and correct only evidence-backed
   bootstrap defects.
3. After the bootstrap, address the broader security/authority/package findings
   with the faster small route plus heavy escalation when appropriate.
4. Resolve same-task package supersession before claiming portable task
   completion or replacing the historical package.
5. Obtain exact current CI evidence when the connected surface can prove it.

## Next action

Use issue #54 as the canonical control issue for this same task. Apply the bridge
control label, start the template-development-rooted Workspace Maintenance Agent
from exact current `template-development`, and keep the route bounded to the
model-routing bootstrap above. Do not archive, package, or promote `main`.

## Last historical handoff commit

`1f539586f382149a5d5a23bb62771165b880df0c`
