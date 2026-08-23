# Agent system

## Purpose

This repository uses native OpenCode on the authorized host for active local implementation.

## Authorities

- Human: exact-SHA `main` acceptance and promotion authority.
- Web: orchestration, web research, task/outcome design, route selection, and independent final outcome/system verification.
- Local: implementation, checks, and durable-state maintenance.

## Route model

Choose the route from the task:

- direct web/GitHub for a tiny exact low-risk change the web can make more simply;
- `small-developer` for very simple bounded local work;
- `heavy-developer` for difficult, important, or subtle work that remains small and bounded; and
- Dual as the default substantive local development route.

Inside Dual:

- `lead-developer` owns current-state analysis and implementation steering.
- `spark-implementer` performs source edits, command execution, and testing.

Small/heavy are independent routes, not Spark substitutes. If Dual is unavailable, web makes a fresh route decision rather than substituting another agent inside Dual. For Dual work, web does not routinely duplicate the lead's deep implementation analysis or review.

Stable current agents are:

- `.opencode/agents/lead-developer.md`
- `.opencode/agents/spark-implementer.md`
- `.opencode/agents/small-developer.md`
- `.opencode/agents/heavy-developer.md`

## Agent memory subsystem

Advisory memory allows agents to retain and query cross-turn guidance while maintaining strict repository authority boundaries:

- **Stable roles**: Allowed agent roles are strictly whitelisted to `lead-developer`, `spark-implementer`, `small-developer`, and `heavy-developer`.
- **Tools**: `.opencode/tools/agentmemory.ts` exposes `agentmemory_remember` and `agentmemory_recall`.
- **Author attribution**: Every remembered entry records `context.agent` as author; all recalled entries render the author role visibly. Orphan and unrecognized authors are discarded.
- **Scope defaults**: `spark-implementer` defaults to `own` scope; `lead-developer`, `small-developer`, and `heavy-developer` default to `team` scope. Any agent may explicitly choose `own` or `team`.
- **Advisory nature**: Memory is advisory only; canonical task records, AS-BUILT, deviations, and exact Git state are durable truth and supersede memory.
- **Safety and conciseness**: Explicit concise capture only. Rejects reasoning/thought traces, credentials/secrets, private runtime IDs, absolute host paths, and raw logs.
- **Clean degradation**: Timeouts, unreachable servers, or service errors degrade cleanly with concise advisory fallback messages and never block work.
- **Local server**: `scripts/agentmemory-server.sh` runs pinned `@agentmemory/agentmemory@0.9.22` with storage derived at runtime from Git common metadata (`.git/agentmemory`). It forces local embedding mode (`EMBEDDING_PROVIDER=local`, `AGENTMEMORY_AUTO_COMPRESS=false`, `AGENTMEMORY_INJECT_CONTEXT=false`, `AGENTMEMORY_ALLOW_AGENT_SDK=false`) and unsets external provider API keys. Absolute host paths are never persisted.

## Current workflow truth

- Exact Git state is authoritative evidence.
- Task records are durable instructions for consequential work.
- Optional task-progress is for continuity and is not authority.
- No context-builder/tokenizer/fallback-compaction platform is introduced.
- Keep the last 5,000 raw chat tokens for bounded session continuity and reread durable files.
- Older chat beyond that raw tail is discarded rather than summarized.
- Do not automatically replay ambiguous mutations; inspect current Git/process state first.

## Branch and verification model

- `developer`: active implementation.
- `main`: exact accepted implementation.
- `web-orchestration`: retained installation/context branch used for orchestration tooling, not implementation truth.

## Branching and record responsibility

- Promote only through exact-SHA procedures.
- AS-BUILT remains the durable implementation truth and must be complete for each changed directory.
- Formal deviations describe persistent, material divergence between accepted expected state and implemented reality.
