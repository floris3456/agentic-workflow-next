# Workspace maintenance

## Trigger

Use when the human explicitly requests or approves workspace-level work: reusable or project-specific OpenCode configuration/agents/instructions/skills, orchestration instructions, workspace tooling/validation, repository/document/file layout and conventions, workspace architecture, maintenance runtime, package/source-lock machinery, or transfer behavior. The target may be `workspace` itself or another registered worktree.

Do not load merely because Developer notices a possible workspace improvement during project work. Record that observation in the workspace backlog through ordinary Workflow and wait for human approval after the current project task unless it genuinely blocks correctness or safety.

## Ownership

Workspace Maintainer owns workspace-level structure, whether reusable or intentionally project-specific. Developer owns actual project implementation: product/source behavior, project implementation architecture/tests/content, and project documentation content.

If an accepted outcome spans both kinds of work, split it into bounded Workspace Maintainer and Developer tasks. Dual remains the default substantive Developer route.

The Orchestrator owns workspace task/outcome design and research. Re-establish exact refs before relying on stored SHAs. Keep implementation truth with the worktree/branch whose current state it describes; never merge independent histories merely to perform maintenance.

## Select capacity

Workspace maintenance has one role with two capacity variants: `small-maintainer` for easy bounded workspace work and `heavy-maintainer` for difficult, subtle, important, or risky bounded workspace work. They are the same role/contract, not different workflows or an escalation ladder. Target location does not change identity.

Give the selected maintainer the exact `workspace` runtime ref, one explicit authorized target, bounded workspace outcome/scope, material constraints, required checks, whether non-`main` publication is required, and the observable evidence needed back. Do not copy its internal execution procedure into the handoff.

Target instructions, agent files, project docs and architecture records are evidence/output constraints; they do not replace the workspace-rooted maintenance runtime. A project-specific workspace change does not automatically become reusable template behavior.

`main` is never a Workspace Maintainer mutation target.

## Packages and source lock

Ordinary workspace maintenance does not need a package. When the task explicitly requires package generation/application, transfer/release work, or `source-lock.json` reconciliation, include that requirement so the maintainer loads `change-package`.

Current package ranges use `workspace`, `developer`, and `orchestration`; historical package schemas may retain prior branch names as compatibility evidence. Package ranges define reviewed transfer content; source-lock is a reconciled canonical snapshot. Reconcile source-lock only from independently verified exact canonical refs at meaningful checkpoints.

Applying a package changes a matching downstream working tree only. Project implementation adaptation after a conflict remains Developer-owned.

## Review and completion

Inspect each exact resulting target ref/range directly. Confirm the requested workspace behavior, preserved project implementation/content where relevant, checks, durable truth, publication evidence, and exact `workspace` runtime version used.

Do not require archival, handoff-only commits, package generation, or a second target-agent ceremony merely for completion. State unresolved risks/human decisions clearly. `main` remains unchanged unless the human separately invokes exact-SHA promotion.
