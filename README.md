# Template-development ledger

This independent branch records work on the reusable agentic workflow template.
It deliberately contains no copy of project implementation, bridge source, or
the ChatGPT Project package.

## What lives here

- `source-lock.json`: exact canonical `main`, `developer`, and
  `web-orchestration` refs last reconciled with this ledger.
- `docs/architecture/AS-BUILT.md`: the current cross-branch template-maintenance
  system.
- `docs/architecture/decisions/`: accepted architectural decisions and their
  consequences.
- `docs/design/`: accepted maintenance design and branch responsibilities.
- `docs/deviations.md`: material design-versus-reality differences.
- `docs/work/current/` and `docs/work/archive/`: compaction-safe active and
  immutable completed task records.
- `changes/<task-id>/`: portable manifests and patches produced after exact-range
  review.
- `scripts/`: deterministic package, application, synchronization, and
  validation tools.

Actual component truth stays with the code it describes. A bridge change updates
the component AS-BUILT on `developer`; a Project-package change updates its
records on `web-orchestration`. This ledger correlates those independent exact
refs and the overall maintenance task without duplicating either tree.

## Normal maintenance flow

1. Begin a task here and record exact source refs before changing source code.
2. Work in isolated checkouts of the canonical template's real `developer`
   and/or `web-orchestration` branches.
3. Commit, push, and review each source branch under its existing rules.
4. Create a portable change package from the reviewed exact ranges.
5. Apply the package to the downstream project's corresponding branches as new,
   independently reviewed tasks.
6. Advance any `main` only through that repository's ordinary exact-SHA human
   approval and guarded promotion.
7. Reconcile this ledger and archive the exact approved maintenance task record.

Never merge this branch into `developer`, `web-orchestration`, or `main`.

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
./scripts/validate-template-development.sh
```
