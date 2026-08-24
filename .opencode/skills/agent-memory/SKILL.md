---
name: agent-memory
description: Use advisory AgentMemory recall and capture safely when memory operations are relevant.
compatibility: developer AgentMemory tools
---

# Agent memory

Load this skill before explicit memory capture or when memory scope/semantics need more than the role's default.

- Memory is advisory; current repository/task truth wins on conflict.
- Recall may use `own` or `team`; the role body defines the default, and rendered memories keep visible author attribution.
- Remember only concise reusable facts. Do not store reasoning traces, credentials/secrets, private runtime identifiers, unnecessary absolute host paths, or raw logs; the tool also rejects unsafe capture.
- If the local memory service is unavailable or times out, continue normal developer work without it.
