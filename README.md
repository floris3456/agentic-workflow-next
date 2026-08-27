# Workspace maintenance

This independent `workspace` branch owns the maintenance runtime and workspace-level architecture around projects created from the template. It also owns cross-branch source snapshots and deterministic change-package machinery. It is never merged into `developer`, `orchestration`, or `main`.

## Runtime layout

- `AGENTS.md`: universal workspace-maintenance authority and safety rules.
- `.opencode/agents/small-maintainer.md`: small capacity for easy bounded workspace work.
- `.opencode/agents/heavy-maintainer.md`: heavy capacity for difficult, subtle, important, or risky bounded workspace work.
- `.opencode/skills/maintenance/`: the shared Workspace Maintainer contract for one verified target.
- `.opencode/skills/change-package/`: package/transfer/source-lock procedure loaded only when needed.
- `.opencode/plugins/workspace-maintenance.ts` plus `scripts/workspace-maintenance-*.mjs`: guarded target inspection, mutation, checks, and non-`main` publication.
- `docs/architecture/AS-BUILT.md`: reconstructive current implementation truth.

Small and Heavy are capacity variants of one Workspace Maintainer role. Both remain rooted in `workspace` and may operate on this worktree or another authorized registered worktree through the same `workspace_*` boundary.

## Ownership

Workspace Maintainer owns workspace-level structure, whether reusable or intentionally project-specific: OpenCode configuration/agents/instructions/skills, orchestration instructions, workspace tooling/validation, repository/document/file layout and conventions, workspace architecture, and package/source-lock machinery.

Developer owns the actual project inside that workspace: product/source behavior, project implementation architecture, project tests, and project documentation content. Dual remains the default substantive Developer route.

A project-specific workspace change does not automatically become reusable template behavior. The Orchestrator/human decides whether a discovered workspace improvement should be generalized.

## Ledger data

- `source-lock.json`: latest reconciled canonical `main`, `developer`, and `orchestration` refs.
- `docs/work/current/`: genuinely live accepted task records or unresolved human decisions.
- `docs/deviations.md`: material final divergence from applicable accepted expectations.
- `changes/`: immutable deterministic package revisions created only for explicit transfer/release needs.

## Maintenance in practice

Choose Small for easy bounded workspace work and Heavy for difficult/subtle/important/risky bounded work. Give the agent one explicit verified target and bounded workspace outcome. It establishes exact state, edits directly, iterates on ordinary failures, runs proportional checks, keeps durable truth accurate, and returns concise evidence.

When orchestration behavior changes, Workspace Maintainer reviews the paired Web and Local instruction representations and updates both when the behavior is shared, while keeping runtime-specific tool differences separate.

`main` is inspection-only for maintenance. Generate/apply a package or reconcile source-lock only when explicitly required by loading `change-package`.

## Validate

```bash
./scripts/bootstrap-workspace.sh
npm install --prefix .opencode --ignore-scripts --no-audit --no-fund
node .opencode/node_modules/opencode-ai/postinstall.mjs
./scripts/validate-workspace.sh
```
