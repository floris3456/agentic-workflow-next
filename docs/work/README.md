# Work lifecycle

`docs/work/current/` contains one task-progress file per active delegated implementation task. It is public-safe procedural memory, not authoritative implementation evidence. `docs/work/archive/` retains each final approved task-progress blob as immutable, non-authoritative benchmark history after the task leaves the active lifecycle. A pre-existing human decision brief, such as a gate-owner decision, may also remain in `current/` but does not use the implementation handoff lifecycle.

## Task lifecycle

1. The web orchestrator assigns a stable task ID and a bounded public-safe brief.
2. The developer creates `docs/work/current/<task-id>-<slug>.md` before substantive implementation.
3. The original delegated brief is preserved verbatim.
4. Task-progress, AS-BUILT, and applicable deviations are maintained during work.
5. Every commit is pushed immediately.
6. Before returning control, the developer creates and pushes a dedicated handoff snapshot commit.
7. The web orchestrator independently reviews the exact remote range.
8. After substantive approval, the implementing developer reconciles durable records and moves the exact approved task-progress blob unchanged to the same basename under `docs/work/archive/` in the finalization commit.
9. The web orchestrator reviews finalization.
10. The human may approve an exact `developer` SHA for promotion to `main`.

## Record responsibilities

- Task-progress: current task process, attempts, observations, interpretations, steering, remaining work, next action.
- AS-BUILT: continuously accurate implementation reality and live developer memory.
- Deviation: continuously accurate intended-versus-actual differences.

## Developer response contract

```text
Status:
Handoff developer SHA:
Files changed:
Checks + perceived results:
Blockers/decisions:
Task record:
```

`Status` is exactly `completed`, `blocked`, `failed`, or `needs decision`.
`completed` is valid only after the handoff commit is pushed, and `Handoff
developer SHA` is that exact 40-character remote commit. All other statuses use
`none`; in particular, a failed push is `blocked` with `none`. No narrative
summary, full files, reproduced diff, long rationale, or correctness claim.
`Files changed` covers the entire current review range. The response is
navigation, not proof.

## Review bases

- First handoff: task-start `developer` SHA to current handoff SHA.
- Later handoff: last reviewed `developer` SHA to current handoff SHA.
- Finalization: substantive-approval SHA to finalization SHA.

The task-progress template carries the task-start and orchestrator-supplied review-base SHAs. The web task context remains the normative home for reviewed and substantive-approval boundaries.

## Completion

Move durable facts into their proper records before archival. Confirm the archive target does not already exist, preserve the substantively approved task-progress blob without cleanup or summarization, and use `git mv` so it leaves `docs/work/current/` in the finalization commit. A target collision or content mismatch is a blocker; never overwrite, rename around, or rewrite benchmark history. Archived task-progress is not active work, durable implementation truth, or a substitute for AS-BUILT and deviation records.
