# Agent system

The repository uses native OpenCode for local implementation. The human retains exact-SHA `main` promotion authority; web owns orchestration, research, route selection, and independent final verification.

## Instruction layers

OpenCode responsibilities are deliberately separated by scope and frequency:

- `opencode.json` and agent frontmatter enforce models, modes, permissions, sharing, and compaction settings mechanically.
- `AGENTS.md` contains only universal ambient repository rules that every local developer role needs continuously.
- `.opencode/agents/*.md` bodies define role identity, role-specific responsibilities, defaults, and role-specific skill triggers.
- `.opencode/skills/*/SKILL.md` contains conditional procedure loaded only when its situation is relevant.
- `docs/**` explains the system; explanatory prose is not duplicated into ambient runtime instructions.
- `docs/architecture/AS-BUILT.md` records current implemented reality; deviations record material intended-versus-actual differences.

## Routes

Dual is the default substantive local route. `lead-developer` is the developer brain: it reconstructs current implementation, chooses the concrete architecture, gives Spark complete instructions, and reviews/steers the result. `spark-implementer` performs the source work, iterates on ordinary failures inside Lead's design, and returns material decisions to Lead before departing from that design. `small-developer` and `heavy-developer` are independent bounded shortcuts chosen only when Dual would be unnecessary overhead, never substitutes inside Dual.

## Conditional developer skills

- `implementation-truth`: reconstructive AS-BUILT/deviation maintenance when implemented reality changes.
- `git-safety`: evidence-based reconciliation for uncertain Git effects and exact-SHA promotion boundaries.
- `agent-memory`: advisory recall/capture only when reusable memory is actually useful.

## Template boundary

Reusable template structure in this worktree—OpenCode config/instructions, agent/skill architecture, template tooling, and template-owned file/document layout—is maintained by Template Maintainer rather than Developer. If project work exposes a reusable template concern, Developer reports it to the current Orchestrator instead of changing template structure inside the project task. Project implementation and filling project documentation with current project facts remain Developer-owned.
## Research boundary

Research creation, prompts, packages, review, and synthesis are web-orchestrator responsibilities. The developer branch may contain durable research evidence and may consume research conclusions supplied by accepted work, but it exposes no developer research workflow skill.

## AgentMemory

`.opencode/tools/agentmemory.ts` exposes recall/remember tools backed by `scripts/agentmemory-lib.mjs`. Stable authors are the four developer roles; Spark defaults to `own` recall and Lead/Small/Heavy to `team`. Captures are explicit, safety-filtered, author-attributed, advisory, and non-blocking when the local service is unavailable.
