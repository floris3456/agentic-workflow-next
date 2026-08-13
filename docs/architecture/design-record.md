# Current agent-system design record

**Status:** current reference design for this template

## Decision

This repository uses a human-controlled web-orchestrated implementation system with exact remote evidence and serialized local developers.

- The human is the acceptance authority.
- Remote Git is authoritative repository evidence.
- The ChatGPT web orchestrator designs tasks, routes agents, steers implementation, and independently reviews exact remote commit ranges.
- OpenCode agents implement bounded tasks on `developer`; they do not orchestrate or review.
- ChatGPT reaches local OpenCode through native GitHub control issues and an outbound local GitHub App bridge; the bridge is not repository evidence or an acceptance authority.
- `main` contains exact implementation explicitly accepted by the human.
- `web-orchestration` is an orphan-style branch containing public-safe task context, routing memory, and generalized Project installation sources.
- jCodeMunch scouts code symbols only.
- Relevance/indexing tools are scouting aids only; they are not access controls.
- Raw external evidence remains readable but immutable.
- All Git persistence is public-safe.

## Local agents

The normal implementation route uses `small-developer` (GPT 5.6 Luna, maximum supported applicable reasoning tier). `large-developer` (GPT 5.6 Sol, high effort) is selected only by the web orchestrator after two substantive Luna failures or for exceptional intrinsic complexity. Environmental failures, external blockers, missing information, and poor task design do not consume attempts.

`repository-scout` is a separate Luna/high primary agent selected directly for
focused read-only fact finding. Its resolved runtime contract enables only
repository read/search tools and denies shell, Git/file mutation, delegation,
skills, web, interaction, todo, and external-directory access. It never replaces
direct GitHub evidence or performs orchestration synthesis.

This routing rule is an orchestration policy, not a permanent validator rule about the number of files under `.opencode/agents/`.

## Continuity

Task-progress preserves procedural context and the public-safe delegated brief. AS-BUILT preserves current implementation truth and is also live developer memory. Deviations preserve material intended-versus-actual differences. AS-BUILT and deviations change atomically with implementation commits.

The web orchestrator keeps per-task context and routing records on the independent branch when MCP-ON GitHub write capability is available. The branch also provides a public-safe Project installation package; installed private Project state remains outside Git.

The Project keeps genuinely distinct operating modes. MCP-ON/Sol uses connected
GitHub for quick exact evidence, authenticated bridge control and continuity
writes, one mutating developer task, and focused concurrent Luna/high read-only
Scouts when broad local exploration saves time. MCP-OFF/Pro uses only public-web
navigation and reasoning and cannot claim Scouts, delegation, bridge control, or
state writes. Scouting and verification scale with size, complexity, uncertainty,
risk, blast radius, reversibility, and stakes; high-stakes manageable changes
receive direct inspection of all relevant GitHub files/diffs even if Scouts help.
The permanent Project instructions route these mechanics to eight narrowly
triggered Sources instead of loading them on every turn.

GitHub mutating commands use durable UUID/sequence semantics rather than direct-MCP delivery assumptions: sequence starts at exactly `1`, stays contiguous, and cannot advance while a prior command is accepted or applying. A separate UUID-idempotent, sequence-free request lane exposes `command.status` and `task.status` from durable local state without repeating work. The bridge stores private OpenCode mappings and raw recovery data locally, while only a bounded redacted projection enters public issues. Task-bound aliases, including workspaces, are stored per task. Capability parity comes from the pinned OpenCode operation manifest; consequential generic web operations remain locally allowlisted.

The accepted command ledger is the one active sequence authority; its maximum
task sequence is derived within transactional admission instead of materialized
in a second counter. Repository ambiguity freezes command dispatch but leaves
task-bound recovery reads and read-only Scouts available to resolve it. Restart
recomputes interrupted local status requests under the same UUID, while command
mutations and `scout.start` retain their fail-closed no-replay behavior.

When a mapped developer session idles or errors, the bridge atomically persists the event/cursor/session-state/delivery boundary, transports the structurally latest assistant message through the existing public-safety projection to the bound issue, and retains it for `task.status` recovery. The bridge does not interpret or semantically validate that response. The web orchestrator correlates it to the task, checks its explicit developer status/handoff information, and uses exact remote GitHub evidence to decide whether review can begin.

Canonical reconciliation is focused on recoverable evidence: pending permission
and question lists restore mapped interaction events, and the Scout-only
status/message fallback restores terminal Scout lifecycle. The bridge does not
materialize an unused whole-project reconciliation snapshot or infer workflow
meaning from either path.

Scout starts extend the sequence-free request lane rather than the mutating task
lifecycle. Each request carries a focused question, exact remote developer SHA,
scope, and expected evidence; a clean detached worktree and independent
task/request/session mapping isolate it. Scout work can run concurrently without
an orchestration-policy cap and can coexist with the one mutating developer task.
Recovery monitoring begins as soon as the mapping is durable, before prompt
delivery can become ambiguous, and never replays the prompt. Because the pinned
runtime exposes empty v2 history for legacy-created sessions, monitoring also
uses the exact Scout workspace's legacy stream and a canonical status/message
fallback that requires terminal lifecycle metadata without reading response
meaning. Idle/error results reuse public projection and durable delivery, while
synthesis stays in the web orchestrator.

## Synchronization and handoff

Every developer commit is pushed immediately. A failed push stops implementation and blocks further commits. Before normal return of control, the developer pushes a dedicated task-progress snapshot commit and responds with the six-field contract: explicit status (`completed`, `blocked`, `failed`, or `needs decision`), exact pushed handoff SHA or `none`, changed areas, checks, blockers/decisions, and task record. The successful snapshot push ends that working cycle; its SHA is reported rather than written back through another same-cycle commit. The web orchestrator reviews the whole range, not only the snapshot.

## Acceptance

After substantive review, finalization, and targeted finalization review, the human may approve an exact `developer` SHA. Luna performs a guarded local `--no-ff` merge to `main` without content changes, then synchronizes `developer` to the accepted merge.

## Validation

Validators enforce only deterministic structure and references. The independent
Project validator covers exact Source/trigger inventory and seven orchestration
scenarios; the developer integration validator compares an explicitly supplied
Project checkout with developer schemas, agents, response fields, Scout contract,
transport boundary, and observable lifecycle. Semantic record correctness,
implementation quality, attempt classification, escalation, and human acceptance
remain reasoning/judgment controls.

## Scope

This record describes the reusable workflow only. It does not decide a future project's product architecture, legal purpose, privacy policy, operational risk, or deployment plan.
