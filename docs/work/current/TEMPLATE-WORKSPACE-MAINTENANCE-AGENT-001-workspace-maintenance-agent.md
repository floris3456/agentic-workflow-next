# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Blocked in independent review pending a second security-correction cycle. The prior
completed handoff remains historical implementation evidence but is superseded by
new findings against the exact pushed implementation. No `main` promotion is
authorized.

## Task-start template-development SHA

7915a22248f11c8000622ffd761fb2a6e91e2359

## Review-base template-development SHA

1f539586f382149a5d5a23bb62771165b880df0c

## Public-safe task brief

Continue the existing Workspace Maintenance Agent template task without changing
its task ID. Correct two independently reproduced security gaps: arbitrary
`workspace_exec` commands must not receive the repository's private Git-common
state, and `workspace_publish` must reject dangerous effective repository/worktree
Git configuration before any credential-program or foreign-push side effect.
Preserve useful read-only Git inspection, default-deny agent authority, normal
developer routing, exact-SHA human authority over `main`, and the existing
three-source schema-3 package model. Keep `main`, `web-orchestration`, the paused
lifecycle task, protected control issues #49/#53, and their historical Scout state
unchanged.

## Current objective

Produce a package-free corrected `template-development` head that closes both
security blockers with adversarial tests, run the complete relevant template
validation, independently review the exact pushed range, then regenerate and
verify the schema-3 package from the corrected reviewed template head and the
exact live source handoffs.

## Current position

Independent remote readback on 2026-08-18 re-established the exact canonical
heads before this cycle:

- template-development: `1f539586f382149a5d5a23bb62771165b880df0c`
- developer: `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

`source-lock.json` exactly matches the live main/developer/web heads above and is
therefore not moved by this reopen checkpoint.

The previous correction fixed the earlier four review findings: Bubblewrap
containment replaced cwd-only host execution; publication became a separate fixed
broker; workspace-maintainer became mechanically default-deny; and a real pinned
OpenCode 1.18.16 lifecycle harness exercised the production bridge route. The
schema-3 package was generated and validated from exact reviewed ranges.

A deeper independent review then found two new blockers in the exact live
`scripts/workspace-maintenance-lib.mjs`:

1. `sandboxCommand` read-only binds the complete real common Git directory to
   `/repo.git` and sets `GIT_COMMON_DIR=/repo.git`. That exposes private bridge
   state stored beneath the common `.git` as well as broader local-only Git state
   to arbitrary allowed workspace commands. Existing containment fixtures only
   use a sentinel outside the repository and do not cover this confidentiality
   boundary.
2. `assertSafeGitMetadata` reads only `git config --local --name-only --list`.
   It does not reject `url.*.pushInsteadOf` or `core.askPass`, and it misses
   worktree-specific settings when `extensions.worktreeConfig=true`. A canonical
   post-push readback is too late because a foreign push or askpass execution may
   already have happened.

Issue #54 is a public-safe journal for this same task. It is intentionally not a
bridge-controlled mutating issue. The workspace/OpenCode route cannot be started
without conflicting with protected open mutating issue #49, which the human has
explicitly required this task not to replay, close, abort, replace, or otherwise
touch. This correction therefore uses bounded connected-GitHub source edits plus
remote CI/readback rather than forcing the unavailable workspace mutation lane.

## Source ranges

Historical reviewed package ranges retained as evidence:

- template-development: `7915a22248f11c8000622ffd761fb2a6e91e2359..d509bf3fd0d3a4622d080f920aca6c122f77624d`
- developer: `ba73b3b54febfdeadbff66262acaa7be12e5760e..3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

Historical correction checkpoints:

- template-development containment/runtime implementation:
  `33227b741c0dc2909ed8ca8dc00ea1b28963febc`
- previous package-free reviewed template head:
  `d509bf3fd0d3a4622d080f920aca6c122f77624d`
- previous package/ledger commit:
  `66a8289fc112de4546ea9cee1933a8c056fd0ba7`
- previous template handoff:
  `1f539586f382149a5d5a23bb62771165b880df0c`
- developer real-runtime harness:
  `f455d6269678dbbab3783fd845ef26e0227c7ed7`
- developer OAuth/provider correction:
  `1b7fb2bce9d9bf23e107d808632066c62fe4c13c`
- developer handoff:
  `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`

Superseded original rejected evidence remains historical:

- developer implementation: `f76dfbd2c103ae43605939ec999f7f846acf7286`
- developer handoff: `d24b67d78d58bd0c217530545ab0b548b64e2485`
- template-development implementation: `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`
- template-development package/ledger: `9ad0913bc40692887f1eed5031c97d2512397961`
- template-development handoff: `fb903dafdb2713621abbfe86b220f26c8d26a6e0`

The new correction range begins after this review-reopen checkpoint. Exact head
will be recorded only after remote publication and readback.

## Observed

- `sandboxCommand` currently mounts the whole common Git directory read-only at
  `/repo.git` and the worktree Git directory at `/worktree.git`.
- The repository's bridge configuration intentionally stores local/private bridge
  state beneath the common `.git`, so mounting the whole common directory violates
  the workspace command confidentiality boundary even though writes are denied.
- Useful ordinary Git inspection does not require exposing every common-Git file;
  the command sandbox needs only a sanitized read-only metadata/object view or a
  separately brokered inspection surface.
- `assertSafeGitMetadata` currently derives unsafe names exclusively from
  `git config --local --name-only --list`.
- `url.*.pushInsteadOf` can rewrite only push destinations; canonical pre/post
  `ls-remote` does not prevent that foreign side effect.
- `core.askPass` can name an executable credential prompt helper even when
  terminal prompting is disabled.
- Worktree-specific config can override common repository config when
  `extensions.worktreeConfig=true`, and `--local` alone does not enumerate those
  effective values.
- Existing workspace tests cover host secret absence, outside read/write denial,
  symlink escape, network denial, foreign Git routes, sandbox ref persistence,
  `main` denial, pushurl rejection, and stale canonical heads, but not these two
  new adversarial cases.

## Interpretation

The first blocker is a confidentiality failure in the arbitrary-command sandbox,
not merely a path-redaction defect: private state must never become readable in
that namespace. The safest design is to avoid mounting the real common directory
and instead materialize a temporary sanitized read-only Git view containing only
required public repository metadata/objects/refs for the selected worktree, or
move Git inspection behind a fixed broker if a sanitized view cannot preserve
ordinary commands safely.

The second blocker must be prevented before any push/credential resolution.
Publication should audit the complete effective repository-local configuration,
including worktree scope when enabled, reject push-only URL rewriting and askpass
programs, and set fixed non-executing askpass environment values as defense in
depth. Tests must assert rejection occurs before foreign-remote or askpass sentinel
side effects.

The publisher's current canonical GitHub HTTPS-only production origin restriction
is left unchanged in this security cycle. Its broader SSH/custom-host
compatibility is a separate non-blocking design question and must not be widened
until the transport security model is explicit.

## Attempts

- Re-established all four exact remote refs through connected GitHub before
  relying on prior handoff state.
- Read the exact template-maintenance agreement, maintenance skill,
  `source-lock.json`, current task record, task template, and live implementation.
- Independently confirmed both new findings against the exact
  `template-development` blob.
- Searched open control issues: #49 and #53 are the only protected open
  `agentic-bridge` issues; no issue was bound to this task ID.
- Created public-safe issue #54 for continuity under the same task ID. It remains
  intentionally unlabelled for bridge control because the one-open-mutating-issue
  gate and the human's no-touch requirement on #49 make a new workspace mutation
  session unavailable.

## Changed approach

The prior completed handoff is no longer treated as final. This cycle first
publishes this task-record-only reopen checkpoint, then uses a bounded direct
connected-GitHub correction on exact known template paths. Remote GitHub Actions
and exact post-push diff/readback provide the execution evidence unavailable in
this web runtime. No bridge/OpenCode mutation is claimed for this cycle unless the
protected issue constraint later changes explicitly.

## Checks

Historical successful checks retained as evidence, not as proof of the new
correction:

- template-development workflow run `32081956594` passed on package-free head
  `d509bf3fd0d3a4622d080f920aca6c122f77624d`.
- workflow run `32082204637` passed on package/ledger commit
  `66a8289fc112de4546ea9cee1933a8c056fd0ba7`.
- workflow run `32082313822` passed on handoff
  `1f539586f382149a5d5a23bb62771165b880df0c`.
- the previous real OpenCode 1.18.16 OAuth-backed lifecycle acceptance succeeded
  and left the source worktrees unchanged.

New-cycle checks are pending implementation. Required minimum is focused
adversarial workspace-maintenance tests plus the complete tracked
`validate-template-development` workflow on every substantive corrected head and
package/handoff checkpoint.

## Blockers / required decisions

No human decision is required to implement the two security corrections. The
workspace/OpenCode mutation lane is unavailable while protected #49 remains open
and untouched, so the selected route is direct connected-GitHub mutation with CI.

The task remains blocked in independent review until both blockers are corrected,
new adversarial tests pass, exact remote source ranges are re-reviewed, and the
schema-3 package is regenerated/verified from the corrected package-free head.

Any `main` promotion remains a separate explicit exact-SHA human decision and is
not authorized here.

## Remaining work

1. Correct the Git-common confidentiality boundary without exposing private
   `.git` state while preserving useful read-only Git inspection.
2. Correct effective local/worktree Git-config validation, reject
   `url.*.pushInsteadOf` and `core.askPass`, and pin non-executing askpass fallback.
3. Add adversarial common-Git private-state and worktree-config/push/askpass tests
   proving rejection or inaccessibility before side effects.
4. Run full template-development validation and inspect the exact pushed range.
5. Regenerate schema-3 package from the new package-free reviewed template head
   and the exact corrected developer/web heads if they remain unchanged.
6. Validate and independently review package bytes/provenance and create a new
   dedicated template-development handoff snapshot.
7. Only after another clean independent review consider archival, downstream
   application, or a separately authorized promotion workflow.

## Next action

Independently read back this task-record-only reopen checkpoint, then correct
`scripts/workspace-maintenance-lib.mjs` and `tests/workspace-maintenance.test.mjs`
with the smallest design that proves both security boundaries without widening
publication transport support.

## Relevant durable records

- current task record:
  `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-workspace-maintenance-agent.md`
- public-safe continuation journal: issue #54
- final previous schema-3 package:
  `changes/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001/`
- previous package binding SHA-256:
  `78fbf87877d48810c527fbdb0a055d345bbeaa9cddff7efc4a9c0bf777df6d60`
- previous manifest SHA-256:
  `f0036c692c09f8ccb73d769ff0a520f437913ba559f5eeefb69346513fd42686`
- previous package/ledger commit:
  `66a8289fc112de4546ea9cee1933a8c056fd0ba7`
- previous package-free reviewed head:
  `d509bf3fd0d3a4622d080f920aca6c122f77624d`
- previous developer handoff:
  `3d3cbad9f423cc4d80aaff8a0fba86a16300c502`
- unchanged web source handoff:
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`

## Last handoff commit

1f539586f382149a5d5a23bb62771165b880df0c
