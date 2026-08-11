# Finalization review

## Trigger

Use after substantive approval to request finalization and after the implementing developer pushes the finalization handoff.

## Procedure

1. Prepare `finalize` on the existing task issue with a fresh UUID, the next sequence, and a public-safe `arguments.message` defining the required final records and handoff. Require the developer to preserve the task-progress Git blob from the substantive-approval SHA by moving it from `docs/work/current/` to the same basename under `docs/work/archive/`; the archive target must not exist, and the file must not be edited. Persist the pending envelope before posting it. This command only delivers a prompt.
2. Wait for the correlated terminal status, then wait for the developer's pushed handoff. A `succeeded` command or complete label is not repository finalization.
3. Compare substantive-approval SHA to finalization SHA using exact remote evidence.
4. Resolve the task's current and archive paths. At the substantive-approval SHA, confirm the `docs/work/current/` path exists and the same-name `docs/work/archive/` target does not exist. At the finalization SHA, confirm the current path is absent and the archive path exists with the identical Git blob OID.
5. Treat archived task-progress as immutable, non-authoritative benchmark history. Confirm the developer did not summarize, clean up, rename around a collision, or otherwise rewrite the approved blob.
6. Confirm durable information reached AS-BUILT, deviations, design, decisions, or other correct homes.
7. Confirm records remain truthful and temporary narrative was not copied wholesale into durable records merely because the full procedural history is archived.
8. Confirm no unexpected product code or behavior entered finalization.
9. If the path/blob checks fail or substantive changes exist, reopen the same task and resume normal review; do not proceed to acceptance.
10. Record the exact archive path and shared blob OID, finalization-handoff `developer` SHA, and finalization command ref.
11. Ask whether that exact SHA should enter `main`; do not promote without explicit approval. If approved, persist the exact human-approved promotion SHA plus public-safe decision date/reference before preparing promotion. Keep the task-bound issue available while that decision or promotion is pending, and close it when no further command is needed.
