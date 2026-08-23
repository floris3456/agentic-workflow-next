# Agentic workflow template

This repository is a reusable template for human-controlled, web-orchestrated software development with direct local implementation as the default.
The retained OpenCode bridge remains available for later stage-5 migration work.

## Start here

1. Read [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
2. Read [`docs/architecture/agent-system.md`](docs/architecture/agent-system.md) for authority boundaries.
3. Read [`docs/architecture/branch-workflow.md`](docs/architecture/branch-workflow.md) for branch semantics.
4. Read [`docs/work/README.md`](docs/work/README.md) before starting work.
5. Read [`docs/architecture/opencode-bridge.md`](docs/architecture/opencode-bridge.md) for the retained bridge transport.
6. Use [`docs/architecture/repository-layout.md`](docs/architecture/repository-layout.md) for file placement.

## Three-branch model

- `developer` is the active implementation branch.
- `main` is exact human-approved implementation via `./scripts/promote-developer-to-main.sh`.
- `web-orchestration` is an independent branch for project installation/context continuity.

Dual (`lead-developer` + `spark-implementer`) is the default substantive route for non-trivial local implementation. `small-developer` and `heavy-developer` are direct bounded alternatives when Dual is unnecessary.
The retained bridge is not the active route inventory: its legacy public `heavy` selector still maps to `large-developer` until the later bridge-retirement step.

## Records and evidence

- Canonical task records and optional task-progress are in `docs/work/`.
- AS-BUILT records are durable implementation truth and must remain complete for changed directories.
- Deviations describe material intended-versus-actual differences.
- Research packages are evidence and recommendations, not implementation acceptance.
- Generate or apply transfer/release packages only when a task requests them.

Anything committed must be safe for public disclosure.

## Bootstrap and validation

```bash
./scripts/bootstrap-agent-workflow.sh
./scripts/validate-repository.sh
```

Use `./scripts/bootstrap-agent-workflow.sh --check` for a non-mutating activation check.

## Project content

This template intentionally contains no product implementation. Future adopters add implementation under `src/`, tests under `tests/`, schemas and examples under `contracts/`, and project-specific research under `research/` while retaining the workflow boundaries.
