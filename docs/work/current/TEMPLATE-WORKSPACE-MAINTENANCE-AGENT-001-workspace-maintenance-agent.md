# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

Paused at a requested continuation boundary; bridge source remains pending.

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

Continue from the pushed template-owned Workspace Maintenance Agent/gate and
implement the smallest explicit template-development-rooted bridge lifecycle on
`developer`, preserving normal developer behavior and all existing recovery and
human-authority boundaries.

## Current position

The template-owned implementation is pushed and independently read back at
template-development `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`. It adds the
`workspace-maintainer` primary agent, stable-authority skill and root routing,
the pinned `workspace_*` OpenCode plugin, a registered-worktree gate, fixture
tests, validator coverage, and matching template AS-BUILT facts. Its focused
fixture tests passed 2/2 and full template validation passed 7/7.

Developer remains clean and synchronized at the task-record-only SHA
`217bee68d877926d5bea5b8e9a77a71b44cc6610` before this handoff snapshot. No
bridge implementation change is retained. An interdependent workspace-session
routing refactor was explored, then deliberately restored before this requested
new-chat handoff rather than publishing a partial, non-compiling bridge state.
Web-orchestration remains `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
and main remains `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- The active OpenCode session is rooted in the synchronized developer worktree,
  so the current developer instructions remain authoritative for this source
  implementation; the requested template-rooted isolation is not assumed.
- The canonical template-maintenance ledger is an independent branch/worktree
  and already owns cross-branch continuity and source locks.
- Existing normal bridge behavior uses the developer repository root and
  developer agents.
- `CommandEnvelope.expected`, command schema/admission, and `CommandExecutor`
  currently guard only `developer_sha`/`developer`; GitHub issue admission treats
  only `start` as the first mutating command.
- `BridgeService` owns one developer-directory `OpenCodeClient`, one developer
  recovery coordinator, and one developer response transport. `TaskSession`,
  session bindings, event kinds, and terminal response deliveries do not persist
  a workspace task-session kind.
- Continuation steering, finalization, question/permission replies, canonical
  interaction recovery, terminal recovery, and response delivery all reuse the
  mapped task session. They can support workspace sessions safely only if client
  selection is based on a durable session kind rather than an agent-name guess.
- `PublicProjection` already redacts configured roots and generic absolute paths;
  a lazily discovered template worktree should still be registered as an
  additional private root before any workspace result is projected.
- The template-development worktree must be discovered from NUL-delimited
  `git worktree list --porcelain -z`, then proven real/non-symlink, same common
  Git directory, exact configured GitHub repository, branch/ref/HEAD/status, and
  remote relationship. No tracked configuration path is needed.

## Interpretation

This source task should add a separate, explicit workspace lifecycle rather than
widening or overloading normal developer semantics. The implementation must keep
target selection behind a same-repository registered-worktree gate and keep
template-development as the session/instruction root. A dedicated
`workspace.start` command with
`expected.template_development_sha`/`expected.ref: template-development` is the
clearest bounded contract. The service should resolve and cache the private
template worktree lazily so ordinary developer service startup remains unchanged
when that worktree is unavailable. Workspace start should require clean,
synchronized exact template state; same-session recovery/continuation after start
must allow the agent's expected dirty or advanced state while re-proving the same
registered worktree and instruction root.

## Attempts

- A partial cross-file draft added a workspace session kind to bridge types/state,
  a `workspace.start` protocol shape, and workspace recovery/response hooks.
  Because the user requested an immediate new-chat handoff before command/service
  routing, migration tests, and component records could be completed, that draft
  was abandoned and all bridge source/schema edits were restored. Reuse the
  architecture below, but do not assume any of that partial code exists.

## Changed approach

The supplied start-state description said the active worktree was
template-development, while direct Git evidence established that this OpenCode
session is rooted in the developer worktree. Existing governing developer and
template-maintenance procedures are therefore being followed explicitly: ledger
continuity was created first in the separate verified template-development
worktree, and source work remains on synchronized `developer`. The user then
requested updated task files and a new-chat continuation prompt. The working tree
was returned to a coherent source baseline; only this handoff record is retained
on developer for the boundary.

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
- Template-development gate commit
  `cd433706bfefebaf42a5de6ea1521ec61deb2c8a` was pushed and independently read
  from `origin/template-development`.
- `node --test tests/workspace-maintenance.test.mjs` on template-development:
  passed 2/2, including registered developer/main/detached access, foreign,
  unregistered, stale, path-like, and symlink rejection, stable root authority,
  exact preflight file/command/commit/push capability, and host-path omission.
- Direct Bun import resolved 8/8 custom tools against pinned
  `@opencode-ai/plugin` `1.18.16`; OpenCode config/server inspection resolved the
  Sol/high primary agent, skill, permissions, and all eight tool IDs.
- `./scripts/validate-template-development.sh`: passed 7/7 tests plus ledger and
  diff checks before the template implementation commit.
- Fresh developer-side `git fetch origin --prune` and exact ref reads found
  developer `217bee68d877926d5bea5b8e9a77a71b44cc6610`, template-development
  `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`, web-orchestration
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and main
  `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `./scripts/validate-repository.sh`: passed at the handoff boundary, including
  104/104 existing bridge tests, 8/8 template-branch tests, structure, links,
  agent-system, research, bridge contracts/build, hooks, and diff checks.
- `./scripts/bootstrap-agent-workflow.sh --check`: passed again at handoff;
  `git diff --check` produced no findings.

## Blockers / required decisions

No technical decision is pending. Implementation is intentionally paused only
because the user requested continuation in a new chat. The next developer must
independently fetch/recheck refs and continue without touching issue #49, issue
#53, or preserved `session-86`.

## Remaining work

1. Add a bridge-owned template-worktree resolver with harmless fixture tests. It
   should lazily discover `refs/heads/template-development`, reject missing,
   ambiguous, stale, foreign, unregistered, or symlinked entries, verify exact
   GitHub identity/common directory, and expose no path publicly.
2. Add `workspace.start` plus an explicit lowercase 40-character
   `expected.template_development_sha` and exact
   `expected.ref: template-development` to parser, JSON schema, state admission,
   GitHub first-mutating-command logic, and protocol documentation. Keep ordinary
   `start`/promotion guards unchanged.
3. Persist `TaskSession.sessionKind` (`developer` or `workspace`) through a
   fail-safe SQLite migration. Propagate it through session bindings, event
   correlation, task status, terminal-delivery recovery, and response kind.
4. Route workspace start/create/prompt, live status, steer/finalize, abort,
   generic requests, structured replies, continuation proof/nudge, durable and
   canonical recovery, and terminal message delivery through an OpenCode client
   whose fixed directory is the verified template worktree. Keep the selected
   agent fixed at `workspace-maintainer`; reject workspace route changes and
   workspace PTYs unless a separately justified safe design is implemented.
5. Resolve/cache that workspace runtime lazily in `BridgeService`, register its
   directory with public projection, and use session-kind-filtered recovery so a
   developer client never recovers a workspace session or vice versa. On restart,
   re-prove the current registered template worktree without requiring it to be
   clean or still at the start SHA.
6. Add focused command, protocol/GitHub, state-migration, projection, recovery,
   handoff, service/routing, and harmless registered-worktree integration tests.
   Prove unchanged normal developer routing and exact same-session terminal flow.
7. Update `contracts/opencode-bridge/protocol.md`,
   `docs/architecture/opencode-bridge.md`, `tools/opencode-bridge/AS-BUILT.md`,
   this task record, and a deviation record only if implementation materially
   differs from the accepted architecture.
8. Run the focused bridge suite, `npm run build`,
   `./scripts/validate-opencode-bridge.sh`, `./scripts/validate-repository.sh`,
   and `git diff --check`; then commit/push implementation and the required
   handoff snapshot, independently inspect the remote source range, and return to
   template-development for source-lock/package/handoff reconciliation.

## Next action

In the new chat, resume this exact task from the latest synchronized
`origin/developer` containing this record. Load the required repository skills,
read the original brief and this continuation state, independently verify all
four refs, inspect template-development commit
`cd433706bfefebaf42a5de6ea1521ec61deb2c8a`, then implement Remaining work item 1
without replaying or altering the preserved Scout task.

## Continuation prompt

Continue task `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` in the canonical
`developer` worktree. Follow root `AGENTS.md`; load `task-workflow`,
`implementation-records`, and `git-sync-and-handoff`; do not launch subagents or
inspect `web-orchestration`. Fetch/prune and independently verify current refs
before editing. Read this entire task record first. The template-owned agent,
skill, plugin, verified worktree gate, tests, and AS-BUILT are already pushed at
template-development `cd433706bfefebaf42a5de6ea1521ec61deb2c8a`. Developer has
no retained bridge implementation from the prior partial draft: begin from the
clean synchronized source represented by the latest `origin/developer` containing
this handoff record. Implement the explicit `workspace.start` architecture in
Remaining work as one coherent, tested change, keeping normal developer routing,
same-session interaction/recovery/terminal delivery, public path redaction,
subagent denial, and human exact-SHA authority over `main` unchanged. Do not
modify issues #49/#53 or replay/replace/abort/reinterpret `session-86`. Keep
component AS-BUILT and this task record atomic with source facts, push every
commit immediately, and finish with the required developer handoff snapshot.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`
- template-development
  `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-workspace-maintenance-agent.md`
- template-development `scripts/workspace-maintenance-lib.mjs`
- template-development `.opencode/plugins/workspace-maintenance.ts`

## Last handoff commit

None
