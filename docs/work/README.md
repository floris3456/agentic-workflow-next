# Work lifecycle

`docs/work/current/` contains one temporary task-progress file per active delegated implementation task. It is public-safe procedural memory, not authoritative implementation evidence. A pre-existing human decision brief, such as a gate-owner decision, may also remain there but does not use the implementation handoff lifecycle.

## Task lifecycle

1. The web orchestrator assigns a stable task ID and a bounded public-safe brief.
2. The developer creates `docs/work/current/<task-id>-<slug>.md` before substantive implementation.
3. The original delegated brief is preserved verbatim.
4. Task-progress, AS-BUILT, and applicable deviations are maintained during work.
5. Every commit is pushed immediately.
6. Before returning control, the developer creates and pushes a dedicated handoff snapshot commit.
7. The web orchestrator independently reviews the exact remote range.
8. After substantive approval, the implementing developer reconciles durable records and deletes task-progress in the finalization commit.
9. The web orchestrator reviews finalization.
10. The human may approve an exact `developer` SHA for promotion to `main`.

## Record responsibilities

- Task-progress: current task process, attempts, observations, interpretations, steering, remaining work, next action.
- AS-BUILT: continuously accurate implementation reality and live developer memory.
- Deviation: continuously accurate intended-versus-actual differences.

## Developer response contract

```text
Status:
Files changed:
Checks + perceived results:
Blockers/decisions:
Task record:
```

No narrative summary, full files, reproduced diff, long rationale, or correctness claim. `Files changed` covers the entire current review range. The response is navigation, not proof.

## Review bases

- First handoff: task-start `developer` SHA to current handoff SHA.
- Later handoff: last reviewed `developer` SHA to current handoff SHA.
- Finalization: substantive-approval SHA to finalization SHA.

The task-progress template carries the task-start and orchestrator-supplied review-base SHAs. The web task context remains the normative home for reviewed and substantive-approval boundaries.

## Completion

Move durable facts into their proper records. Delete task-progress in finalization; do not archive it as a permanent diary.
