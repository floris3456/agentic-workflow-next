# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Completed working cycle; the template-owned workspace gate and explicit bridge
route are reviewed, pushed, and packaged, with finalization and any `main`
promotion remaining separate human-controlled boundaries

## Task-start template-development SHA

7915a22248f11c8000622ffd761fb2a6e91e2359

## Review-base template-development SHA

7915a22248f11c8000622ffd761fb2a6e91e2359

## Public-safe task brief

Add a dedicated Workspace Maintenance Agent whose OpenCode session remains
rooted in the canonical `template-development` worktree while it performs
bounded maintenance in any worktree proven by Git to belong to the same
canonical repository. Give the agent one stable instruction authority from
`template-development`, reject unregistered, foreign, stale, or escaping target
paths, keep subagents denied and exact-SHA human authority over `main`, and add a
separate bridge route with explicit template-development ref guarding,
lifecycle/interaction continuity, public-safe projection, and unchanged normal
developer routing. Implement focused integration coverage without mutating
`main` or replaying the separate stuck Scout acceptance.

The earlier `TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002` maintenance task remains
paused with its protected issue and Scout state unchanged. This task did not
replay, replace, abort, close, or reinterpret that work.

## Current objective

Hand off the exact pushed source ranges, provenance package, reconciled source
snapshot, and validation evidence. No `main` promotion is authorized.

## Current position

Template-development commit `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`
owns the primary `workspace-maintainer`, its stable-authority skill, the pinned
OpenCode plugin, repository-scoped worktree gate, focused fixtures, validator
coverage, and matching AS-BUILT facts.

Developer implementation `f76dfbd2c103ae43605939ec999f7f846acf7286`
and task-record handoff `d24b67d78d58bd0c217530545ab0b548b64e2485`
are pushed. The bridge now accepts only explicit `workspace.start`, proves and
pins the registered template-development worktree and exact guarded ref, stores
a fail-closed durable workspace session kind, and routes the full session
lifecycle through the workspace runtime. Ordinary developer starts retain their
existing route. Runtime switching, caller agent override, alternate PTYs,
subagent delegation, and workspace attempts to promote `main` are denied.
Recovery, question/permission replies, steering, abort/finalize, and terminal
delivery stay in the original workspace session and re-prove the canonical
runtime. Public projections expose only repository-relative task evidence and
generic failures; host paths do not cross the public boundary.

The tracked generator fetched canonical history and created
`changes/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001/manifest.json` for exactly the
reviewed task range. Schema-2 provenance validation succeeds. The package
SHA-256 is `79815d273f90870b6e7acd7b6239d478c7573f76aba17196297edd0e299d915f`,
the developer patch SHA-256 is
`01dce71767159f1c8c8ca6db2e46c85833a981be73ed350d37e78448cc789c37`,
and the explicit empty web patch SHA-256 is
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
The source snapshot is reconciled to the exact independently verified canonical
refs listed below. Package/ledger commit
`9ad0913bc40692887f1eed5031c97d2512397961` is pushed and independently read
back. Only this dedicated handoff snapshot remains in the working cycle.

## Source ranges

- developer package: `ba73b3b54febfdeadbff66262acaa7be12e5760e..d24b67d78d58bd0c217530545ab0b548b64e2485`
- bridge implementation: `11f1f1178394bd0ff80116f4acf67958cdc08ace..f76dfbd2c103ae43605939ec999f7f846acf7286`
- developer handoff: `f76dfbd2c103ae43605939ec999f7f846acf7286..d24b67d78d58bd0c217530545ab0b548b64e2485` (task record only)
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`
- template-development implementation: `7915a22248f11c8000622ffd761fb2a6e91e2359..cd433706bfefebaf42a5de6ea1521ec61deb2c8a`

## Observed

- The existing bridge originally admitted ordinary developer starts but had no
  durable workspace task kind or second verified runtime.
- The template-owned gate independently derives eligible worktrees from Git,
  keeps instruction authority at template-development, and rejects foreign,
  unregistered, stale, symlinked, or escaping targets without returning host
  paths.
- A task's first accepted start permanently locks its developer/workspace kind,
  including a start that fails before OpenCode session creation.
- Workspace runtime initialization is lazy and retryable after transient setup
  failure; subsequent activity re-proves the same canonical worktree without
  requiring it to remain clean after authorized work begins.
- Persisted legacy sessions recover as developer sessions; null, unknown, or
  conflicting kinds fail closed.
- The developer implementation changed exactly 20 reviewed paths and did not
  alter the separate paused Scout records, `main`, or web-orchestration.

## Interpretation

Workspace maintenance is a distinct least-authority route rather than a widened
developer route. The session's project and instruction authority remain the
registered template-development worktree while repository-owned tools mediate
verified target access. Durable session kind, exact ref/worktree proof, and
runtime-specific recovery prevent a restart or interaction from crossing into
the normal developer runtime. Technical access still grants no authority to
promote `main`; exact-SHA human approval remains unchanged.

## Attempts

1. Established and pushed the template ledger record before source work.
2. Implemented and runtime-tested the template-owned workspace agent and gate,
   then pushed the template phase at `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`.
3. Established the developer task record and preserved a continuation handoff
   before bridge implementation.
4. Implemented the explicit workspace route, focused tests, protocol/schema
   updates, and current component AS-BUILT facts on developer.
5. Ordinary Git publication was blocked before remote ref mutation by the
   configured transport proxy. A bounded connected-GitHub fallback published
   exact staged trees to `developer`; cache-busted readback and later direct Git
   transport verified both exact commits and ancestry.
6. A proxy-bypassed canonical fetch/prune synchronized all four remote-tracking
   refs and an independent `ls-remote` returned the same exact tips.
7. The tracked package generator performed its sterile canonical fetch and
   generated the schema-2 package for only the reviewed task range.
8. Offline package verification and clean-base dry runs succeeded for both
   source targets, followed by full template-development validation.
9. Package/source-snapshot commit
   `9ad0913bc40692887f1eed5031c97d2512397961` was pushed; a fresh canonical
   fetch and independent remote readback returned that exact template-development
   tip while the three source refs remained unchanged.

## Changed approach

Source publication used a bounded connected-GitHub path only after normal Git
transport failed without mutating a ref. The fallback required the remote tree
to equal the local staged tree before advancing only `developer`. Package
generation later used the repository-owned generator through a working direct
canonical Git route; no package bytes or provenance rules were hand-built or
weakened.

## Checks

- `git fetch --prune origin` with the working direct transport: passed.
- Independent `git ls-remote --heads origin`: main
  `6127611113dfdb66f93a0cfd2d355359aa370833`, developer
  `d24b67d78d58bd0c217530545ab0b548b64e2485`, web-orchestration
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and template-development
  `cd433706bfefebaf42a5de6ea1521ec61deb2c8a` before this cycle's ledger commit.
- Remote developer compare: `11f1f1178394bd0ff80116f4acf67958cdc08ace..f76dfbd2c103ae43605939ec999f7f846acf7286`
  is ahead one, behind zero, with exactly the intended 20 paths.
- Developer `npm --prefix tools/opencode-bridge run build`: passed.
- Developer focused protocol/GitHub/state/workspace tests: passed 36/36.
- Developer full bridge tests: passed 113/113.
- Developer `./scripts/validate-opencode-bridge.sh`: passed, including the bridge
  contract/build/full test suite and 8/8 branch-initialization tests.
- Developer `./scripts/validate-repository.sh`: passed on the final source and
  handoff-record trees.
- Developer `./scripts/bootstrap-agent-workflow.sh --check`: passed.
- Developer `git diff --check`: passed.
- Template-owned gate fixture tests: passed 2/2; runtime agent/skill/tool
  resolution also passed before the template phase was pushed.
- Package manifest: schema 2, canonical-remote provenance, 20 exact developer
  paths, zero web paths, and both reviewed heads ancestor-of/equal-to their
  canonical tips.
- Developer package dry run from exact base: passed; empty web package dry run:
  passed.
- `node --test tests/change-package.test.mjs`: passed 5/5.
- `./scripts/validate-template-development.sh`: passed, including 7/7 tests and
  `git diff --check`.
- Public-path scan of the generated package and reconciled source snapshot:
  passed.
- Package/ledger remote readback: template-development
  `9ad0913bc40692887f1eed5031c97d2512397961`; developer
  `d24b67d78d58bd0c217530545ab0b548b64e2485`; web-orchestration
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`; main
  `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blockers / required decisions

None for this working cycle. Any future `main` promotion still requires explicit
human approval of an exact SHA.

## Remaining work

1. Push this dedicated template-development handoff snapshot.
2. Keep downstream application, task archival, and any `main` promotion as
   separate later workflows.

## Next action

Commit and push this task-record-only handoff snapshot, then independently verify
all four canonical refs remain at the recorded exact tips.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `source-lock.json`
- Developer implementation `f76dfbd2c103ae43605939ec999f7f846acf7286`
- Developer handoff `d24b67d78d58bd0c217530545ab0b548b64e2485`
- Change package `changes/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001/manifest.json`
- Package SHA-256 `79815d273f90870b6e7acd7b6239d478c7573f76aba17196297edd0e299d915f`
- Package/ledger commit `9ad0913bc40692887f1eed5031c97d2512397961`

## Last handoff commit

None; this dedicated handoff snapshot cannot record its own commit SHA.
