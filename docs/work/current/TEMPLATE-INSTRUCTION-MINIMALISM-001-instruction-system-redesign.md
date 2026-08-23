# Template-maintenance task record

## Task ID

TEMPLATE-INSTRUCTION-MINIMALISM-001

## Status

queued — instruction redesign plan aligned with Dual developer, attributed memory, and context reconstruction; no instruction/source implementation performed yet

## Task-start template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Review-base template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Public-safe task brief

Redesign the `agentic-workflow-next` instruction system across `web-orchestration`, `developer`, and `template-development` for simplicity, minimalism, reliability, and the shortest safe path to a proven task outcome. Remove duplicated instruction authority and routine lifecycle ceremony that does not materially improve correctness or recoverability.

The redesigned system must also activate the accepted new developer architecture:

- `dual` becomes the normal/default route for substantive development;
- the Dual lead performs deep implementation architecture, gives Spark detailed execution instructions, reviews Spark's actual work, and steers corrections;
- Spark executes and may use a task-scoped `proposed-deviations` channel to challenge lead instructions, but may not silently deviate;
- `small` remains a specialized route for very simple bounded local work that generally needs no testing or only trivial testing;
- `heavy` remains a specialized route for bounded small work that is too difficult, important, subtle, or risky for `small` but does not justify the full Dual loop;
- `small` and `heavy` are never fallback executors inside Dual and never silently replace Spark.

The web orchestrator becomes primarily the **orchestration + web research + task/outcome design + final system-verification layer**, not the default deep implementation reviewer. Useful task design may require web research into specific architectural components before delegation; the boundary is depth and responsibility, not ignorance. The web layer understands enough to define the requested outcome, scope, constraints, expected checks, and likely affected architecture. The Dual lead then performs the deeper repository/current-state analysis needed to decide exactly how the implementation should work.

When that deeper current-state analysis shows an implementation expectation does not fit reality, the lead may choose a materially different implementation on its own as long as it still delivers the same requested outcome, respects material scope and hard constraints, and does not consume a human-owned risk/authority decision. The formal deviation record describes the resulting **current implemented state versus the prior expected state**; it is not a future-state permission request.

### Responsibility boundary

This record owns **cross-system instruction and lifecycle semantics**:

- permanent web-orchestrator role/authority and procedure routing;
- web research/task-design versus lead implementation-design responsibility split;
- public route-selection policy for direct, `small`, `heavy`, and `dual`;
- web final-verification depth for Dual versus single-model shortcut routes;
- canonical task-record versus task-progress authority and ownership;
- lead/Spark instruction-authority and proposed-deviation semantics at the instruction layer;
- formal deviation semantics shared across routes;
- developer and template-maintenance lifecycle, handoff, push/checkpoint, and recovery instructions;
- AS-BUILT/deviation/actionable-doc/package assessment rules;
- memory precedence and context-reconstruction semantics;
- removal of routine compaction-era workflow language;
- template-maintenance instruction responsibility split;
- validator philosophy and migration ordering for instruction contracts;
- removal of obsolete instruction requirements that only exist to drive the bridge transport.

This record does **not** own:

- host/runtime migration, worktrees, canonical repository migration, OpenCode version/runtime acceptance, bridge/runtime deletion, package-broker runtime deletion, bridge-only host administration, or direct-host base capability proof — owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`;
- the concrete lead -> Spark agent implementation, model configuration, Spark permission boundary, execution-packet runtime, proposed-deviation file implementation, or lead review loop — owned by `TEMPLATE-DUAL-DEVELOPER-001`;
- AgentMemory version/integration/storage, stable role attribution implementation, shared/isolated recall runtime, privacy filtering, context-builder implementation, or compaction/runtime acceptance tests — owned by `TEMPLATE-AGENT-MEMORY-001`.

The private fixed-operation adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001` and is not a prerequisite.

### Staged boundary

The four active architecture tasks have a strict dependency order rather than circular bootstrap:

1. `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` proves the direct-host/OpenCode substrate while the bridge remains intact.
2. `TEMPLATE-DUAL-DEVELOPER-001` proves the Dual lead -> Spark topology without depending on AgentMemory.
3. `TEMPLATE-AGENT-MEMORY-001` proves attributed shared/isolated memory plus deterministic context reconstruction.
4. This task performs the semantic/design/template/validator cutover that makes those proven capabilities the normal workflow.
5. One representative substantive task then runs through the operative Dual path while the bridge is still physically present but unused.
6. Runtime deletion returns to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` only after that proof.

This task must not delete bridge runtime merely because it removes bridge-era instruction semantics.

## Current objective

Produce and implement one minimal instruction architecture where each rule has one canonical owner, the normal path is short, developer-side implementation review happens inside Dual, web remains an independent final verifier without duplicating that deep review by default, durable context survives session/context replacement, and extra procedure is triggered only by a concrete need.

The target operating model is:

```text
Human
  -> outcome / material scope / consequential decisions / main acceptance

Web orchestrator
  -> web research needed to understand/design the task
  -> canonical task/outcome design
  -> route selection and orchestration
  -> final exact-remote system/outcome verification

Developer route
  direct -> web performs tiny exact mutation itself
  small  -> simple bounded single-model local shortcut
  heavy  -> difficult/important bounded small single-model shortcut
  dual   -> default substantive developer
             Lead: deep current-state analysis + architecture + Spark instructions
             Spark: fast edits/tests + proposed deviations
             Lead: exact implementation review + steering

Git-backed durable truth
  -> task-record / task-progress / AS-BUILT / deviations / docs / exact Git

AgentMemory
  -> attributed advisory recall, never authority

Human
  -> only authority accepting one exact reviewed developer SHA into main
```

The semantic cutover must migrate validators/tests in the same reviewed ranges so the new correct architecture is not rejected by old exact-prose, small-default, bridge, compaction, review, or lifecycle assertions.

## Current position

The current system has sound high-level safety rules but encodes the previous architecture in many places:

- web instructions identify the web orchestrator as the primary deep reasoning/task-design/independent-review layer;
- OpenCode defaults to `small-developer`;
- developer architecture exposes only `small` and `heavy` single-model routes;
- both developer agents prohibit subagents and independent review;
- current web route policy treats `small` as the normal default and contains a fixed small-failure escalation concept;
- developer/template instructions require push-after-every-commit, handoff-only snapshot commits, and archival/finalization ceremony as normal lifecycle steps;
- task-progress is described as compaction-safe and has explicit compaction-recovery procedure;
- no attributed AgentMemory layer or deterministic context reconstruction exists;
- validators frequently pin exact prose, `small-developer` as default, six-field handoffs, bridge structures, compaction-era lifecycle, and other implementation details.

Exact live source refs at original task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

No source instruction changes have been made under this task.

Independent architecture review first identified circular bootstrap, duplicated task authority, validator rollback, mandatory package/archive ceremony, and ambiguous checkpoint/recovery ownership. The later accepted Dual/memory architecture now also changes route selection, review ownership, deviation authority, and continuity semantics. This record incorporates those decisions before implementation.

## Source ranges

None yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

## Observed

- Permanent web instructions already contain a strong universal principle: complete the human's actual outcome with the shortest route that proves it.
- Useful web task design sometimes requires researching specific architectural components before implementation; removing deep implementation ownership does not mean the web orchestrator should design tasks blindly.
- The same developer task/push/handoff/finalization rules are restated across root instructions, agent files, multiple skills, work docs, and validators.
- Current developer agents are implementation-only; no developer-side architect/reviewer exists.
- Current OpenCode/validator configuration pins `small-developer` as the default and denies the delegation needed by a Dual lead.
- Template-development currently conflates accepted task plan and execution progress in the same historical `task-progress` shape.
- Bridge transport detail dominates ordinary workflow/recovery even though direct host access is being established for the new repository.
- The repository already has strong persistent truth sources: task records/progress, AS-BUILT, deviations, architecture/design, exact Git, and actionable docs.
- Because those records are purpose-built, routine whole-conversation compaction becomes redundant and can create a lower-quality competing summary.
- A bounded recent raw conversation tail remains useful for local dialogue continuity after deterministic authoritative context reconstruction.
- AgentMemory can add attributed reusable experience but must remain advisory and must not capture private chain-of-thought or become a source of instruction authority.
- AS-BUILT and deviations are reconstruction/safety mechanisms; the primary risk is failing to assess/update them when required, not the cost of keeping them accurate.
- Current validators often require exact wording, route phrases, tool names, six-field handoffs, fixed route escalation, bridge structures, compaction-era lifecycle, and finalization details instead of validating behavior/hard boundaries.
- The accepted template-maintenance design currently treats package production as the normal post-review path even though source implementation can be complete without transfer/release.
- Automatic post-commit push and handoff-only snapshot requirements are operating choices rather than architectural necessities.
- Developer safety hooks that block unsafe `main` mutation, force/non-fast-forward behavior, or continued work after unresolved synchronization failure remain useful independently of ceremonial push/snapshot policy.

## Interpretation

### Normative terminology

- **Task-record:** the accepted instruction plan for a task. It defines the requested outcome, scope, constraints, required work/outputs, expected checks, relevant accepted design, and any explicitly authorized exception. It is instruction authority, not an execution log.
- **Task-progress:** durable execution context while acting on a task-record. It preserves only what is needed to resume correctly: current position, material observations, meaningful failed attempts/route changes, blockers/decisions, checks already run, remaining work, and next action. It must not contain command-by-command history or private reasoning and must never silently redefine the task-record.
- **AS-BUILT:** the reverse-engineered description of all code files within its directory, complete enough to reconstruct the implemented reality of those files.
- **Deviation:** a durable description of current implemented reality whenever the resulting implementation materially differs from an applicable prior normative expected state. It records what is actually implemented, which expectation it differs from, and why the actual implementation still satisfies the accepted outcome/constraints or which accepted exception applies. It is not a proposal for a future state and is not permission by itself.
- **Proposed deviation:** a non-normative developer-internal proposal, used especially by Spark to challenge a lead execution instruction before the lead decides whether to adopt it. It does not become a formal deviation merely by being proposed.
- **Other actionable docs:** user/operator/developer/procedural documentation that becomes false or materially incomplete because of the implementation.
- **AgentMemory:** attributed advisory recall. It can accelerate reasoning but cannot override newer authoritative task/repository truth.

### Canonical task authority

For consequential work that needs durable authority, there must be exactly one canonical task-record for the requested outcome.

- The task-record owns outcome, material scope, constraints, required work, expected checks, accepted design links, and explicit exceptions.
- Task-progress references that record by stable task ID/path and, where useful for unambiguous resumption, the exact accepted record commit. It does not copy the brief as a second source of truth and does not reinterpret or weaken the plan.
- A material authorized change to the requested outcome/scope/constraints updates the canonical task-record through the authority that owns that change.
- A lead implementation decision that changes only the implementation route while preserving the same requested outcome/scope/hard constraints does not require rewriting the task-record merely to predict implementation reality; record a formal deviation when the resulting current implementation materially differs from the task/design's prior expected state.
- Template-maintenance uses the canonical template-development task-record for cross-branch authority. Branch-local progress may preserve source execution state but remains execution context rather than a competing plan.
- Tiny one-turn direct work may skip persisted task records/progress when there is no meaningful continuity, delegation, cross-branch coordination, architectural, audit, or recovery need.

Historical records remain historical evidence. Do not rewrite old records just to adopt new terminology.

### Authority split: human, web, lead, Spark

**Human:** owns requested outcome, consequential/material scope changes, named risk decisions, sensitive access/privacy choices, and exact-SHA `main` acceptance.

**Web orchestrator:** owns web research, task/outcome design, route selection, orchestration, final system/outcome verification, and cross-task responsibility boundaries. It should research specific architecture/components deeply enough to produce a useful task-record and expected checks. It should not attempt to fully pre-solve every implementation detail that the local lead can inspect more accurately against the live repository.

**Dual lead:** owns deep implementation architecture and developer-side review for a `dual` task. It reconciles the task's expected implementation with actual current repository reality, creates detailed Spark packets, accepts/rejects Spark proposed deviations, reviews exact Spark changes/checks, and steers corrections.

**Spark:** owns fast execution of the current lead packet. It may propose a materially different implementation when evidence supports it, but may not silently implement that departure before lead acceptance.

A lead may intentionally create a formal deviation without returning to web/human when the deeper current-state reality justifies a different implementation and the same requested outcome, material scope, and hard constraints remain satisfied. Escalate only when the change alters the requested outcome/scope, consumes a human-owned risk/authority choice, weakens a hard safety boundary, or needs unauthorized capability/access.

### Minimal permanent rules

Permanent cross-task instructions should contain only hard rules that truly apply everywhere:

1. complete the human's actual outcome;
2. use the shortest safe route that proves it;
3. remote Git is authoritative for repository facts;
4. run only one mutating route per worktree;
5. never persist private/sensitive runtime information into public Git or private chain-of-thought into durable memory;
6. never replay an ambiguous mutation without reconciliation;
7. treat agent handoffs/blockers/memory as claims or navigation, not acceptance;
8. keep `main` promotion human exact-SHA only.

Conditional procedure belongs in one routed skill rather than repeated permanent prose.

### Route semantics

The target route vocabulary describes task shape, not a failure/escalation ladder:

- **Direct web/GitHub:** tiny, precisely known, low-risk mutation that web can perform and prove more simply than launching local development.
- **`small`:** very simple bounded local work that is too slow/wasteful for direct web execution, generally requires no testing or only trivial checks, and does not justify Dual overhead.
- **`heavy`:** bounded small work that is too difficult, important, subtle, or risky for `small`, but still small enough that lead -> Spark decomposition/review would be wasteful.
- **`dual`:** normal/default substantive development: nontrivial implementation, interacting changes, meaningful testing, uncertainty, deeper architecture/current-state reasoning, or developer-side review.

`small` and `heavy` are independent single-model shortcuts. They never replace Spark inside a running/selected Dual task. If a required Dual capability is unavailable, mark only `dual` unavailable and make a fresh route decision from the actual task; do not pretend the same Dual execution occurred with another agent.

Do not require a fixed number of failed `small` attempts before `heavy` or `dual`. Select the right route from task characteristics and current evidence.

Model/provider/version names are implementation configuration. Public route semantics should survive Opus/Spark/small/heavy model upgrades.

Runtime proof/removal of the bridge is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`; concrete Dual topology is owned by `TEMPLATE-DUAL-DEVELOPER-001`.

### Developer review and web final verification

For a `dual` task, Spark completion is not a developer handoff. The lead must inspect the actual implementation and relevant checks, then steer corrections as needed. Only the lead can return a developer-reviewed completion from Dual.

Web then performs final independent **system/outcome verification**, not a routine duplicate of the lead's entire line-by-line review. At minimum verify:

- the exact remote SHA/range exists and matches the claimed developer result;
- canonical CI/required checks have the expected exact-SHA evidence;
- the canonical task-record outcome/material constraints are satisfied;
- applicable AS-BUILT/deviation/actionable-doc truth is current;
- material architecture/safety/authority boundaries are satisfied;
- any named residual risk/decision is owned by the correct authority.

Deepen web review proportionally for high-stakes security, permissions, destructive migrations, weak/unclear lead evidence, or other conditions where independent implementation-level inspection materially improves confidence.

`small` and `heavy` have no lead reviewer. Because they are intentionally small/bounded, web final verification must become proportionally deeper enough to review the actual implementation itself without turning those routes into Dual internally.

### Proposed-deviation semantics

The task-scoped `proposed-deviations` artifact owned by `TEMPLATE-DUAL-DEVELOPER-001` is a developer-internal lead/Spark channel.

A proposal should identify the challenged lead instruction/assumption, direct current-state evidence, the proposed alternative, why it better achieves the same requested outcome, expected test/durable-record impact, and lead disposition.

Spark may not silently implement a material proposal before lead acceptance. Lead acceptance converts it into the lead's current execution instruction; it does not itself create a formal deviation record.

After implementation, assess the final current state against applicable prior expected states. If the accepted proposal produced a material current-state difference, record the formal deviation describing that actual difference.

### Formal deviations describe current state

Deviation assessment is about **implemented reality now**, not predicting or seeking permission for a future implementation.

Compare the resulting implementation with every applicable normative expected state, including the canonical task-record, direct human instruction, accepted ADR/design/plan/gate, and material delegated/lead instruction that defined an expected implementation state.

Record a formal deviation when the final implementation intentionally differs materially. The record should make clear:

- what is actually implemented now;
- what prior expectation it materially differs from;
- the current-state evidence/reason for the difference;
- how the same accepted outcome/constraints are satisfied or which explicit accepted exception applies.

Meaningful failed attempts that end at the expected state belong in task-progress, not deviations.

### Task-progress lifecycle

Task-progress exists for information value and deterministic resumption, not cadence or compaction ritual.

Update it when resumable state changes materially: current position, material observations, meaningful failed attempts/route changes, blockers/decisions, checks already run, remaining work, or next action. Do not update after every command merely to create history.

A progress update should normally travel with a meaningful implementation/checkpoint commit. A dedicated progress-only checkpoint is appropriate when work must pause, transfer, rotate context/session, or survive a meaningful interruption without another substantive implementation commit.

### Context reconstruction and AgentMemory

Routine whole-conversation compaction is not part of the target workflow.

The repository's durable records already preserve higher-quality purpose-specific state. Before a developer context becomes too large, make resumable durable state current and reconstruct a fresh context from deterministic sources.

Authority order is approximately:

1. current system/human/branch/role authority;
2. canonical task-record;
3. exact current repository state and applicable accepted architecture/design/deviations;
4. current task-progress;
5. relevant actionable docs;
6. attributed AgentMemory recall;
7. bounded recent raw conversation tail.

AgentMemory is advisory. Every recalled item must preserve author identity; a memory conflict with current authoritative state triggers inspection rather than overriding it.

The runtime implementation/default profiles are owned by `TEMPLATE-AGENT-MEMORY-001`, including Spark own-memory default and explicit team recall. This task must encode the semantic rule that memory never becomes task/instruction authority.

Replace instructions such as “keep progress useful after compaction” with “keep progress useful for resumption/context reconstruction/route or session transfer.”

Do not freeze 5k/10k recent-tail values into permanent instructions. Use the measured/configurable role defaults produced by the memory task.

If the selected runtime can still perform an unavoidable emergency provider-overflow compaction after routine compaction is disabled, treat it as a recovery exception, not the normal continuity mechanism.

### Push/checkpoint rule

Remove push-after-every-local-commit as a universal rule from developer and template-maintenance workflows.

Push when one of these boundaries makes remote durability or independent evidence materially useful:

- before handoff or independent review;
- before route/worktree/session transfer;
- before a long interruption or recovery-sensitive checkpoint;
- before context/session rotation when remote durability materially reduces loss/recovery risk;
- when canonical CI or another remote check must run on the exact SHA.

Local commits between those boundaries are allowed when safe. Keep synchronization failure protection: if a push or other mutation is failed/ambiguous, stop dependent mutation until local and exact remote state are reconciled. Keep hooks/guards that protect `main`, reject force/non-fast-forward behavior, or prevent continued work after unresolved sync failure even if automatic post-commit push is removed.

### Tool-neutral recovery

Recovery should be a short no-replay procedure, not a transport state machine:

1. after timeout, disconnect, unknown response, failed publication, or ambiguous mutation, do not repeat the mutation automatically;
2. inspect the existing process/session where applicable, local worktree/Git state, and exact remote Git state;
3. if the original effect is active or completed, continue or review it;
4. replace/retry only after evidence proves the original effect absent or impossible to continue;
5. unresolved ambiguity blocks only dependent mutation until reconciled.

Memory absence is not evidence that a repository mutation failed. Reconcile exact execution/Git state before any retry.

Bridge UUID/sequence/mailbox/control-issue rules are not general recovery semantics and must disappear from the post-cutover workflow.

### Mandatory durable-record assessment

The **assessment is mandatory; the edit is conditional on resulting truth**.

Before handoff of a mutating task, execution must determine whether the final state requires AS-BUILT, deviations, other actionable documentation, and package/release work.

- **AS-BUILT:** for every changed code file, identify the applicable AS-BUILT scope and verify the AS-BUILT still accurately and completely describes all code files within its directory, including newly added files and changed behavior. If not, update it in the same resulting checkpoint/change. A previously undocumented code file is not exempt merely because the old AS-BUILT did not mention it.
- **Deviations:** compare final current implementation with every applicable prior normative expected state and record the actual material current-state difference as described above.
- **Other actionable docs:** update user/operator/developer/procedural documentation whenever the final implementation makes it false, materially incomplete, or misleading. Do not churn still-correct prose.
- **Packages:** package/release work is required only when the accepted task-record requests transfer, downstream application, release packaging, or another outcome that actually needs a package. It is not automatically part of source implementation completion.

A recorded `not required` classification is acceptable only when the relevant current artifact remains fully correct or the requested outcome does not require that artifact.

### Package semantics and accepted-design update

Source implementation completion and package/release transfer are separate outcomes.

Implementation under this task must amend the accepted template-maintenance design and operative skills so that:

- reviewed source work can complete without generating/applying a package when transfer/release is not requested;
- the tracked deterministic package generator and provenance contract remain authoritative when packaging is requested;
- package bases/heads remain exact reviewed ranges and are independently validated;
- the Action/request package broker remains a runtime concern owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` and may be removed only after direct canonical generator execution is proven.

Do not leave accepted design saying package production is mandatory while skills/task records say it is conditional.

### Developer lifecycle

For `dual`, the default substantive path should be:

1. read the canonical task-record and applicable branch/role instructions;
2. verify worktree/branch/start SHA;
3. create/resume concise task-progress only when durable continuity is warranted;
4. lead performs deep current-state/implementation analysis;
5. lead supplies Spark the detailed execution packet;
6. Spark implements/runs requested checks and uses proposed-deviations instead of silently changing material lead instructions;
7. lead reviews actual Spark diff/checks/proposals and steers corrections until developer-reviewed completion;
8. assess/update AS-BUILT, formal deviations, actionable docs, tests, and package/release obligations;
9. create meaningful commit(s) and push at the next proof/continuity boundary;
10. return concise producer data with exact remote developer SHA and perceived check/blocker state;
11. web independently performs final system/outcome verification from exact remote evidence.

For `small` or `heavy`, use the same canonical task/durable-state/safety rules but omit the lead -> Spark internal loop. Web's final verification covers the missing developer-side review proportionally.

Remove mandatory handoff-only snapshot commits. The latest meaningful pushed implementation/checkpoint commit should normally be the handoff boundary.

Remove mandatory post-approval archival/finalization from the critical path of a proven implementation outcome. If archival remains useful, treat it as explicit housekeeping/history maintenance rather than a universal completion prerequisite.

### Handoff semantics

Handoff is navigation, not acceptance. Keep only producer information that the next authority cannot derive more reliably from GitHub:

- status;
- exact last known remote SHA for the producing branch;
- perceived checks/results;
- any human-owned blocker/decision;
- task-progress path when one exists;
- explicit possible unpushed mutation when relevant;
- for Dual, enough indication that lead review completed and any unresolved proposed-deviation/human decision remains visible.

The reviewer derives changed files, exact ranges, commit ancestry, and CI from remote GitHub. Exact field names/order need not be frozen unless a machine consumer actually requires them.

### Web and template-maintenance responsibility split

- Web permanent instructions own universal hard boundaries, the high-level web role, and procedure router.
- Ordinary web workflow owns web research/task design, proportional route selection, orchestration, final verification, and completion.
- The Dual lead owns deep implementation design/review for Dual work; web instructions should not duplicate that procedure.
- Recovery owns ambiguous/failed-state reconciliation and no-replay.
- Template-maintenance web procedure should be a thin orchestrator wrapper that defers detailed branch procedure to canonical template-development repository instructions instead of copying them.
- Developer agent files should contain role, permissions, and route identity plus pointers to canonical shared procedure rather than duplicating generic lifecycle prose.
- Promotion remains a separate exact-SHA human-authorized procedure. Remove bridge transport details when obsolete, but retain guarded no-content-change promotion, branch-movement checks, exact parent/tree verification, and explicit human approval.

### Validator rules and migration ordering

Validators should prove machine-checkable safety/behavior, not editorial wording. Prefer schema/inventory, permission boundaries, allowed route selectors, exact default-role relationships, subagent containment, branch/main protection, private-state non-persistence, memory attribution/filter behavior, deterministic/provenance behavior, no-replay safety, and executable acceptance tests. Remove exact-English requirements unless the literal is a machine-consumed contract.

Validator migration is part of the semantic cutover, not cleanup afterward:

1. identify assertions that encode obsolete bridge behavior, exact prose, `small-developer` as universal default, fixed small-failure counts, web-as-deep-reviewer, six-field handoffs, compaction recovery, mandatory snapshot/finalization, or mandatory package behavior;
2. replace them with behavior/safety assertions describing the intended new system;
3. change instructions/agents/templates/design records and validators in the same reviewed cutover so canonical CI does not force obsolete semantics back into the repository;
4. retain exact runtime tests owned by the Dual/AgentMemory/direct-host tasks for the concrete mechanisms they implement;
5. keep push-triggered canonical CI as independent exact-SHA evidence.

Do not delete bridge runtime validators merely because this task stops requiring their semantics. Runtime deletion remains the direct-host task; coordinate ordering so CI remains meaningful until retirement.

## Attempts

- Performed a heavy comparison of current web-orchestrator, developer, and template-development instructions.
- Corrected task-record/task-progress distinction and strengthened AS-BUILT/deviation semantics.
- Split runtime/transport migration back to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` and removed circular bootstrap.
- Added canonical task authority, information-value progress, checkpoint push, tool-neutral recovery, package/design alignment, validator migration ordering, and stronger durable-record rules.
- Incorporated the accepted `TEMPLATE-DUAL-DEVELOPER-001` design: Dual default substantive route, specialized small/heavy small-task shortcuts, lead deep implementation/review, Spark execution/proposals, and no Spark substitution.
- Incorporated `TEMPLATE-AGENT-MEMORY-001`: attributed advisory memory, shared/isolated recall semantics, deterministic context reconstruction, and removal of routine compaction-era workflow.
- Corrected deviation authority so a lead may implement a better current-state solution without returning to web/human when it preserves the same accepted outcome/material constraints, with deviations documenting actual implemented difference rather than requesting future permission.
- No instruction implementation, validator rewrite, or `main` mutation has been performed under this task.

## Changed approach

The first version of this record repeated runtime migration details and some completion requirements owned by the direct-host task. A later revision separated ownership but still assumed the old single-model developer/reviewer architecture.

The accepted design now makes this task a later **semantic activation stage**:

- direct-host proves the base runtime;
- Dual proves developer-side architecture/review;
- AgentMemory proves attributed memory/context reconstruction;
- this task rewrites cross-system instructions/design/templates/validators to use those proven capabilities;
- a representative Dual task proves the operative path;
- destructive runtime retirement returns to direct-host.

Simplicity does not mean making web ignorant, dropping durable context, or forbidding implementation judgment. It means each layer does the depth of reasoning it owns: web researches/designs the task and verifies the outcome; lead deeply reconciles implementation with current reality; Spark executes; durable records preserve truth; memory accelerates recall; and duplicated ceremony disappears.

## Checks

- Exact task-start refs were independently read from GitHub.
- Current live `main`, `developer`, `web-orchestration`, and `template-development` refs were re-read before the latest planning amendments.
- Current web permanent/workflow/recovery/template-maintenance/promotion instructions were reviewed.
- Current developer root/agent/task/git/implementation-record/work-lifecycle instructions and `opencode.json` were reviewed.
- Current developer agent-system/design/validator behavior was reviewed for small-default, review, delegation, and lifecycle assumptions.
- Current template-development root/template-maintenance/Workspace/package/validator structure and accepted maintenance design were reviewed.
- Current AgentMemory/OpenCode integration was inspected enough to define the instruction-layer requirement that memory remain attributed/advisory and private reasoning not be persisted.
- Current validators were confirmed to contain exact-prose/bridge/default-agent/lifecycle assertions that would reject the intended architecture unless migrated with the semantic cutover.
- No source instruction files have been changed by this planning record.

## Blockers / required decisions

No human design decision currently blocks this instruction redesign.

Activation of the semantic cutover should wait for independent proof of:

1. `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` Stage 1 base direct-host/OpenCode execution/recovery/push/CI path;
2. `TEMPLATE-DUAL-DEVELOPER-001` lead -> Spark/default-route architecture; and
3. `TEMPLATE-AGENT-MEMORY-001` stable-role memory attribution/shared-isolated recall/context reconstruction behavior.

The exact on-disk naming/location of task-record versus task-progress remains an implementation detail. Choose the smallest migration that makes authority unambiguous and preserves historical records rather than introducing another global state machine or duplicate record hierarchy.

The exact task-scoped `proposed-deviations` path/schema is owned by the Dual task; this task only requires its non-normative semantics and correct relationship to formal current-state deviations.

Server-side `main` protection verification is a direct-host/runtime acceptance condition, not owned by this instruction task. Preserve human exact-SHA promotion authority and do not weaken repository-side protection requirements.

## Remaining work

1. Wait for and independently inspect the direct-host Stage 1, Dual developer, and AgentMemory/context prerequisite proofs; do not require bridge deletion first.
2. Re-read exact live source refs immediately before instruction implementation.
3. Define the smallest canonical task-record/task-progress ownership/naming scheme compatible with existing history; avoid duplicate briefs/plans.
4. Rewrite permanent web instructions around orchestration + web research + task/outcome design + final verification, keeping universal hard boundaries and avoiding deep implementation-procedure duplication.
5. Rewrite ordinary web workflow route selection for direct/`small`/`heavy`/`dual` exactly as accepted, removing fixed small-failure escalation and any silent Dual fallback/substitution.
6. Encode the Dual review split: lead deep implementation architecture/review; Spark execution/proposals; web exact-remote final verification; proportionally deeper web implementation review only for small/heavy or high-risk conditions.
7. Rewrite recovery around direct evidence, direct-host execution, tool-neutral no-replay reconciliation, and memory-independent Git truth, removing bridge command-bus ceremony from the operative path.
8. Simplify developer root/agent/shared-skill/work-lifecycle instructions so each normative rule has one owner; remove push-after-every-commit, mandatory snapshot commit, and default archival/finalization ceremony while retaining synchronization/main/no-force safety guards.
9. Simplify template-development maintenance instructions/task templates around one canonical task-record plus concise progress; remove automatic push/snapshot/finalization ceremony from the normal critical path.
10. Encode exact AS-BUILT completeness, formal current-state deviation semantics, lead same-outcome implementation authority, proposed-deviation distinction, and separate actionable-doc assessment.
11. Replace compaction-specific progress/recovery wording with deterministic context reconstruction/resumption semantics and encode AgentMemory as attributed advisory context rather than authority.
12. Amend accepted template-maintenance design/skills so package generation/application is conditional on transfer/downstream/release outcomes while retaining deterministic generator/provenance requirements.
13. Thin web template-maintenance wrapper and developer agent files so they point to canonical shared procedure instead of duplicating it.
14. Migrate validators/tests in the same cutover to enforce behavior, structure, safety, role/delegation boundaries, route semantics, memory authority, no-replay, and machine-consumed contracts rather than exact prose/obsolete bridge lifecycle assumptions.
15. Run focused checks and canonical push-triggered validation; independently review exact source ranges.
16. Run one representative substantive task through the operative `dual` workflow while bridge runtime remains present but unused; verify lead review, Spark proposal handling if applicable, context reconstruction, checkpoint/recovery, web final verification, and exact remote CI evidence.
17. Hand runtime deletion back to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. Do not absorb bridge/package-broker/bridge-admin deletion into this task.

Runtime deletion of bridge/package-broker/bridge-admin code, direct OpenCode version compatibility proof, concrete Dual agent implementation, concrete AgentMemory runtime, server-side `main` protection proof, Scout/general Workspace runtime decisions, package release/application for unrelated tasks, imported-history cleanup, and the private host adapter remain outside this task unless separately activated.

## Next action

Do not start the semantic cutover by deleting/bypassing the bridge or by partially changing route words. First consume the completed direct-host, Dual, and AgentMemory prerequisite proofs. Then perform the web/developer/template/design/validator changes as one coherent semantic cutover, run canonical validation plus one representative substantive Dual task while the bridge remains available, and return destructive runtime retirement to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- template-development `AGENTS.md`
- template-development `.opencode/skills/template-maintenance/SKILL.md`
- template-development `docs/design/template-maintenance-workflow.md`
- template-development `docs/architecture/AS-BUILT.md`
- template-development `docs/deviations.md`
- developer `AGENTS.md`
- developer `opencode.json`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `.opencode/skills/task-workflow/SKILL.md`
- developer `.opencode/skills/git-sync-and-handoff/SKILL.md`
- developer `.opencode/skills/implementation-records/SKILL.md`
- developer `docs/work/README.md`
- developer `docs/architecture/branch-workflow.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/design-record.md`
- developer `docs/architecture/AS-BUILT.md`
- developer `docs/deviations.md`
- developer `scripts/validate-agent-system.mjs`
- developer `scripts/validate-web-orchestrator-integration.mjs`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- web `web-orchestration-only/task-context/TEMPLATE.md`
- web package validator and canonical push-triggered CI assets
- exact AgentMemory upstream version/integration selected under `TEMPLATE-AGENT-MEMORY-001`

## Last handoff commit

None
