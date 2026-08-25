# Maintenance routing design

## Decision

Template maintenance and target-worktree maintenance use one role contract:

**maintenance capacity + explicit verified target + bounded task**

The target may be `template-development` itself or another registered worktree. The role does not change identity when the target changes.

Two agent definitions provide capacity, not different workflows:

- `small-maintainer` handles easy, bounded work.
- `heavy-maintainer` handles difficult, subtle, important, or risky bounded work.

Both load the same `maintenance` skill, have the same tool permissions, and operate through the same verified `workspace_*` boundary. The heavy variant differs only in model and reasoning capacity.

## Why this is simpler

The former template coordinator and workspace agents split identity by maintenance location even though the hard problem is target authority. The verified-worktree gate already supports `template-development` as a normal registered target, so a second local-edit workflow is unnecessary.

Keeping one role avoids duplicated target rules, completion rules, validation behavior, and handoff ceremony. The caller owns route and capacity selection; the maintenance agent owns bounded implementation and ordinary edit/test/fix iteration.

## Conditional procedure

Every maintenance task loads `maintenance`. Package generation, package application, and source-lock/package reconciliation additionally load `change-package`. Package detail stays out of ordinary maintenance context because most tasks do not need it.

## Authority boundaries

The maintenance role remains rooted in `template-development`. A target's instruction-shaped files describe the implementation and constraints the result must satisfy; they do not replace the selected maintenance role's controlling workflow. Technical access does not authorize extra targets or scope.

`main` is inspection-only. Promotion is a separate human-authorized exact-SHA operation.

## Durable truth

AS-BUILT describes complete current implementation in its scope. Deviations record material final divergence from accepted expectations. Task progress, when useful, is temporary resumable state. None of these records becomes a competing instruction router.
