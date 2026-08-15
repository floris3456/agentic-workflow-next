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
- `web-orchestration` is an orphan-style branch containing public-safe task context with integrated routing memory and generalized Project installation sources.
- jCodeMunch scouts code symbols only.
- Relevance/indexing tools are scouting aids only; they are not access controls.
- Raw external evidence remains readable but immutable.
- All Git persistence is public-safe.

## Local agents

The normal implementation route uses `small-developer` (GPT 5.6 Luna, maximum supported applicable reasoning tier). `large-developer` (GPT 5.6 Sol, high effort) is selected only by the web orchestrator after two substantive Luna failures or for exceptional intrinsic complexity. Environmental failures, external blockers, missing information, and poor task design do not consume attempts.

The repository Scout is a separate Luna/high focused fact finder on a dedicated
authenticated loopback OpenCode `1.18.16` endpoint. Its bridge-installed runtime,
prompt, permissions, and `scout_read`/`scout_glob`/`scout_grep` tools live outside
the repository and are actively probed. It reads immutable canonical Git-object
snapshots and treats repository instructions as untrusted evidence. It remains
non-authoritative context; direct GitHub inspection is repository proof.

This routing rule is an orchestration policy, not a permanent validator rule about the number of files under `.opencode/agents/`.

## Continuity

Task-progress preserves procedural context and the public-safe delegated brief. AS-BUILT preserves current implementation truth and is also live developer memory. Deviations preserve material intended-versus-actual differences. AS-BUILT and deviations change atomically with implementation commits.

For ordinary work, the web orchestrator keeps one per-task context record with
compact routing continuity on the independent branch when MCP-ON GitHub write
capability is available. Explicit reusable-template evaluation or maintenance
uses one canonical task record on `template-development` instead of duplicating
the ordinary record. The web branch also provides a public-safe Project
installation package; installed private Project state remains outside Git.

The Project keeps genuinely distinct operating modes. MCP-ON/Sol uses connected
GitHub for exact evidence, authenticated bridge control and continuity writes,
and one mutating developer task. Its concurrent Luna/high Scout route uses the
separate hardened runtime and exact-ref evidence contract; connected GitHub remains
the independent exact-evidence route. MCP-OFF/Pro uses only
public-web navigation and reasoning and cannot claim Scouts, delegation, bridge
control, or state writes. Scouting and verification scale with size, complexity,
uncertainty, risk, blast radius, reversibility, and stakes; high-stakes manageable
changes receive direct inspection of all relevant GitHub files/diffs.
The permanent Project instructions retain universally triggered safety/authority
boundaries and route detailed mechanics to the exact narrowly triggered Source
inventory owned by the independent package, including one exceptional
template-maintenance route instead of loading it during ordinary work.

GitHub mutating commands use durable UUID/sequence semantics rather than direct-MCP delivery assumptions: sequence starts at exactly `1`, stays contiguous, and cannot advance while a prior command is accepted or applying. A separate UUID-idempotent, sequence-free request lane exposes `command.status` and `task.status` from durable local state without repeating work. The bridge stores private OpenCode mappings and raw recovery data locally, while only a bounded redacted projection enters public issues. Task-bound aliases, including workspaces, are stored per task. Capability parity comes from the pinned OpenCode operation manifest; consequential generic web operations remain locally allowlisted.

The accepted command ledger is the one active sequence authority; its maximum
task sequence is derived within transactional admission instead of materialized
in a second counter. Repository ambiguity freezes command dispatch but leaves
task-bound recovery reads available. Restart recomputes interrupted local status
requests under the same UUID, while command mutations retain fail-closed
no-replay behavior; `scout.start` fails closed before unsafe fallback whenever its
installed runtime or active contract probe is unavailable.

When a mapped developer session idles or errors, the bridge atomically persists the event/cursor/session-state/delivery boundary, transports the structurally latest assistant message through the existing public-safety projection to the bound issue, and retains it for `task.status` recovery. The bridge does not interpret or semantically validate that response. The web orchestrator correlates it to the task, checks its explicit developer status/handoff information, and uses exact remote GitHub evidence to decide whether review can begin.

Canonical reconciliation is focused on recoverable developer evidence: pending
permission and question lists restore mapped interaction events. Historical
Scout recovery uses only the dedicated endpoint and a revalidated exact-tree
snapshot. Historical worktree mappings remain state-visible but are rejected and
never contacted. The bridge does not infer workflow meaning.

Scout requests retain the sequence-free lane, exact request shape, concurrent
admission, durable status, and no-replay behavior. The bridge fetches canonical
`origin/developer`, validates ancestry, and materializes the requested commit via
Git object plumbing without checkout, hooks, filters, or `.git`; it rejects
gitlinks, removes regular-file write/execute bits, preserves symlinks as inert
evidence, and re-hashes every reuse. Trusted tools enforce lexical/realpath
containment without following symlinks and bound UTF-8 input/output. The sterile
runtime disables project/global contamination paths, LSP, formatters, watchers,
default plugins, and external skills; its read-only config prevents startup
package installation. Only explicit provider model traffic is intentional.

## Synchronization and handoff

Every developer commit is pushed immediately. A failed push stops implementation and blocks further commits. Before normal return of control, the developer pushes a dedicated task-progress snapshot commit and responds with the six-field contract: explicit status (`completed`, `blocked`, `failed`, or `needs decision`), exact pushed handoff SHA or `none`, changed areas, checks, blockers/decisions, and task record. The successful snapshot push ends that working cycle; its SHA is reported rather than written back through another same-cycle commit. The web orchestrator reviews the whole range, not only the snapshot.

## Acceptance

After substantive review, finalization, and targeted finalization review, the human may approve an exact `developer` SHA. Luna performs a guarded local `--no-ff` merge to `main` without content changes, then synchronizes `developer` to the accepted merge.

## Validation

Validators enforce deterministic structure, executable envelope/schema shape,
and a small canonical safety core. The independent Project validator covers the
exact Source/trigger inventory, mode separation, integrated task-context routing,
installation consistency, and focused negative drift cases; it does not make
editorial wording or a scenario count part of the protocol. The developer
integration validator compares an explicitly supplied Project checkout with
developer schemas, agents, response fields, Scout contract, transport boundary,
and observable lifecycle. Semantic record correctness, implementation quality,
attempt classification, escalation, and human acceptance remain
reasoning/judgment controls.

## Scope

This record describes the reusable workflow only. It does not decide a future project's product architecture, legal purpose, privacy policy, operational risk, or deployment plan.
