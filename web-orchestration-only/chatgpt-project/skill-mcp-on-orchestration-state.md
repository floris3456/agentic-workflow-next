# Orchestration-state persistence

## Trigger

Use when starting a task, changing consequential orchestration state, returning from MCP-OFF, routing agents, or preparing human acceptance.

## Write boundary

The sole direct repository-write exception for the web orchestrator is connected GitHub MCP writing `web-orchestration-only/**` on `web-orchestration`. Never write implementation content to `developer` or `main`, and never normally merge branch histories.

## Task context

Maintain one concise `web-orchestration-only/task-context/<task-id>.md` with exact task-start, last-reviewed, and current-handoff SHAs, delegations, findings, steering, unresolved questions, human decisions, next action, and last orchestration mode.

`Last orchestration mode` is historical continuity only; current-turn mode determination always wins.

## Safety

Load `skill-shared-public-safe-persistence.md` before every write. Do not copy private chat, secrets, personal details, or sensitive values.

## MCP-OFF reconciliation

On return to MCP-ON, reconcile consequential MCP-OFF decisions before further consequential delegation.

## Activation

Direct writes require a live capability test. Until it passes, do not pretend persistence occurred.
