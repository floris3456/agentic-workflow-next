# Template-maintenance task record

## Task ID

TEMPLATE-AGENT-MEMORY-001

## Status

queued — non-blocking enhancement after the core direct-host/Dual workflow is stable

## Task-start template-development SHA

18de9c9d559d0f68ef20c7623789898e027e6554

## Review-base template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Public-safe task brief

Integrate `https://github.com/rohitg00/agentmemory` as an advisory persistent-memory layer for the local developer roles in `floris3456/agentic-workflow-next`.

Use stable role identity rather than model version:

- `lead-developer` — Dual lead (initially Opus 4.6, later replaceable);
- `spark-implementer` — Dual executor (initially GPT-5.3-Codex-Spark);
- `small-developer`;
- `heavy-developer`.

Every retrieved memory must preserve who authored it. Support both shared/team recall and own/isolated recall. Spark should normally receive its own memory automatically because the lead supplies the current detailed execution instructions; Spark can explicitly query team memory when useful. Lead/small/heavy may use shared memory by default.

Memory is never instruction authority. Current human/task/Git/AS-BUILT/deviation/task-progress truth wins over remembered claims.

Do not use AgentMemory to reintroduce conversation compaction or a complicated context reconstruction system. The operative context policy is owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`: last 5,000 raw chat tokens plus instructions to re-read the durable files needed for the task, with no compaction fallback.

## Execution order position

This is step 6, after the core workflow is already working:

1. Direct Host substrate.
2. Dual opt-in proof.
3. Instruction Minimalism cutover and Dual default.
4. One representative substantive Dual task.
5. Direct Host bridge/broker retirement.
6. **AgentMemory enhancement — this task.**

This task must not block steps 3–5. If AgentMemory is unavailable or proves troublesome, the workflow continues using the repository's durable records.

## Responsibility boundary

This record owns only the memory integration:

- pin/select an exact compatible AgentMemory version;
- connect the developer roles to one project-scoped memory service/storage boundary;
- stable per-role authorship;
- shared/team and own/isolated recall;
- visible memory authorship/provenance;
- safe capture rules;
- graceful operation when memory is unavailable.

It does not own Dual behavior, route/default/review semantics, task-record/task-progress, or context-compaction policy.

## Current position

No AgentMemory integration exists in `agentic-workflow-next` today.

At the earlier planning review, upstream AgentMemory `main` was observed at `2d38dafede67d0d4ed920cde94d2106e98825b8a` and supported OpenCode plus shared memory concepts. Implementation must re-read upstream and pin an exact compatible release/commit rather than following moving `main`.

Exact live template source refs at this planning revision:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development` planning base: `87c48bb7e29f9ad0cef61cf0f0edcea670e71825`

No memory/runtime source implementation has been performed under this task.

## Memory rules

### Advisory only

Memory can contain useful lessons, project conventions, architecture observations, recurring bugs, and file history. A memory conflict with current repository/task truth means “check current truth,” not “follow the memory.”

### Authorship

Use stable role IDs as the author/filter key. Model/provider/version can be metadata but must not determine the durable role identity.

Shared recall must show the author of each relevant memory. Own recall must filter to the selected role.

### Defaults

Initial simple defaults:

- Spark: own/isolated automatic memory;
- lead: shared/team automatic memory;
- small: shared/team automatic memory;
- heavy: shared/team automatic memory.

Keep an explicit way for any role to query its own or team memory when useful. These are configuration choices, not new routing authority.

### Capture safety

Do not intentionally persist:

- private chain-of-thought/reasoning traces;
- credentials/tokens/secrets/authentication headers;
- unnecessary raw private session/device/provider identifiers;
- unnecessary host-local absolute paths when repository-relative paths suffice;
- unbounded raw logs/tool output.

Prefer concise reusable facts/lessons. If an optional AgentMemory provider would transmit stored project memory to an additional external service beyond already-authorized traffic, do not silently enable it.

### Failure behavior

AgentMemory is an optimization. If it is absent, stale, or broken, do not fabricate recall and do not block normal work that can proceed from the canonical task-record, task-progress, AS-BUILT/deviations/docs, and exact Git state.

## Context relationship

Do not build a context builder under this task.

The supported developer context remains simple:

- normal instructions;
- last 5,000 raw tokens of the full chat;
- explicit instruction to read the necessary durable files for the task;
- optional relevant AgentMemory recall when available.

There is no compaction fallback and AgentMemory is not a replacement summary of the old conversation.

## Verification philosophy

Keep integration proof small and practical.

Do not build exhaustive memory-isolation verifiers, custom context-state machines, or large negative-test suites at the outset. A focused smoke proof should establish that:

- memories are written/read under the correct stable role identity;
- shared recall can surface another role's memory with its author visible;
- own recall can return the selected role's memory;
- normal developer work still proceeds when AgentMemory is unavailable.

Use ordinary tests/checks appropriate to the integration. Add stronger mechanics only if real failures later justify them.

## Remaining work

1. After the core Direct Host/Dual/instruction/bridge-retirement path is stable, re-read upstream AgentMemory and choose/pin an exact compatible version.
2. Install/connect it in the smallest replaceable way.
3. Add stable role attribution for lead, Spark, small, and heavy.
4. Configure shared/team and own/isolated recall with the initial defaults above.
5. Narrow capture to safe reusable memory rather than private/raw execution state.
6. Run the small smoke proof described above.
7. Update only the architecture/AS-BUILT/docs needed to describe the actual memory integration.
8. Stop. Do not expand this task into a generalized context-management platform.

## Next action

Wait until the core direct-host/Dual workflow and bridge retirement are complete. Then add AgentMemory as an independent optimization.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/AS-BUILT.md`
- developer `docs/deviations.md`
- upstream `rohitg00/agentmemory` exact source selected during implementation

## Last handoff commit

None
