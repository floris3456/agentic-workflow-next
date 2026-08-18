# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Security source correction implemented and independently reviewed at exact remote
implementation head `9d119a2432eacfe7c4655f18f6d40ebc34d1e2ef`.
The task is **not complete**: exact push-triggered CI result evidence for the new
head is not available through the current connector surface, and same-task
schema-3 package supersession is not defined by the tracked generator after the
old package bytes already entered template history. No `main` promotion is
authorized.

## Task-start template-development SHA

`7915a22248f11c8000622ffd761fb2a6e91e2359`

## Review-base template-development SHA

Prior completed handoff superseded by this review cycle:
`1f539586f382149a5d5a23bb62771165b880df0c`.

Review-reopen checkpoint:
`7cf68d1937b6d21a54bb022e67dec17e5f7b293b`.

## Public-safe task brief

Continue the same Workspace Maintenance Agent task and correct two independent
security findings without changing the task ID:

1. arbitrary `workspace_exec` commands must not receive private/common Git state;
2. `workspace_publish` must reject dangerous effective repository/worktree Git
   configuration before any foreign-push or credential-program side effect.

Preserve useful read-only Git inspection, default-deny agent authority, the
existing developer bridge implementation, exact-SHA human authority over `main`,
and the schema-3 three-source package model. Keep protected issues #49/#53 and
their historical Scout state untouched.

## Re-established source state before record checkpoint

Immediately after the source correction and before the later task-record-only
checkpoint, independent remote readback established:

- template-development implementation head:
  `9d119a2432eacfe7c4655f18f6d40ebc34d1e2ef`
- developer: `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

The task record is intentionally updated after that source head, so the current
`template-development` tip must always be obtained by remote readback rather than
inferred from the implementation SHA recorded above.

`source-lock.json` remains unchanged and still exactly matches the live
main/developer/web heads. Issue #49 remains open with 254 comments and unchanged
`updated_at=2026-08-17T02:02:28Z`. Issue #53 remains open with 12 comments and
unchanged `updated_at=2026-08-17T11:45:43Z`. Issue #54 is this task's public-safe
continuation journal, remains open and unlabelled, and has no bridge activity.

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
- Created public-safe issue #54 under the same task ID; it remains intentionally
  unlabelled for bridge control.
- Did not touch protected #49/#53 or the historical stuck Scout request/session.
- The workspace/OpenCode mutating lane remains unavailable without disturbing the
  protected open bridge-control state, so the source correction used bounded
  connected-GitHub contents writes with exact readback.
- An attempted atomic Git-tree publication was refused by the connector before any
  tree/ref mutation; exact readback proved no branch effect, so it was not replayed.
  The correction was then published as bounded linear contents commits.

## Blockers / required decisions

1. **Exact current CI proof:** the full push-triggered validation result for the
   corrected head must be obtained from a surface that can read GitHub Actions
   check/run state for this push. CI success is currently UNKNOWN.
2. **Same-task schema-3 package supersession:** repository-owned behavior must be
   defined before changing generator/validator semantics or replacing the old
   package. The current tracked contract has no safe same-ID supersession path
   after package storage is already in history. A delta-only replacement is not
   accepted by inference.
3. Package generation itself must still run through the tracked generator on an
   authorized maintainer execution surface; hand-building package bytes is
   prohibited.

No human decision is needed about the two original security corrections; their
source implementation is complete. A human/repository-level design decision is
required before changing the package format/provenance contract to solve the
same-task supersession ambiguity.

Any `main` promotion remains a separate explicit exact-SHA human decision and is
not authorized here.

## Remaining work

1. Obtain exact successful full template-development validation for the final
   package-free correction/record head; correct only evidence-backed failures if
   any.
2. Decide and implement a repository-owned safe same-task package-supersession
   rule, or otherwise provide an authorized package path that preserves the full
   original feature plus these corrections without self-reference.
3. Generate the schema-3 package through the tracked generator on an authorized
   maintainer execution surface.
4. Validate and independently review exact package bytes, manifest provenance,
   source ranges, and canonical-tip relations.
5. Publish a dedicated final template-development handoff only after those steps.
6. Only after another clean independent review consider archival, downstream
   application, or any separately human-approved promotion workflow.

## Next action

Do not archive or promote. Resolve exact CI evidence and the same-task package
supersession contract while keeping the corrected source range, historical package,
protected issues, developer, main, and web-orchestration unchanged.

## Last historical handoff commit

`1f539586f382149a5d5a23bb62771165b880df0c`
