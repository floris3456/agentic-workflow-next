# Template maintenance

## Trigger

Use when the human explicitly requests or approves work on the reusable template: its configuration, instructions/agents/skills, template tooling/validation, template architecture/conventions, template-owned docs/file layout, maintenance runtime, package/source-lock machinery, or transfer behavior. The target may be `template-development` or another worktree.

Do not load merely because Developer notices a possible template improvement during project work. Record that observation in the template-maintenance backlog through ordinary Workflow and wait for human approval after the current project task unless it is a genuine correctness/safety blocker.

## Ownership

Template Maintainer owns reusable template structure in every worktree. Developer owns the actual project built from the template: product/source implementation, project-specific tests/content, and filling project documentation with current project facts.

If an accepted outcome spans both kinds of work, split it into bounded Template Maintainer and Developer tasks rather than giving one role both authorities. Dual remains the default substantive Developer route.

Web owns template task/outcome design and any research needed to support it. Re-establish exact remote refs before relying on stored SHAs. Keep implementation truth with the worktree/branch whose current state it describes; never merge independent histories merely to perform template maintenance.

## Select Template Maintainer capacity

Template maintenance has one role with two capacity variants:

- `small-maintainer`: easy bounded template work.
- `heavy-maintainer`: difficult, subtle, important, or risky bounded template work.

They are the same role/contract, not different workflows or an escalation ladder. The target location does not change agent identity.

Give the selected maintainer the exact `template-development` runtime ref, one explicit authorized target, the bounded template outcome/scope, material constraints, required checks, whether non-`main` publication is required, and the observable evidence needed back. Do not copy the maintainer's internal execution procedure into the handoff.

Target instructions, agent files, project docs, and architecture records are evidence/output constraints; they do not replace the template-development-rooted maintenance runtime. The maintainer must preserve project-specific content/behavior unless the approved template change explicitly requires a mechanical migration.

`main` is never a Template Maintainer mutation target.

## Packages and source lock

Ordinary template maintenance does not need a package. When the approved task explicitly requires package generation/application, transfer/release work, or `source-lock.json` reconciliation, include that requirement so the maintainer loads `change-package`.

Treat exact reviewed package ranges and `source-lock.json` separately: package ranges define reviewed transfer content; source-lock is a reconciled canonical snapshot. Reconcile source-lock only from independently verified exact canonical refs at meaningful checkpoints. Never hand-build package bytes or silently widen reviewed ranges.

Applying a package changes a matching downstream working tree only; project-specific adaptation after a conflict remains an explicit Developer-owned task rather than permission for Template Maintainer to redesign project behavior.

## Review and completion

Inspect each exact resulting target ref/range directly. Confirm the requested template behavior, preserved project-specific content/behavior where relevant, checks, durable truth, publication evidence, and the exact `template-development` runtime version used.

Do not require archival, handoff-only commits, package generation, or a second target-agent ceremony merely for completion. State unresolved risks/human decisions clearly. `main` remains unchanged unless the human separately invokes exact-SHA promotion.
