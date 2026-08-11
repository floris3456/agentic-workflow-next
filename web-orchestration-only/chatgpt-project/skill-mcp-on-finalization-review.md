# Finalization review

## Trigger

Use after substantive approval to request finalization and after the implementing developer pushes the finalization handoff.

## Procedure

1. Prepare `finalize` on the existing task issue with a fresh UUID, the next sequence, and a public-safe `arguments.message` defining the required final records and handoff. Persist the pending envelope before posting it. This command only delivers a prompt.
2. Wait for the correlated terminal status, then wait for the developer's pushed handoff. A `succeeded` command or complete label is not repository finalization.
3. Compare substantive-approval SHA to finalization SHA using exact remote evidence.
4. Confirm task-progress was deleted; inspect its final pre-deletion form if needed.
5. Confirm durable information reached AS-BUILT, deviations, design, decisions, or other correct homes.
6. Confirm records remain truthful and temporary narrative was not copied wholesale.
7. Confirm no unexpected product code or behavior entered finalization.
8. If substantive changes exist, reopen the same task and resume normal review.
9. Record the exact finalization-handoff `developer` SHA and finalization command ref.
10. Ask whether that exact SHA should enter `main`; do not promote without explicit approval. If approved, persist the exact human-approved promotion SHA plus public-safe decision date/reference before preparing promotion. Keep the task-bound issue available while that decision or promotion is pending, and close it when no further command is needed.
