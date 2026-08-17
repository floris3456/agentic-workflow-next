# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

Developer correction complete after independent review. The real pinned-OpenCode
bridge lifecycle acceptance succeeded without repository mutation, and the
corrected developer implementation is pushed. Overall template maintenance
remains active only for the final portable package and ledger handoff.

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

Add the missing real-runtime acceptance proof for the already-implemented
template-development-rooted workspace bridge route while preserving its reviewed
session-kind, recovery, interaction, terminal-delivery, public-projection, and
ordinary developer-routing behavior. Do not change `main`, web-orchestration, or
the protected paused Scout/#49/#53 state.

## Current position

Independent correction-cycle reconciliation found developer still at the prior
handoff `d24b67d78d58bd0c217530545ab0b548b64e2485`, main at
`6127611113dfdb66f93a0cfd2d355359aa370833`, and web-orchestration at
`7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`. Template-development advanced only
through the reviewed correction ledger/runtime work and is now
`dfbfeaa2cdd513e7f5012b3829179c596d9c0d80`; its corrected containment/package
implementation checkpoint is
`33227b741c0dc2909ed8ca8dc00ea1b28963febc`.

The prior developer implementation remains published at
`f76dfbd2c103ae43605939ec999f7f846acf7286`, with its historical handoff at
`d24b67d78d58bd0c217530545ab0b548b64e2485`. The correction-cycle reopening
record is published at `183402e259a5f8367f3f4cc233fc8b3c490140c1`.
A tracked real-runtime acceptance harness and its architecture, component,
operator, and validator records were published at
`f455d6269678dbbab3783fd845ef26e0227c7ed7`. Its first model-backed attempt
exposed a missing OAuth-provider precondition; the smallest launcher/gate
correction is published at `1b7fb2bce9d9bf23e107d808632066c62fe4c13c`.
The fresh credentialed acceptance then passed from the clean synchronized
developer worktree. A dedicated developer handoff snapshot is now the only
remaining source-branch action.

Main remains `6127611113dfdb66f93a0cfd2d355359aa370833` and
web-orchestration remains `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`.
Neither branch has been modified.

Independent review accepted the core bridge routing but found the lifecycle
suite relied on fake OpenCode clients. The new operator-run harness starts a
fresh exact OpenCode 1.18.16 process with sterile temporary HOME/XDG state and
exactly one explicitly supplied private OpenAI credential source. It uses the
production bridge executor, clients, durable state, recovery, projection, and
response transport; deterministic doubles remain focused regression coverage,
not the live acceptance authority.

## Observed

- Ordinary network `git fetch --prune origin` was attempted twice and failed
  before ref mutation with an HTTP CONNECT 403 from the execution environment.
  Authenticated GitHub ref reads independently returned exactly the four expected
  branch heads, and local tracking refs matched all four; no stale branch ref was
  present to prune.
- The bridge now discovers `refs/heads/template-development` only from
  NUL-delimited registered Git worktree inventory and rejects missing, duplicate,
  stale, bare, symlinked, foreign-repository, origin-mismatched, branch-mismatched,
  or changed registrations using fixed public-safe errors.
- Workspace start fetches the explicit remote ref and requires a clean registered
  worktree at the exact lowercase expected template-development SHA/ref. Runtime
  and restart re-proof allow expected post-start dirt or advancement while keeping
  the same canonical registered worktree.
- SQLite schema version 5 persists fail-closed `developer` or `workspace` task
  session kind; legacy rows migrate to developer and null/unknown kinds are
  rejected.
- The fixed `workspace-maintainer` client handles start, live status,
  steer/finalize, generic operations, permission/question replies and
  continuation recovery, abort, durable/canonical recovery, and terminal
  response delivery. Global and per-session recovery are kind-filtered.
- Workspace route changes, all bridge PTYs, main promotion, caller agent
  overrides, and cross-kind restart attempts are rejected. Normal developer
  start/routing and exact-SHA human authority over `main` remain unchanged.
- The discovered private root is registered dynamically with public projection;
  focused output and error tests prove that no local absolute worktree path is
  published.
- Issues #49 and #53 and preserved session-86 were not read, modified, replayed,
  replaced, aborted, or reinterpreted.
- A fresh proxy-bypassed canonical fetch plus independent `ls-remote` readback
  established all four current refs before correction mutation; the developer
  worktree was clean, on `developer`, synchronized, and had active tracked hooks.
- The runtime smoke queries the actual agent, skill, tool, and project inventories
  from template-development before creating the bridge task. Effective
  last-match permissions must deny every discovered tool except the bounded
  workspace surface and question, and must deny every discovered skill except
  `workspace-maintenance`.
- Its workspace command performs only `git status --short` through
  `workspace_exec` against the verified developer worktree. The harness proves
  meaningful workspace tool progress, target instructions as evidence only,
  same-session steering, canonical terminal recovery, response transport, and
  public path redaction, then proves an independent normal developer session.
- The runtime receives neither the host environment nor general host credential
  state. One mode-private credential file is validated, copied into temporary
  runtime state, and removed afterward. Helper Git reads use fixed arguments and
  sterile global/system configuration.
- The successful fresh run used real OpenCode 1.18.16 and the production bridge
  path. It proved the template-development project root, fixed
  `workspace-maintainer`, connected expected provider/model, effective
  default-deny inventory, `workspace-maintenance` loading, all four required
  workspace operations including sandboxed `git status --short`, unchanged
  project/session/skill context after reading developer instructions, two
  terminal phases on one mapping, canonical recovery/public delivery without
  local paths, and a separate `small-developer` session.
- The successful smoke removed all temporary runtime state and left both
  developer and template-development clean at their exact remote heads. It did
  not access or mutate `main`, web-orchestration, issues #49/#53, or the paused
  Scout lifecycle state.

## Interpretation

The harness adds acceptance evidence without changing route semantics. Durable
session kind remains the sole runtime selector after the first accepted start,
while exact Git identity and worktree registration remain the technical target
gate. Neither capability grants promotion authority. No deviation record is
required.

## Attempts

- The ordinary fetch/prune route was retried once, then replaced only for
  independent read verification by authenticated GitHub ref inspection.
- A build exposed that one gated edit had read only the first 500 lines of
  `service.ts`. The omitted unchanged tail was restored from the exact committed
  blob through the verified gate before rebuilding; subsequent compilation and
  focused execution passed.
- The first large patch that added the acceptance harness exceeded the tool's
  displayed output budget. The complete resulting file was independently read,
  syntax-checked, hardened, and included in the structural validator before any
  commit.
- The first live launch could not derive the absent installed Scout-runtime
  binary and therefore never started a server. The next launch used the exact
  pinned installation already validated from template-development.
- That launch proved the real project/agent/tool/skill inventory, but its copied
  OAuth credential was not connected because the sterile launcher had disabled
  OpenCode's bundled default authentication integration. It created one
  inactive user message and no assistant/tool/error message; the isolated
  process and its temporary state were stopped and removed. The launcher now
  retains bundled authentication only in OAuth mode, asserts the expected
  provider/model connection before prompting, and still audits every exposed
  tool/skill against the effective default-deny policy.

## Changed approach

No bridge route architecture changed. The correction adds one tracked,
credentialed, operator-run acceptance route. It is intentionally excluded from
the ordinary no-credential deterministic suite while remaining required by the
task acceptance boundary. OAuth mode needs OpenCode's bundled authentication
integration inside the otherwise sterile runtime; this does not grant a tool or
skill because the real effective permission inventory remains default-deny.

## Checks

- Correction-cycle remote read: developer
  `d24b67d78d58bd0c217530545ab0b548b64e2485`, template-development
  `fb903dafdb2713621abbfe86b220f26c8d26a6e0`, web-orchestration
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and main
  `6127611113dfdb66f93a0cfd2d355359aa370833` before correction commits.
- Template-development correction checkpoints
  `546ada45be5fb4317ea40cdf7b207b0174ebe0e3`,
  `33227b741c0dc2909ed8ca8dc00ea1b28963febc`, and
  `dfbfeaa2cdd513e7f5012b3829179c596d9c0d80` were independently read back
  after each immediate push.
- `npm --prefix tools/opencode-bridge run build`: passed.
- Focused workspace/protocol/state/recovery/projection/scope suite: passed 68/68.
- Complete `npm --prefix tools/opencode-bridge test`: passed 113/113.
- `./scripts/validate-opencode-bridge.sh`: passed bridge contracts, build,
  113/113 bridge tests, and 8/8 branch-initialization tests.
- `./scripts/validate-repository.sh`: passed structure, links, agent-system,
  research, bridge contracts/build/tests, 8/8 branch tests, hooks, and diff
  checks.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active.
- `git diff --check`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed with the tracked real-runtime
  harness and sterile-environment assertions.
- `node --check tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs`:
  passed.
- Developer acceptance-harness implementation
  `f455d6269678dbbab3783fd845ef26e0227c7ed7`: an initial hook auto-push failed
  through the intercepted proxy, the explicit proxy-free push succeeded, and
  `recover-remote-sync.sh` independently proved the exact remote commit before
  clearing the synchronization marker.
- Developer OAuth/provider-gate correction
  `1b7fb2bce9d9bf23e107d808632066c62fe4c13c`: immediate hook push and
  independent `ls-remote` readback matched; local HEAD/tracking ref remained
  exact and clean.
- `npm --prefix tools/opencode-bridge run test:workspace-runtime-smoke` with a
  private OAuth source and exact real OpenCode 1.18.16: passed. Observed bounded
  workspace tool progress, same-session terminal delivery, evidence-only target
  instructions, independent normal developer routing, public-safe output, zero
  repository mutation, and complete temporary-state cleanup.
- Final-source focused workspace/protocol/state/recovery/projection/scope suite:
  passed 68/68.
- Final-source complete `npm --prefix tools/opencode-bridge test`: passed
  113/113.
- Final-source `./scripts/validate-opencode-bridge.sh`: passed contracts,
  structure, build, 113/113 tests, and 8/8 branch-initialization tests.
- Final-source `./scripts/validate-repository.sh`: passed structure, links,
  agent-system, research, bridge contracts/build/tests, 8/8 branch tests, hooks,
  and diff checks.
- Final-source `./scripts/bootstrap-agent-workflow.sh --check` and
  `git diff --check`: passed.

## Blockers / required decisions

No developer technical blocker or decision remains. Direct Git transport works
with the execution environment's intercepting proxy variables removed. Overall
completion now depends only on template-development package regeneration,
validation, remote evidence, and its normal ledger handoff.

## Remaining work

1. Publish this dedicated developer handoff snapshot.
2. Return to template-development for the final three-range package and ledger
   reconciliation.

## Next action

Commit/push this developer handoff snapshot, independently read it back, and
continue from template-development.

## Continuation prompt

None. This session is actively completing the task.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`
- template-development
  `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-workspace-maintenance-agent.md`
- template-development `scripts/workspace-maintenance-lib.mjs`
- template-development `.opencode/plugins/workspace-maintenance.ts`

## Last handoff commit

`d24b67d78d58bd0c217530545ab0b548b64e2485`
