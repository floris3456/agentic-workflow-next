# AS-BUILT: repository workflow

**Status:** Template baseline with implemented GitHub-mediated OpenCode bridge and migrated web-orchestration installation package

## Purpose

This repository is a reusable workflow template rather than a product implementation. Its implemented system consists of OpenCode agent definitions and skills, tracked Git enforcement, deterministic validators, durable record conventions, a research package shape, a GitHub-mediated OpenCode bridge, and an independent web-orchestration branch with continuity and installation sources.

## Implemented boundaries

- `developer` is the active implementation branch and is pushed after every commit.
- `main` is advanced only by the guarded exact-SHA promotion script after human approval.
- `web-orchestration` is an independent root history containing only `web-orchestration-only/**`.
- `web-orchestration-only/chatgpt-project/` contains a generalized public-safe Project instruction file and shared, MCP-ON, and MCP-OFF procedure files. MCP-ON reaches local OpenCode indirectly through authenticated GitHub issue commands and the outbound bridge, not a direct Project OpenCode tool. It is an installation source, not private live Project state.
- Normal web-orchestrator writes are limited to public-safe runtime continuity under `web-orchestration-only/task-context/**` and `web-orchestration-only/agent-routing/**`; Project instructions, skills, templates, and validation remain read-only unless the human commissions agent-system maintenance.
- The web finalization reviewer requires remote Git proof that the current task path existed and the same-name archive target did not at substantive approval, then that finalization removed the current path and retained the identical Git blob under `docs/work/archive/`. The orchestration branch validator pins and prints bridge protocol `agentic-bridge/1` and checks exact source inventory/file types, grouped trigger/reference structure, placeholder coverage, bridge command example, continuity fields, UTF-8, the guarded archive-review procedure, obsolete task-record removal policy, formatting-tolerant stale direct-transport/source-project residue, and selected high-risk policy inversions through `web-orchestration-only/validate-package.mjs`.
- `small-developer` is the default Luna route; `large-developer` is the exceptional Sol route selected by the web orchestrator.
- Local agents deny subagent/task launches and do not perform orchestration, acceptance, or independent review.
- `tools/opencode-bridge/` implements the pinned OpenCode `1.18.16` HTTP/SSE/PTY transports, durable recovery/state, GitHub App conditional polling/outbox, strict command and sequence-free recovery-request protocols, public projection, latest mapped developer-response delivery, default-deny operation policy, and foreground service/configuration CLI. It enforces exact contiguous command sequence, one nonterminal mutation per task, task-scoped workspace aliases, public `applying`, and never retries an uncertain mutation. `contracts/opencode-bridge/` records its exact 188-operation compatibility boundary and public command/request/result protocol.
- The bridge keeps OpenCode loopback-only and separately attachable by the normal TUI. It requires no inbound webhook, tunnel, custom ChatGPT MCP, self-hosted runner, or mandatory OS service.
- `scripts/initialize-template-branches.sh` repairs only provably fresh unrelated generated `main`/`developer` roots with matching metadata/tree shape, records a local old-root backup, and uses a hook-validated tree-preserving `force-with-lease`; valid ancestry no-ops and established ambiguity is refused.
- Tracked hooks enforce checks against direct `main` changes, branch deletion, non-fast-forward pushes, and continued work after failed synchronization within a configured local checkout. They are advisory client-side defense in depth rather than a server-side boundary; operators should also restrict `main` through a GitHub ruleset.
- Recovery and promotion scripts fail closed on ambiguous synchronization or authorization evidence.
- Validators check deterministic structure, links, configuration, executable bits, clean research shape, and residual source-project terminology; they do not establish semantic correctness or human acceptance.
- Finalization reconciles durable records, verifies task-progress against the substantive-approval blob, refuses archive collisions, and moves the unchanged file to the same basename under `docs/work/archive/`. Archived task files are immutable, non-authoritative benchmark history excluded from active-task discovery, scouting, current-policy residue scans, and generic link-health checks.

## Durable records

Task-progress is active process memory and later immutable benchmark history, never implementation authority. AS-BUILT records current implementation reality. Deviation records capture material intended-versus-actual differences. When implementation changes a fact described by AS-BUILT or a deviation, the record changes in the same commit.

## Verification routes

Run `./scripts/bootstrap-agent-workflow.sh --check` to verify local hook activation, `./scripts/bootstrap-opencode-bridge.sh --check --config <file>` for a configured instance, `./scripts/validate-repository.sh` for implementation-tree checks, and `node scripts/validate-research.mjs` for research-only checks. On an orchestration-branch checkout, run `node web-orchestration-only/validate-package.mjs`. Inspect remote refs with Git before treating a branch, commit, or bridge report as evidence.

Component details belong in the established AS-BUILT location defined in [`repository-layout.md`](repository-layout.md), including [`tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md).
