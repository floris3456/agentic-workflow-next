# Agent system

## Purpose

The system separates human acceptance, web orchestration, remote evidence, and local implementation. Git stores a generalized public-safe web-orchestrator installation source, not private live Project state.

## Authority

1. The human defines consequential intent and decides whether an exact reviewed state enters `main`.
2. Remote Git is authoritative repository evidence.
3. The web orchestrator independently reasons about and reviews that evidence.
4. Developer responses and task-progress are navigation and developer reasoning, not proof.
5. The optional symbol scout is scouting context only.

## Web orchestrator

The web orchestrator is the primary reasoning, task-design, routing, steering, and review layer. Generalized installation instructions and conditional skills live under `web-orchestration-only/chatgpt-project/` on the independent branch. The installed Project configuration, private conversations, connector credentials, and runtime service configuration remain outside Git.

In MCP-ON mode it uses:

- an authenticated native GitHub integration for exact remote evidence, writes limited to `task-context/**` and `agent-routing/**`, and public-safe bridge-control issue actions;
- an optional symbol-scouting integration for code context; and
- the outbound local GitHub App bridge to reach OpenCode indirectly for implementation delegation, steering, recovery, finalization, and guarded promotion.

In MCP-OFF mode it uses the public GitHub website for repository inspection and cannot pretend delegation or direct orchestration writes occurred.

## Local implementation

The current approved implementation agents are:

- `small-developer`: default, configured-provider GPT 5.6 Luna at `max` reasoning effort;
- `large-developer`: exceptional path, configured-provider GPT 5.6 Sol at `high` reasoning effort.

The web orchestrator chooses the agent. Local developers do not launch subagents, review their own work, select escalation, or accept changes.

The bridge is transport and local durability, not a new authority. It maps public task aliases to private OpenCode sessions, projects bounded status, and invokes Luna/Sol against the same loopback server a human can attach to with the normal TUI. Direct GitHub inspection remains the proof route.

Routing policy is web-side and intentionally is not frozen through a validator that counts agent files.

## Branches

- `developer`: active implementation and task-progress.
- `main`: exact implementation deliberately accepted by the human.
- `web-orchestration`: independent orphan-style tree containing only `web-orchestration-only/**`, including public-safe continuity and Project installation sources.

No normal merge crosses between `web-orchestration` and implementation branches.

## Scouting boundary

The configured symbol scout is non-authoritative context. `.jcodemunch.jsonc` uses strict freshness and excludes evidence, research, archives, and retired local handoffs to improve relevance and minimize indexed data. A timeout may return an older index, so freshness must be checked before relying on scouting after edits. Provider, credential, and machine-service configuration remain outside Git and must be reviewed by the operator before use.

## Persistent continuity

- The local developer's task-progress file survives compaction, reconnects, multiple commits, steering, and Luna-to-Sol transition.
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
| Reliable structural checks | `scripts/validate-agent-system.mjs` |

## Validation boundary

Mechanical checks establish parseability, path/reference integrity, executable bits, templates, hook prerequisites, and other deterministic facts. They do not claim to prove implementation quality, AS-BUILT truth, deviation completeness, substantive attempts, or escalation judgment.
