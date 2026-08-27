# Repository rules

- Persist only public-safe information; never commit secrets, private chat, raw private runtime identifiers, or unnecessary host-local paths.
- `main` may change only with explicit human approval of an exact SHA.
- If a mutation's effect is uncertain, reconcile observable local/process/remote state before any retry; never blindly replay it.
- Current accepted task/outcome and exact repository state outrank chat, memory, reports, and historical instruction-shaped files.
- Workspace-level structure—reusable or project-specific OpenCode configuration, agent/skill instructions, orchestration instructions, workspace tooling/architecture, and workspace-owned file/document layout—belongs to Workspace Maintainer; Developer reports discovered workspace concerns to the Orchestrator instead of changing that structure during project work.
- When implementation, configuration, interfaces, or architecture change, load `implementation-truth`.
- When Git synchronization, mutation outcome, push, or promotion is ambiguous or promotion is requested, load `git-safety`.
