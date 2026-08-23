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
- `docs/deviations.md`: material implemented-versus-normative reality differences.
- `docs/work/current/` and `docs/work/archive/`: canonical task records, optional
  separate concise task progress, and archived completed records.
- `changes/<task-id>/`: portable three-range manifests and patches produced when
  packaging is requested after exact-range review.
- `scripts/`: deterministic package, application, synchronization, and
  validation tools.
- `.opencode/agents/workspace-maintainer.md`, `.opencode/agents/small-workspace-maintainer.md`,
  their dedicated skill, and the repository-owned `workspace_*` plugin: the
  authoritative template-rooted maintenance runtime for verified registered
  worktrees without target-instruction takeover or host-path publication. Its
  adjacent package manifest pins both OpenCode and the plugin helper API to
  1.18.16 while installed dependencies and lockfiles remain local generated
  state.

Actual component truth stays with the code it describes. A developer change
updates component records on `developer`; a web-orchestration change updates its
records on `web-orchestration`. This ledger correlates those independent exact
refs and the overall maintenance task without duplicating either tree.

## Normal maintenance flow

1. Web orchestration leads task design, sets up the canonical task-record here,
   and records exact source refs before source work.
2. Source work executes on the canonical template's `developer` or
   `web-orchestration` branches using the selected route: default substantive
   Dual (`dual`) or bounded shortcuts (`small`/`heavy`). Maintenance
   runtime/package machinery is maintained directly on `template-development`.
3. Keep each branch's normal records current and review its exact remote range
   under the branch's existing rules.
4. When transfer or release packaging is requested, create a portable change
   package from reviewed exact template-development, developer, and
   web-orchestration ranges. The template-development range ends before package
   storage so it cannot contain itself.
5. Apply the package to the downstream project's corresponding branches as new,
   independently reviewed tasks.
6. Advance any `main` only through that repository's ordinary exact-SHA human
   approval and guarded promotion.
7. Reconcile this ledger's source snapshot at meaningful checkpoints. Task
   completion is not blocked on ceremonial archival.

Never merge this branch into `developer`, `web-orchestration`, or `main`.

For an explicitly routed repository-wide maintenance operation, start
`workspace-maintainer` or `small-workspace-maintainer` with this worktree as the
OpenCode directory. It discovers targets from Git and keeps target instructions
as evidence; it does not turn a target into the OpenCode project or weaken human
authority over `main`.

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
