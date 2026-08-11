# Implementation records

## Task-progress

Active per-task procedural memory under `docs/work/current/`. It preserves the public-safe delegated brief, current position, observations, interpretations, attempts, steering, checks, blockers, remaining work, and next action. During finalization its exact substantively approved blob moves to the same basename under `docs/work/archive/` as immutable benchmark history.

Archived task-progress remains non-authoritative procedural history. It is excluded from active-task discovery and scouting, is never edited, and does not reduce the requirement to keep durable implementation records current.

## AS-BUILT

AS-BUILT is both live developer memory and durable reverse-engineer-capable truth. It records current architecture, behavior, interfaces, dependencies, configuration, invariants, operational assumptions, and verification routes.

When implementation changes an AS-BUILT fact, code and record change in the same commit. A knowingly stale AS-BUILT record is an implementation defect, not deferred documentation work.

## Deviations

A deviation is a material difference between an applicable accepted expected state and actual implementation. Update the deviation record in the same commit that creates or changes that difference.

Failed approaches belong in task-progress unless they create a durable system constraint.

## Finalization

After substantive web review approval, the implementing developer reconciles all three layers, promotes durable task-only information, verifies task-progress still matches the approved blob, moves it unchanged to its collision-free same-name archive path, and pushes finalization. Finalization is a double-check; it does not replace continuous maintenance or make the archive authoritative.
