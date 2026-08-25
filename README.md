# Template-development ledger

This independent branch owns the reusable template's maintenance runtime, cross-branch source snapshot, and deterministic change-package machinery. It contains no copy of developer or orchestrator source and is never merged into those source branches.

## Runtime layout

- `AGENTS.md`: universal repository authority and safety rules.
- `.opencode/agents/small-maintainer.md`: small capacity for easy, bounded maintenance.
- `.opencode/agents/heavy-maintainer.md`: heavy capacity for difficult, subtle, important, or risky bounded maintenance.
- `.opencode/skills/maintenance/`: the shared maintenance contract for an explicit verified target.
- `.opencode/skills/change-package/`: package and source-lock procedure loaded only when that rare work is required.
- `.opencode/plugins/workspace-maintenance.ts` plus `scripts/workspace-maintenance-*.mjs`: guarded target inspection, mutation, checks, and non-`main` publication.
- `docs/architecture/AS-BUILT.md`: reconstructive current implementation truth.

Small and heavy are the same role at different model capacity. Both remain rooted in `template-development` and operate on `template-development` itself or another authorized registered worktree through the same `workspace_*` boundary. The explicit target and bounded task define where authority applies; target instruction files are evidence and output constraints, not a second workflow.

## Ledger data

- `source-lock.json`: latest reconciled exact canonical `main`, `developer`, and `web-orchestration` refs.
- `docs/work/current/`: genuinely live accepted task records or unresolved human decisions.
- `docs/deviations.md`: material final divergence from applicable accepted expectations.
- `changes/`: immutable deterministic package revisions created only for explicit transfer or release needs.

Actual component implementation truth stays on the branch that owns it. This ledger correlates exact refs rather than duplicating source trees.

## Maintenance in practice

Choose small for easy bounded work and heavy for difficult, subtle, important, or risky bounded work. Give the selected agent an explicit verified target and outcome. The agent establishes exact state, edits directly, iterates on ordinary failures, runs proportional checks, maintains applicable durable truth, and returns concise observable evidence.

`main` is inspection-only for maintenance. Any `main` promotion remains a separate human-authorized exact-SHA operation.

Generate or apply a package only for an explicit downstream transfer or release need by loading `change-package` and using the tracked scripts. For the rationale behind the role/target split see `docs/design/maintenance-routing.md`; for the complete implementation and security boundaries see `docs/architecture/AS-BUILT.md`.

## Validate

```bash
./scripts/bootstrap-template-development.sh
npm install --prefix .opencode --ignore-scripts --no-audit --no-fund
node .opencode/node_modules/opencode-ai/postinstall.mjs
./scripts/validate-template-development.sh
```
