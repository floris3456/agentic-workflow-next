# Template-maintenance task record

## Task ID

TEMPLATE-INSTRUCTION-MINIMALISM-001

## Status

queued — instruction redesign plan recorded; no instruction/source implementation performed yet

## Task-start template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Review-base template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Public-safe task brief

Redesign the `agentic-workflow-next` instruction system across `web-orchestration`, `developer`, and `template-development` for simplicity, minimalism, reliability, and the shortest safe path to a proven task outcome. Remove duplicated instruction authority and routine lifecycle ceremony that does not materially improve correctness or recoverability.

### Responsibility boundary

This record owns **instruction and lifecycle semantics**:

- permanent web-orchestrator rules and route-selection policy;
- task-record versus task-progress authority and ownership;
- developer lifecycle, handoff, push/checkpoint, and recovery instructions;
- AS-BUILT/deviation/docs/package assessment rules;
- template-maintenance instruction responsibility split;
- validator philosophy for instruction contracts.

This record does **not** own host/runtime migration. Worktree creation, canonical repository migration, OpenCode version/runtime acceptance, bridge/runtime deletion, package-broker runtime deletion, and bridge-only host administration are owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

The private fixed-operation adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001`.

## Current objective

Produce and later implement one minimal instruction architecture where each rule has one canonical owner, the normal path is short, durable context remains reliable under reduced conversational retention, and extra procedure is triggered only by a concrete need.

## Current position

The current system has sound high-level safety rules but duplicates lifecycle requirements across web instructions, developer agents/skills/work docs, and template-development. The operative web workflow/recovery still embeds bridge-era transport procedure. Developer instructions currently require push-after-every-commit, a handoff-only snapshot commit, and post-approval archival as default lifecycle steps. Validators frequently pin exact prose and obsolete implementation details.

Exact live source refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

No source instruction changes have been made under this task.

## Source ranges

None yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

## Observed

- Permanent web instructions already contain the correct high-level principle: complete the human's requested outcome with the shortest route that proves it.
- The same developer task/push/handoff/finalization rules are restated in root instructions, small/heavy agent files, multiple skills, and work documentation.
- Bridge transport detail currently dominates ordinary workflow/recovery even though direct host access is now available.
- Future conversational retention may be sharply reduced, so durable task-progress remains important even after compaction is removed.
- AS-BUILT and deviations are reconstruction/safety mechanisms; the primary risk is failing to assess/update them when required, not the cost of keeping them accurate.
- Current validators often require exact wording, route phrases, tool names, and bridge structures instead of validating behavior and hard boundaries.

## Interpretation

### Normative terminology

- **Task-record:** the accepted instruction plan for a task. It defines the requested outcome, scope, constraints, required work/outputs, expected checks, relevant accepted design, and any explicitly authorized exception. It is instruction authority, not an execution log.
- **Task-progress:** durable execution context while acting on a task-record. It preserves only what is needed to resume correctly: current position, material observations, meaningful prior attempts/route changes, blockers/decisions, checks already run, remaining work, and next action. It must not contain command-by-command history or private reasoning.
- **AS-BUILT:** the reverse-engineered description of all code files within its directory. It must remain accurate for the implemented reality of those files.
- **Deviation:** a durable record required whenever the final implementation intentionally differs materially from an accepted task-record, human or agent instruction prompt, ADR, plan, gate, or other normative expected state.

### Minimal permanent rules

Permanent cross-task instructions should contain only hard rules that truly apply everywhere:

1. complete the human's actual outcome;
2. use the shortest safe route that proves it;
3. remote Git is authoritative for repository facts;
4. run only one mutating route per worktree;
5. never persist private/sensitive runtime information;
6. never replay an ambiguous mutation without reconciliation;
7. treat agent handoffs/blockers as claims, not acceptance;
8. keep `main` promotion human exact-SHA only.

Conditional procedure belongs in one routed skill, not repeated permanent prose.

### Route semantics

The instruction layer should express only the route decision, not reimplement transport:

- inspect directly for read-only evidence;
- use direct GitHub mutation for tiny, precisely known edits when that is genuinely simpler;
- prefer Remote Desktop Commander for normal/nontrivial local implementation;
- use direct native OpenCode `small` or `heavy` when delegated implementation materially saves effort or improves confidence;
- after any local/agent push, use GitHub for independent exact-SHA/range/CI verification.

Do not require a fixed number of failed `small` attempts before selecting `heavy`. Route from actual complexity, uncertainty, risk, and observed evidence.

Runtime proof/removal of the bridge is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`; this task only defines how instructions select and describe the retained routes.

### Task-record and task-progress lifecycle

The task-record remains the execution plan. Execution must not silently weaken or reinterpret it. Material authorized plan changes must remain visible as instruction changes, not be hidden in task-progress.

For delegated mutating work, retain concise durable task-progress because reduced future conversation retention makes recovery otherwise brittle. Update it when resumable state changes materially, not after every command. A progress update should normally travel with a meaningful implementation/checkpoint commit. A dedicated progress-only checkpoint is appropriate only when work must pause or transfer without another implementation commit.

### Mandatory durable-record assessment

The **assessment is mandatory; the edit is conditional on resulting truth**.

Before handoff of a mutating task, execution must explicitly determine whether the final state requires AS-BUILT, deviations, actionable documentation, and package/release work. A recorded `not required` classification is acceptable only when the current artifact remains fully correct or the task-record does not request that outcome.

- **AS-BUILT:** for each changed code directory, inspect the applicable AS-BUILT and update it in the same resulting change whenever the reverse-engineered description would otherwise become inaccurate, incomplete, or misleading.
- **Deviations:** compare final implementation with every applicable normative expected state. Record a deviation whenever the final implementation intentionally differs materially. Failed attempts that still end at the accepted state belong in task-progress, not deviations.
- **Other docs:** update actionable user/operator/developer/procedural documentation whenever the final implementation makes it false or materially incomplete. Do not churn still-correct prose.
- **Packages:** package/release work is required when the accepted task-record requests transfer, downstream application, or release packaging. It is not automatically part of source implementation truth.

### Developer lifecycle

The default delegated mutating path should be:

1. read the accepted task-record and applicable branch instructions;
2. verify worktree/branch/start SHA;
3. create/resume concise task-progress;
4. implement;
5. assess/update AS-BUILT, deviations, docs, tests, and package/release obligations;
6. run relevant checks;
7. create meaningful commit(s) and push before handoff;
8. return concise navigation with the exact remote SHA and perceived checks/blocker state;
9. web independently reviews remote diff and CI.

Remove push-after-every-local-commit as a universal rule. Push before handoff, route transfer, long interruption/recovery checkpoint, or whenever a remote checkpoint materially improves recoverability.

Remove the mandatory handoff-only snapshot commit. The latest meaningful pushed implementation/checkpoint commit should normally be the handoff boundary.

Remove mandatory post-approval archival/finalization from the critical path of a proven implementation outcome. If archival remains useful, treat it as housekeeping or an explicit history-maintenance action.

The final handoff field names should be minimal and chosen during implementation; required semantics are: status, exact last known remote developer SHA, perceived checks, human-owned blocker/decision if any, and task-progress path. If unpushed local mutation may exist, state that separately. The web reviewer derives changed files/ranges from GitHub.

### Web and template-maintenance responsibility split

- Web permanent instructions own only universal hard boundaries and the procedure router.
- Ordinary web workflow owns proportional route selection, independent review, and completion.
- Recovery owns only ambiguous/failed state reconciliation and no-replay.
- Template-maintenance web procedure should be a thin orchestrator wrapper; detailed template-development branch procedure has one canonical repository owner.
- Developer agent files should contain only role/permission/route identity and point to one shared developer workflow instead of repeating lifecycle prose.

### Validator rules

Validators should prove machine-checkable safety/behavior, not editorial wording. Prefer schema/inventory, permission boundaries, allowed route selectors, branch/main protection, private-state non-persistence, deterministic/provenance behavior, and executable acceptance tests. Remove exact-English requirements unless the exact literal is itself a machine-consumed contract.

## Attempts

- Performed a heavy comparison of current web-orchestrator, developer, and template-development instructions.
- Corrected the task-record/task-progress distinction and clarified AS-BUILT/deviation semantics before recording this plan.
- Split runtime/transport migration ownership back to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` so this record no longer duplicates bridge/package-broker removal plans.
- No instruction implementation, validator rewrite, or `main` mutation has been performed under this task.

## Changed approach

The first version of this record still repeated runtime migration details and some completion requirements owned by the direct-host task. This revision makes the boundary explicit: this record owns instruction semantics; the direct-host record owns runtime/transport implementation.

Simplicity does not mean dropping durable context. Task-progress remains concise recovery state for delegated mutating work, while the task-record remains the accepted plan.

## Checks

- Exact task-start refs were independently read from GitHub.
- Current web permanent/workflow/recovery/template-maintenance/promotion instructions were reviewed.
- Current developer root/agent/task/git/implementation-record/work-lifecycle instructions were reviewed.
- Current template-development root/template-maintenance/Workspace/validator structure was reviewed.
- No source instruction files have been changed by this planning record.

## Blockers / required decisions

No human decision currently blocks implementation of this instruction redesign.

The exact on-disk naming/location of task-record versus task-progress still needs a minimal implementation decision because current repository terminology conflates them. Choose the smallest migration that makes authority unambiguous without rewriting historical records.

## Remaining work

1. Re-read exact live source refs before instruction implementation.
2. Define the smallest task-record/task-progress ownership and naming scheme compatible with history.
3. Rewrite permanent web instructions to the minimal hard-boundary set plus route-selection semantics.
4. Rewrite ordinary workflow/recovery to remove transport-era ceremony and rely on the direct-host capabilities supplied by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.
5. Simplify developer root/agent/skill/work-lifecycle instructions so each normative rule has one owner.
6. Implement concise task-progress and remove mandatory handoff-only commit, push-after-every-commit, and archival from the default critical path.
7. Encode mandatory AS-BUILT/deviation/docs/package assessment and concrete update triggers.
8. Simplify the web/template-development maintenance responsibility split without changing branch authority.
9. Rewrite validators/tests to enforce behavior and safety properties instead of duplicated exact prose.
10. Run focused local checks and canonical validation; independently review exact source ranges.

Runtime deletion of bridge/package-broker/bridge-admin code, direct OpenCode compatibility proof, Scout/Workspace runtime decisions, package release/application, imported-history cleanup, and the private host adapter are outside this task unless separately activated.

## Next action

Implement this instruction redesign far enough that subsequent direct-host migration work runs under the simplified workflow, then return runtime execution/removal to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- template-development `AGENTS.md`
- template-development `.opencode/skills/template-maintenance/SKILL.md`
- template-development `docs/architecture/AS-BUILT.md`
- template-development `docs/deviations.md`
- developer `AGENTS.md`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `.opencode/skills/task-workflow/SKILL.md`
- developer `.opencode/skills/git-sync-and-handoff/SKILL.md`
- developer `.opencode/skills/implementation-records/SKILL.md`
- developer `docs/work/README.md`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- web `web-orchestration-only/task-context/TEMPLATE.md`

## Last handoff commit

None
