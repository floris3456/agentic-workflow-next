# Web Orchestrator package AS-BUILT

## Scope

`web-orchestration-only/` is the ChatGPT Project representation inside the `orchestration` branch. It is paired with the Local OpenCode representation at repository root; it is not a separate branch or a copy of project implementation truth.

## Project package

`chatgpt-project/developer-instructions.md` is the permanent Web Orchestrator role/router. Web owns public-web research, prompt/prompt-package creation, task/outcome design, route selection, orchestration and independent verification. It uses native ChatGPT web research and Remote Desktop Commander as its indirect medium for local repository/OpenCode interaction.

The five conditional Project Sources are:
- `skill-workflow.md`: ordinary research, ownership/routing, Developer orchestration, workspace-backlog handling, review and completion. Dual is the default substantive Developer route.
- `skill-recovery.md`: reconcile uncertain mutation/session/Git/publication effects before retry.
- `skill-workspace.md`: explicitly requested or human-approved Workspace Maintainer work, including reusable or project-specific workspace structure and conditional package/source-lock work.
- `skill-promotion.md`: human-approved exact `developer` SHA promotion guard for `main`.
- `skill-prompt-creation.md`: prompts and prompt packages as bounded context transfer.

`task-context/` contains the current task-record template, historical public-safe records and `workspace-backlog.md`. The backlog is pending-decision evidence only; it cannot authorize Workspace Maintainer execution.

## Validation

`validate-package.mjs` checks the exact Web package/Source inventory, task-context shape, public-safety boundaries, routed Source structure, no-replay recovery guard and exact-SHA promotion authority. It intentionally does not compare Web and Local prose.

`validate-package.test.mjs` exercises the canonical package and negative structural/safety fixtures and checks the branch-level orchestration CI contract.

Run:

```bash
node web-orchestration-only/validate-package.mjs
node --test web-orchestration-only/validate-package.test.mjs
```
