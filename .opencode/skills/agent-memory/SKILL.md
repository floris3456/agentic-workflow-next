---
name: agent-memory
description: Recall or store concise advisory knowledge that is useful across future developer sessions.
compatibility: developer AgentMemory tools
---

# Agent memory

Load this skill when explicit memory capture is useful or when recall scope needs to differ from the role default.

Memory is advisory. Current task instructions and repository truth always win.

Recall only when previous developer knowledge could materially help the current task. Use the role's default scope unless there is a reason to choose `own` or `team`.

Remember only concise knowledge likely to be useful in future sessions: stable implementation facts, recurring constraints, useful conventions, or lessons that are not already better represented by durable repository documentation.

Do not use memory as a task log, progress record, command history, evidence store, or replacement for AS-BUILT, deviations, or repository documentation.

Never store reasoning traces, secrets, private runtime identifiers, unnecessary host-local paths, or raw logs.

If memory is unavailable, continue normally.
