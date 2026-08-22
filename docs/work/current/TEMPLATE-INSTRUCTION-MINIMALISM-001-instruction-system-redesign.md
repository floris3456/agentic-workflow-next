# Template-maintenance task record

## Task ID

TEMPLATE-INSTRUCTION-MINIMALISM-001

## Status

queued — instruction redesign plan hardened; no instruction/source implementation performed yet

## Task-start template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Review-base template-development SHA

591531a58ffff840721ca60a3665bd31e0bfe7a8

## Public-safe task brief

Redesign the `agentic-workflow-next` instruction system across `web-orchestration`, `developer`, and `template-development` for simplicity, minimalism, reliability, and the shortest safe path to a proven task outcome. Remove duplicated instruction authority and routine lifecycle ceremony that does not materially improve correctness or recoverability.

### Responsibility boundary

This record owns **instruction and lifecycle semantics**:

- permanent web-orchestrator rules and route-selection policy;
- canonical task-record versus task-progress authority and ownership;
- developer and template-maintenance lifecycle, handoff, push/checkpoint, and recovery instructions;
- AS-BUILT/deviation/actionable-doc/package assessment rules;
- template-maintenance instruction responsibility split;
- validator philosophy and migration ordering for instruction contracts;
- removal of obsolete instruction requirements that only exist to drive the bridge transport.

This record does **not** own host/runtime migration. Worktree creation, canonical repository migration, OpenCode version/runtime acceptance, bridge/runtime deletion, package-broker runtime deletion, bridge-only host administration, and direct-host capability proof are owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

The two tasks have an explicit staged boundary rather than a circular dependency:

1. `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` first proves the direct host/OpenCode path while the bridge remains intact.
2. This task then performs the instruction and validator cutover so normal work no longer depends on the bridge.
3. The direct-host task then resumes destructive bridge/runtime/broker retirement after a representative task proves the new path.

This task must not delete bridge runtime code merely because it removes bridge-era instruction semantics. The bridge remains available through this semantic cutover until the direct-host task has independent evidence that retirement is safe.

The private fixed-operation adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001` and is not a prerequisite.

## Current objective

Produce and implement one minimal instruction architecture where each rule has one canonical owner, the normal path is short, durable context remains reliable under reduced conversational retention, validators enforce behavior rather than prose, and extra procedure is triggered only by a concrete need.

The target sequence is:

1. consume the proven direct-host capability boundary from `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` Stage 1;
2. change task authority, route, checkpoint, handoff, recovery, durable-record, and package semantics;
3. migrate validators/tests in the same cutover so the new correct workflow is not rejected by old exact-prose/bridge assertions;
4. run focused checks and canonical CI;
5. run one representative task through the simplified direct path while bridge code still exists but is not required;
6. hand runtime retirement back to the direct-host task.

## Current position

The current system has sound high-level safety rules but duplicates lifecycle requirements across web instructions, developer agents/skills/work docs, and template-development. The operative web workflow/recovery still embeds bridge-era transport procedure. Developer and template-maintenance instructions currently require push-after-every-commit, handoff-only snapshot commits, and archival/finalization ceremony as normal lifecycle steps. Validators frequently pin exact prose and obsolete implementation details.

Exact live source refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

No source instruction changes have been made under this task.

An independent architecture/reliability review of this record together with `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` found that the direction is viable but the prior wording still allowed circular bootstrap, duplicated task authority, validator rollback into obsolete semantics, mandatory packaging/archival ceremony, and ambiguous checkpoint/recovery ownership. This revision makes those boundaries explicit before implementation.

## Source ranges

None yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `591531a58ffff840721ca60a3665bd31e0bfe7a8`

## Observed

- Permanent web instructions already contain the correct high-level principle: complete the human's requested outcome with the shortest route that proves it.
- The same developer task/push/handoff/finalization rules are restated in root instructions, small/heavy agent files, multiple skills, and work documentation.
- Template-development currently conflates accepted task plan and execution progress in the same `task-progress` shape.
- Bridge transport detail currently dominates ordinary workflow/recovery even though direct host access is available for the new repository.
- Future conversational retention may be sharply reduced, so concise durable task-progress remains important even after compaction behavior changes.
- AS-BUILT and deviations are reconstruction/safety mechanisms; the primary risk is failing to assess/update them when required, not the cost of keeping them accurate.
- Current validators often require exact wording, route phrases, tool names, six-field handoffs, fixed route escalation, bridge structures, and finalization details instead of validating behavior and hard boundaries.
- The accepted template-maintenance design currently treats package production as the normal post-review path even though source implementation can be complete without transfer/release.
- Automatic post-commit push and handoff-only snapshot requirements are operating choices rather than architectural necessities.
- Developer safety hooks that block unsafe `main` mutation, force/non-fast-forward behavior, or continued work after unresolved synchronization failure remain useful independently of the ceremonial push/snapshot policy.

## Interpretation

### Normative terminology

- **Task-record:** the accepted instruction plan for a task. It defines the requested outcome, scope, constraints, required work/outputs, expected checks, relevant accepted design, and any explicitly authorized exception. It is instruction authority, not an execution log.
- **Task-progress:** durable execution context while acting on a task-record. It preserves only what is needed to resume correctly: current position, material observations, meaningful failed attempts/route changes, blockers/decisions, checks already run, remaining work, and next action. It must not contain command-by-command history or private reasoning and must never silently redefine the task-record.
- **AS-BUILT:** the reverse-engineered description of all code files within its directory, complete enough to reconstruct the implemented reality of those files.
- **Deviation:** a durable record required whenever the final implementation intentionally differs materially from any applicable normative expected state, including direct human instruction, the current accepted task-record, an agent/delegated prompt, an accepted ADR/design/plan/gate, or another accepted rule that defined the expected result.
- **Other actionable docs:** user/operator/developer/procedural documentation that becomes false or materially incomplete because of the implementation.

### Canonical task authority

For consequential work that needs durable authority, there must be exactly one canonical task-record for the requested outcome.

- The task-record owns outcome, scope, constraints, required work, expected checks, accepted design links, and explicit exceptions.
- Task-progress references that record by stable task ID/path and, where useful for unambiguous resumption, the exact accepted record commit. It does not copy the brief as a second source of truth and does not reinterpret or weaken the plan.
- A material authorized plan change updates the canonical task-record. It is not hidden inside progress.
- Template-maintenance uses the canonical template-development task-record for cross-branch authority. Branch-local progress may preserve source execution state but must remain execution context rather than a competing plan.
- Tiny one-turn direct work may skip persisted task records/progress when there is no meaningful continuity, delegation, cross-branch coordination, architectural, audit, or recovery need. Do not manufacture durable ceremony merely to satisfy a workflow shape.

Historical records remain historical evidence. Do not rewrite old records just to adopt new terminology.

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
- use direct GitHub mutation for tiny, precisely known edits when that is genuinely simpler and remotely provable;
- use Remote Desktop Commander for normal/nontrivial local implementation when local tools/context materially help;
- use direct native OpenCode `small` or `heavy` when delegated implementation materially saves effort or improves confidence;
- select `small` or `heavy` from actual task complexity, uncertainty, risk, blast radius, and expected value, not from a fixed number of failed `small` attempts;
- after any local/agent push, use GitHub for independent exact-SHA/range/CI verification.

Runtime proof/removal of the bridge is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`; this task only defines how instructions select and describe retained routes after Stage 1 proof.

### Task-progress lifecycle

Task-progress exists for information value, not cadence.

Update it when resumable state changes materially: current position, material observations, meaningful failed attempts or route changes, blockers/decisions, checks already run, remaining work, or next action. Do not update it after every command merely to create history.

A progress update should normally travel with a meaningful implementation/checkpoint commit. A dedicated progress-only checkpoint is appropriate when work must pause, transfer, or survive a meaningful interruption without another substantive implementation commit.

### Push/checkpoint rule

Remove push-after-every-local-commit as a universal rule from both developer and template-maintenance workflows.

Push when one of these boundaries makes remote durability or independent evidence materially useful:

- before handoff or independent review;
- before route/worktree/session transfer;
- before a long interruption or recovery-sensitive checkpoint;
- when a remote checkpoint materially reduces loss/recovery risk;
- when canonical CI or another remote check must run on the exact SHA.

Local commits between those boundaries are allowed when safe. Keep synchronization failure protection: if a push or other mutation is failed/ambiguous, stop dependent mutation until local and exact remote state are reconciled. Keep hooks/guards that protect `main`, reject force/non-fast-forward behavior, or prevent continued work after unresolved sync failure even if automatic post-commit push is removed.

### Tool-neutral recovery

Recovery should be a short no-replay procedure, not a transport state machine:

1. after timeout, disconnect, unknown response, failed publication, or ambiguous mutation, do not repeat the mutation automatically;
2. inspect the existing process/session where applicable, local worktree/Git state, and exact remote Git state;
3. if the original effect is active or completed, continue or review it;
4. replace/retry only after evidence proves the original effect absent or impossible to continue;
5. unresolved ambiguity blocks only dependent mutation until reconciled.

Bridge UUID/sequence/mailbox/control-issue rules are not general recovery semantics and must disappear from the post-cutover workflow.

### Mandatory durable-record assessment

The **assessment is mandatory; the edit is conditional on resulting truth**.

Before handoff of a mutating task, execution must determine whether the final state requires AS-BUILT, deviations, other actionable documentation, and package/release work.

- **AS-BUILT:** for every changed code file, identify the applicable AS-BUILT scope and verify that the AS-BUILT still accurately and completely describes all code files within its directory, including newly added files and changed behavior. If not, update it in the same resulting checkpoint/change. A previously undocumented code file is not exempt merely because the old AS-BUILT did not mention it.
- **Deviations:** compare the final implementation with every applicable normative expected state. Record a deviation whenever the final implementation intentionally differs materially. Meaningful failed attempts that ultimately return to the accepted expected state belong in task-progress, not deviations.
- **Other actionable docs:** update user/operator/developer/procedural documentation whenever the final implementation makes it false, materially incomplete, or misleading. Do not churn still-correct prose.
- **Packages:** package/release work is required only when the accepted task-record requests transfer, downstream application, release packaging, or another outcome that actually needs a package. It is not automatically part of source implementation completion.

A recorded `not required` classification is acceptable only when the relevant current artifact remains fully correct or the requested outcome does not require that artifact.

### Package semantics and accepted-design update

Source implementation completion and package/release transfer are separate outcomes.

Implementation under this task must amend the accepted template-maintenance design and operative skills so that:

- reviewed source work can complete without generating or applying a package when transfer/release is not requested;
- the tracked deterministic package generator and provenance contract remain authoritative when packaging is requested;
- package bases/heads remain exact reviewed ranges and are independently validated;
- the Action/request package broker remains a runtime concern owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` and may be removed only after direct canonical generator execution is proven.

Do not leave the accepted design saying package production is mandatory while skills/task records say it is conditional.

### Developer lifecycle

The default delegated mutating path should be:

1. read the accepted task-record and applicable branch instructions;
2. verify worktree/branch/start SHA;
3. create/resume concise task-progress only when durable continuity is warranted;
4. implement using the selected route;
5. assess/update AS-BUILT, deviations, actionable docs, tests, and package/release obligations;
6. run relevant checks;
7. create meaningful commit(s) and push at the next proof/continuity boundary;
8. return concise producer data with the exact remote SHA and perceived checks/blocker state;
9. web independently reviews the exact remote diff/range and canonical CI.

Remove mandatory handoff-only snapshot commits. The latest meaningful pushed implementation/checkpoint commit should normally be the handoff boundary.

Remove mandatory post-approval archival/finalization from the critical path of a proven implementation outcome. If archival remains useful, treat it as explicit housekeeping/history maintenance rather than a universal completion prerequisite.

### Handoff semantics

Handoff is navigation, not acceptance. Keep only producer information that the reviewer cannot derive more reliably from GitHub:

- status;
- exact last known remote SHA for the producing branch;
- perceived checks/results;
- any human-owned blocker/decision;
- task-progress path when one exists;
- explicit statement of possible unpushed mutation when relevant.

The reviewer derives changed files, exact ranges, commit ancestry, and CI from remote GitHub. Exact field names/order need not be frozen unless a machine consumer actually requires them.

### Web and template-maintenance responsibility split

- Web permanent instructions own only universal hard boundaries and the procedure router.
- Ordinary web workflow owns proportional route selection, independent review, and completion.
- Recovery owns only ambiguous/failed-state reconciliation and no-replay.
- Template-maintenance web procedure should be a thin orchestrator wrapper that defers detailed branch procedure to the canonical template-development repository instructions instead of copying them.
- Developer agent files should contain only role, permissions, and route identity plus a pointer to one shared workflow, rather than repeating lifecycle prose.
- Promotion remains a separate exact-SHA human-authorized procedure. Remove issue/bridge transport details from promotion when the direct-host cutover makes them obsolete, but retain guarded no-content-change promotion, branch-movement checks, exact parent/tree verification, and explicit human approval.

### Validator rules and migration ordering

Validators should prove machine-checkable safety/behavior, not editorial wording. Prefer schema/inventory, permission boundaries, allowed route selectors, branch/main protection, private-state non-persistence, deterministic/provenance behavior, no-replay safety, and executable acceptance tests. Remove exact-English requirements unless the exact literal is itself a machine-consumed contract.

Validator migration is part of the semantic cutover, not cleanup afterward:

1. identify assertions that encode obsolete bridge, exact prose, fixed small-failure counts, six-field handoffs, mandatory snapshot/finalization, or mandatory package behavior;
2. replace them with behavior/safety assertions that describe the intended new system;
3. change instructions/agents/templates/design records and validators in the same reviewed cutover so canonical CI does not force obsolete semantics back into the repository;
4. keep push-triggered canonical CI as independent exact-SHA evidence.

Do not delete bridge runtime validators merely because this task stops requiring their semantics. Runtime deletion remains the direct-host task; this task may update validator expectations needed for the semantic cutover and must coordinate ordering so CI remains meaningful throughout.

## Attempts

- Performed a heavy comparison of current web-orchestrator, developer, and template-development instructions.
- Corrected the task-record/task-progress distinction and clarified AS-BUILT/deviation semantics before recording this plan.
- Split runtime/transport migration ownership back to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` so this record no longer duplicates bridge/package-broker removal plans.
- Independently reviewed both active plans together and converted their remaining circular dependency into the explicit proof -> semantic cutover -> destructive retirement sequence.
- Added canonical task authority, information-value progress, checkpoint push, tool-neutral recovery, package/design alignment, validator migration ordering, and stronger AS-BUILT/deviation rules to the accepted plan.
- No instruction implementation, validator rewrite, or `main` mutation has been performed under this task.

## Changed approach

The first version of this record still repeated runtime migration details and some completion requirements owned by the direct-host task. A later revision separated task ownership but still allowed each task to depend on the other to start.

The corrected approach makes this task an explicit **middle cutover stage**. Direct-host Stage 1 proves capability without deleting the bridge. This task then changes semantics and validators while the bridge remains physically available. Only after the simplified path is independently proven does runtime retirement return to the direct-host task.

Simplicity does not mean dropping durable context. It means keeping one task authority, recording only useful resume state, pushing at proof/continuity boundaries instead of every commit, and retaining safety checks that prevent irreversible or ambiguous mistakes.

## Checks

- Exact task-start refs were independently read from GitHub.
- Current live `main`, `developer`, `web-orchestration`, and `template-development` refs were re-read before this planning amendment.
- Current web permanent/workflow/recovery/template-maintenance/promotion instructions were reviewed.
- Current developer root/agent/task/git/implementation-record/work-lifecycle instructions were reviewed.
- Current template-development root/template-maintenance/Workspace/package/validator structure and accepted maintenance design were reviewed.
- Current validators were confirmed to contain exact-prose and bridge-era assertions that would reject parts of the intended simplified architecture unless migrated with the semantic cutover.
- No source instruction files have been changed by this planning record.

## Blockers / required decisions

No human decision currently blocks this instruction redesign.

Activation of the semantic cutover should wait for `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` Stage 1 to prove the direct host/OpenCode execution, interaction, recovery, push/readback, and canonical CI path while the bridge is still intact.

The exact on-disk naming/location of task-record versus task-progress remains an implementation detail. Choose the smallest migration that makes authority unambiguous and preserves historical records rather than introducing another global state machine or duplicate record hierarchy.

Server-side `main` protection verification is a direct-host/runtime acceptance condition, not owned by this instruction task. This task must preserve human exact-SHA promotion authority and must not weaken repository-side protection requirements.

## Remaining work

1. Wait for and independently inspect the direct-host Stage 1 capability proof; do not require bridge deletion first.
2. Re-read exact live source refs immediately before instruction implementation.
3. Define the smallest canonical task-record/task-progress ownership and naming scheme compatible with existing history; avoid duplicate briefs/plans.
4. Rewrite permanent web instructions to the minimal hard-boundary set plus proportional route-selection semantics.
5. Rewrite ordinary workflow and recovery around direct evidence, direct-host execution, tool-neutral no-replay reconciliation, and independent GitHub review, removing bridge command-bus ceremony from the operative path.
6. Simplify developer root/agent/shared-skill/work-lifecycle instructions so each normative rule has one owner; remove fixed small-failure escalation, push-after-every-commit, mandatory snapshot commit, and default archival/finalization ceremony while retaining synchronization/main/no-force safety guards.
7. Simplify template-development maintenance instructions and task templates around one canonical task-record plus concise progress; remove automatic push/snapshot/finalization ceremony from the normal critical path.
8. Encode the exact AS-BUILT completeness rule, all-normative-source deviation trigger, and separate actionable-doc assessment.
9. Amend accepted template-maintenance design/skills so package generation/application is conditional on transfer/downstream/release outcomes, while retaining deterministic generator/provenance requirements.
10. Thin the web template-maintenance wrapper and developer agent files so they point to canonical shared procedure instead of duplicating it.
11. Migrate validators/tests in the same cutover to enforce behavior, structure, safety, no-replay, and machine-consumed contracts rather than exact prose/obsolete bridge lifecycle assumptions.
12. Run focused checks and canonical push-triggered validation; independently review exact source ranges.
13. Run one representative task through the simplified direct workflow while bridge runtime is still present but not required; verify checkpoint/recovery/handoff behavior from remote evidence.
14. Hand runtime deletion back to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. Do not absorb bridge/package-broker/bridge-admin deletion into this task.

Runtime deletion of bridge/package-broker/bridge-admin code, direct OpenCode version compatibility proof, server-side `main` protection proof, Scout/general Workspace runtime decisions, package release/application for unrelated tasks, imported-history cleanup, and the private host adapter are outside this task unless separately activated.

## Next action

Do not start semantic cutover by deleting or bypassing the bridge. First consume the completed direct-host Stage 1 proof. Then perform the instruction/design/template/validator changes as one coherent semantic cutover, run canonical validation plus one representative direct-path task while the bridge remains available, and return destructive runtime retirement to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- template-development `AGENTS.md`
- template-development `.opencode/skills/template-maintenance/SKILL.md`
- template-development `docs/design/template-maintenance-workflow.md`
- template-development `docs/architecture/AS-BUILT.md`
- template-development `docs/deviations.md`
- developer `AGENTS.md`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `.opencode/skills/task-workflow/SKILL.md`
- developer `.opencode/skills/git-sync-and-handoff/SKILL.md`
- developer `.opencode/skills/implementation-records/SKILL.md`
- developer `docs/work/README.md`
- developer `docs/architecture/branch-workflow.md`
- developer `docs/architecture/design-record.md`
- developer `scripts/validate-agent-system.mjs`
- developer `scripts/validate-web-orchestrator-integration.mjs`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- web `web-orchestration-only/task-context/TEMPLATE.md`
- web package validator and canonical push-triggered CI assets

## Last handoff commit

None
