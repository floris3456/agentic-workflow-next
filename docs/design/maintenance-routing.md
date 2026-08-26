# Maintenance routing design

## Decision

Template maintenance uses one role contract:

**maintenance capacity + explicit verified target + bounded template task**

The target may be `template-development` itself or another registered worktree. Agent identity does not change when the target changes.

Two agent definitions provide capacity, not different workflows:

- `small-maintainer` handles easy bounded template work.
- `heavy-maintainer` handles difficult, subtle, important, or risky bounded template work.

Both load the same `maintenance` skill, have the same tool permissions, and operate through the same verified `workspace_*` boundary. The heavy variant differs only in model/reasoning capacity.

## Ownership boundary

Template Maintainer owns the reusable template in every worktree: OpenCode config, agents, instructions/skills, template tooling and validators, docs/file layout, template architecture/conventions, and package/source-lock machinery.

Developer owns the actual project the template is used to build: product/source behavior, project-specific implementation/tests/content, and filling project documentation with current project facts. Dual is the default substantive Developer route; Small/Heavy Developer are bounded shortcuts only when Dual would be unnecessary overhead.

A Template Maintainer may therefore edit `developer` when changing template-owned structure there, but it does not take over project implementation. Target instructions and project docs are evidence/output constraints; they do not replace the template-development-rooted maintenance workflow.

## Template concerns discovered during project work

Developer does not silently change reusable template structure while implementing a project task. If Lead, Spark, Small Developer, or Heavy Developer finds a template-level problem/opportunity, it reports the observation and useful evidence to the current Orchestrator.

The Orchestrator records a concise template-maintenance backlog item and lets the current project task finish unless the template issue genuinely blocks correctness or safety. After the task, the Orchestrator presents the item to the human. Only an approved item becomes a bounded Small/Heavy Template Maintainer task.

This is a routing boundary, not a new state machine. The backlog needs only enough durable evidence to make the later human decision and maintenance task clear.

## Conditional package procedure

Every maintenance task loads `maintenance`. Package generation/application, transfer/release work, and source-lock reconciliation additionally load `change-package`. Package detail stays out of ordinary maintenance context because most template work does not need it.

Exact reviewed package ranges and `source-lock.json` have different meanings: package ranges define the reviewed transfer; source-lock is a reconciled canonical snapshot. Neither silently widens or controls the other.

## Durable truth and authority

AS-BUILT describes complete current implementation in its scope. Deviations record material final divergence from accepted expectations. Task progress, when useful, is temporary resumable state. None becomes a competing instruction router.

`main` is inspection-only for Template Maintainer. Promotion is a separate human-authorized exact-SHA operation.
