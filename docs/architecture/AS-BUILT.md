# AS-BUILT: repository workflow

## Current implementation

Native OpenCode on the authorized host is the local implementation runtime. Web owns orchestration, research, route selection, and independent final outcome verification. `developer` is the implementation branch; `main` changes only through explicit human-approved exact-SHA promotion. No bridge, replacement RPC/control plane, compaction recovery platform, or mandatory package/handoff lifecycle is active.

## Instruction and configuration layers

- `opencode.json` selects `lead-developer`, disables sharing, denies global task launches, keeps external-directory access approval-gated, and disables automatic compaction/pruning.
- `AGENTS.md` is intentionally tiny ambient context: universal public-safety, exact-SHA `main`, mutation-reconciliation, durable-truth precedence, and mandatory triggers for `implementation-truth`/`git-safety` only.
- `.opencode/agents/*.md` keeps executable frontmatter plus role-specific system instructions. Global repository policy is not repeated in each role body.
- `.opencode/skills/*/SKILL.md` holds conditional procedure. Current developer skills are `implementation-truth`, `git-safety`, and `agent-memory`; the retired bridge/workflow-era skill set remains absent.
- `docs/architecture/agent-system.md` explains this layering; documentation is not a second ambient instruction manual.

## Active OpenCode agents

- `lead-developer.md`: primary, `cliproxyapi/claude-opus-5#max`, edit denied. Its shell map is default-deny with repository inspection/review/test commands allowed; task permission is exactly wildcard deny plus `spark-implementer: allow`; questions are allowed. Lead is the developer brain: it reconstructs affected implementation reality, chooses the concrete architecture, gives Spark complete instructions, reviews the actual diff/check evidence, and steers corrections; memory defaults to `team`.
- `spark-implementer.md`: subagent, `openai/gpt-5.6-sol`, high reasoning. Read/edit/search/list/bash are allowed; task delegation, external-directory access, and questions are denied. Spark executes inside Lead's design, iterates on ordinary implementation failures with focused checks, runs broader relevant validation when ready, reviews the final diff once, returns concise evidence instead of routine full-diff transmission, and returns material design/scope/interface departures to Lead before implementing them; memory defaults to `own`.
- `small-developer.md`: primary, `cliproxyapi/gemini-3.7-flash-high`, high reasoning, task/questions denied. It is a direct very-simple bounded shortcut and retains repository-relative path discipline plus proportional validation; memory defaults to team.
- `heavy-developer.md`: primary, `openai/gpt-5.6-sol`, max reasoning, task/questions denied. It is the direct difficult/subtle but bounded shortcut; memory defaults to team.

Dual is the default substantive developer route. Small and Heavy are independent bounded shortcuts selected only when Dual would be unnecessary overhead; they are not Spark replacements inside Dual.

## Conditional skills

- `implementation-truth` loads when code, configuration, interfaces, dependencies, runtime behavior, or architecture change. For every changed code scope it identifies the owning AS-BUILT and keeps that document complete enough to reconstruct current implementation, preserves still-valid truth, records only material final deviations, and avoids documentation churn when durable truth did not change.
- `git-safety` loads for uncertain Git effects, unexpected local/remote disagreement, publication reconciliation, or promotion. It determines what actually happened from the smallest useful evidence, absorbs an already-existing effect, retries only when absence and safety are proven, keeps one mutating route while uncertainty remains, and verifies exact remote refs after claimed publication or promotion.
- `agent-memory` loads for explicit capture or non-default recall scope. Memory remains advisory and concise; it is not a task log, progress record, command history, evidence store, or replacement for AS-BUILT/deviations/docs. Service failure is non-blocking and the tool/library enforce hard safety/role constraints.

## AgentMemory implementation

- `.opencode/tools/agentmemory.ts` registers `agentmemory_remember` and `agentmemory_recall` using `@opencode-ai/plugin` and delegates behavior to `scripts/agentmemory-lib.mjs`.
- `scripts/agentmemory-lib.mjs` whitelists exactly the four developer roles, defaults Spark to `own` and Lead/Small/Heavy to `team`, renders authors, filters unknown authors, locally ranks recall results, rejects unsafe/oversized capture (reasoning, secrets, private runtime IDs, absolute host paths, raw logs), and degrades cleanly on HTTP/server failure.
- `scripts/agentmemory-server.sh` launches pinned `@agentmemory/agentmemory@0.9.22`. It derives a private state root from Git common metadata, creates a synthetic private `HOME` plus XDG/npm-cache roots there, clears external provider credentials, forces local embeddings and disables automatic compression/context injection/SDK/graph/consolidation/bridge/snapshot/image/Docker features, then runs the pinned CLI from the private state root. No host-local absolute path is persisted in Git.
- `tests/agentmemory.test.mjs` covers author attribution, team/own isolation, default scopes, orphan filtering, safety rejection, ranking behavior, and graceful unavailable-server fallback.

## Git and repository mechanics

- `.githooks/pre-commit` restricts normal commits to authorized branch state and protects pending exact promotion synchronization; `.githooks/pre-merge-commit` protects unsanctioned `main` merges; `.githooks/pre-push` blocks deletion/non-fast-forward pushes and validates the narrow template repair and exact approved promotion cases.
- `scripts/bootstrap-agent-workflow.sh` activates/checks tracked hooks and executable shell scripts.
- `scripts/initialize-template-branches.sh` performs only the narrow clean/synchronized fresh-template ancestry repair with a backup ref and exact lease; otherwise it no-ops or refuses.
- `scripts/promote-developer-to-main.sh` implements exact human-approved developer-SHA promotion, parent/tree verification, remote-main expectation, push verification, and developer synchronization.
- `scripts/recover-remote-sync.sh` and automatic post-commit push/recovery state are absent. Unknown mutation outcomes are reconciled from current process/session plus local/remote Git evidence before any retry.

## Validation

- `scripts/validate-agent-system.mjs` is a structural/configuration validator, not a prose validator. It parses frontmatter; checks OpenCode project config; verifies the four required agents, documented models/modes and mechanical permission boundaries; verifies the three current skills and their frontmatter name/non-empty description; verifies AgentMemory components and executable scripts/hooks; and keeps specific retired paths absent. It does not scan documentation for exact wording or enforce lifecycle prose.
- `scripts/validate-preimplementation.mjs` checks required repository/docs/task-template presence and local Markdown links.
- `scripts/validate-repository.sh` runs preimplementation, agent-system and CI-status structure checks, research validation/manifest verification, research symlink regression tests, AgentMemory tests, and tracked-hook activation checks.
- `tests/dual-agent-config.test.mjs` independently checks the mechanical agent/config contract; `tests/research-evidence.test.mjs` proves research walks reject symlink escape attempts without following/reading external targets.

## Research and records

Research creation, prompt/package preparation, review, and synthesis are owned by the web orchestrator. `research/` remains a durable public-safe evidence/artifact structure with its own validator; developer OpenCode exposes no research workflow skill. Local developers may consume research evidence/conclusions supplied by accepted work but do not own research production.

Consequential work may use a stable canonical task record plus optional concise task-progress for resumption. AS-BUILT describes current implementation reality; deviations describe material implemented divergence from an applicable accepted expectation. Material Spark departures from Lead design are surfaced to Lead before implementation; no mandatory special proposal-file ceremony is active.

Deterministic transfer/release package generation remains available only when explicitly requested. There is no mandatory push-every-commit, handoff-only commit, archive/finalization, snapshot, retry-count, package-generation, or lifecycle ceremony.

## Branch authority

- `developer`: active implementation.
- `main`: exact human-approved implementation only.
- `web-orchestration`: separate retained orchestration branch; it is not a path in the developer tree and has no developer OpenCode configuration.
