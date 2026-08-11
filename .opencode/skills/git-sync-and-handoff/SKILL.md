---
name: git-sync-and-handoff
description: Enforce immediate push, synchronization recovery, handoff snapshot commits, limited responses, and guarded human-approved promotion.
compatibility: Generic developer/main Git workflow
---

# Git synchronization and handoff

Load this skill before committing, pushing, returning control, recovering synchronization, or carrying out an approved promotion.

## Normal developer commits

- Work on `developer`.
- Ensure tracked hooks are active with `./scripts/bootstrap-agent-workflow.sh --check`.
- Include the task ID in task commit messages.
- Push every commit immediately. The tracked `post-commit` hook attempts this automatically on `developer`.
- Do not use `--no-verify`.
- Do not force-push shared history.

## Failed push

A failed push is the only exception to successful push before response.

When it occurs:

1. stop implementation;
2. do not create another implementation commit;
3. retain the local commit and failure marker;
4. return the five-field synchronization-failure response; and
5. wait for directed recovery.

Never claim an unconfirmed local commit is remote work.

Use `./scripts/recover-remote-sync.sh` only for a recovery task. A reset to the remote head does not resolve or erase a marker: recovery must prove the marker's recorded failed commit is in synchronized history before clearing it. The script restores that commit by fast-forward when safe and otherwise fails closed on ambiguous local movement. If local and remote histories truly diverged after a failed push, it may create one exact-head, non-conflicting two-parent recovery merge and push it as a fast-forward. A conflict or ref movement fails closed; remote history is never rewritten.

## End-of-turn snapshot

Before a normal response:

1. ensure implementation records are current;
2. update task-progress completely;
3. leave `Last handoff commit` as the previous successful handoff SHA (or `None` for the first handoff);
4. create a dedicated commit whose only intended purpose is the current task-progress handoff boundary;
5. push successfully;
6. report the resulting current handoff SHA in `Status`;
7. at the start of the next working cycle, record that SHA as `Last handoff commit`; and
8. return the limited response.

A handoff snapshot is a boundary marker. The web reviewer inspects the entire range since the task start or previous reviewed SHA.

## Five-field response

Return only:

```text
Status:
Files changed:
Checks + perceived results:
Blockers/decisions:
Task record:
```

- `Status`: completion/blocker state, branch, exact commit, push state.
- `Files changed`: paths changed across the full current handoff/review range, not only the snapshot commit.
- `Checks + perceived results`: checks run and direct observed results.
- `Blockers/decisions`: observable condition, stopping point, and information/decision required; no unsupported diagnosis.
- `Task record`: exact task-progress path.

The response and task record are navigation, not proof.

## Push-failure response

```text
Status: Synchronization failed; developer; local commit <sha>; not confirmed on origin/developer.
Files changed: <paths in the intended range>
Checks + perceived results: git push -> <brief observed failure>
Blockers/decisions: Remote synchronization must be restored before implementation continues.
Task record: <path>; remote copy may be stale.
```

## Finalization response

After the finalization commit deletes the task record:

```text
Task record: docs/work/current/<task>.md; deleted by this finalization commit after reconciliation.
```

The finalization commit itself is pushed before response; no extra task snapshot follows deletion.

## Promotion

Only after the human approves an exact reviewed `developer` SHA, the small/Luna developer runs:

```bash
./scripts/promote-developer-to-main.sh <approved-developer-sha>
```

Promotion introduces no content changes. A conflict aborts. Never bypass hooks manually.

Promotion is a mechanical no-edit operation, not a normal implementation task. Do not create a task record, update an existing task record, or make a handoff snapshot before running it. Before pushing `main`, the script records a pending tuple of the exact merge, approved developer SHA, and previous main SHA. If `main` is pushed but `developer` synchronization fails, make no commits and rerun the same command with the same approved SHA; the script requires that tuple and verifies both parents before resuming. A look-alike merge without matching pending evidence fails closed. The promotion response uses the five fields with `Files changed: None` and `Task record: Not applicable; promotion operation.`
