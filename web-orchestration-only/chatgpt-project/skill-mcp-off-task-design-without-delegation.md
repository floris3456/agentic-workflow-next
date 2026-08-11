# Task design without delegation

## Trigger

Use when implementation is needed but opencode-mcp is unavailable.

## Procedure

1. Design the same public-safe bounded task used under MCP-ON.
2. Establish task ID, start SHA, scope, records, checks, stop conditions, and response contract.
3. Do not claim the task was sent or started.
4. Preserve it in current chat context only as needed.
5. When MCP-ON returns, reconcile decisions into task context, recheck remote state, update a stale brief, then delegate normally.
