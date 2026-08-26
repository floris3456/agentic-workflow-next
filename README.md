# Template-development ledger

This independent branch coordinates maintenance of the reusable agentic-workflow template and owns the template-development-rooted Workspace Maintenance/runtime and deterministic package machinery. It contains no copy of project implementation or web-orchestrator source and is never merged into the source branches.

## Runtime layout

- `AGENTS.md`: tiny universal rules shared by every template-development OpenCode role.
- `.opencode/agents/`: role-specific system instructions and mechanical permissions.
- `.opencode/skills/template-maintenance/`: conditional procedure for the template coordinator.
- `.opencode/skills/workspace-maintenance/`: conditional procedure for verified cross-worktree maintenance.
- `.opencode/plugins/workspace-maintenance.ts` plus `scripts/workspace-maintenance-*.mjs`: guarded `workspace_*` tools.
- `docs/architecture/AS-BUILT.md`: reconstructive current implementation truth.

## Ledger data

- `source-lock.json`: latest reconciled exact canonical `main`, `developer`, and `web-orchestration` refs.
- `docs/work/current/`: only genuinely live task records; optional concise progress is used when resumption needs it.
- `docs/deviations.md`: material implemented-versus-expected differences.
- `changes/`: immutable deterministic package revisions created only when transfer/release packaging is requested.

Actual component truth stays with the source that owns it. Developer implementation and records stay on `developer`; web-orchestrator implementation stays on `web-orchestration`; this ledger correlates exact refs rather than duplicating either tree.

## Maintenance in practice

Web owns task design and route selection. `template-maintainer` coordinates cross-branch maintenance. The small/heavy Workspace agents are separate bounded routes that remain rooted here while operating only through verified `workspace_*` tools; target instructions are evidence/output constraints, not transferred agent authority.

Generate a package only for an explicit transfer/downstream/release need, using `scripts/create-change-package.mjs` over exact reviewed ranges. Apply packages with `scripts/apply-change-package.mjs`; downstream commit/push/review remains owned by that branch. Any `main` promotion still requires explicit human approval of the exact SHA.

For deeper explanation see `docs/design/template-maintenance-workflow.md`; for implemented reality and security boundaries see `docs/architecture/AS-BUILT.md`.

## Validate

```bash
./scripts/bootstrap-template-development.sh
npm install --prefix .opencode --ignore-scripts --no-audit --no-fund
node .opencode/node_modules/opencode-ai/postinstall.mjs
./scripts/validate-template-development.sh
```
