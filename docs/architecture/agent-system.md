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

Dual is the default substantive local route: `lead-developer` designs, instructs, reviews, and steers; `spark-implementer` performs source implementation and checks. `small-developer` and `heavy-developer` are independent bounded direct routes chosen by web, not substitutes inside Dual.

## Conditional developer skills

- `implementation-truth`: same-change AS-BUILT/deviation maintenance when implemented facts change.
- `git-safety`: reconciliation for ambiguous Git state and exact-SHA promotion boundaries.
- `agent-memory`: memory-specific scope and safe explicit capture procedure.

## Research boundary

Research creation, prompts, packages, review, and synthesis are web-orchestrator responsibilities. The developer branch may contain durable research evidence and may consume research conclusions supplied by accepted work, but it exposes no developer research workflow skill.

## AgentMemory

`.opencode/tools/agentmemory.ts` exposes recall/remember tools backed by `scripts/agentmemory-lib.mjs`. Stable authors are the four developer roles; Spark defaults to `own` recall and Lead/Small/Heavy to `team`. Captures are explicit, safety-filtered, author-attributed, advisory, and non-blocking when the local service is unavailable.
