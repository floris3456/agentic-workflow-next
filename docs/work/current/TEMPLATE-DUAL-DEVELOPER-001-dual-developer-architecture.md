# Template-maintenance task record

## Task ID

TEMPLATE-DUAL-DEVELOPER-001

## Status

queued — implement after the Direct Host substrate is proven; first prove as an opt-in route

## Task-start template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Review-base template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Public-safe task brief

Add a `dual` developer made of two distinct roles operating on one developer task:

- **Lead developer:** initially Opus 4.6, later replaceable by Opus 5 or another suitable model. The lead is the brains: deeply inspect current repository reality, architect the implementation, give Spark extremely detailed instructions, review Spark's actual work/checks, and steer corrections.
- **Spark implementer:** initially GPT-5.3-Codex-Spark. Spark performs the implementation work: source edits, generation, commands, tests/checks, and reports observable results.

Model names are configuration, not permanent routing language.

The lead must not perform the source implementation itself. It should remain read-only with respect to implementation source/tests/generated outputs and use Spark for the actual edits and execution. The lead may maintain the small amount of developer-control/task state needed to run/review the task, but it must not quietly become a second implementation editor.

Spark gets one task-scoped `proposed-deviations` file. When Spark believes a lead instruction does not fit current reality and a different implementation better achieves the same requested outcome, Spark writes the proposal there instead of silently changing course. The lead accepts or rejects it and then instructs Spark accordingly.

The lead may itself choose a materially different implementation from an earlier expected plan when deeper current-state evidence shows that implementation is better and it still delivers the same requested outcome within material scope and hard constraints. If the resulting implemented reality materially differs from a prior normative expected state, the normal formal deviation records that current difference. A deviation is not a future-state permission request.

## Route semantics

`dual`, `small`, and `heavy` are separate route choices, not an escalation/fallback ladder:

- **`small`:** very simple bounded local work that is too inconvenient/slow for direct web execution, normally requires no testing or only trivial testing, and would make Dual overhead wasteful.
- **`heavy`:** difficult, important, subtle, or risky work that is still small/bounded enough that a full lead -> Spark loop would be unnecessary overhead.
- **`dual`:** normal substantive development involving nontrivial implementation, interacting edits, meaningful testing, deeper current-state reasoning, or developer-side review.

`small` and `heavy` never replace Spark inside Dual. If Spark or the lead is unavailable, Dual is unavailable; the web orchestrator makes a fresh route choice for the task rather than pretending another agent completed the Dual route.

This task proves `dual` as an **explicit opt-in route only**. `TEMPLATE-INSTRUCTION-MINIMALISM-001` later makes it the normal/default substantive route after the mechanism is proven.

## Execution order position

This is step 2:

1. Direct Host substrate.
2. **Dual opt-in proof — this task.**
3. Instruction Minimalism cutover and Dual default.
4. One representative substantive Dual task.
5. Direct Host bridge/broker retirement.
6. AgentMemory enhancement.

AgentMemory is not required to implement or prove Dual.

## Responsibility boundary

This record owns only the Dual developer mechanism:

- stable lead and Spark role identities;
- narrow lead -> Spark delegation;
- lead deep implementation analysis and detailed execution instructions;
- Spark-only source implementation/testing;
- the task-scoped `proposed-deviations` file;
- lead review and correction loop;
- a simple successful opt-in proof.

Cross-system route/default/review/task/deviation/lifecycle rules belong to `TEMPLATE-INSTRUCTION-MINIMALISM-001`. Direct-host runtime belongs to `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. AgentMemory belongs to `TEMPLATE-AGENT-MEMORY-001`.

## Current position

Current developer architecture has only independent single-model `small` and `heavy` agents. The existing agents deny subagent launches, OpenCode currently defaults to `small-developer`, and the web orchestrator currently owns the deeper implementation review.

Exact live source refs at this planning revision:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development` planning base: `87c48bb7e29f9ad0cef61cf0f0edcea670e71825`

No source implementation has been performed under this task.

## Lead developer contract

The lead should:

1. read the canonical task-record and relevant current task-progress/AS-BUILT/deviations/docs;
2. inspect the live repository deeply enough to understand actual implementation constraints;
3. decide the concrete implementation architecture;
4. give Spark instructions detailed enough that Spark mainly executes rather than invents architecture;
5. inspect Spark's actual resulting diff and relevant check output;
6. accept/reject proposed deviations and steer Spark as needed;
7. return developer-reviewed completion only when satisfied with the actual result.

The web orchestrator may research architectural components enough to design a useful task, but it should not duplicate this deep implementation analysis by default.

## Spark contract

Spark should:

- make the actual source/test/generated-file edits requested by the lead;
- run the requested commands/checks;
- report exact observable results;
- use the task-scoped `proposed-deviations` file when a material lead instruction should change;
- never silently change the requested outcome or lead architecture;
- never recursively delegate another mutating developer.

### Proposed-deviations file

Use one real task-scoped file, not an ephemeral queue. Keep it simple. A proposal needs only:

- the instruction/assumption being challenged;
- the observed current-state reason;
- the proposed alternative;
- why it better reaches the same requested outcome;
- lead disposition: pending / accepted / rejected.

The file is developer-internal working state, not normative authority and not the formal deviation log. By final developer handoff there must be no unresolved proposal. Durable effects belong in task-progress and/or the normal formal deviation record; the working proposal file does not need to become permanent repository history after the task is complete.

## Deviation rule

The lead may adopt a better implementation on its own when it preserves the same requested outcome, material scope, and hard constraints. Do not require a web/human round trip merely because an implementation expectation changed.

Escalate only when the change would alter the requested outcome/material scope, consume a human-owned risk/access decision, or weaken a hard authority/safety boundary.

After implementation, if current implemented reality materially differs from an applicable prior normative expected state, record a formal deviation describing:

- what exists now;
- what prior expectation it differs from;
- why the current implementation is better/necessary;
- how the same requested outcome remains satisfied.

## Verification philosophy

Keep the first implementation instruction-first and small.

Do not build a large Dual protocol, verifier, exhaustive acceptance matrix, or exact-prose validator. Configure the roles/permissions sensibly, write clear instructions, and prove the route with one representative opt-in implementation plus the normal tests/checks that task naturally requires. Add stronger mechanical enforcement later only if real use exposes a repeated failure mode.

## Remaining work

1. Consume the proven Direct Host substrate.
2. Add stable lead and Spark agent roles and the narrow delegation needed for the lead to use Spark.
3. Ensure the lead is instructed not to edit implementation source and Spark is the implementation executor.
4. Implement the simple lead -> Spark instruction/review loop.
5. Add one task-scoped `proposed-deviations` file mechanism.
6. Run one bounded opt-in Dual task and confirm the lead actually reviews/steers Spark before completion.
7. Update only the architecture/AS-BUILT/docs needed to describe the mechanism.
8. Use ordinary proportional checks/CI. Do not add complex workflow verifiers unless a concrete failure proves one is needed.
9. Hand the proven opt-in route to `TEMPLATE-INSTRUCTION-MINIMALISM-001`, which owns making Dual the default.

## Next action

After Direct Host step 1 is proven, implement `dual` as an explicit opt-in route and prove one representative lead -> Spark cycle with AgentMemory absent/disabled.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/design-record.md`
- developer `docs/architecture/AS-BUILT.md`
- developer `docs/deviations.md`

## Last handoff commit

None
