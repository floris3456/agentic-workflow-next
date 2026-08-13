# MCP-ON recovery and reconciliation

## Trigger

Use when a command/result is missing, delayed, stuck, rejected, failed,
indeterminate, or when developer/remote synchronization is inconsistent.

## Durable read requests

Status lookup is exceptional reconciliation, not mandatory polling. Post a
sequence-free UUID request on the existing task-bound issue from the authorized
identity. It does not consume command sequence or execute/repeat a mutation.

Exact command ledger or pre-ledger-rejection state:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"30000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"command.status","arguments":{"command_id":"00000000-0000-4000-8000-000000000000"}}
-->
```

Mapped developer session state and latest projected response:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"40000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"task.status","arguments":{}}
-->
```

## Procedure

1. Stop new commands. Reconcile task context, the same bound issue, exact UUID,
   sequence, persisted envelope, authorized comment identity/association, bridge
   bot author, result marker, service heartbeat, and exact remote GitHub state.
2. If an eligible command comment exists, do not replace it because acknowledgement
   is delayed. If publication itself is ambiguous and the exact comment is not
   visible, repost only the byte-identical persisted envelope with the same UUID;
   this is ledger deduplication, not a fresh action. Never change content while
   reusing a UUID.
3. Interpret lifecycle exactly: `accepted` means wait; `applying` means a side
   effect may be underway, so wait and never reissue; `succeeded` applies only
   command-specific semantics; `rejected` means no handler ran; `failed` needs
   diagnosis; `indeterminate` means an effect may have started and is terminal.
   A pre-ledger rejection has no command tuple: verify its `marker_hash` as the
   lowercase SHA-256 of the exact UTF-8 source-marker body bytes (including the
   canonical trailing newline), retain the rejected source, and do not treat it
   as an accepted command result.
4. For genuinely stuck `applying`, wait only the operation's bounded window, then
   use one `command.status` plus `task.status`. Compare applying age, heartbeat,
   projected response, and exact remote Git evidence. Never automatically retry.
   If still unresolved, require the local operator to inspect and stop/restart
   the bridge; startup converts interrupted applying work to `indeterminate` for
   evidence-based reconciliation.
5. A new action uses the next contiguous sequence and fresh UUID only after the
   prior state is terminal and duplicate effects have been excluded. Preserve
   pre-ledger rejected or terminal-unresolved envelopes until reconciled.
6. If session idle/error delivery was missed, `task.status` recovers the latest
   projected developer response. Interpret it under the normal workflow; neither
   idle nor the status result proves completion.
7. For a failed push or absent reported commit, stop ordinary implementation.
   Inspect remote branch, reported SHA, ancestry, and intervening commits. With a
   mapped session, send a focused `steer` requiring the repository's guarded Git
   synchronization recovery; without one, request local operator recovery. Never
   force-push normal `developer` history.
8. Use sequenced `sync.recover` with empty arguments only when OpenCode
   event/cursor/session recovery is needed. Its success does not inspect or fix
   Git synchronization.
9. Record command/request IDs, refs, lifecycle, evidence, and disposition in task
   context. Close an orphaned issue only when no valid start exists. Treat labels
   and prose as hints, never proof.

Routine delay is not a human decision. Escalate only an unresolved operator
state, consequential choice, sensitive permission, or risk the human owns.
