# Web orchestration package AS-BUILT

## Scope and branch role

`web-orchestration` is an independent public package branch. It owns the Web
orchestrator's installation instructions, conditional Project Sources, task
record template and historical public context, package validator/tests, and push
validation workflow. It is not merged into `developer`, `template-development`,
or `main`.

Remote implementation facts come from the branch that owns them. This package
defines orchestration behavior; it is not implementation truth for developer or
maintenance source.

## ChatGPT Project package

`web-orchestration-only/chatgpt-project/developer-instructions.md` is the only
permanent Project instruction body. It defines the Web role, remote-Git evidence
authority, human exact-SHA main authority, one-mutating-route rule, public
persistence boundary, uncertain-effect no-replay rule, the no-compaction
5,000-token reread policy, and the Source router. It does not carry ordinary,
maintenance, recovery, promotion, or prompt-creation procedure.

Five Sources load conditionally:

- `skill-workflow.md` owns ordinary research, outcome and task design, durable
  task-record use, route selection, direct/developer/Dual orchestration, review,
  durable-truth assessment, and independent completion verification. It relies
  on Lead as the developer brain in Dual and does not duplicate Lead/Spark
  internals or require full-diff transfer.
- `skill-recovery.md` is the exceptional reconciliation procedure. It inspects
  available session/process, local Git, remote Git, task, and external-effect
  evidence; absorbs an existing effect; permits retry only after absence is
  proven; and prevents overlapping mutation. It contains no recovery state
  machine.
- `skill-maintenance.md` routes bounded work to `small-maintainer` or
  `heavy-maintainer`, which are capacity variants of one template-development-
  rooted role. Web supplies an exact runtime ref, one explicit verified target,
  bounded outcome, constraints, checks, publication expectation, and evidence
  contract without copying the agent's internal procedure. Explicit package or
  source-lock work is identified so the agent can load `change-package`.
- `skill-promotion.md` permits main promotion only after explicit human approval
  of one exact reviewed developer SHA. It rechecks refs/preconditions, uses only
  the guarded operation, bans opportunistic content and automatic replay, and
  verifies exact remote results.
- `skill-prompt-creation.md` treats a prompt as context transfer across an
  execution boundary. It adapts to established destination capabilities,
  preserves Observed/Interpretation/Requested-outcome roles, transfers only
  mission-specific state, and omits receiver-owned workflow.

`chatgpt-project/README.md` defines deterministic external rendering,
five-Source installation, capability configuration, public/private boundaries,
and upgrade steps. Rendering replaces the repository placeholders outside Git;
rendered private deployment configuration is never committed.

## Task context and future design

`task-context/TEMPLATE.md` defines the current seven-section canonical task
record: accepted outcome, material scope, constraints, required outputs, required
checks, accepted design, and explicit exceptions. `task-context/README.md`
separates that durable authority from optional concise `<task-id>-progress.md`
execution state and requires historical records to remain unchanged evidence.
Other tracked task-context files are historical public records and are not
retroactively migrated to the current schema.

`ORCHESTRATION-EVOLUTION.md` is non-runtime design for a future general
`orchestration` package. It recommends one shared core plus exactly one continuous
Web or Local capability profile, shared conditional Sources, deterministic
installation composition, and capability-driven differences. It explicitly
records that the current branch/package rename and Local profile are not yet
authorized or implemented.

`README.md` describes current package authority, inventory, public boundary, and
validation entry points.

## Validator

`validate-package.mjs` is a dependency-free executable ES module for Node
22.13.0 or newer. It:

- enforces the exact root and Project Source inventories;
- requires regular, readable, non-empty UTF-8 text without NUL bytes;
- permits flexible public-safe historical Markdown under `task-context/`;
- validates the current task template and task/progress separation;
- validates one router row per known Source plus basic Source structure;
- checks deterministic render placeholders and installation inventory;
- checks hard public-safety, one-route, no-replay, context, maintenance-role, and
  human exact-SHA promotion concepts;
- rejects obsolete active split-maintenance and Lead/Spark handoff artifacts; and
- scans every loaded text file for host-local paths, credential-like tokens, and
  private keys.

The validator checks durable concepts and mechanical structure rather than exact
instruction prose.

## Tests and CI

`validate-package.test.mjs` runs with Node's built-in test runner. It verifies the
canonical package and CI contract, then uses isolated temporary copies for
negative fixtures covering inventory drift, invalid file types/bytes/UTF-8,
historical task compatibility, task-progress separation, router/Source structure,
render placeholders, public-safety loss, unsafe dynamic context, uncertain-
mutation replay, obsolete maintenance terminology, Dual-protocol residue, and
promotion weakening.

`.github/workflows/validate-web-orchestration.yml` runs only on pushes to
`web-orchestration`. It checks out without persisted credentials, pins Node
22.13.0, runs the package validator and discovery-mode tests, has read-only
contents permission, and publishes an exact-SHA status through `statuses: write`.

Verification routes:

```bash
node web-orchestration-only/validate-package.mjs
node --test web-orchestration-only/validate-package.test.mjs
node --test
```
