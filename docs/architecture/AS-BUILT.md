# AS-BUILT: repository workflow

**Status:** Template baseline with implemented GitHub-mediated OpenCode bridge and migrated web-orchestration installation package

## Purpose

This repository is a reusable workflow template rather than a product implementation. Its implemented system consists of OpenCode agent definitions and skills, tracked Git enforcement, deterministic validators, durable record conventions, a research package shape, a GitHub-mediated OpenCode bridge, and an independent web-orchestration branch with continuity and installation sources.

## Implemented boundaries

- `developer` is the active implementation branch and is pushed after every commit.
- `main` is advanced only by the guarded exact-SHA promotion script after human approval.
- `web-orchestration` is an independent root history containing only `web-orchestration-only/**`.
- `web-orchestration-only/chatgpt-project/` on the independent branch contains
  a short permanent router and an exact public-safe Source inventory selected by
  a concrete co-trigger/dependency audit. MCP-ON/Sol and MCP-OFF/Pro have separate
  workflows and scouting; an exceptional MCP-ON template-maintenance Source uses
  `template-development` as its continuity owner. Shared safety/authority policy
  remains permanently visible because it applies on every turn. MCP-ON reaches
  local OpenCode indirectly through authenticated GitHub issue commands and the
  outbound bridge, not a direct Project OpenCode tool. The package is an
  installation source, not private live Project state.
- Ordinary web-orchestrator writes are limited to public-safe runtime continuity under `web-orchestration-only/task-context/**`; explicitly commissioned template maintenance instead uses `docs/work/current/**` on `template-development`. Project instructions, skills, templates, and validation remain read-only unless the human commissions template or agent-system maintenance.
- The web finalization reviewer requires remote Git proof that the current task path existed and the same-name archive target did not at substantive approval, then that finalization removed the current path and retained the identical Git blob under `docs/work/archive/`. The orchestration branch validator pins bridge protocol `agentic-bridge/1` and checks the exact web-owned Source/static-package inventory, ordinary and template-maintenance continuity routing, trigger/mode separation, installation/upgrade consistency, executable request/command examples, six-field handoff shape, and a small canonical safety core. Its Node test suite uses focused negative drift fixtures instead of treating editorial wording or scenario counts as protocol.
- `small-developer` is the default Luna route; `large-developer` is the exceptional Sol route selected by the web orchestrator. Both use the explicit six-field status/exact-pushed-SHA response contract and explicitly allow structured OpenCode questions so the bridge can publish a task-owned alias for `question.reply`; plain assistant text is not treated as an interaction event. Small-developer normal work is guided through repository-relative paths in the configured working directory; parent/sibling rediscovery and scope widening after missing paths are prohibited.
- No ref-owned `repository-scout` agent is tracked. Concurrent Scout requests use a bridge-installed external OpenCode `1.18.16` runtime on a distinct authenticated loopback endpoint. Canonical `origin/developer` snapshots use Git object plumbing without checkout/worktree, reject gitlinks, strip regular-file write/execute bits, preserve symlinks as inert evidence, and fully re-hash reuse. The Luna/high prompt and only allowed tools (`scout_read`, `scout_glob`, `scout_grep`) are bridge-owned; sterile launch, read-only config, realpath containment, active probes, and no normal-server fallback fail closed independently. LSP is excluded.
- Local agents deny subagent/task launches and do not perform orchestration, acceptance, or independent review.
- `tools/opencode-bridge/` implements pinned OpenCode `1.18.16` HTTP/SSE/PTY transports, durable recovery/state, GitHub App polling/outbox, strict command and sequence-free recovery/Scout protocols, public projection, developer/Scout response delivery, external Scout runtime installation/launch/probe, exact-tree snapshots, default-deny policy, and foreground CLI. It enforces ledger-derived contiguous sequence, one nonterminal mutation per task, ambiguity freeze with read recovery, durable rejections, task-scoped aliases, atomic terminal-event/cursor/delivery persistence, persisted one-shot post-interaction continuation claims, separate endpoint recovery, restart-recomputed status, and no replay of uncertain work. The developer config retains in-worktree defaults and keeps `external_directory` at approval (`ask`) rather than broadly allowing outside paths. Repository bootstrap authenticates exact Git host plus owner/repository across supported HTTPS/SSH forms; public/Enterprise API hosts derive unambiguously and custom API layouts require explicit `github.git_host`. `contracts/opencode-bridge/` records its exact 188-operation compatibility boundary and public protocol.
- The bridge keeps normal developer OpenCode loopback-only and separately attachable by the normal TUI; its dedicated Scout process/port/root/auth do not alter normal developer configuration or availability. Hardened Scout hosts are currently non-root Linux only. No inbound webhook, tunnel, custom ChatGPT MCP, self-hosted runner, or mandatory OS service is required.
- `scripts/initialize-template-branches.sh` repairs only provably fresh unrelated generated `main`/`developer` roots with matching metadata/tree shape, records a local old-root backup, and uses a hook-validated tree-preserving `force-with-lease`; valid ancestry no-ops and established ambiguity is refused.
- Tracked hooks enforce checks against direct `main` changes, branch deletion, non-fast-forward pushes, and continued work after failed synchronization within a configured local checkout. They are advisory client-side defense in depth rather than a server-side boundary; operators should also restrict `main` through a GitHub ruleset.
- Recovery and promotion scripts fail closed on ambiguous synchronization or authorization evidence.
- Validators check deterministic structure, links, configuration, executable bits, clean research shape, and residual source-project terminology; they do not establish semantic correctness or human acceptance. `scripts/validate-web-orchestrator-integration.mjs <web-orchestration-only-directory>` additionally checks one exact independent Project checkout against developer-owned schemas, runtime agents, response template, transport boundary, lifecycle semantics, and the shared one-task/one-canonical-issue containment contract. Supplying `WOR_WEB_ORCHESTRATION_ROOT` adds that check to full repository validation without making the implementation runtime depend on the independent branch.
- Finalization reconciles durable records, verifies task-progress against the substantive-approval blob, refuses archive collisions, and moves the unchanged file to the same basename under `docs/work/archive/`. Archived task files are immutable, non-authoritative benchmark history excluded from active-task discovery, scouting, current-policy residue scans, and generic link-health checks.

## Durable records

Task-progress is active process memory and later immutable benchmark history, never implementation authority. AS-BUILT records current implementation reality. Deviation records capture material intended-versus-actual differences. When implementation changes a fact described by AS-BUILT or a deviation, the record changes in the same commit.

## Verification routes

Run `./scripts/bootstrap-agent-workflow.sh --check` to verify local hook activation, `./scripts/bootstrap-opencode-bridge.sh --check --config <file>` for a configured instance, `./scripts/validate-repository.sh` for implementation-tree checks, and `node scripts/validate-research.mjs` for research-only checks. On an orchestration-branch checkout, run its package test and validator. With both independent worktrees present, run `node scripts/validate-web-orchestrator-integration.mjs <web-orchestration-only-directory>` or set `WOR_WEB_ORCHESTRATION_ROOT` for the full repository command. Inspect remote refs with Git before treating a branch, commit, or bridge report as evidence.

Component details belong in the established AS-BUILT location defined in [`repository-layout.md`](repository-layout.md), including [`tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md).
