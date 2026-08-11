# Implementation records

## Task-progress

Temporary per-task procedural memory under `docs/work/current/`. It preserves the public-safe delegated brief, current position, observations, interpretations, attempts, steering, checks, blockers, remaining work, and next action. It is deleted during finalization.

## AS-BUILT

AS-BUILT is both live developer memory and durable reverse-engineer-capable truth. It records current architecture, behavior, interfaces, dependencies, configuration, invariants, operational assumptions, and verification routes.

When implementation changes an AS-BUILT fact, code and record change in the same commit. A knowingly stale AS-BUILT record is an implementation defect, not deferred documentation work.

## Deviations

A deviation is a material difference between an applicable accepted expected state and actual implementation. Update the deviation record in the same commit that creates or changes that difference.

Failed approaches belong in task-progress unless they create a durable system constraint.

## Finalization

After substantive web review approval, the implementing developer reconciles all three layers, promotes durable task-only information, deletes task-progress, and pushes finalization. Finalization is a double-check; it does not replace continuous maintenance.
