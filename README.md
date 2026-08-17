# Template-development ledger

This independent branch records work on the reusable agentic workflow template
and owns the template-development-rooted maintenance runtime. It deliberately
contains no copy of project implementation, bridge source, or the ChatGPT
Project package.

## What lives here

- `source-lock.json`: exact canonical `main`, `developer`, and
  `web-orchestration` refs last reconciled with this ledger.
- `docs/architecture/AS-BUILT.md`: the current cross-branch template-maintenance
  system.
- `docs/architecture/decisions/`: accepted architectural decisions and their
  consequences.
- `docs/design/`: accepted maintenance design and branch responsibilities.
- `docs/deviations.md`: material design-versus-reality differences.
- `docs/work/current/` and `docs/work/archive/`: compaction-safe not-yet-finalized
  and immutable finalized task records.
- `changes/<task-id>/`: portable three-range manifests and patches produced after
  exact-range review.
- `scripts/`: deterministic package, application, synchronization, and
  validation tools.
- `.opencode/agents/workspace-maintainer.md`, its dedicated skill, and the
  repository-owned `workspace_*` plugin: the authoritative template-rooted
  maintenance runtime for verified registered worktrees without
  target-instruction takeover or host-path publication. Its adjacent package
  manifest pins both OpenCode and the plugin helper API to 1.18.16 while installed
  dependencies and lockfiles remain local generated state.

Actual component truth stays with the code it describes. A bridge change updates
the component AS-BUILT on `developer`; a Project-package change updates its
records on `web-orchestration`. This ledger correlates those independent exact
refs and the overall maintenance task without duplicating either tree.

## Normal maintenance flow

1. Begin a task here and record exact source refs before changing source code.
2. Work on the canonical template's real `developer` and/or `web-orchestration`
   branches using the proportional source route, and maintain the rooted
   maintenance runtime/package machinery here when they are in scope.
3. Keep each source branch's normal records current and review its exact remote
   range under the branch's existing rules.
4. Create a portable change package from reviewed exact template-development,
   developer, and web-orchestration ranges. The template-development range ends
   before package storage so it cannot contain itself.
5. Apply the package to the downstream project's corresponding branches as new,
   independently reviewed tasks.
6. Advance any `main` only through that repository's ordinary exact-SHA human
   approval and guarded promotion.
7. Reconcile this ledger and archive the exact approved maintenance task record.

Never merge this branch into `developer`, `web-orchestration`, or `main`.

For an explicitly routed repository-wide maintenance operation, start
`workspace-maintainer` with this worktree as the OpenCode directory. It discovers
targets from Git and keeps target instructions as evidence; it does not turn a
target into the OpenCode project or weaken human authority over `main`.

## Generated projects

Create from the GitHub template with **Include all branches**. The generated
ledger is then available alongside the project's three operational branches.
Configure its `source-lock.json` with the canonical template URL and the exact
template refs used by the project. GitHub template generation does not create an
ongoing upstream relationship, so the recorded remote and refs are the durable
link.

## Validate

```bash
./scripts/bootstrap-template-development.sh
npm install --prefix .opencode --ignore-scripts --no-audit --no-fund
node .opencode/node_modules/opencode-ai/postinstall.mjs
./scripts/validate-template-development.sh
```
