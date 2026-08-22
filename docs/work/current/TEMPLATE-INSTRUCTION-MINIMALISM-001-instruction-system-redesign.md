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

Redesign the `agentic-workflow-next` instruction system across `web-orchestration`, `developer`, and `template-development` for simplicity, minimalism, reliability, and the shortest safe path to a proven task outcome. Remove transport-era and lifecycle ceremony that no longer provides proportional value, eliminate duplicated instruction authority, and make extra process conditional on a concrete need rather than default.

This task is separate from `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. It defines the instruction architecture that the direct-host migration should converge on. The private fixed-operation host adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001`.

The redesign must preserve these hard boundaries:

- the human's requested outcome is primary;
- remote Git is authoritative for repository facts;
- use the shortest safe route that proves the outcome;
- one mutating route per worktree;
- private host/runtime identifiers and sensitive data are never persisted;
- an ambiguous mutation is never automatically replayed;
- agent reports and blockers are claims to evaluate, not acceptance;
- only the human accepts an exact reviewed `developer` SHA into `main`.

Terminology is normative for this task:

- **Task-record:** the instruction plan for a task. It defines the requested outcome, scope, constraints, required work, expected checks, and accepted plan. It is instruction authority for execution and is not an execution log.
- **Task-progress:** durable execution context while acting on a task-record. It records only the state needed to resume correctly: current position, material observations, prior meaningful attempts/changes of approach, blockers/decisions, checks already run, remaining work, and next action. It must not contain command-by-command history or private reasoning.
- **AS-BUILT:** the reverse-engineered description of all code files within its directory. It must remain accurate enough to reconstruct the important implemented reality of those files.
- **Deviation:** a durable record required whenever the final implementation intentionally differs materially from an accepted task-record, human or agent instruction prompt, ADR, plan, gate, or other normative expected state.

The design must assume that future conversational continuity may be sharply reduced. Durable task-progress therefore remains an important reliability mechanism even while the surrounding lifecycle is simplified.

## Current objective

Produce and later implement a minimal instruction architecture in which the normal path is direct and short, while task-record/task-progress, AS-BUILT, deviations, docs, tests, packages, Scouts, heavy routing, recovery, and other mechanisms are invoked by clear rules rather than habit or duplicated prose.

## Current position

The current instruction system contains sound high-level safety rules but substantial duplicated and obsolete ceremony. The web workflow still contains GitHub-Issue bridge transport; developer lifecycle rules are repeated across root instructions, two agent files, multiple skills, and work documentation; template maintenance duplicates route and lifecycle rules between web and template-development; validators pin exact prose and obsolete implementation details.

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

`main` is out of scope for mutation without separate exact-SHA human approval.

## Observed

- Permanent web instructions already state the correct top-level principle: complete the human's requested outcome with the shortest route that proves it.
- The operative web workflow still contains bridge control issues, UUIDs, sequences, lifecycle states, mailbox handling, and bridge-specific Scout/developer control.
- Recovery is dominated by bridge issue/status/publication recovery rather than the durable no-replay principle that remains useful.
- Direct-host planning now prefers Remote Desktop Commander for normal/nontrivial implementation, direct GitHub mutation for tiny precisely known edits, and GitHub exact-SHA readback/CI for independent verification.
- Developer lifecycle rules are duplicated across `AGENTS.md`, small/heavy agent files, `task-workflow`, `git-sync-and-handoff`, implementation-record rules, and `docs/work/README.md`.
- Current developer rules require every commit to be pushed immediately, a dedicated handoff-only snapshot commit, and a later archival/finalization cycle. These steps are not always needed to prove the source outcome.
- The existing developer task artifact currently conflates task instruction planning and execution continuity. The redesign must explicitly separate task-record authority from task-progress continuity.
- Future reduced conversational retention makes concise durable task-progress important; removing it entirely would be brittle.
- AS-BUILT and deviations are safety/reconstruction mechanisms, not optional prose. The danger is forgetting to assess them, not the cost of updating them when actually required.
- Template maintenance repeats source/Workspace/record/package/finalization rules across web and template-development.
- Current validators frequently enforce exact wording, exact route phrases, exact tool names, and obsolete bridge structure rather than only machine-checkable safety/behavior.

## Interpretation

### Target instruction architecture

Use a small permanent rule set and load conditional procedure only when a task actually triggers it. Avoid multiple files restating the same normative rule.

Permanent cross-task rules should be limited to:

1. complete the human's actual outcome;
2. use the shortest safe route that proves it;
3. remote Git is authoritative;
4. use only one mutating route per worktree;
5. keep private/sensitive runtime information out of Git;
6. never replay an ambiguous mutation without reconciliation;
7. treat agent handoffs/blockers as claims, not acceptance;
8. keep `main` promotion human exact-SHA only.

Everything else should have one canonical owner and be loaded only when relevant.

### Execution route preference

- Read-only question/review: inspect exact evidence directly and answer.
- Tiny precisely known edit: direct GitHub mutation when remote write/readback is genuinely simpler.
- Normal/nontrivial implementation: Remote Desktop Commander against a verified worktree so search, multi-file edits, diff, tests, generators, Git, commit, and push stay in one local execution surface.
- Delegated implementation: direct Commander/native OpenCode using web-selected `small` or `heavy` when autonomous implementation materially saves effort or improves confidence.
- After local/agent push: independently verify exact remote SHA/range and canonical CI through GitHub.

Do not introduce a fixed number of failed `small` attempts before `heavy`; select or change route from actual complexity, uncertainty, risk, and observed evidence.

### Task-record versus task-progress

The redesign must make these separate concepts explicit.

**Task-record** is the accepted instruction plan. It should contain only what execution must satisfy: goal, scope, constraints, required outputs, required checks, relevant accepted design/records, and any planned exceptional behavior. Developers may execute it but must not silently change its normative requirements. Material authorized changes to the plan must remain visible as instruction changes rather than being hidden in progress notes.

**Task-progress** is execution continuity. For delegated mutating work, retain a concise durable progress artifact because conversational context may later retain only a small recent window. It should be updated only when the resumable state changes materially, not after every command. At any point it should answer: where are we, what important facts/attempts already matter, what remains, and what happens next?

A task-progress update should normally travel with a meaningful implementation/checkpoint commit rather than requiring a separate handoff-only commit. A dedicated progress-only checkpoint is justified when work must pause or transfer without another implementation commit.

### Durable-record safety rule

The **assessment is mandatory; the edit is conditional on truth**.

Before a mutating task can hand off, execution must explicitly determine whether the final state requires updates to AS-BUILT, deviations, other actionable docs, and package/release artifacts. This assessment should be mechanically visible where practical so omission is harder than an intentional `not required` classification.

#### AS-BUILT

For every directory whose code files are changed, inspect the applicable AS-BUILT. Because AS-BUILT is a reverse-engineered description of all code files in that directory, update it in the same resulting change whenever the implementation makes that reverse-engineered description inaccurate, incomplete, or misleading. No edit is needed only when the existing AS-BUILT remains fully accurate for the changed code.

#### Deviations

Evaluate the final implementation against all applicable normative expected states, including the accepted task-record, human or agent instruction prompt, ADR, plan, gate, and other controlling design/decision artifacts. Record a deviation whenever the final implementation intentionally differs materially. Failed attempts or implementation routes that still produce the accepted final state belong in task-progress, not deviations.

#### Other documentation

Update user/operator/developer-facing or procedural documentation whenever the resulting implementation would make actionable instructions or stated behavior false or materially incomplete. Do not churn still-correct explanatory prose merely because code changed.

#### Packages

A package is not implementation truth. Require package generation when the requested outcome includes transfer, downstream application, or release packaging. Source implementation/review can be complete without generating a package when no transfer/release outcome is requested.

### Developer lifecycle simplification

Replace the current universal lifecycle with a short reliable path:

1. read the accepted task-record and relevant branch instructions;
2. verify worktree/branch/start SHA;
3. create/resume concise task-progress for delegated mutating work;
4. implement;
5. assess/update AS-BUILT, deviations, docs, and tests as required by the resulting truth;
6. run relevant checks;
7. create meaningful commit(s) and push before handoff;
8. return the exact remote SHA plus concise perceived check/blocker information;
9. web independently reviews remote diff and CI.

Remove the requirement that every local commit must immediately push. Push before handoff, route transfer, long interruption/recovery checkpoint, or whenever a remote checkpoint materially improves recoverability. Avoid publishing arbitrary intermediate history merely to satisfy process.

Remove the mandatory dedicated handoff-only snapshot commit. The latest meaningful pushed implementation/checkpoint commit should normally be the handoff SHA.

Remove mandatory post-approval archival/finalization from the critical path of source completion. If archival remains useful, make it housekeeping or an explicit history-maintenance action that cannot block a proven implementation outcome.

### Handoff simplification

The developer handoff should contain only navigation that the web reviewer cannot derive more reliably itself. A candidate shape is:

```text
Status:
Remote developer SHA:
Checks + perceived results:
Blocker/decision:
Task-progress:
```

Always report the last independently known remote developer SHA, including when blocked, rather than replacing useful remote state with `none`. If unpushed local mutation may exist, state that separately.

The web reviewer derives changed files/range from GitHub instead of trusting the developer to reproduce them.

### Web instruction simplification

- Keep permanent instructions small and hard-boundary focused.
- Rewrite ordinary workflow around direct inspection, tiny GitHub edits, Commander implementation, optional direct OpenCode delegation, exact remote review, and proportional CI.
- Rewrite recovery around process/session/local Git/remote Git reconciliation and no-replay; delete issue/bridge lifecycle recovery.
- Keep template-maintenance and promotion as separately triggered procedures, but remove transport-specific ceremony.
- Replace the oversized bridge-oriented task-context template with only the continuity fields actually needed by the web orchestrator.

### Template-development simplification

- Keep independent branch authority, exact remote review, public safety, and human `main` boundary.
- Avoid duplicating the same maintenance procedure in web and template-development; one side owns detailed branch procedure and the other only orchestrates it.
- Remove package-broker fallback after direct-host package generation is proven.
- Do not make package creation, downstream application, or archival a prerequisite for source completion unless the task-record requests those outcomes.
- Evaluate whether Workspace Maintenance and hardened Scout belong in the core workflow or should become separately triggered/optional capabilities. Their safety value may remain, but their existence must not force every maintenance task through their machinery.

### Validator simplification

Validators should prove machine-checkable properties, not editorial phrasing. Prefer checks for required files/schema, permission boundaries, allowed route selectors, prohibited bridge/private-state persistence, branch/main protections, deterministic behavior, exact remote/provenance rules, and executable acceptance tests. Remove checks that require exact English wording, obsolete tool names, or duplicated prose solely to satisfy validation.

## Attempts

- Performed a heavy analysis of current web-orchestrator, developer, and template-development instructions at exact current source refs.
- Compared the operative instructions to the direct-host migration plan and identified duplicated lifecycle rules and bridge-era ceremony.
- Corrected the conceptual model for task-record, task-progress, AS-BUILT, and deviations before recording this plan.
- No instruction implementation, validator rewrite, package generation, or `main` mutation has been attempted under this task.

## Changed approach

The earlier simplification analysis proposed making developer task records conditional and described durable execution state under the wrong term. This task corrects that model: task-record is the instruction plan; task-progress is the durable execution context. Reliability under reduced future conversational retention therefore argues for keeping concise task-progress for delegated mutating work while removing unnecessary handoff, push, archival, and duplicate-instruction ceremony.

The redesign also strengthens rather than weakens AS-BUILT/deviation safety: assessment is mandatory, and updates are required whenever the resulting repository truth or normative divergence requires them.

## Checks

- Exact task-start refs independently read from GitHub for `main`, `developer`, `web-orchestration`, and `template-development`.
- Existing web permanent instructions/workflow/recovery/template-maintenance/promotion/task-context were reviewed.
- Existing developer root instructions, small/heavy agents, task workflow, Git sync/handoff, implementation-record rules, and work lifecycle were reviewed.
- Existing template-development root instructions, template-maintenance skill, Workspace skill/agents, task template, migration record, ADR, and validator behavior were reviewed.
- The new task path was confirmed absent before creation.

## Blockers / required decisions

No human decision is required to preserve or begin this instruction-redesign plan.

Implementation must remain compatible with the separate direct-host migration and must not pull the deferred private host adapter back into scope.

The later implementation should explicitly decide the exact on-disk separation/naming for task-record versus task-progress, because the current repository structure and terminology conflate them. Choose the smallest migration that makes their authority and ownership unambiguous without rewriting historical records.

## Remaining work

1. Re-read exact live source refs before implementation.
2. Design the smallest concrete task-record/task-progress file ownership and naming scheme compatible with existing history.
3. Rewrite permanent web instructions to the minimal hard-boundary set plus Commander/GitHub route preference.
4. Rewrite ordinary web workflow and recovery for direct-host execution and no-replay reconciliation; remove bridge/issue transport procedure.
5. Simplify developer `AGENTS.md`, small/heavy agent files, task workflow, Git/handoff rules, work lifecycle, and response shape so each rule has one normative owner.
6. Make task-progress concise durable execution context; remove command-by-command expectations, mandatory handoff-only commits, automatic push-after-every-commit, and archival from the default completion path.
7. Encode mandatory AS-BUILT/deviation/docs/package assessment and concrete update triggers without creating routine documentation churn.
8. Simplify template-maintenance web/template-development responsibility split and remove duplicated lifecycle prose.
9. Remove obsolete bridge/package-broker/Workspace-bridge instruction references in coordination with the direct-host migration.
10. Rewrite validators/tests to enforce behavior and safety properties rather than exact editorial wording.
11. Run focused local tests and full affected canonical validation.
12. Push/review exact `developer`, `web-orchestration`, and `template-development` ranges as applicable; do not touch `main` without separate human exact-SHA approval.

## Next action

Before bulk direct-host migration source removal, implement this instruction redesign far enough that subsequent migration work runs under the simplified direct-host-oriented workflow rather than the obsolete bridge-era lifecycle.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- template-development `AGENTS.md`
- template-development `.opencode/skills/template-maintenance/SKILL.md`
- template-development `.opencode/skills/workspace-maintenance/SKILL.md`
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
