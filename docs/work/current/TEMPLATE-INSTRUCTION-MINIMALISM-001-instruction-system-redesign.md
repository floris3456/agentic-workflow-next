# Template-maintenance task record

## Task ID

TEMPLATE-INSTRUCTION-MINIMALISM-001

## Public-safe task brief

Redesign the `agentic-workflow-next` instruction system around a small number of clear responsibilities and durable files. Prefer written instructions and human/model judgment over custom workflow machinery. Remove duplicated authority, bridge-era ceremony, compaction behavior, exact-prose validators, and lifecycle steps that do not materially improve correctness.

Activate the accepted developer architecture:

- web orchestrator = orchestration + web research + task/outcome design + route selection + final outcome/system verification;
- Dual lead = deep current-state implementation architecture + detailed Spark instructions + developer-side review/steering;
- Spark = actual implementation/testing executor;
- `small` = very simple bounded local shortcut;
- `heavy` = difficult/important but still small bounded shortcut;
- `dual` = normal/default substantive developer after the opt-in mechanism is proven.

Web may research specific architectural components deeply enough to design a useful task. It should not duplicate the lead's detailed implementation analysis or routine line-by-line code review for Dual work.

## Execution position

This is **step 3**. The canonical overall execution order is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

AgentMemory is not a prerequisite for this task or for bridge retirement.

## Responsibility boundary

This task owns cross-system instruction semantics:

- web/lead/Spark responsibility split;
- direct/`small`/`heavy`/`dual` route policy and making `dual` the default substantive route;
- canonical task-record versus task-progress semantics;
- formal current-state deviation semantics and Spark proposed-deviation distinction;
- simple handoff/checkpoint/recovery rules;
- zero-compaction context policy;
- AS-BUILT/deviation/actionable-doc/package assessment rules;
- simplification/removal of unnecessary workflow validators and ceremony.

Direct-host runtime and bridge retirement belong to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. Concrete Dual mechanics belong to `TEMPLATE-DUAL-DEVELOPER-001`. AgentMemory runtime belongs to `TEMPLATE-AGENT-MEMORY-001`.

## Canonical task authority

### Task-record

A task-record is the accepted instruction plan. It defines requested outcome, material scope, constraints, required work/outputs, expected checks, relevant accepted design, and explicit exceptions.

For consequential work that needs durable authority, use exactly one canonical task-record. Do not mix volatile execution state into it and do not duplicate the same plan into competing records.

Tiny one-turn work may skip a durable task-record when continuity/audit value is negligible.

### Task-progress

Task-progress is separate resumable execution state, not instruction authority.

Create/update it only when useful for continuity. Keep only what is needed to continue correctly: current position, material observations, meaningful failed attempts/route changes, blockers/decisions, checks already run, remaining work, and next action.

Do not turn progress into a command log, private reasoning dump, duplicate task brief, or hidden plan change.

A material authorized change to requested outcome/scope/constraints changes the canonical task-record. An implementation decision that preserves the accepted outcome may instead produce a formal deviation when current reality materially differs from the prior expected implementation.

## Route selection

Choose the route from the task itself, not a retry counter:

- direct web/GitHub = tiny exact low-risk change web can do more simply;
- `small` = very simple bounded local work, normally no or trivial testing;
- `heavy` = difficult/important/subtle but still small bounded work;
- `dual` = default substantive development.

Small/heavy are not Spark fallbacks. If Dual is unavailable, make a fresh route decision.

## Review split

For Dual:

- lead deeply reviews implementation and steers Spark;
- web independently checks the exact remote result against the task outcome, relevant system/architecture constraints, ordinary check evidence, durable truth, and unresolved risk;
- web does not routinely repeat the lead's full implementation review.

For small/heavy, web reviews the bounded implementation more directly because there is no lead reviewer.

## Deviation semantics

A formal deviation describes **current implemented reality** when the resulting implementation materially differs from an applicable prior normative expected state. It is not a future-state proposal or permission request.

A Dual lead may intentionally choose a different implementation without returning to web/human when deeper current-state evidence shows it is better and it still satisfies the same requested outcome, material scope, and hard constraints.

Spark's task-scoped `proposed-deviations` file is only the internal proposal path before the lead decides.

## Zero-compaction context policy

There is **no compaction and no compaction fallback** in the target workflow.

Do not summarize/compact older conversation to preserve continuity. Retain the **last 5,000 raw tokens of the full chat** plus normal role/system/project instructions.

Agents must re-read the durable repository files needed for the current task instead of relying on an artificial chat summary, especially:

- canonical task-record;
- current task-progress;
- relevant AS-BUILT;
- relevant deviations;
- relevant architecture/design/actionable docs;
- exact current Git state when needed.

Keep this first version simple. Do not build a custom context-reconstruction engine, token-budget state machine, emergency compaction path, or context verifier.

If the selected runtime would automatically compact, configure/adapt the supported workflow so it does not. Old chat beyond the retained 5k raw tail is simply not part of active context; durable files carry important state.

AgentMemory may later add useful advisory recall, but it does not change this rule and is not required for continuity.

## Lifecycle simplification

### Push/checkpoint

Do not force a push after every local commit and do not require handoff-only snapshot commits.

Push when remote durability/evidence is actually useful: before handoff/review, route/session/worktree transfer, a meaningful interruption/recovery checkpoint, or when remote CI/checks need the SHA.

If a push or other mutation has an ambiguous result, stop dependent mutation until local and remote state are reconciled.

### Recovery

Never automatically replay an ambiguous mutation. Inspect current process/session/local Git/remote Git state first, then continue or retry based on evidence.

Do not replace the bridge state machine with another state machine.

### Archival/finalization

Archival/finalization is not part of the critical path to a proven task outcome. Completed or superseded task records should not remain in the live `current/` set merely because a ceremonial archive step has not happened.

### Packages

Source implementation can complete without a package. Generate/apply a package only when the accepted task requests transfer, downstream application, or release packaging.

Retain the deterministic generator/provenance logic when packaging is needed; remove the Action/request broker under Direct Host.

## Durable implementation truth

Before a mutating handoff, assess whether current reality requires AS-BUILT, formal deviations, other actionable docs, or package/release changes.

### AS-BUILT invariant

For every changed code file, identify the applicable AS-BUILT scope. The applicable AS-BUILT must remain **complete and accurate for all code files in its directory, enough to reconstruct the implemented reality of those files**.

A newly added or previously undocumented code file is not exempt. If its directory's AS-BUILT would no longer be complete/accurate, update that AS-BUILT in the same resulting change.

Keep this as an instruction/required outcome; do not build a dedicated verifier merely to restate it.

### Formal deviations

Compare the final implemented state against applicable prior normative expected states and record intentional material current-state differences.

### Other actionable docs

Update user/operator/developer/procedural documentation only when implementation makes it false, materially incomplete, or misleading.

### Packages

Assess whether the requested outcome actually requires transfer/release packaging; do not create packages by default.

## Instruction-first validation philosophy

Remove complex workflow verification unless it proves a real machine-consumed contract or hard safety boundary.

During this cutover:

- remove exact-English/prose validators;
- remove validators whose purpose is to enforce obsolete bridge lifecycle, retry counts, handoff ritual, compaction recovery, snapshot/finalization ceremony, or old routing/reviewer assumptions;
- keep ordinary code/tests/CI that actually test implementation behavior;
- keep small structural checks for things that truly must be machine-readable or are hard safety guards;
- prefer clear agent instructions over custom behavioral verifiers;
- add stronger mechanical enforcement later only when actual repeated failures justify it.

The goal is a small understandable workflow, not a mechanically proved workflow theorem.

## Required work

- rewrite web permanent/workflow/recovery/template-maintenance/promotion instructions around the new role split and direct routes;
- make `dual` the default substantive route while preserving small/heavy as the two small-work shortcuts;
- rewrite developer agent/shared instructions around lead/Spark/small/heavy roles without duplicating generic lifecycle prose;
- make lead non-editing for implementation source and Spark the implementation executor;
- adopt one task-record + separate concise task-progress semantics;
- adopt current-state deviation semantics and the Spark proposal distinction;
- replace all compaction language/behavior with the fixed last-5k-raw-chat + re-read-durable-files rule, with no fallback compaction;
- remove push-every-commit, handoff snapshot, mandatory finalization/archive, and mandatory packaging ceremony;
- remove/simplify complex workflow validators as described above while keeping ordinary useful tests/CI and hard safety checks;
- update accepted architecture/design/AS-BUILT/actionable docs to match the resulting operative workflow.

## Acceptance criteria

The cutover is complete when:

- operative web/developer/template instructions express one coherent simple authority model;
- `dual` is the default substantive route and small/heavy remain bounded small-work routes;
- lead/Spark/web responsibilities do not overlap by default;
- task-record and task-progress are separate concepts/artifacts;
- zero compaction + last 5k raw chat + durable-file reread is the supported continuity model;
- obsolete bridge/prose/lifecycle verifier assumptions no longer reject the correct workflow;
- the strong AS-BUILT completeness rule is preserved;
- ordinary relevant checks pass;
- one representative substantive Dual task succeeds before bridge retirement.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory.md`
- applicable web/developer/template architecture/AS-BUILT/deviation records
