---
name: task-workflow
description: Run a delegated implementation task from public-safe brief through compaction-safe progress, steering, handoff, and finalization.
compatibility: Generic repository developer branch workflow
---

# Task workflow

Use this skill whenever a delegated task starts, resumes, changes approach, hands off, or finalizes.

An exact-SHA `developer` to `main` promotion after explicit human approval is not a task under this lifecycle. It must not create or update task-progress or add a pre-promotion handoff commit; use `git-sync-and-handoff`'s promotion procedure instead.

## Start

1. Confirm the task ID and that the current branch is `developer`.
2. Confirm the working tree is clean and synchronized with `origin/developer`.
3. Create `docs/work/current/<task-id>-<slug>.md` from `docs/work/templates/task-progress-template.md` before substantive work.
4. Copy the exact **public-safe delegated brief** into `Original task brief` without rewriting it.
5. Record the task-start `developer` SHA in the file.
6. Load `implementation-records` before changing an implemented component or an accepted planned fact.
7. Load `git-sync-and-handoff` before any commit or return of control.

Stop and ask through the limited response if the delegated text appears unsafe for public Git persistence.

## Maintain task-progress

Keep the file useful after compaction or agent replacement. Update:

- `Current objective` when steering changes the route but not the general human goal.
- `Current position` with the exact working point.
- `Observed` with direct results only.
- `Interpretation` with developer inference, never disguised as fact.
- `Attempts` with enough detail to avoid repeating a failed route.
- `Changed approach` for material strategy changes, including steering source and treatment of old work.
- `Checks`, `Blockers / required decisions`, `Remaining work`, `Next action`, and `Relevant durable records`.

Do not record private chain-of-thought, credentials, private chat, or unnecessary sensitive values.

## Attempt record

For a meaningful failed route, record:

- approach;
- relevant action/check;
- observable result;
- whether abandoned; and
- reusable lesson.

Do not label an event a “substantive small-route attempt.” The web orchestrator makes that classification.

## Steering

Continue in the same task file when the orchestrator changes implementation strategy while preserving the same general goal. Record the change under `Changed approach`. Use a new task only when the intended outcome materially changes.

For pushed work, prefer a corrective commit or `git revert`; do not rewrite shared history.

## Compaction recovery

Recover in this order:

1. Original task brief.
2. Current objective.
3. Current position.
4. Remaining work.
5. Next action.
6. Referenced AS-BUILT/deviation records.
7. Exact current `developer` repository state.
8. Attempts/changed approach only as needed.
9. Resume.

AS-BUILT explains what exists. Task-progress explains what you were doing.

## Handoff boundary

When returning control:

1. finish the bounded activity;
2. make implementation records current;
3. update task-progress completely;
4. load `git-sync-and-handoff`;
5. create the dedicated handoff snapshot commit;
6. push it successfully; and
7. return only the six-field response with explicit status and exact pushed
   handoff developer SHA or `none`.

Before the snapshot, make `Status`, `Remaining work`, and `Next action` truthful
for the boundary being handed off. The successful snapshot push is the last tool
action in that working cycle. Do not reopen the record to insert the snapshot's
own SHA or begin another cycle before returning the six fields.

## Finalization

Only after the web orchestrator approves substantive implementation:

1. reconcile actual implementation with AS-BUILT, deviations, design, and other durable records;
2. promote any durable task-only information to its correct home;
3. use the substantive-approval SHA to verify that the current task-progress path still resolves to the exact approved Git blob;
4. derive `docs/work/archive/<task-id>-<slug>.md` with the same basename and stop if that target already exists;
5. use `git mv` to move the task-progress file without editing its contents, then verify the archive file hashes to the approved blob;
6. commit and push finalization; and
7. use the finalization task-record wording defined by `git-sync-and-handoff`.

A content mismatch or archive collision is a blocker. Do not clean up the approved task-progress blob, overwrite benchmark history, invent a different archive name, or reuse an archived task identity. Archived task-progress is immutable, public-safe, non-authoritative benchmark history; it is no longer active work and never replaces durable records.

Finalization is a reconciliation pass, not deferred documentation. If it exposes substantive implementation errors or requires product code changes, restore/recreate the task record and return to normal implementation.
