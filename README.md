# Template-development ledger

This independent branch owns the reusable template's maintenance runtime, cross-branch source snapshot, and deterministic change-package machinery. It contains no copy of developer or orchestrator source and is never merged into those source branches.

## Runtime layout

- `AGENTS.md`: universal repository authority and safety rules.
- `.opencode/agents/small-maintainer.md`: small capacity for easy bounded template maintenance.
- `.opencode/agents/heavy-maintainer.md`: heavy capacity for difficult, subtle, important, or risky bounded template maintenance.
- `.opencode/skills/maintenance/`: the shared Template Maintainer contract for one explicit verified target.
- `.opencode/skills/change-package/`: package/transfer/source-lock procedure loaded only when that work is required.
- `.opencode/plugins/workspace-maintenance.ts` plus `scripts/workspace-maintenance-*.mjs`: guarded target inspection, mutation, checks, and non-`main` publication.
- `docs/architecture/AS-BUILT.md`: reconstructive current implementation truth.

Small and Heavy are capacity variants of one Template Maintainer role. Both remain rooted in `template-development` and may operate on this worktree or another authorized registered worktree through the same `workspace_*` boundary.

Template Maintainer owns reusable template structure wherever it appears: OpenCode config/instructions, agent/skill architecture, template tooling/validation, docs/file layout and conventions, and package/source-lock machinery. Actual project implementation/content remains Developer-owned; Dual is the default substantive Developer route.

A target's instruction files and project records are evidence/output constraints rather than a second maintenance workflow. Template maintenance preserves project-specific content/behavior unless the authorized template change requires a mechanical migration.

## Ledger data

- `source-lock.json`: latest reconciled exact canonical `main`, `developer`, and orchestration refs.
- `docs/work/current/`: genuinely live accepted task records or unresolved human decisions.
- `docs/deviations.md`: material final divergence from applicable accepted expectations.
- `changes/`: immutable deterministic package revisions created only for explicit transfer/release needs.

Actual component implementation truth stays on the branch that owns it. This ledger correlates exact refs rather than duplicating source trees.

## Maintenance in practice

Choose Small for easy bounded template work and Heavy for difficult/subtle/important/risky bounded template work. Give the selected agent one explicit verified target and bounded template outcome. It establishes exact state, edits directly, iterates on ordinary failures, uses focused checks while working, runs proportional broader validation when ready, maintains applicable durable truth, and returns concise observable evidence.

If project development exposes a reusable template concern, Developer reports it to the Orchestrator instead of changing template structure inside the project task. The Orchestrator may backlog it for human review after the current task; approved work returns here as an ordinary bounded Template Maintainer task.

`main` is inspection-only for maintenance. Any `main` promotion remains a separate human-authorized exact-SHA operation.

Generate/apply a package or reconcile source-lock only when explicitly required by loading `change-package`. For the role boundary see `docs/design/maintenance-routing.md`; for complete implementation/security boundaries see `docs/architecture/AS-BUILT.md`.

## Validate

```bash
./scripts/bootstrap-template-development.sh
npm install --prefix .opencode --ignore-scripts --no-audit --no-fund
node .opencode/node_modules/opencode-ai/postinstall.mjs
./scripts/validate-template-development.sh
```
