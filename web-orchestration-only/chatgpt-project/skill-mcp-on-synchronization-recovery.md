# Synchronization recovery

## Trigger

Use after failed push, absent reported commit, divergent claims, or a synchronization-failure handoff.

## Procedure

1. Stop implementation; recovery becomes the only repository-changing activity.
2. Inspect remote branch, reported/local SHA metadata, ancestry, and intervening commits with least effort first.
3. Give a directed recovery task when the cause is clear; otherwise delegate only diagnosis and restoration.
4. Do not allow normal commits while the failure marker exists.
5. Preserve shared history; never force-push normal `developer` history.
6. Verify the exact local state is remotely visible and clear the marker only through the repository recovery script.
7. Update task context with the failure and recovered remote SHA.
