# Template-maintenance task record

## Task ID

TEMPLATE-AGENT-MEMORY-001

## Public-safe task brief

Add `rohitg00/agentmemory` as a small, advisory persistent-memory layer for local developer roles after the core direct-host/Dual workflow is already stable.

Memory must help agents reuse relevant experience without becoming instruction authority, without replacing repository durable truth, and without reintroducing conversation compaction or a custom context-management platform.

## Execution position

This is **step 6**. The canonical overall execution order is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

AgentMemory must not block Direct Host, Dual, the instruction cutover, the representative Dual task, or bridge retirement.

## Required outcome

Use stable role identities independent of concrete model versions:

- `lead-developer`;
- `spark-implementer`;
- `small-developer`;
- `heavy-developer`.

Every recalled memory must preserve its author. Support both:

- **shared/team recall** — relevant developer memories across roles, with author visible;
- **own/isolated recall** — memories for one selected role.

Initial defaults:

- Spark: own/isolated automatic recall;
- lead: shared/team automatic recall;
- small: shared/team automatic recall;
- heavy: shared/team automatic recall.

Any role may explicitly request own or team recall when useful.

## Authority

Memory is advisory evidence only. Current human instruction, canonical task-record, exact current repository state, applicable AS-BUILT/design/deviation truth, and current task-progress outrank remembered claims.

A conflict between memory and current durable truth means inspect the current truth; memory does not win.

## Context relationship

This task does **not** own context reconstruction and must not build a context builder.

The operative context policy is owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`:

- no compaction and no compaction fallback;
- retain the last 5,000 raw tokens of the full chat;
- keep normal instructions;
- instruct the agent to re-read the durable repository files needed for the task.

AgentMemory may add relevant advisory recall on top of that. It is not a replacement summary of older conversation.

## Capture safety

Do not intentionally persist:

- private chain-of-thought/reasoning traces;
- credentials, tokens, secrets, authentication headers, or environment-secret values;
- unnecessary private session/device/provider identifiers;
- unnecessary host-local absolute paths when repository-relative references suffice;
- unbounded raw logs or tool output.

Prefer concise reusable facts, conventions, architecture observations, recurring bugs, and validated lessons.

Do not silently enable an additional external memory-processing provider that would transmit stored project memory beyond already-authorized traffic.

## Implementation philosophy

Keep the first integration small and replaceable:

1. re-read upstream AgentMemory at implementation time and pin an exact compatible version;
2. connect one project-scoped memory service/storage boundary;
3. bind every write/read to a stable developer role;
4. provide shared and own recall with visible authorship;
5. narrow capture to public-safe reusable information;
6. make memory failure degrade cleanly to repository durable truth.

Do not add generalized memory orchestration, large isolation-verifier suites, context state machines, or elaborate memory governance unless actual failures later justify them.

## Acceptance criteria

The task is complete when ordinary focused checks prove that:

- the correct stable role authors a memory;
- shared recall can surface another role's memory with its author visible;
- own recall can retrieve the selected role's memory;
- normal developer work can still proceed when AgentMemory is unavailable;
- no compaction or context-builder behavior was introduced.

Update applicable AS-BUILT/docs for the memory implementation actually adopted.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer `docs/architecture/agent-system.md`
- developer applicable AS-BUILT/deviation records
