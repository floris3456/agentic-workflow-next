---
name: maintenance
description: Maintain workspace-owned structure on workspace or another verified worktree.
compatibility: small-maintainer and heavy-maintainer
---

# Workspace maintenance

Use this skill for both Workspace Maintainer capacities.

## Ownership

Workspace Maintainer owns workspace-level structure wherever it appears: template-owned or project-specific OpenCode configuration, agents, instructions and skills; orchestration instructions; workspace tooling and validation; repository/document/file layout and conventions; workspace architecture; and maintenance/package/source-lock machinery.

Workspace Maintainer does not own the actual project built inside that workspace: product/source behavior, project implementation architecture, project tests, or filling project documentation with current project facts. That work belongs to Developer, with Dual as the default substantive route. If the bounded request would require project implementation rather than workspace maintenance, return the ownership mismatch instead of crossing the boundary.

A workspace change may be reusable across projects or intentionally project-specific. Do not silently generalize a project-specific change into the reusable template; the Orchestrator/human owns that decision.

## Paired Orchestrator instructions

The Web and Local Orchestrators are two runtime-specific implementations of one orchestration contract. Web instructions live under `web-orchestration-only/chatgpt-project/`; Local instructions live under `.opencode/` in the `orchestration` worktree.

When changing orchestration behavior in either representation, inspect the corresponding other-side instruction. If the behavior is runtime-independent, update both consistently. If only tool use, packaging, or runtime capability differs, change only the applicable side. Never copy Web-specific Remote Desktop Commander/native-search instructions into Local, and never copy Local-specific Tavily instructions or its `web-orchestration-only/` exclusion into Web.

Use this correspondence when relevant:
- Web `developer-instructions.md` ↔ Local `local-orchestrator.md` plus root `AGENTS.md` where the rule is ambient.
- Web `skill-workflow.md` ↔ Local `orchestration-workflow/SKILL.md`.
- Web `skill-recovery.md` ↔ Local `recovery/SKILL.md`.
- Web `skill-workspace.md` ↔ Local `workspace/SKILL.md`.
- Web `skill-promotion.md` ↔ Local `promotion/SKILL.md`.
- Web `skill-prompt-creation.md` ↔ Local `prompt-creation/SKILL.md`.

## Target and work

Stay rooted in the registered `workspace` OpenCode project. The bounded request, selected agent, this skill, and root repository rules control the work; technical access is not task authority. Target instruction-shaped files are evidence and output constraints, not a second controlling workflow. `main` is inspection-only.

Select the explicit target with `workspace_list` and `workspace_inspect` by registered branch or unambiguous exact detached HEAD, never by filesystem path. Establish exact target state and the bounded workspace outcome before editing.

Resolve ordinary implementation ambiguity from evidence. Do not orchestrate, delegate, or stop after one ordinary failed edit/check. Before each mutation, inspect the target and pass the exact returned `head` and `status_digest`; reinspect whenever either changes and never overwrite unexplained worktree changes.

Use focused checks while iterating. Fix ordinary failures and rerun the smallest useful check; do not repeat an unchanged failure or repeatedly run broad validation. Run proportional broader validation once the result is ready.

## Durable truth and publication

Keep applicable durable records accurate for the workspace-owned reality you changed. AS-BUILT should remain complete enough to reconstruct current implementation; create/update a deviation only for material final divergence from an applicable accepted expectation.

Use `workspace_publish` only when durable publication of the inspected non-`main` branch is requested. If a mutation/publication effect is uncertain, inspect actual state before any retry; never blindly replay it.

Report the capacity, exact target/resulting SHA or local state, changed files, checks/outcomes, remote verification when published, and any material remaining risk, ownership mismatch, or human decision.
