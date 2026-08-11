# MCP-ON delegation recovery

## Trigger

Use after timeout, reconnect error, empty response, ambiguous send result, or uncertain session continuation.

## Procedure

1. Inspect the delegated session conversation for the exact prompt before retrying.
2. If present, do not resend it; continue or monitor the existing work.
3. If absent, seek independent connector/provider evidence before diagnosing failure.
4. Retry only after determining duplicate implementation will not be created.
5. Delegated shells may differ; use portable commands or explicitly select Bash when required.
6. Record consequential recovery or steering in the task-context file.
