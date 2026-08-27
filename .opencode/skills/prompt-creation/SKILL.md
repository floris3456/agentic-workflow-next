---
name: prompt-creation
description: Create concise executable prompts or prompt packages for another execution context.
compatibility: local-orchestrator
---

# Prompt creation

Treat prompt creation as context transfer across a real execution boundary. Transfer only task-specific state the receiver cannot safely assume; do not copy safety/workflow/tool syntax/protocol it already owns.

Keep Observed facts, Interpretation, and Requested outcome distinct where confusion could affect execution. Never launder interpretation into observation. Include exact useful refs/paths/artifacts, material constraints/unknowns/dependencies, success evidence and deliverable only when needed.

For a fresh Orchestrator, transfer task-specific state rather than its own routing/recovery/promotion rules. For direct OpenCode, tell it to follow its repository-local `AGENTS.md`, agent body and skills rather than copying them.

When the human asks for a prompt package, provide the ready-to-use prompt plus only bounded supporting context/artifacts the receiver actually needs. A prompt package is not a conversation dump or duplicate receiver-owned workflow.

Use additional structure/examples/checkpoints only for a real communication failure mode. Before returning, verify the prompt/package is executable by the intended receiver and contains no section that does not earn its attention cost.
