# Agentic workflow template

This repository is a reusable template for human-controlled, web-orchestrated software development. It separates consequential acceptance, task design and review, local implementation, research evidence, and Git enforcement so that a project can adopt a disciplined workflow without inheriting product assumptions.

## Start here

1. Read [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).
2. Read [`docs/architecture/agent-system.md`](docs/architecture/agent-system.md) for authority boundaries.
3. Read [`docs/architecture/branch-workflow.md`](docs/architecture/branch-workflow.md) for branch semantics.
4. Read [`docs/work/README.md`](docs/work/README.md) before starting delegated work.
5. Read [`docs/architecture/opencode-bridge.md`](docs/architecture/opencode-bridge.md) for the GitHub-mediated implementation transport.
6. Use [`docs/architecture/repository-layout.md`](docs/architecture/repository-layout.md) to place new files.

## Three-branch model

The workflow deliberately uses three branches with different authorities:

- `developer` is the shared active implementation branch. Delegated OpenCode developers work here, and every commit is pushed immediately.
- `main` contains only the exact implementation state explicitly accepted by the human. It is advanced through the guarded exact-SHA promotion script, not ordinary commits or merges.
- `web-orchestration` is an independent orphan history containing only `web-orchestration-only/**`. It stores concise task context, routing memory, and a generalized public-safe ChatGPT Project installation package; it is never merged into implementation branches.

The web orchestrator designs bounded tasks, routes the normal Luna or exceptional Sol developer, steers work, and independently reviews exact remote ranges. OpenCode developers implement only the delegated task. The human remains the consequential acceptance authority.

Consumers who need the complete workflow should create from this template with all branches included. GitHub can generate included branches with unrelated histories, so first run `./scripts/initialize-template-branches.sh` from a clean `developer` checkout; it safely no-ops for correct ancestry and refuses established ambiguous histories. The independent `web-orchestration` branch is intentional and is never repaired or folded into `main`. Install and customize its `web-orchestration-only/chatgpt-project/` package in the target ChatGPT Project, then run `./scripts/bootstrap-agent-workflow.sh` to activate tracked hooks.

The normal web-to-local implementation path uses ChatGPT's native GitHub integration, a dedicated public-safe control issue, and the outbound local bridge under [`tools/opencode-bridge/`](tools/opencode-bridge/). It does not require a custom OpenCode MCP, inbound webhook, tunnel, or self-hosted runner. Follow the component [setup guide](tools/opencode-bridge/README.md), then use `./scripts/bootstrap-opencode-bridge.sh`, `./scripts/opencode-bridge-status.sh`, and `./scripts/opencode-attach.sh`.

## Records and evidence

- Task-progress is active procedural memory under `docs/work/current/`. Finalization moves the exact approved file unchanged to `docs/work/archive/` as immutable, non-authoritative benchmark history after durable facts are reconciled.
- AS-BUILT records are continuously maintained implementation truth.
- Deviation records describe material intended-versus-actual differences.
- Research packages are evidence and recommendations, not human acceptance.
- Deterministic validators prove structural and mechanical facts only; they do not prove semantic correctness, implementation quality, or acceptance.

Anything committed must be safe for public disclosure. See [`SECURITY.md`](SECURITY.md).

## Bootstrap and validation

```bash
./scripts/bootstrap-agent-workflow.sh
./scripts/bootstrap-opencode-bridge.sh --check --config ~/.config/agentic-workflow/opencode-bridge.json
./scripts/validate-repository.sh
```

Use `./scripts/bootstrap-agent-workflow.sh --check` for a non-mutating activation check. The generic CI workflow runs the same repository validation on `developer` and `main`.

When both independent branch worktrees are available, include exact Project/bridge
contract validation by setting the package directory for the same command:

```bash
WOR_WEB_ORCHESTRATION_ROOT=<path-to-web-orchestration-only> ./scripts/validate-repository.sh
```

## Project content

This template intentionally contains no product implementation, domain model, evidence package, or project decisions. Future adopters can place their own implementation under `src/`, tests under `tests/`, schemas and examples under `contracts/`, and project-specific research under `research/` while retaining the workflow boundaries.
