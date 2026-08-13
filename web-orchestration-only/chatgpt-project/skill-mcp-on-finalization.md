# MCP-ON finalization

## Trigger

Use only after substantive review when repository durable-record policy requires
a separate finalization handoff. Do not load for a task that is already complete
without such a policy.

## Procedure

1. Record the substantive-approval SHA. On the existing task issue, persist then
   post `finalize` with a fresh UUID, next sequence, and public-safe message.
2. Require the developer to bring durable AS-BUILT/design/deviation records
   current and preserve the task-progress Git blob by moving
   `docs/work/current/<task>.md` to the same basename under
   `docs/work/archive/`. The archive target must not exist and the file must not
   be edited.
3. Command `succeeded` proves prompt delivery only. Wait for and interpret the
   six-field pushed developer handoff, then verify its exact remote SHA.
4. Compare substantive-approval SHA to finalization SHA. At the former, confirm
   the current path exists and the archive target does not. At the latter,
   confirm the current path is absent, the archive path exists, and both versions
   have the identical Git blob OID.
5. Treat archived progress as immutable, non-authoritative benchmark history.
   Confirm finalization added no unexpected product behavior and durable facts
   reached their proper records.
6. If blob/path checks fail or substantive changes appeared, resume normal review
   and steering. Otherwise record finalization SHA, command/result refs, archive
   path, and shared blob OID.
7. Ask the human about promotion only if appropriate. Keep the exact task issue
   available while promotion is pending; close it when no command remains.
