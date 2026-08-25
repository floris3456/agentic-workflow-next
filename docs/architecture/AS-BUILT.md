# AS-BUILT: repository workflow

## Current implementation

Native OpenCode on the authorized host is the local implementation runtime. Web owns orchestration, research, route selection, and independent final outcome verification. `developer` is the implementation branch; `main` changes only through explicit human-approved exact-SHA promotion. No bridge, replacement RPC/control plane, compaction recovery platform, or mandatory package/handoff lifecycle is active.

## Instruction and configuration layers

- `opencode.json` selects `lead-developer`, disables sharing, denies global task launches, keeps external-directory access approval-gated, and disables automatic compaction/pruning.
- `AGENTS.md` is intentionally tiny ambient context: universal public-safety, exact-SHA `main`, mutation-reconciliation, durable-truth precedence, and mandatory triggers for `implementation-truth`/`git-safety` only.
- `.opencode/agents/*.md` keeps executable frontmatter plus concise role-specific system instructions. Global repository policy is not repeated in each role body.
- `.opencode/skills/*/SKILL.md` holds conditional procedures. Current developer skills are `implementation-truth`, `git-safety`, and `agent-memory`; the retired bridge/workflow-era skill set remains absent.
- `docs/architecture/agent-system.md` explains this layering; documentation is not a second ambient instruction manual.

## Active OpenCode agents

- `lead-developer.md`: primary, `cliproxyapi/claude-opus-5#max`, using the Opus 5 max reasoning variant, edit denied. Its shell map is default-deny with repository inspection/review/test commands allowed; task permission is exactly wildcard deny plus `spark-implementer: allow`; questions are allowed. Its body owns substantive Dual design, Spark instruction, review, steering, and team-memory default.
- `spark-implementer.md`: subagent, `openai/gpt-5.6-sol`, high reasoning. Read/edit/search/list/bash are allowed; task delegation, external-directory access, and questions are denied. Its body owns implementation/checks under Lead direction, departure escalation, return evidence, and own-memory default.
- `small-developer.md`: primary, `cliproxyapi/gemini-3.7-flash-high`, high reasoning, task/questions denied. It is the direct tiny/very-low-risk route and retains repository-relative path discipline plus proportional validation; memory defaults to team.
- `heavy-developer.md`: primary, `openai/gpt-5.6-sol`, max reasoning, task/questions denied. It is the direct difficult/subtle but bounded route; memory defaults to team.

Dual remains the default substantive route. Small and Heavy are independent bounded routes selected by web, not Spark replacements inside Dual.

## Conditional skills

- `implementation-truth` loads when implemented behavior/configuration/interfaces/architecture or a represented durable fact changes. It keeps the applicable AS-BUILT current in the same change, records only material intended-versus-actual deviations, and avoids record churn for unchanged facts.
- `git-safety` loads for uncertain mutation outcomes, synchronization ambiguity, pushes needing reconciliation, or promotion. It requires evidence-based reconciliation before retry, one mutating route while state is uncertain, useful rather than ceremonial pushes, and exact human authorization for `main`.
- `agent-memory` loads before explicit capture or when memory scope semantics need more than a role's default. It describes advisory own/team recall, author visibility, safe concise capture, and non-blocking service failure; the tool/library enforce the hard safety/role rules.

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

Consequential work may use a stable canonical task record plus optional concise task-progress for resumption. AS-BUILT describes current implementation reality; deviations describe material implemented divergence from an applicable accepted expectation. Material Spark departures from Lead design are surfaced before implementation rather than encoded as a mandatory special working-file ceremony.

Deterministic transfer/release package generation remains available only when explicitly requested. There is no mandatory push-every-commit, handoff-only commit, archive/finalization, snapshot, retry-count, package-generation, or lifecycle ceremony.

## Branch authority

- `developer`: active implementation.
- `main`: exact human-approved implementation only.
- `web-orchestration`: separate retained orchestration branch; it is not a path in the developer tree and has no developer OpenCode configuration.
