# Template-maintenance task record

## Task ID

TEMPLATE-AGENT-MEMORY-001

## Status

queued — persistent-memory/context-reconstruction architecture accepted; implementation waits for the basic direct-host and Dual developer proofs

## Task-start template-development SHA

18de9c9d559d0f68ef20c7623789898e027e6554

## Review-base template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Public-safe task brief

Integrate `https://github.com/rohitg00/agentmemory` as the persistent advisory memory layer for local developers in `floris3456/agentic-workflow-next`, with stable per-role authorship, shared team recall, optional own-memory-only recall, and deterministic context reconstruction that replaces routine lossy conversation compaction.

The memory system must serve the developer roles rather than become a new instruction authority. The canonical task-record, task-progress, exact repository state, AS-BUILT, accepted design/deviations, and actionable docs remain durable truth. AgentMemory stores attributed reusable experience and retrieved context that can help a developer reason faster, but a remembered claim never overrides current authoritative state.

Use stable role identities rather than model versions. The initial identities are semantically:

- `lead-developer` — the Dual lead, initially Opus 4.6 and later upgradeable to Opus 5;
- `spark-implementer` — the Dual executor, initially GPT-5.3-Codex-Spark;
- `small-developer` — specialized simple-task single-model route;
- `heavy-developer` — specialized difficult/important-small-task single-model route.

Every memory/retrieval result must preserve who authored it. The integration must support both:

- **shared/team recall** — relevant memories from all developer roles, with author identity retained;
- **isolated/own recall** — only memories belonging to the selected developer role.

Spark should default to a narrow/own-memory automatic context profile because the lead supplies its exact execution packet; Spark must still be able to make an explicit broader team-memory query when useful. Lead, small, and heavy may use shared/team recall by default. Exact defaults may be tuned from acceptance evidence, but the shared/isolated capability and authorship are mandatory.

Remove routine conversational compaction from the supported developer workflow. Instead, before useful context is exhausted, preserve/update the authoritative durable state and start/continue with a deterministic reconstructed context containing the applicable role instructions, canonical task-record, current task-progress, relevant AS-BUILT/design/deviation/actionable-doc state, selected AgentMemory recall, and a bounded recent raw conversation tail.

Do not freeze an arbitrary recent-tail number before measurement. Benchmark a small range such as roughly 5k and 10k recent tokens, and choose the smallest tail that preserves useful local conversational continuity after authoritative context is injected. Different roles may use different tails; Spark is expected to need less recent conversational history than the lead because the lead supplies a fresh detailed execution packet.

AgentMemory may internally summarize/consolidate observations as advisory memory. That is not repository/task context compaction and must never replace canonical durable records.

## Responsibility boundary

This record owns the **persistent developer-memory and context-reconstruction runtime**:

- exact pinned AgentMemory version/upstream provenance and installation method;
- one compatible local memory service/storage boundary for developer agents;
- stable per-role memory authorship independent of model versions;
- shared/team and isolated/own recall semantics;
- automatic-memory default profiles and explicit cross-role recall;
- memory provenance shown to consuming developers;
- memory capture/privacy filtering, including prohibition on persisting private chain-of-thought or raw credentials;
- graceful behavior when memory is unavailable or stale;
- deterministic context-builder ordering and token-budget policy;
- disabling routine automatic compaction in the supported path where the selected OpenCode runtime permits it;
- proactive context/session rotation/reconstruction before provider overflow;
- acceptance tests for memory isolation/attribution and context recovery.

`TEMPLATE-DUAL-DEVELOPER-001` owns the lead -> Spark architecture, Spark execution packets, proposed-deviation channel, lead review, and Dual developer topology.

`TEMPLATE-INSTRUCTION-MINIMALISM-001` owns the cross-system instruction wording: memory is advisory, canonical authority precedence, task-progress semantics, route/review rules, and the replacement of compaction-era procedural language with context-reconstruction language.

`TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` owns the selected compatible OpenCode runtime, direct-host worktrees/session control, no-replay runtime recovery, canonical repository identity, and bridge retirement.

The AgentMemory integration must not be a prerequisite for proving the base Dual developer. Dual first proves correctly with memory disabled/optional; this task then adds memory and reconstruction and proves that its absence degrades gracefully rather than corrupting the developer workflow.

## Current objective

Create a memory/context stack with explicit precedence:

```text
Hard human/system/branch authority
  -> canonical task-record
  -> exact repository state + accepted architecture/design/deviations
  -> task-progress / current execution continuity
  -> selected actionable docs
  -> attributed AgentMemory recall (advisory)
  -> bounded recent raw conversation tail
```

On a context boundary, reconstruct from these sources instead of asking a model to compress the entire prior conversation into another opaque summary.

For a Dual task:

```text
Lead developer
  -> shared team memory by default
  -> deep current-state analysis
  -> detailed Spark packet

Spark implementer
  -> own-memory automatic context by default
  -> explicit team recall available when needed
  -> every recalled item retains author identity
```

Memory must accelerate reasoning without changing authority or silently contaminating one role with unattributed assumptions from another.

## Current position

No AgentMemory integration exists in `agentic-workflow-next` today. Current continuity is primarily repository task-progress/AS-BUILT/deviation state plus OpenCode/web conversational continuity, and current developer instructions explicitly contain compaction-safe/compaction-recovery language.

Upstream `rohitg00/agentmemory` was inspected during planning. At this record's creation its public `main` head is:

- AgentMemory `main`: `2d38dafede67d0d4ed920cde94d2106e98825b8a`

The observed upstream supports OpenCode integration and a shared memory service, but this task must select and pin an exact compatible version during implementation rather than depending on moving `main`.

The current upstream OpenCode capture plugin records broad session/tool events and includes hooks for reasoning and compaction events. The template must not adopt that capture behavior blindly: private chain-of-thought must not be persisted, and raw tool/session data must be filtered so secrets or unnecessary sensitive runtime values do not become durable memory.

Exact live template source refs at planning time:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- task-start `template-development`: `18de9c9d559d0f68ef20c7623789898e027e6554`

No source/runtime memory implementation has been performed under this task.

## Source ranges

None yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `18de9c9d559d0f68ef20c7623789898e027e6554`

## Observed

- The template already relies heavily on persistent repository state: task records/progress, AS-BUILT, deviations, architecture/design, exact Git, and actionable docs.
- That durable-state design means routine whole-conversation compaction duplicates information already stored in more authoritative and purpose-built forms.
- A recent raw conversational tail is still useful for local dialogue continuity, especially for unresolved details that have not yet become durable state.
- AgentMemory is designed as cross-session agent memory and has an OpenCode integration surface, making it a plausible fit for developer memory without inventing a new memory engine.
- A shared memory service creates attribution risk unless every write/read is bound to a stable developer role and every retrieved memory preserves its author.
- Spark benefits from a narrower automatic context than the lead because Spark should execute a current detailed packet rather than synthesize architecture from an uncontrolled mixture of old memories.
- Upstream memory capture can include broad tool/session data. The template needs a narrower capture boundary than a generic coding-agent installation.
- Memory can be unavailable, stale, or wrong. The existing Git-backed durable truth must remain sufficient to resume and complete work without trusting memory.

## Interpretation

### Memory is advisory, never instruction authority

A memory result is evidence/recall with provenance. Before using it for a consequential decision, compare it with current task/repository truth when the fact could have changed.

Memory must never silently override:

- the current human request;
- the canonical task-record;
- branch/agent authority rules;
- exact current repository state;
- accepted current architecture/design/deviation truth;
- a newer task-progress decision.

Conflicting memory is a reason to inspect current evidence, not permission to follow the memory.

### Stable authorship

Use stable role IDs, not transient model IDs, as the primary memory author/filter key. Store model/provider/version only as optional provenance.

A future Opus 5 lead should still read/write `lead-developer` memory. A future Spark model upgrade should still read/write `spark-implementer` memory unless the role itself changes.

At minimum each stored/retrieved memory must expose:

- developer role author;
- project/repository scope;
- memory content/type/concepts as supported by the selected AgentMemory version;
- useful file/scope references when safe;
- source/session/time metadata sufficient to distinguish old recollection from current truth without persisting private runtime identifiers into Git.

### Shared versus isolated recall

The integration must expose both modes explicitly and test them at the exact API/plugin path used by OpenCode:

- **team/shared:** search all developer-role memories for this project and retain author labels;
- **own/isolated:** filter to one selected developer role.

Automatic context defaults:

- `spark-implementer`: own/isolated memory by default;
- `lead-developer`: team/shared by default;
- `small-developer`: team/shared by default unless measured evidence favors a narrower default;
- `heavy-developer`: team/shared by default unless measured evidence favors a narrower default.

Spark may explicitly query team memory. The lead may explicitly query Spark-only memory when reviewing Spark-specific lessons/patterns.

Do not treat memory isolation as a security boundary until the exact selected version/integration passes negative tests proving the filter on every recall path the template exposes.

### Capture boundary

The generic upstream integration must be narrowed/configured/adapted so template memory does not become a dump of private execution state.

Do not intentionally persist:

- private chain-of-thought/reasoning traces;
- credentials, tokens, secrets, authentication headers, or environment-secret values;
- raw private agent/session/device/provider identifiers when a stable public-safe role/project label is sufficient;
- unnecessary host-local absolute paths when repository-relative paths are enough;
- unbounded raw tool output/log streams.

Prefer durable lessons, project conventions, architecture facts, recurring bugs, file-specific history, and validated workflow observations.

If an AgentMemory LLM/provider option would transmit stored project memory to an external service beyond already-authorized model traffic, that is a privacy/access choice and must not be silently enabled. Prefer a local/keyless mode when it satisfies the requirement; otherwise surface the provider choice to the human.

### Context reconstruction instead of routine compaction

The supported workflow should not depend on model-generated whole-history compaction summaries.

Before approaching the usable context boundary:

1. make canonical task-progress/resumable state current;
2. ensure applicable AS-BUILT/deviation/actionable-doc state is current for already-implemented facts;
3. capture only useful advisory memories under the correct role identity;
4. establish the exact current repository/worktree state;
5. start/continue a fresh context/session with deterministic reconstruction;
6. inject only the authoritative/relevant sources plus selected memory and a bounded recent raw tail;
7. continue the same task without inventing a new task identity.

The context builder should prioritize correctness over filling the entire model window. Old low-value conversation is discarded rather than summarized into a competing truth source.

### Reconstructed context order

A fresh developer context should be assembled in a stable order approximately:

1. role/system/branch instructions and permission boundary;
2. canonical task-record and exact accepted plan reference;
3. current task-progress/resume state;
4. relevant exact current AS-BUILT, accepted architecture/design/deviations, and actionable docs;
5. exact current repository/worktree/ref facts needed for the task;
6. selected attributed AgentMemory recall;
7. bounded recent raw conversation tail.

The implementation may optimize token placement/caching, but must not reorder authority such that memory or recent chat overrides canonical task/repository truth.

### Recent raw tail

Do not make `5k` or `10k` a universal architecture constant yet.

Acceptance testing should compare at least a small useful range around those values and choose the smallest role-appropriate tail that preserves conversational continuity after authoritative context is loaded. The implementation should make the tail configurable without changing task semantics.

Expected direction:

- lead: larger recent tail because it carries architectural discussion and review dialogue;
- Spark: smaller recent tail because each execution pass receives a detailed current packet;
- small/heavy: modest tail proportional to their intentionally bounded tasks.

### Compaction handling

Disable routine automatic/preflight compaction on the selected OpenCode runtime where supported and prove the exact behavior rather than assuming a configuration flag is absolute.

Proactive reconstruction should occur before normal provider overflow. If the selected runtime/provider can still perform an emergency/forced overflow compaction that cannot be fully disabled, treat that as a recovery fallback rather than normal continuity. Record/prove the limitation and ensure task-progress/repository state still allows deterministic reconstruction afterward.

Remove normal workflow instructions that tell agents to maintain progress *for compaction*. Progress is maintained for durable resumption, route/session transfer, failure recovery, and context reconstruction.

### Memory failure behavior

AgentMemory is an optimization layer. If it is unavailable, corrupted, or cannot prove the requested filter:

- do not fabricate recall;
- do not weaken task/repository authority;
- continue from canonical durable records when safe;
- isolate only the memory-dependent action;
- repair/reconcile memory separately;
- never replay an ambiguous repository mutation because memory is missing.

A memory outage must not automatically block a task whose required state is fully recoverable from Git-backed durable truth.

## Attempts

- Inspected the requested `rohitg00/agentmemory` repository and its OpenCode integration surface.
- Confirmed the desired architecture can use one developer memory service with role-attributed shared and isolated recall rather than building a separate memory system for each model.
- Separated AgentMemory advisory recall from the existing Git-backed durable truth architecture.
- Reframed removal of compaction as deterministic context reconstruction with a recent raw tail rather than relying on lossy whole-history summaries.
- Added a template-specific capture boundary because generic upstream capture includes more session/reasoning/tool data than this architecture should retain.
- No memory runtime/source change or `main` mutation has been performed.

## Changed approach

The original design discussion described compaction as obsolete because repository persistence already preserves most important state. The accepted plan keeps that insight but makes the runtime requirement precise: remove routine lossy compaction from the supported path, proactively reconstruct context from authoritative sources, and treat any unavoidable provider-overflow compaction as an exceptional recovery condition until the selected runtime proves it can be disabled completely.

Memory is not a replacement for task-progress, AS-BUILT, deviations, or docs. It is an attributed advisory layer that lets developers reuse lessons and history without making chat summaries authoritative.

## Checks

- Exact live template source refs were independently read before creating this record.
- AgentMemory public repository and exact current `main` SHA were independently read.
- AgentMemory OpenCode capture code was inspected enough to identify that the template needs explicit role attribution and a narrower privacy/capture boundary.
- Current developer task workflow was confirmed to contain compaction-specific recovery language that will need semantic replacement during the instruction cutover.
- No source implementation has been performed under this task.

## Blockers / required decisions

No human decision blocks local/keyless memory design and acceptance testing.

Implementation waits for:

1. `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` Stage 1 basic direct-host/OpenCode proof; and
2. `TEMPLATE-DUAL-DEVELOPER-001` proof that the lead -> Spark developer works correctly without depending on AgentMemory.

If the chosen AgentMemory configuration requires transmitting stored project memory to an additional external provider/service, that privacy/provider choice is human-owned unless already explicitly authorized.

The exact retained recent-tail token count is intentionally unresolved until measured. This is a tuning decision, not an architecture blocker.

## Remaining work

1. Consume and independently verify the direct-host and Dual developer prerequisite proofs.
2. Re-read AgentMemory upstream, select/pin an exact compatible release/commit, and record its provenance rather than following moving `main`.
3. Decide the smallest installation/update mechanism that keeps third-party runtime code replaceable and does not copy an uncontrolled source tree into the template.
4. Configure one project-scoped local AgentMemory service/storage boundary for developer roles.
5. Add/adapt role attribution so every memory write/read reliably carries `lead-developer`, `spark-implementer`, `small-developer`, or `heavy-developer` identity as appropriate.
6. Add explicit team/shared and own/isolated recall paths and prove author labels survive retrieval.
7. Configure Spark's automatic context to own-memory by default while retaining explicit team recall; configure lead/small/heavy defaults and keep them tunable.
8. Narrow capture so no private reasoning, credentials, unnecessary private runtime identifiers, or unbounded raw outputs are durably stored.
9. Implement deterministic context reconstruction from task-record/task-progress/current implementation truth/memory/recent raw tail.
10. Disable routine automatic compaction where the selected OpenCode runtime supports it and add proactive context-boundary rotation before overflow.
11. Benchmark recent-tail sizes around the proposed 5k/10k range per role and select/document the smallest useful defaults without freezing them into higher-level architecture.
12. Add negative tests proving own-memory recall cannot see another role through every exposed recall path and proving memory cannot override a newer task/repository fact.
13. Add failure tests proving memory outage/staleness degrades gracefully to canonical durable state.
14. Add reconstruction tests proving a fresh/rotated lead, Spark, small, and heavy context resumes the same task from deterministic sources without a model-generated whole-history summary.
15. Update runtime architecture/AS-BUILT/security/actionable docs and validators for the implemented memory/context behavior.
16. Hand the proven memory/context capability to `TEMPLATE-INSTRUCTION-MINIMALISM-001` for the final semantic/validator cutover.

## Next action

Wait for the direct-host Stage 1 and Dual developer proofs. Then pin and integrate AgentMemory with explicit role attribution and privacy filtering, prove shared/isolated recall, and prove deterministic context reconstruction with routine compaction disabled before `TEMPLATE-INSTRUCTION-MINIMALISM-001` makes the behavior operative everywhere.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer `.opencode/skills/task-workflow/SKILL.md`
- developer `.opencode/skills/implementation-records/SKILL.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/design-record.md`
- developer `docs/architecture/AS-BUILT.md`
- developer `docs/deviations.md`
- developer `SECURITY.md`
- developer validators/tests covering agent/runtime behavior
- upstream `rohitg00/agentmemory` exact pinned source/release selected during implementation

## Last handoff commit

None
