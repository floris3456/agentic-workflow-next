# Workspace maintenance routing

## Decision

Workspace maintenance uses one role contract:

**maintenance capacity + explicit verified target + bounded workspace task**

The target may be `workspace` itself or another registered worktree. Agent identity does not change when the target changes.

- `small-maintainer` handles easy bounded workspace work.
- `heavy-maintainer` handles difficult, subtle, important, or risky bounded workspace work.

Both load the same `maintenance` skill, have the same tool permissions, and use the same verified `workspace_*` boundary. Heavy differs only in model/reasoning capacity.

## Ownership boundary

Workspace Maintainer owns workspace-level structure, whether reusable or project-specific: OpenCode configuration/agents/instructions/skills, orchestration instructions, workspace tooling/validation, repository/document/file layout and conventions, workspace architecture, and maintenance/package/source-lock machinery.

Developer owns the actual project: source/product behavior, project implementation architecture, project tests, and project documentation content. Dual is the default substantive Developer route.

A project-specific workspace change does not automatically become reusable template behavior. The Orchestrator/human decides whether to generalize it.

If Developer discovers a workspace concern while implementing the project, it reports the concern to the current Orchestrator instead of changing workspace-owned structure inside the project task. The Orchestrator may execute an explicitly requested project-specific workspace change or backlog a reusable improvement for human approval after the current task.

## Paired Orchestrator maintenance

Web and Local are two native representations of the same Orchestrator contract. Workspace Maintainer reviews the corresponding instruction on both sides whenever orchestration behavior changes.

Shared orchestration semantics are updated on both sides. Runtime-specific behavior stays local to its representation: Web uses native ChatGPT web search and Remote Desktop Commander as its indirect OpenCode/local execution medium; Local uses Tavily for public web research and its instruction set forbids reading `web-orchestration-only/`.

No prose-equality validator is required. The maintainer owns semantic synchronization while validators check mechanical inventory, permissions, runtime discovery, and safety boundaries.

## Conditional package procedure

Every maintenance task loads `maintenance`. Package generation/application and source-lock reconciliation additionally load `change-package`; ordinary workspace work does not carry package procedure.

`main` remains inspection-only. Promotion is a separate human-authorized exact-SHA operation.
