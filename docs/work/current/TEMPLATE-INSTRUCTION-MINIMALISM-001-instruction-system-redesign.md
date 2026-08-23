# Template-maintenance task record

## Task ID

TEMPLATE-INSTRUCTION-MINIMALISM-001

## Status

queued — simplified semantic cutover; execute after Direct Host substrate and Dual opt-in proof

## Task-start template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Review-base template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Public-safe task brief

Redesign the `agentic-workflow-next` instructions around a small number of clear responsibilities and durable files. Prefer written instructions and human/model judgment over custom workflow machinery. Remove duplicated authority, bridge-era ceremony, compaction behavior, exact-prose validators, and lifecycle steps that do not materially improve correctness.

Activate the accepted developer architecture:

- web orchestrator = orchestration + web research + task/outcome design + route selection + final outcome/system verification;
- Dual lead = deep current-state implementation architecture + detailed Spark instructions + developer-side review/steering;
- Spark = actual implementation/testing executor;
- `small` = very simple bounded local shortcut;
- `heavy` = difficult/important but still small bounded shortcut;
- `dual` = normal/default substantive developer after the opt-in route is proven.

Web may research specific architectural components deeply enough to design a useful task. It should not duplicate the lead's detailed implementation analysis or routine line-by-line code review for Dual work.

## Execution order position

This is step 3:

1. Direct Host substrate.
2. Dual Developer opt-in proof.
3. **Instruction cutover — this task.**
4. One representative substantive task through the now-default Dual route.
5. Direct Host removes bridge/broker/runtime leftovers.
6. AgentMemory is added as a non-blocking enhancement.

AgentMemory is not a prerequisite for this task or for bridge retirement.

## Responsibility boundary

This record owns the cross-system instruction semantics:

- web/lead/Spark responsibility split;
- direct/`small`/`heavy`/`dual` route policy and making `dual` the default substantive route;
- canonical task-record versus task-progress semantics;
- formal current-state deviation semantics and Spark proposed-deviation distinction;
- simple handoff/checkpoint/recovery rules;
- zero-compaction context policy;
- AS-BUILT/docs/package assessment rules;
- simplification/removal of unnecessary workflow validators and ceremony.

Direct-host runtime/bridge retirement belongs to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. Concrete Dual mechanics belong to `TEMPLATE-DUAL-DEVELOPER-001`. AgentMemory runtime belongs to `TEMPLATE-AGENT-MEMORY-001`.

## Current position

The current repository still encodes the old architecture in many places: `small` default routing, web as primary deep implementation reviewer, bridge transport/recovery, compaction-specific task-progress recovery, push-after-every-commit, handoff snapshot/finalization ceremony, package broker workflow, and validators that pin exact phrases/old topology.

Exact live source refs at this planning revision:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development` planning base: `87c48bb7e29f9ad0cef61cf0f0edcea670e71825`

No source instruction cutover has yet been performed under this task.

## Core semantics

### Task-record

The task-record is the accepted instruction plan. It owns the requested outcome, material scope, constraints, required work/outputs, expected checks, relevant accepted design, and explicit exceptions.

For consequential work that needs durable authority, use one canonical task-record. Do not copy the same plan into multiple competing records. Tiny one-turn work may skip durable task records when continuity/audit value is negligible.

### Task-progress

Task-progress is resume state, not authority. Keep only what is useful to continue correctly: current position, material observations, meaningful failed attempts/route changes, blockers/decisions, checks already run, remaining work, and next action.

Do not turn it into a command log, private reasoning dump, or duplicate task brief.

### Deviation

A formal deviation describes **current implemented reality** when the resulting implementation materially differs from an applicable prior normative expected state. It is not a future-state proposal or permission request.

A Dual lead may intentionally choose a different implementation without returning to web/human when deeper current-state evidence shows it is better and it still satisfies the same requested outcome, material scope, and hard constraints. Record the resulting material current-state difference in the formal deviation record.

Spark's task-scoped `proposed-deviations` file is only the internal proposal path before the lead decides.

### Route selection

Choose the route from the task itself, not a retry counter:

- direct web/GitHub = tiny exact low-risk change web can do more simply;
- `small` = very simple bounded local work, normally no or trivial testing;
- `heavy` = difficult/important/subtle but still small bounded work;
- `dual` = default substantive development.

Small/heavy are not Spark fallbacks. If Dual is unavailable, make a fresh route decision.

### Review split

For Dual:

- lead deeply reviews implementation and steers Spark;
- web independently checks the exact remote result against the task outcome, relevant system/architecture constraints, ordinary CI/check evidence, durable truth, and unresolved risk;
- web does not routinely repeat the lead's full implementation review.

For small/heavy, web reviews the bounded implementation more directly because there is no lead reviewer.

## Zero-compaction context policy

There is **no compaction fallback** in the target workflow.

Do not summarize/compact the old conversation to preserve continuity. Retain the **last 5,000 raw tokens of the full chat** plus the normal role/system/project instructions.

Agents are explicitly instructed to re-read the durable repository files needed for the current task instead of relying on an artificial chat summary, especially:

- canonical task-record;
- current task-progress;
- relevant AS-BUILT;
- relevant deviations;
- relevant architecture/design/docs;
- exact current Git state when needed.

Keep this first version simple. Do not build a custom context reconstruction engine, token-budget state machine, emergency compaction path, or context verifier. If the selected runtime would automatically compact, configure or adapt the supported workflow so it does not. Old chat beyond the retained 5k raw tail is simply not part of the active context; durable files carry the important state.

AgentMemory may later add useful recall, but it does not change this zero-compaction rule and is not required for continuity.

## Lifecycle simplification

### Checkpoints/push

Do not force a push after every local commit and do not require a handoff-only snapshot commit.

Push when remote durability/evidence is actually useful: before handoff/review, route/session/worktree transfer, a meaningful interruption/recovery checkpoint, or when remote CI/checks need the SHA.

If a push/mutation is ambiguous, stop dependent mutation until local and remote state are reconciled.

### Recovery

Keep one rule: never automatically replay an ambiguous mutation. Inspect current process/session/local Git/remote Git state first, then continue or retry based on evidence.

Do not replace the bridge state machine with another state machine.

### Archival/finalization

Archival/finalization is not part of the critical path to a proven task outcome. Do not require a special post-approval cycle or snapshot merely to move a record. Active discovery should depend on truthful status/current task identity rather than ceremony.

### Packages

Source implementation can complete without a package. Generate/apply a package only when the accepted task actually asks for transfer, downstream application, or release packaging. Retain the deterministic generator/provenance logic when packaging is needed; remove the Action/request broker under Direct Host.

## Durable implementation truth

Before a mutating handoff, assess whether current reality requires updates to:

- **AS-BUILT:** changed code must leave the applicable AS-BUILT accurate enough to describe the implemented files/behavior in its scope;
- **formal deviations:** record intentional material current-state differences from prior normative expectations;
- **other actionable docs:** update docs that would otherwise become false/misleading;
- **package/release artifacts:** only when the requested outcome actually needs them.

Keep the rule understandable. Do not build a special validator for each assessment.

## Instruction-first validation philosophy

Remove complex workflow verification unless it proves a real machine-consumed contract or hard safety boundary.

During this cutover:

- remove exact-English/prose validators;
- remove validators whose purpose is to enforce the obsolete bridge lifecycle, retry counts, six-field ritual, compaction recovery, snapshot/finalization ceremony, or `small`-default architecture;
- keep ordinary code/tests/CI that actually test implementation behavior;
- keep small structural checks for things that truly must be machine-readable (for example parseable config/schema or a hard branch/promotion guard);
- prefer clear agent instructions over building custom behavioral verifiers;
- add stronger mechanical enforcement later only when actual repeated failures show it is justified.

The goal is a small understandable workflow, not a mechanically proved workflow theorem.

## Remaining work

1. Consume the Direct Host substrate proof and Dual opt-in proof.
2. Rewrite web permanent/workflow/recovery/template-maintenance/promotion instructions around the new role split and direct routes.
3. Make `dual` the default substantive route while preserving small/heavy as the two small-work shortcuts.
4. Rewrite developer agent/shared instructions around lead/Spark/small/heavy roles without duplicating lifecycle prose.
5. Make the lead non-editing for implementation source and Spark the implementation executor.
6. Adopt one task-record + concise task-progress semantics and current-state deviation semantics.
7. Replace all compaction language/behavior with the fixed last-5k-raw-chat + re-read-durable-files rule. No fallback compaction.
8. Remove push-every-commit, handoff snapshot, mandatory finalization/archive, and mandatory packaging ceremony.
9. Remove/simplify complex workflow validators as described above; keep ordinary useful tests/CI and hard safety checks.
10. Update accepted architecture/design/AS-BUILT/docs to match the new operative workflow.
11. Run ordinary focused checks/CI and inspect the exact remote range.
12. Run one representative substantive task through the now-default Dual route.
13. Hand bridge/broker retirement back to Direct Host.

## Next action

After the Direct Host and Dual opt-in proofs, perform one coherent instruction/design/validator simplification cutover, then prove it with one normal substantive Dual task.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- template-development `AGENTS.md`
- template-development `.opencode/skills/template-maintenance/SKILL.md`
- developer `AGENTS.md`
- developer `opencode.json`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/design-record.md`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`

## Last handoff commit

None
