# Template-maintenance task record

## Task ID

TEMPLATE-DUAL-DEVELOPER-001

## Public-safe task brief

Add a `dual` developer composed of two distinct roles working on one developer task:

- **Lead developer:** the brains of the developer. The initial model is Opus 4.6, later replaceable by Opus 5 or another suitable model. The lead deeply inspects current repository reality, designs the implementation, gives Spark detailed execution instructions, reviews Spark's actual work/checks, and steers corrections.
- **Spark implementer:** the execution role. The initial model is GPT-5.3-Codex-Spark. Spark performs source/test/generated-file edits, commands, tests/checks, and reports observable results.

Model names are configuration, not permanent routing language.

The lead must not perform the implementation source work itself. It may maintain the small amount of task/control state necessary to direct and review Spark, but must not quietly become a second implementation editor.

## Execution position

This is **step 2**. The canonical overall execution order is owned by `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`.

This task proves `dual` as an explicit opt-in route. `TEMPLATE-INSTRUCTION-MINIMALISM-001` later makes it the normal/default substantive route.

AgentMemory is not required to implement or prove Dual.

## Route semantics

`dual`, `small`, and `heavy` are separate route choices, not a fallback ladder:

- **`small`:** very simple bounded local work that is too inconvenient/slow for direct web execution, normally requires no testing or only trivial testing, and would make Dual overhead wasteful;
- **`heavy`:** difficult, important, subtle, or risky work that is still small/bounded enough that a full lead -> Spark loop would be unnecessary overhead;
- **`dual`:** normal substantive development involving nontrivial implementation, interacting edits, meaningful testing, deeper current-state reasoning, or developer-side review.

`small` and `heavy` never replace Spark inside Dual. If the lead or Spark is unavailable, Dual is unavailable; the web orchestrator makes a fresh route decision rather than pretending another agent completed the Dual route.

## Responsibility boundary

This task owns only the Dual mechanism:

- stable lead and Spark role identities;
- narrow lead -> Spark delegation;
- lead deep implementation analysis and detailed execution instructions;
- Spark-only implementation/testing;
- one real task-scoped `proposed-deviations` file;
- lead review and correction loop;
- a simple opt-in proof.

Cross-system route/default/review/task/deviation/lifecycle rules belong to `TEMPLATE-INSTRUCTION-MINIMALISM-001`. Direct-host runtime belongs to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. AgentMemory belongs to `TEMPLATE-AGENT-MEMORY-001`.

## Lead developer contract

The lead must:

1. read the canonical task-record and relevant current task-progress, AS-BUILT, deviations, architecture/design/docs;
2. inspect the live repository deeply enough to understand the actual implementation constraints;
3. decide the concrete implementation architecture;
4. give Spark instructions detailed enough that Spark mainly executes rather than invents architecture;
5. inspect Spark's actual resulting diff and relevant check output;
6. accept/reject proposed deviations and steer Spark as needed;
7. return developer-reviewed completion only when satisfied with the actual result.

The web orchestrator may research architectural components enough to design a useful task, but should not duplicate this deep implementation analysis by default.

## Spark contract

Spark must:

- make the actual implementation edits requested by the lead;
- run the requested commands/checks;
- report exact observable results;
- use the task-scoped `proposed-deviations` file when a material lead instruction should change;
- never silently change the requested outcome or lead architecture;
- never recursively delegate another mutating developer.

## Proposed-deviations file

Use one real task-scoped file, not an ephemeral queue.

A proposal needs only:

- the lead instruction/assumption being challenged;
- the observed current-state reason;
- the proposed alternative;
- why it better reaches the same requested outcome;
- lead disposition: pending / accepted / rejected.

The file is developer-internal working state, not normative authority and not the formal deviation log. By final developer handoff there must be no unresolved proposal. Durable effects belong in task-progress and/or the formal deviation record; the working proposal file does not need to remain after the task is complete.

## Deviation authority

The lead may choose a materially different implementation on its own when deeper current-state evidence shows it is better and it preserves the same requested outcome, material scope, and hard constraints.

Do not require a web/human round trip merely because an implementation expectation changed.

Escalate only when the change would alter requested outcome/material scope, consume a human-owned risk/access decision, or weaken a hard authority/safety boundary.

If the resulting current implementation materially differs from an applicable prior normative expected state, record a formal deviation describing what exists now, the prior expectation, why the current implementation differs, and how the same requested outcome remains satisfied.

## Implementation philosophy

Keep the first version instruction-first and small.

Do not build a large Dual protocol, verifier framework, exhaustive acceptance matrix, or exact-prose validator. Configure the roles/permissions sensibly, write clear instructions, and prove the route with one representative opt-in implementation plus the normal tests/checks that task naturally requires.

Add stronger mechanical enforcement only if actual use later exposes a repeated failure mode.

## Required work

- add stable lead and Spark roles and the narrow delegation needed for the lead to use Spark;
- make the lead non-editing for implementation source/tests/generated outputs and Spark the implementation executor;
- implement the simple lead -> Spark instruction/review/steering loop;
- implement one task-scoped `proposed-deviations` file;
- run one bounded opt-in Dual task and confirm the lead reviews/steers Spark before completion;
- update only the architecture/AS-BUILT/docs needed to describe the mechanism;
- use ordinary proportional checks/CI rather than new workflow-verifier infrastructure.

## Acceptance criteria

The task is complete when an explicit opt-in Dual task demonstrates:

- lead deep current-state implementation design;
- Spark-only implementation execution;
- lead review of the actual resulting work/checks;
- correction/steering when needed;
- no unresolved proposed deviation at handoff;
- no substitution of small/heavy for Spark;
- ordinary relevant checks passing for the task.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer applicable architecture/AS-BUILT/deviation records
