# MCP-ON delegation recovery

## Trigger

Use when a command comment or bridge result is missing, delayed, ambiguous, rejected, failed, or indeterminate.

## Procedure

1. Stop issuing new commands. Load the pending envelope from task context and inspect the same task issue for its exact UUID, sequence, original envelope, and bridge result.
2. Before waiting, verify the issue is open with `<bridge-control-label>` and the command comment author is the configured allowlisted identity with association `OWNER`, `MEMBER`, or `COLLABORATOR`. Unauthorized commands are silently ignored. Reopen or relabel the same issue when needed; never create a replacement issue for the task.
3. If an eligible command comment exists, do not create a replacement merely because an acknowledgement is delayed. Bridge outbox writes are durable and ordered, but GitHub delivery may lag.
4. If comment publication itself was ambiguous and the exact eligible command is not visible, only replay the exact persisted envelope with the same UUID from the authorized identity. Never change content while reusing a UUID; an exact duplicate is idempotent and does not re-run the side effect or re-emit an old result.
5. If `<bridge-bot-login>` publishes a `marker_hash` rejection without the command tuple, verify it as the lowercase SHA-256 hex digest of the exact UTF-8 bytes after the command marker line's newline and before `-->`, including the canonical trailing newline immediately before `-->`. Retain the envelope as `pre-ledger-rejected` and inspect the exact source. Do not mistake it for a terminal result of an accepted command.
6. Interpret tuple-correlated lifecycle state precisely: `accepted` means wait; `applying` means wait and is pre-indeterminate because the command may still complete; `succeeded` means apply command-specific semantics; `failed` requires diagnosis; `rejected` is terminal, the handler did not run, and stale sequence state must be diagnosed; `indeterminate` is terminal and means a mutation may have started. Never reissue an `applying` command.
7. After `indeterminate`, inspect remote GitHub evidence and the existing task state before deciding whether a new command is safe. Never retry automatically.
8. A corrected or deliberately repeated action uses a sequence greater than the last accepted task sequence and a fresh UUID only after the prior state is terminal and duplicate execution has been excluded. Journal or cancel the old command, then persist the new pending envelope before posting it.
9. A new `status` command with empty arguments reports the mapped OpenCode session, not the ledger state of an earlier command UUID. Use it only when session state, rather than command delivery, answers the recovery question.
10. Treat status labels as potentially stale hints only. Establish branch, SHA, synchronization, checks, and completion independently from remote GitHub.
11. If a command is definitely unpublished, mark it `cancelled`; close an orphaned issue when it has no valid `start`. Keep `pre-ledger-rejected` and `terminal-unresolved` envelopes until correction or independent reconciliation is durable.
12. Record consequential recovery, command IDs, sequences, command/result refs, lifecycle transitions, and steering in the task-context file.
