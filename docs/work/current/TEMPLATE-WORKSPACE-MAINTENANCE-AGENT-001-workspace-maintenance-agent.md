# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

## Status

Active; source implementation not yet started

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

Create the source-branch task record, inspect the current bridge and OpenCode
boundaries, then implement and verify the smallest explicit workspace route and
repository-scoped maintenance gate on `developer`.

## Current position

The canonical remote refs were freshly fetched and independently read as
template-development `7915a22248f11c8000622ffd761fb2a6e91e2359`, developer
`ba73b3b54febfdeadbff66262acaa7be12e5760e`, web-orchestration
`7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and main
`6127611113dfdb66f93a0cfd2d355359aa370833`. They match the last externally
observed refs. The local template-development worktree was clean but 13 commits
behind its remote and was fast-forwarded without rewriting history. No source
implementation has started.

## Source ranges

- developer: planned from `ba73b3b54febfdeadbff66262acaa7be12e5760e`
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

## Interpretation

The workspace route must be explicit rather than a widened developer route:
session root and instruction authority belong to template-development, while
target-worktree access is separately verified and capability does not grant
authority to mutate `main`.

## Attempts

None.

## Changed approach

Human priority pauses the lifecycle diagnosis before any replay, replacement,
abort, closure, or reinterpretation of its Scout. Workspace-maintenance source
work proceeds first as a separate task.

## Checks

- `git fetch origin --prune`: completed; only the local remote-tracking
  template-development ref advanced to the already externally observed SHA.
- `git ls-remote --heads origin`: all four canonical refs match the externally
  observed values.
- Local developer is clean and equals `origin/developer`.
- Local template-development was clean, fast-forwarded to
  `origin/template-development`, and its tracked hooks check passed.

## Blockers / required decisions

None for this task.

## Remaining work

1. Create the normal developer source-task record before implementation.
2. Inspect supported OpenCode and bridge contracts and design the bounded route.
3. Implement agent instructions, workspace procedure, verified access gate,
   bridge lifecycle route, focused tests, and current AS-BUILT records.
4. Run focused and full validation, inspect pushed source ranges, reconcile the
   source snapshot, and prepare the normal maintenance handoff.

## Next action

Commit and push this initial ledger record, then create the developer source task
record before changing source.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

None
