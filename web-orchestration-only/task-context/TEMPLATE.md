# Task context: <task-id>

- Continuity schema: agentic-bridge/1
- Task ID: <task-id>
- Human goal: <public-safe goal>
- Current orchestration objective: <current objective>
- Task-start developer SHA: <sha>
- Last reviewed developer SHA: <sha or none>
- Current handoff developer SHA: <sha or none>
- Substantive implementation approval SHA: <sha or none>
- Finalization handoff developer SHA: <sha or none>
- Human-approved promotion SHA: <sha or none>
- Human approval date/reference: <public-safe date/reference or none>
- Verified post-promotion main SHA: <sha or none>
- Verified post-promotion developer SHA: <sha or none>
- Relevant repository refs: <refs>
- Last orchestration mode: MCP-ON | MCP-OFF
- Bridge control issue: <url/number or none>
- Bridge control issue state: open | closed | none
- Last bridge sequence: <positive integer or none>
- Last bridge command: <uuid, kind, and lifecycle state or none>

## Pending bridge command

- State: none | prepared | posted | pre-ledger-rejected | terminal-unresolved | cancelled
- Prepared at: <date/time or none>
- Command-comment ref: <url/number or none>
- Result-comment ref: <url/number or none>
- Exact one-line JSON envelope: <public-safe JSON or none>

## Bridge command journal

- <uuid/sequence/kind>: <command-comment ref, result-comment ref, lifecycle state, and concise resolution>

## Scout request journal

- <request uuid/task/issue/exact ref>: <focus, result ref, lifecycle, and concise disposition>

## Delegations issued

- <date, issue/command ref, and concise public-safe delegated outcome>

## Review findings

- <exact range and concise finding>

## Steering issued

- <issue/command ref and changed approach, rollback, or recovery direction>

## Unresolved questions

- <question or none>

## Human decisions required

- <exact decision or none>

## Migration notes

- <non-authoritative legacy/unknown context or none>

## Current next action

<one concrete next orchestration action>
