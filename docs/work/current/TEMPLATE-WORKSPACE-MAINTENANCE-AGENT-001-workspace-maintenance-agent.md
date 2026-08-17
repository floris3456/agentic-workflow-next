# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Active; template-owned workspace gate implemented, bridge route pending

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

The earlier `TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002` maintenance task is paused
while awaiting human-provided local diagnostic evidence. Its issue and Scout
state remain preserved; this task is the only actively mutating
template-maintenance task.

## Current objective

Implement and verify the explicit bridge route on `developer` without changing
normal developer routing, then reconcile the exact source range and package the
completed maintenance task.

## Current position

The initial ledger record was pushed at
`bb1592291da426441a47729c6c8ef1df5e0fadb9`, and the required developer source
record was then pushed at `217bee68d877926d5bea5b8e9a77a71b44cc6610`
before bridge source edits. Template-development now owns a primary
`workspace-maintainer`, its stable-authority skill, a pinned local OpenCode
plugin, the repository-scoped worktree gate, fixture acceptance tests, validator
coverage, and matching AS-BUILT facts. The gate was exercised against harmless
temporary canonical and foreign repositories and runtime-loaded through
OpenCode. Developer bridge implementation has not yet started.

## Source ranges

- developer: active from `ba73b3b54febfdeadbff66262acaa7be12e5760e`;
  task-record-only head currently `217bee68d877926d5bea5b8e9a77a71b44cc6610`
- web-orchestration: no source change planned; current
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- The existing bridge starts normal implementation sessions in the developer
  worktree and keeps external-directory access at approval by default.
- The template-development ledger already centralizes reusable-template
  continuity but does not yet provide a repository-wide Workspace Maintenance
  Agent route.
- The earlier lifecycle task's fresh Scout acceptance created `session-86` for
  issue #53/request `ba57a03f-30c7-4beb-a454-34a02fc045ba`; its projection
  remained `starting` without a terminal event while bridge heartbeats advanced.
- OpenCode project plugins under `.opencode/plugins/` load automatically. The
  repository's plugin helper contract is pinned at `1.18.16`; the locally
  installed CLI used for runtime endpoint inspection reports `1.18.18`.
- The existing bridge has one developer-rooted OpenCode client and recovery
  coordinator. Command admission, GitHub first-command handling, and persisted
  task sessions currently distinguish ordinary `start` but no workspace start.

## Interpretation

The workspace route must be explicit rather than a widened developer route:
session root and instruction authority belong to template-development, while
target-worktree access is separately verified and capability does not grant
authority to mutate `main`. Repository-scoped plugin tools are preferable to a
parent-directory allow rule: they can derive eligible targets from Git, require
exact HEAD/status preflight, keep builtin shell/edit and subagents denied, and
omit host paths from their public results.

## Attempts

- The first direct gate smoke rejected NUL-delimited worktree inventory as
  binary. Inventory/status decoding was separated from ordinary UTF-8 file and
  command-output decoding, which remains binary-rejecting.
- Initial focused testing exposed the same NUL handling for dirty Git status and
  retained command newlines. The implementation and exact expectations were
  corrected, after which both fixture tests passed.
- Initial full validation traversed generated `.opencode/node_modules` and
  treated the imported library as an executable. Validation now explicitly
  excludes ignored generated dependencies and reserves executable-bit checks for
  CLI scripts.

## Changed approach

Human priority pauses the lifecycle diagnosis before any replay, replacement,
abort, closure, or reinterpretation of its Scout. Workspace-maintenance source
work proceeds first as a separate task. Because the actual connected OpenCode
session was developer-rooted rather than template-development-rooted, the ledger
record was established first and cross-worktree implementation used explicit
verified local Git operations; the feature itself was not assumed before its
gate existed.

## Checks

- `git fetch origin --prune`: completed; only the local remote-tracking
  template-development ref advanced to the already externally observed SHA.
- `git ls-remote --heads origin`: all four canonical refs match the externally
  observed values.
- Local developer is clean and equals `origin/developer`.
- Local template-development was clean, fast-forwarded to
  `origin/template-development`, and its tracked hooks check passed.
- Developer source task-record commit
  `217bee68d877926d5bea5b8e9a77a71b44cc6610` was pushed before source edits;
  its focused agent-system validation passed.
- `node --test tests/workspace-maintenance.test.mjs`: passed 2/2, including
  multiple registered branches and detached evidence, foreign/unregistered/
  stale/symlink rejection, instruction-root stability, exact-preflight
  read/write/delete/command/commit/push capability, and public-path omission.
- Direct Bun import resolved all eight plugin tools against pinned
  `@opencode-ai/plugin` `1.18.16`.
- OpenCode config resolution preserved `template-maintainer` as default and
  resolved `workspace-maintainer` as Sol/high primary with builtin shell/edit,
  external-directory, and task denial. Authenticated local server endpoints
  resolved the workspace agent, skill, and all eight custom tool IDs.
- `./scripts/validate-template-development.sh`: passed, including 7/7 tests and
  `git diff --check`.

## Blockers / required decisions

None for this task.

## Remaining work

1. Commit and push the template-owned Workspace Maintenance Agent/gate phase.
2. Implement the separate template-development-rooted bridge start, guard,
   lifecycle, interaction, recovery, and terminal-delivery route on `developer`.
3. Add focused bridge contract, compatibility, routing, projection, recovery,
   and fixture acceptance tests plus component AS-BUILT facts.
4. Run focused and full validation, independently inspect pushed source ranges,
   reconcile the source snapshot, create the deterministic change package, and
   prepare the normal maintenance handoff snapshot.

## Next action

Commit and push the template-owned Workspace Maintenance Agent/gate phase, then
implement the explicit bridge route from the already-established developer task
record.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

None
