# Orchestration-state persistence

## Trigger

Use when starting a task, changing consequential orchestration state, returning from MCP-OFF, routing agents, or preparing human acceptance.

## Write boundary

The normal direct repository-write exception for the web orchestrator is connected/native GitHub writing runtime continuity under `web-orchestration-only/task-context/**` and `web-orchestration-only/agent-routing/**` on `web-orchestration`. Project instructions, skills, templates, and validation remain read-only unless the human separately commissions agent-system maintenance. Never use the bridge as a fallback state writer, never write implementation content to `developer` or `main`, and never normally merge branch histories.

## Task context

Maintain one concise `web-orchestration-only/task-context/<task-id>.md` with exact task-start, last-reviewed, finalization-handoff, human-approved promotion, and verified post-promotion SHAs; control issue state; pending envelope and latest command refs; delegations; findings; steering; unresolved questions; human decisions; next action; and last orchestration mode.

`Last orchestration mode` is historical continuity only; current-turn mode determination always wins.

## Safety

Load `skill-shared-public-safe-persistence.md` before every write. Persist each exact public-safe command envelope before posting it, journal resolved commands, retain pre-ledger-rejected or terminal-unresolved envelopes until reconciled, and mark definitely unpublished commands cancelled. Do not copy private chat, secrets, personal details, or sensitive values.

## MCP-OFF reconciliation

On return to MCP-ON, reconcile consequential MCP-OFF decisions before further consequential delegation.

## Activation

Direct state writes and bridge issue actions require separate live capability checks. Until the applicable check passes, do not pretend persistence or command delivery occurred.
