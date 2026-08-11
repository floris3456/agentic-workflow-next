# AS-BUILT: repository workflow

**Status:** Template baseline with active `AGENTIC-BRIDGE-001` implementation

## Purpose

This repository is a reusable workflow template rather than a product implementation. Its implemented system consists of OpenCode agent definitions and skills, tracked Git enforcement, deterministic validators, durable record conventions, a research package shape, an in-progress GitHub-mediated OpenCode bridge, and an independent web-orchestration branch with continuity and installation sources.

## Implemented boundaries

- `developer` is the active implementation branch and is pushed after every commit.
- `main` is advanced only by the guarded exact-SHA promotion script after human approval.
- `web-orchestration` is an independent root history containing only `web-orchestration-only/**`.
- `web-orchestration-only/chatgpt-project/` contains a generalized public-safe Project instruction file and shared, MCP-ON, and MCP-OFF procedure files. It is an installation source, not private live Project state.
- The orchestration branch validates its required Project files, trigger references, repository placeholder, and residual source identifiers through `web-orchestration-only/validate-package.mjs`.
- `small-developer` is the default Luna route; `large-developer` is the exceptional Sol route selected by the web orchestrator.
- Local agents deny subagent/task launches and do not perform orchestration, acceptance, or independent review.
- `tools/opencode-bridge/` currently implements the pinned OpenCode `1.18.16` HTTP/SSE/PTY transport and SQLite durability core. `contracts/opencode-bridge/` records its exact 188-operation compatibility boundary. The GitHub control service and workflow migration are not yet implemented.
- Tracked hooks block direct `main` changes, branch deletion, non-fast-forward pushes, and continued work after failed synchronization.
- Recovery and promotion scripts fail closed on ambiguous synchronization or authorization evidence.
- Validators check deterministic structure, links, configuration, executable bits, clean research shape, and residual source-project terminology; they do not establish semantic correctness or human acceptance.

## Durable records

Task-progress is temporary process memory. AS-BUILT records current implementation reality. Deviation records capture material intended-versus-actual differences. When implementation changes a fact described by AS-BUILT or a deviation, the record changes in the same commit.

## Verification routes

Run `./scripts/bootstrap-agent-workflow.sh --check` to verify local hook activation, `./scripts/validate-repository.sh` for implementation-tree checks, `npm --prefix tools/opencode-bridge test` for bridge-core checks, and `node scripts/validate-research.mjs` for research-only checks. On an orchestration-branch checkout, run `node web-orchestration-only/validate-package.mjs`. Inspect remote refs with Git before treating a branch or commit as evidence.

Component details belong in the established AS-BUILT location defined in [`repository-layout.md`](repository-layout.md), including [`tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md).
