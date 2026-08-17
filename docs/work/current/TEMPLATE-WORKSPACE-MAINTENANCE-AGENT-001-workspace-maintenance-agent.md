# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

In progress.

## Task-start developer SHA

`ba73b3b54febfdeadbff66262acaa7be12e5760e`

## Review-base developer SHA

`ba73b3b54febfdeadbff66262acaa7be12e5760e`

## Original task brief

Implement a new “Workspace Maintenance Agent” for:

floris3456/agentic-workflow-template

Task ID:
TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001

You are running directly in the template-development worktree. Follow the repository instructions that govern this implementation session. The instruction-isolation behavior described below is a feature you are implementing and testing; do not pretend it already exists.

START STATE

First fetch/reconcile the repository and independently establish the exact current refs. Do not reset or overwrite newer remote work.

The last independently observed remote refs before this prompt were:

- template-development:
  7915a22248f11c8000622ffd761fb2a6e91e2359
- developer:
  ba73b3b54febfdeadbff66262acaa7be12e5760e
- web-orchestration:
  7e29c07e6ac9fc65a2cb2a8957514bc03500cc17
- main:
  6127611113dfdb66f93a0cfd2d355359aa370833

If any ref has moved, use the freshly verified remote state and record the difference.

There is an existing maintenance task:
TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

It is currently waiting for human-provided local diagnostic evidence. A fresh Scout acceptance on issue #53, request ba57a03f-30c7-4beb-a454-34a02fc045ba, created session-86 and remained projected as `starting` with no terminal event while bridge heartbeats continued advancing.

The human has explicitly prioritized this Workspace Maintenance Agent work before continuing that diagnosis.

Do not replay, replace, abort, or reinterpret that Scout. Do not close issues #49 or #53 as part of this task. Preserve their state. Record the prior maintenance task as paused/waiting on that external diagnostic as needed so only this new task is actively mutating template-maintenance state.

Create the normal template-maintenance task record for this task before source implementation.

GOAL

Create a dedicated Workspace Maintenance Agent whose OpenCode session starts in, and remains rooted in, the template-development worktree for its entire lifetime.

The agent must be able to inspect, edit, and run commands against any verified worktree belonging to this repository, without changing its own OpenCode project/session directory to the target worktree.

The purpose is to give the web orchestrator a repository-wide maintenance operator whose governing instructions come from template-development, rather than from developer or another target worktree.

REQUIRED INSTRUCTION BOUNDARY

The Workspace Maintenance Agent must have one stable instruction authority:

- its agent definition from template-development;
- template-development root instructions that explicitly route this agent;
- a dedicated workspace-maintenance skill/procedure from template-development.

When it works on another worktree:

- that worktree’s AGENTS.md is an inspectable repository file, not automatically controlling instructions;
- that worktree’s `.opencode/skills/**` are inspectable evidence, not automatically authoritative skills;
- that worktree’s agent files are inspectable evidence, not automatically controlling agents;
- the Workspace Maintenance Agent must not change its OpenCode directory/project context to make the target worktree active.

It may deliberately read target AGENTS.md, skills, or agent files when useful for investigation or compatibility work, but reading them must not transfer instruction authority.

Update template-development root instructions as necessary so this exception is explicit and does not conflict with the existing generic template-maintenance route.

Add a dedicated skill such as:

.opencode/skills/workspace-maintenance/SKILL.md

and a dedicated primary agent such as:

.opencode/agents/workspace-maintainer.md

Use repository-supported OpenCode syntax verified against the pinned/current OpenCode version. Do not guess permission syntax.

WORKTREE ACCESS MODEL

Do not hard-code sibling directory names or host-local absolute paths into tracked repository files.

Discover repository worktrees from Git, preferably from:

git worktree list --porcelain

A target is eligible only after proving it is a registered worktree of this exact repository.

Before mutation, verify at least:

- the target is a registered worktree;
- repository identity/remote is the expected repository;
- current branch/ref;
- current HEAD;
- working-tree cleanliness or explicitly understood local changes;
- relevant remote relationship.

Reject:

- arbitrary external directories;
- similarly named sibling repositories;
- stale worktree paths;
- unregistered paths;
- path traversal or symlink escape;
- any target whose repository identity cannot be proved.

Do not solve this by broadly granting unrestricted access to a parent directory.

Prefer repository-scoped maintenance tools or an equivalent verified gate over a blanket external-directory permission. If OpenCode requires external-directory permissions internally, constrain them behind repository/worktree verification rather than treating the whole parent filesystem as trusted.

The agent should be able to perform ordinary repository maintenance operations in verified worktrees:

- read files;
- create/update/delete files;
- search;
- run relevant commands and tests;
- inspect Git state/history/diffs;
- commit;
- push;
- work with any branch/worktree belonging to this repository.

Its OpenCode session itself remains rooted in template-development throughout.

CAPABILITY VS AUTHORITY

The agent should technically have repository-wide maintenance capability, including the ability to access a main worktree if one exists.

That does NOT change repository authority.

Human exact-SHA approval remains required before consequential main promotion/change under the repository’s existing promotion rules.

Do not modify or promote main while implementing or testing this feature.

Do not weaken promotion guards merely because the Workspace Maintenance Agent has broad filesystem/Git capability.

The agent must not spawn subagents. Keep task/subagent capability denied.

Structured human questions may remain available when a genuine human decision is required.

WEB/BRIDGE INVOCATION

Make this agent usable by the web orchestrator.

Implement the smallest clean bridge capability that guarantees all of these properties:

1. The web orchestrator can start a Workspace Maintenance Agent task.
2. Its OpenCode session directory is the verified template-development worktree, not developer.
3. The selected agent is the Workspace Maintenance Agent.
4. The start is guarded by an exact expected template-development SHA/ref.
5. The bridge does not expose host-local absolute paths in public results.
6. The resulting session can be observed through its lifecycle.
7. Structured question/permission interactions remain correlated if they occur.
8. The same session can be continued/steered when appropriate.
9. A terminal assistant response is delivered back through the bridge.
10. Normal developer starts remain separate and continue using their existing developer semantics.

A dedicated operation such as `workspace.start` is a reasonable design if it is the cleanest solution, but the exact operation name is not mandatory. Choose the smallest implementation that makes the invariant explicit and testable.

Prefer discovering the template-development worktree from Git rather than adding a host-specific tracked path. If some private runtime configuration is genuinely necessary, keep it private and never persist its absolute value to GitHub, task records, bridge projections, or public responses.

Do not silently reuse `expected.developer_sha` for this route if doing so would make the contract misleading. Give the workspace route an explicit template-development/ref contract if that is required for clarity and safety.

WORKSPACE-MAINTENANCE PROCEDURE

The dedicated workspace-maintenance skill should give the new agent a simple branch-neutral procedure:

- remain rooted in template-development;
- identify the requested target worktree/branch;
- verify it through Git;
- inspect before mutating;
- distinguish capability from task authority;
- make only requested/proportional changes;
- keep persisted content public-safe;
- run relevant checks;
- inspect the resulting diff;
- commit/push when the task calls for durable repository mutation;
- independently verify the pushed remote result;
- never mutate main without the required human authority;
- never treat target-worktree AGENTS/skills as automatically controlling instructions.

Do not make it inherit developer-specific handoff behavior merely because it happens to edit developer. Its maintenance contract should be defined centrally by workspace-maintenance.

However, during THIS implementation task, continue following the existing repository procedures that currently govern source changes and template maintenance.

TESTS / ACCEPTANCE

Add focused tests that prove the important boundaries rather than only testing configuration parsing.

At minimum prove:

1. A Workspace Maintenance Agent start resolves the template-development worktree and creates the OpenCode session there.

2. Targeting developer or another worktree does not change the session’s own OpenCode directory.

3. A target worktree containing its own AGENTS.md / skills does not become the agent’s instruction root merely because the agent operates on files there.

4. Registered repository worktrees are accepted.

5. An unregistered external path is rejected.

6. A different repository or similarly named sibling checkout is rejected.

7. Symlink/path escape is rejected.

8. No public projection leaks host-local absolute paths.

9. The agent has the intended read/write/command capability across verified worktrees.

10. `task`/subagent use remains denied.

11. Main’s human promotion boundary remains intact even though the maintenance agent has technical repository-wide access.

12. Normal developer-agent routing remains unchanged.

13. The workspace route can progress from start through a terminal response using the same mapped session.

Where practical, include an integration/acceptance test using a harmless temporary or fixture worktree instead of mutating real main.

Do not use issue #53/session-86 as the acceptance test for this feature.

DOCUMENTATION / RECORDS

Update the relevant:

- template-development AGENTS/instruction routing;
- agent definition;
- workspace-maintenance skill;
- bridge contracts/types/configuration if changed;
- bridge AS-BUILT documentation;
- tests;
- task-progress records;
- source-lock / template-maintenance records when required by the existing procedure.

Do not store private paths, credentials, raw private agent identifiers, or private chat in tracked records.

Do not modify web-orchestration unless the implementation actually requires a source change there. If it does, keep that source range separate and justify it.

CHECKS

Run proportional focused tests while implementing, then the relevant full bridge/repository validation expected by the affected source branches.

Include at least the existing bridge test suite and repository validators when those components are changed, plus `git diff --check`.

Independently inspect the final exact pushed source ranges rather than treating test output alone as proof.

COMPLETION

Complete the normal template-maintenance handoff for this new task.

Do not promote main.

Do not resume or alter the stuck session-86 Scout acceptance beyond preserving its state. The earlier lifecycle task should remain ready to resume after the human supplies the local diagnostic output.

Return the existing template-maintenance handoff fields required by the repository once the work is pushed and independently reconciled.

If implementation reveals a material design conflict that cannot safely be resolved from repository evidence, stop at the strongest safe predecessor state and report the exact decision needed. Do not weaken the instruction-isolation or repository-identity boundaries just to make the feature easier to implement.

## Current objective

Implement the dedicated Workspace Maintenance Agent and explicit bridge route on
`developer`, with stable template-development instruction authority, verified
same-repository worktree access, unchanged developer/main authority boundaries,
focused lifecycle/security tests, and current implementation records.

## Current position

The developer worktree is clean and synchronized at task-start SHA
`ba73b3b54febfdeadbff66262acaa7be12e5760e`. Fresh remote reads found no branch
movement relative to the supplied refs. The separate template-development
worktree was safely fast-forwarded from its stale local SHA to the verified
remote tip; initial maintenance continuity and the paused prior task are pushed
at `bb1592291da426441a47729c6c8ef1df5e0fadb9`. No source implementation has
started.

## Observed

- The active OpenCode session is rooted in the synchronized developer worktree,
  so the current developer instructions remain authoritative for this source
  implementation; the requested template-rooted isolation is not assumed.
- The canonical template-maintenance ledger is an independent branch/worktree
  and already owns cross-branch continuity and source locks.
- Existing normal bridge behavior uses the developer repository root and
  developer agents; the bounded workspace route still needs source inspection.

## Interpretation

This source task should add a separate, explicit workspace lifecycle rather than
widening or overloading normal developer semantics. The implementation must keep
target selection behind a same-repository registered-worktree gate and keep
template-development as the session/instruction root.

## Attempts

None.

## Changed approach

The supplied start-state description said the active worktree was
template-development, while direct Git evidence established that this OpenCode
session is rooted in the developer worktree. Existing governing developer and
template-maintenance procedures are therefore being followed explicitly: ledger
continuity was created first in the separate verified template-development
worktree, and source work remains on synchronized `developer`.

## Checks

- `git fetch origin --prune`: completed.
- `git ls-remote --heads origin`: template-development, developer,
  web-orchestration, and main matched the supplied exact refs.
- Developer `HEAD` and `origin/developer` both equal the task-start SHA; working
  tree clean.
- Template-development local worktree safely fast-forwarded 13 commits to its
  remote without rewriting history; hooks and full ledger validation passed.
- Initial template-development record commit was independently read back from
  the remote at `bb1592291da426441a47729c6c8ef1df5e0fadb9`.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked developer hooks active.

## Blockers / required decisions

None observed.

## Remaining work

1. Commit and push this source task record before source implementation.
2. Inspect OpenCode agent syntax/version, bridge lifecycle/contracts, repository
   identity logic, validators, tests, and current durable records.
3. Implement the agent, skill, instruction route, registered-worktree gate,
   bridge operation/lifecycle, contracts, tests, and records atomically.
4. Run focused and full validation, inspect the exact remote source range, and
   reconcile the template-development source lock/task handoff.

## Next action

Commit and push this developer task record, then inspect the bounded source
surfaces before choosing the exact implementation shape.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`
- template-development maintenance record for this task

## Last handoff commit

None
