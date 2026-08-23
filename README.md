# Agentic workflow template

This repository is a reusable template for human-controlled, web-orchestrated software development with direct local implementation as the default.

## Start here

1. Read [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
2. Read [`docs/architecture/agent-system.md`](docs/architecture/agent-system.md) for authority boundaries.
3. Read [`docs/architecture/branch-workflow.md`](docs/architecture/branch-workflow.md) for branch semantics.
4. Read [`docs/work/README.md`](docs/work/README.md) before starting work.
5. Use [`docs/architecture/repository-layout.md`](docs/architecture/repository-layout.md) for file placement.

## Three-branch model

- `developer` is the active implementation branch.
- `main` is exact human-approved implementation via `./scripts/promote-developer-to-main.sh`.
- `web-orchestration` is an independent branch for project installation/context continuity.

Dual (`lead-developer` + `spark-implementer`) is the default substantive route for non-trivial local implementation. `small-developer` and `heavy-developer` are direct bounded alternatives when Dual is unnecessary.

## Agent memory

Advisory agent memory is provided via `.opencode/tools/agentmemory.ts` and `scripts/agentmemory-server.sh` (pinned to `@agentmemory/agentmemory@0.9.22`).
- Roles: `lead-developer`, `spark-implementer`, `small-developer`, and `heavy-developer`.
- Recall scopes: Spark defaults to `own`; Lead/Small/Heavy default to `team`. Any role may explicitly select `own` or `team`. All recalls render the author role visibly.
- Invariants: Memory is strictly advisory; durable repository truth (Git state, canonical task records, AS-BUILT) always takes precedence.
- Safety: Capture is concise and explicit only; reasoning traces, credentials/secrets, private runtime IDs, absolute host paths, and raw logs are rejected. Local server uses runtime Git common directory storage (`.git/agentmemory`) and unsets external provider keys to ensure no cloud leakage. Failures degrade cleanly with advisory fallbacks and never block work.

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
