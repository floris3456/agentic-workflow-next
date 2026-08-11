# Synchronization recovery

## Trigger

Use after failed push, absent reported commit, divergent claims, or a synchronization-failure handoff.

## Procedure

1. Stop implementation; recovery becomes the only repository-changing activity.
2. Inspect remote branch, reported/local SHA metadata, ancestry, and intervening commits with least effort first.
3. Use `sync.recover` with empty arguments only when bridge/OpenCode event, cursor, or mapped-session state also needs reconciliation. Persist it before posting. Its `succeeded` result says local OpenCode reconciliation ran; it does not inspect or repair Git synchronization.
4. For a Git synchronization failure with an existing mapped session, send a directed `steer` requiring the repository's guarded remote-sync recovery procedure. If no mapped session exists, stop and request local operator recovery instead of issuing another `start`.
5. Delegate only diagnosis/restoration on the existing task and only through an explicit bridge command. Do not allow normal commits while the failure marker exists.
6. Preserve shared history; never force-push normal `developer` history.
7. Verify from remote GitHub that the exact local state is visible and clear the marker only through the repository recovery script.
8. Update task context with the failure, exact recovery command/operator ref, and independently verified remote SHA.
