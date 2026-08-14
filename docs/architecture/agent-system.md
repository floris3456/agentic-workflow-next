# Agent system

## Purpose

The system separates human acceptance, web orchestration, remote evidence, and local implementation. Git stores a generalized public-safe web-orchestrator installation source, not private live Project state.

## Authority

1. The human defines consequential intent and decides whether an exact reviewed state enters `main`.
2. Remote Git is authoritative repository evidence.
3. The web orchestrator independently reasons about and reviews that evidence.
4. Developer responses and task-progress are navigation and developer reasoning, not proof.
5. OpenCode Scout and optional symbol-scout reports are context only; synthesis
   remains with the web orchestrator.

## Web orchestrator

The web orchestrator is the primary reasoning, task-design, routing, steering, and review layer. Generalized installation instructions and the audited conditional Source inventory live under `web-orchestration-only/chatgpt-project/` on the independent branch. Its short permanent instructions keep universal safety/authority visible and route genuinely separate MCP-ON and MCP-OFF workflows, scouting procedures, and an exceptional template-maintenance procedure. The installed Project configuration, private conversations, connector credentials, and runtime service configuration remain outside Git.

In MCP-ON mode it uses:

- an authenticated native GitHub integration for exact remote evidence,
  public-safe bridge-control actions, ordinary continuity writes limited to
  `task-context/**`, and explicit template-maintenance continuity under
  `docs/work/current/**` on `template-development`;
- direct GitHub inspection for exact evidence, with targeted concurrent OpenCode
  Scouts when broader local exploration saves time; and
- the outbound local GitHub App bridge to reach OpenCode indirectly for implementation delegation, steering, recovery, finalization, and guarded promotion.

In MCP-OFF mode it uses the public GitHub website for repository inspection and cannot pretend delegation or direct orchestration writes occurred.

For a quick exact lookup MCP-ON uses connected GitHub directly. It launches
focused Scouts only when broad/local exploration or independent partitioning
saves time. Review and verification are proportional to change size, complexity,
uncertainty, risk, blast radius, reversibility, and stakes. High-stakes work keeps
an independent direct-GitHub evidence boundary even when Scouts contribute.

## Local implementation

The current approved implementation agents are:

- `small-developer`: default, configured-provider GPT 5.6 Luna at `max` reasoning effort;
- `large-developer`: exceptional path, configured-provider GPT 5.6 Sol at `high` reasoning effort.

The separate `repository-scout` is a directly selected primary OpenCode agent
using GPT 5.6 Luna at `high` reasoning effort. It is not an implementation agent:
only repository read/search tools are enabled, mutations and delegation are
denied by the resolved tool/permission surface, and it produces focused facts and
unknowns rather than orchestration synthesis.

The web orchestrator chooses the agent. Local developers do not launch subagents, review their own work, select escalation, or accept changes.

Both implementation developers explicitly allow OpenCode's structured question
tool when a human answer is required. This produces a task-correlated event and
public alias that the web orchestrator can answer through `question.reply`;
ordinary assistant prose is not a substitute. The read-only Scout continues to
deny questions and cannot enter this interaction path.

The bridge is transport and local durability, not a new authority. It maps public task aliases to private OpenCode sessions, projects bounded status, and invokes Luna/Sol against the same loopback server a human can attach to with the normal TUI. Direct GitHub inspection remains the proof route.

Routing policy is web-side and intentionally is not frozen through a validator that counts agent files.

## Branches

- `developer`: active implementation and task-progress.
- `main`: exact implementation deliberately accepted by the human.
- `web-orchestration`: independent orphan-style tree containing only `web-orchestration-only/**`, including public-safe continuity and Project installation sources.
- `template-development`: independent reusable-template maintenance ledger with
  exact source locks, public-safe task/architecture/deviation records, and
  deterministic cross-branch change packages.

No normal merge crosses between `web-orchestration` and implementation branches.

## Scouting boundary

The OpenCode Scout transport is authorized through the GitHub issue lane but has
its own request/session lifecycle rather than mutating task progress,
finalization, or promotion. Each request names a focused question, exact remote
developer SHA, scope, and expected evidence. Exact-ref detached worktrees and
task/request-correlated aliases/results prevent developer-checkout or cross-task
leakage. Any useful number may run concurrently with one mutating developer task.

The configured optional symbol scout is likewise non-authoritative context.
`.jcodemunch.jsonc` uses strict freshness and excludes evidence, research,
archives, and retired local handoffs to improve relevance and minimize indexed
data. A timeout may return an older index, so freshness must be checked before
relying on it after edits. Provider, credential, and machine-service
configuration remain outside Git and must be reviewed by the operator before use.

## Persistent continuity

- The local developer's task-progress file survives compaction, reconnects, multiple commits, steering, and Luna-to-Sol transition.
- Finalization moves the exact substantively approved task-progress blob to `docs/work/archive/` as immutable, non-authoritative benchmark history; archived records are excluded from active-task discovery and scouting.
- AS-BUILT is live implementation memory and durable reality.
- Deviation records are live intended-versus-actual truth.
- The web orchestrator keeps concise task context, pre-publication command envelopes, command/result refs, human approval boundaries, and routing records under the two runtime-continuity directories on `web-orchestration` when its authenticated write capability is available.

## Normative homes

| Rule | Normative home |
| --- | --- |
| Local always-active boundaries and skill triggers | `AGENTS.md` |
| Local task process | `.opencode/skills/task-workflow/SKILL.md` |
| AS-BUILT/deviation process | `.opencode/skills/implementation-records/SKILL.md` |
| Commit, push, handoff, recovery, promotion | `.opencode/skills/git-sync-and-handoff/SKILL.md` and tracked hooks/scripts |
| Task file and response shapes | `docs/work/templates/` |
| Branch and human acceptance procedure | `docs/architecture/branch-workflow.md` |
| Generalized web installation source | `web-orchestration-only/chatgpt-project/` on `web-orchestration` |
| GitHub-mediated OpenCode transport | `docs/architecture/opencode-bridge.md`, `contracts/opencode-bridge/`, and `tools/opencode-bridge/` |
| Installed Project state and private runtime configuration | Orchestration environment, outside Git |
| Public Git persistence | `SECURITY.md` |
| Current architecture | this document and focused architecture documents |
| Reliable structural checks | `scripts/validate-agent-system.mjs`; with an independent Project checkout, `scripts/validate-web-orchestrator-integration.mjs` |

## Validation boundary

Mechanical checks establish parseability, path/reference integrity, executable bits, templates, hook prerequisites, and other deterministic facts. They do not claim to prove implementation quality, AS-BUILT truth, deviation completeness, substantive attempts, or escalation judgment.
