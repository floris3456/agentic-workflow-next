# Template-maintenance task record

## Task ID

TEMPLATE-DUAL-DEVELOPER-001

## Status

queued — dual-developer architecture accepted; implementation waits for the bounded direct-host runtime proof

## Task-start template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Review-base template-development SHA

21c6ecdc0b3c0aa459998135a7462f1a2976158d

## Public-safe task brief

Add a new default `dual` developer route to `floris3456/agentic-workflow-next`. The route consists of a reasoning/review lead and a fast execution agent operating as one developer system on one mutating worktree.

The initial lead model is Anthropic Opus 4.6, with a future upgrade to Opus 5 expected. The initial executor is GPT-5.3-Codex-Spark. Model/version choices are replaceable configuration; repository instructions and routing language must use stable role identities rather than baking model versions into architecture.

The lead developer is the brains of the developer. It reads the accepted task, performs the deep repository/current-state analysis needed for implementation, designs the concrete implementation approach, gives Spark an extremely detailed execution packet, reviews Spark's exact changes and checks, and steers Spark until the developer outcome is satisfactory. Spark performs the edits, tests, and other mechanical execution requested by the lead.

Spark must have one task-scoped `proposed-deviations` file/queue through which it can challenge the lead's execution instructions when direct current-state evidence shows a materially better route. Spark may not silently deviate. The lead accepts or rejects each proposal and remains responsible for the resulting developer implementation.

The lead may itself intentionally depart from an expected implementation plan/instruction when deeper current-state inspection proves a different implementation is better and the same requested outcome, material scope, and hard constraints are still satisfied. That is not a request for future permission. When the resulting implementation materially differs from an applicable prior expected state, the repository's formal deviation record must describe the current implemented reality and the prior expectation it differs from. A change to the human's requested outcome, material scope, acceptance authority, or a hard safety/security boundary still requires the owning authority rather than being treated as an implementation deviation.

`dual` becomes the normal/default developer route for substantive implementation. The existing `small` and `heavy` developers remain separate single-model routes for intentionally small work and are never substitutes for Spark inside a `dual` execution:

- `small`: very simple bounded local tasks that are too slow/wasteful for the web orchestrator to execute directly but generally need no testing or at most very simple testing; use when Dual overhead would be wasteful.
- `heavy`: bounded small tasks that are too difficult, important, subtle, or risky for `small`, but still small enough that the full lead -> Spark planning/review loop would be unnecessary overhead.
- `dual`: the default for normal substantive development requiring nontrivial implementation, testing, interacting edits, deeper local reasoning, or developer-side review.

If Spark or another required part of `dual` is unavailable, the `dual` route is unavailable. Do not silently replace Spark with `small` or `heavy`; the web orchestrator must make a fresh route decision from the actual task and available capabilities.

## Responsibility boundary

This record owns the **developer-internal architecture and runtime contract** for `dual`:

- stable `dual`, lead, and Spark role identities;
- lead -> Spark delegation and permission boundary;
- detailed execution-packet contract;
- Spark execution/result contract;
- task-scoped proposed-deviation mechanism;
- lead review, correction, and same-task steering loop;
- model/config abstraction that allows Opus/Spark versions to change without rewriting workflow semantics;
- route-specific acceptance tests proving one lead and one executor can safely operate against one developer worktree;
- developer-side architecture/design/AS-BUILT updates caused by introducing the new topology.

`TEMPLATE-INSTRUCTION-MINIMALISM-001` owns the cross-system instruction semantics: when web selects `direct`, `small`, `heavy`, or `dual`; the web/lead review split; canonical task-record/task-progress rules; deviation semantics shared across routes; handoff/checkpoint/recovery rules; and validator philosophy.

`TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` owns the base host/OpenCode capability, canonical repository identity, worktrees, selected compatible OpenCode runtime, no-replay host recovery, bridge retirement, and package-broker retirement.

`TEMPLATE-AGENT-MEMORY-001` owns persistent AgentMemory integration, per-agent memory attribution, shared/isolated recall, and deterministic context reconstruction. Dual must work correctly without AgentMemory first; memory is an enhancement, not a prerequisite for proving the lead -> Spark developer contract.

The private fixed-operation host adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001` and is not a prerequisite.

## Current objective

Prove one developer architecture with explicit non-overlapping authority:

```text
Human
  -> requested outcome / material scope / acceptance

Web orchestrator
  -> web research + task/outcome design + route selection
  -> final system/outcome verification

Dual developer (default substantive route)
  Lead developer (initially Opus 4.6)
    -> deep current-state analysis
    -> implementation architecture
    -> detailed Spark execution packet
    -> review exact Spark changes/checks
    -> accept/reject proposed deviations
    -> steer until developer work is satisfactory
        |
        v
  Spark implementer (GPT-5.3-Codex-Spark)
    -> edit / generate / test / report evidence
    -> may propose, never silently apply, a departure from lead instructions

Remote GitHub + canonical CI
  -> exact repository/check evidence

Human
  -> only authority accepting one exact reviewed developer SHA into main
```

The web orchestrator may research specific architectural components before task design because useful task design requires enough understanding of the problem space. It should not duplicate the lead's deep implementation analysis by default. The lead is expected to discover deeper current-state details and may adapt implementation accordingly while preserving the requested outcome.

## Current position

The current developer architecture has only two implementation agents and no developer-internal reviewer:

- `small-developer` is the configured OpenCode default;
- `large-developer` is the current `heavy` route;
- both deny subagent/task launches;
- both describe themselves as implementation-only and explicitly not independent review;
- the web orchestrator is currently the primary task-design, steering, and independent-review layer;
- current validators explicitly require `small-developer` as the default and validate the existing small/heavy topology.

Exact live repository refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `21c6ecdc0b3c0aa459998135a7462f1a2976158d`

No developer/source implementation has been performed under this task.

## Source ranges

None yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `21c6ecdc0b3c0aa459998135a7462f1a2976158d`

## Observed

- `opencode.json` currently sets `default_agent` to `small-developer` and denies task/subagent launches globally.
- Current small/heavy agent definitions explicitly prohibit launching subagents and reviewing their own work.
- Current architecture/design records give the web orchestrator primary deep review responsibility and define only public `small` / `heavy` implementation selectors.
- Current developer validation pins the existing default and multiple lifecycle/agent details, so introducing `dual` cannot safely be treated as an agent-file-only edit.
- The direct-host migration already intends to replace bridge-mediated execution with native OpenCode sessions, which is the correct base on which to prove the new developer topology.
- The requested Opus and Spark models are initial implementations of stable roles. Future Opus 5 or Spark upgrades must not require changing the public routing contract.

## Interpretation

### Public route semantics

The target public implementation choices are not a fallback ladder:

1. **Direct web/GitHub mutation** — tiny, precisely known, low-risk edits where the web orchestrator can complete and prove the change more simply than launching local development.
2. **`small`** — simple bounded local work that is too slow/wasteful for direct web execution, generally requires no testing or only trivial checks, and does not justify Dual overhead.
3. **`heavy`** — difficult/important small work where stronger single-model reasoning is warranted, but the task remains small enough that lead -> Spark decomposition/review would be unnecessary overhead.
4. **`dual`** — normal/default substantive development.

The web orchestrator selects among these from the actual task. `small` and `heavy` do not replace Spark and are not internal components of `dual`.

### Stable developer roles

Use stable role names independent of model versions. Exact file names may follow the repository's smallest compatible naming scheme, but the semantic roles are:

- **lead developer** — architect/reviewer for `dual`;
- **Spark implementer** — fast executor inside `dual`;
- **small developer** — specialized simple-task route;
- **heavy developer** — specialized difficult/important small-task route.

The initial lead model is Opus 4.6 and may later become Opus 5. The Spark role initially uses GPT-5.3-Codex-Spark. Model replacement is configuration unless a future model changes required permissions/capabilities enough to alter the role contract.

### Lead developer authority

The lead owns detailed implementation design inside the accepted requested outcome.

It must:

1. read the canonical task-record and relevant current repository state;
2. inspect deeply enough to understand the implementation reality, affected AS-BUILT/design/deviations, tests, interfaces, and hidden compatibility constraints;
3. decide the concrete implementation architecture;
4. produce a detailed Spark execution packet;
5. review Spark's actual diff, checks, and any proposed deviations;
6. accept, reject, or revise proposals;
7. steer the same developer task until the implementation is satisfactory or a genuine human/orchestration-owned decision is required;
8. leave task-progress and applicable durable implementation truth current.

The lead does not own changing the human's requested outcome or material scope. It does own changing an implementation expectation when current reality proves a different route is better and the same outcome/constraints remain satisfied.

### Spark execution packet

Every nontrivial Spark assignment must be detailed enough that Spark is primarily executing rather than inventing architecture. At minimum include:

- current objective and canonical task-record reference;
- exact repository/worktree starting state relevant to the assignment;
- intended files/symbols/components to change;
- important files/systems not to touch;
- step-by-step implementation instructions at the detail appropriate to the task;
- invariants and compatibility requirements;
- required tests/checks and expected evidence;
- AS-BUILT/deviation/actionable-doc obligations that Spark should surface for lead review;
- definition of done for the assignment;
- known traps/edge cases discovered by the lead;
- conditions that should go to `proposed-deviations` instead of being silently changed.

The execution packet is developer-internal procedure, not a second task-record. Persist only the minimum needed for correct resume/recovery under the shared task-progress rules.

### Spark authority

Spark executes the lead's packet using the authorized developer worktree and tools. It may edit, generate, run checks, and report exact observable results within that packet.

Spark must not:

- redefine the task outcome;
- silently change the lead's architecture/instructions;
- launch another mutating agent;
- accept its own implementation;
- claim that a formal deviation is approved merely because it proposed one.

### Proposed deviations

Each Dual task gives Spark one task-scoped `proposed-deviations` file/queue visible to the lead. The exact path/schema should be the smallest form compatible with the final task-work layout, but each proposal must distinguish:

- the lead instruction/assumption being challenged;
- direct current-state evidence;
- the proposed alternative;
- why it better preserves or achieves the same requested outcome;
- expected impact on files/tests/durable records;
- status: pending, accepted, rejected, or superseded;
- lead disposition when resolved.

This artifact is not normative authority and is not the repository's formal deviation record. It is a developer-internal proposal channel.

Spark does not implement a material proposed departure until the lead accepts it. Once accepted, the lead owns that decision and can instruct Spark to implement it.

### Formal deviations describe current reality

A formal deviation is not a future-state proposal or permission mechanism. It records a material difference that exists in the resulting implementation between current implemented reality and an applicable prior expected state.

The lead may intentionally create such a deviation without returning to web/human merely because the implementation method changed, provided the same requested outcome, material scope, and hard constraints are still met. The deviation then records what is implemented, what prior expectation it differs from, why current reality required or justified the change, and how the requested outcome is still satisfied.

Escalate only when the proposed implementation would materially change the requested outcome/scope, consume a human-owned risk decision, weaken a hard authority/safety boundary, or require capability/access outside existing authorization.

### Permission/subagent boundary

The target permission design should be narrow:

- lead may launch/use only the approved Spark implementer for the Dual task;
- Spark cannot launch subagents;
- small/heavy remain single-model and cannot recursively delegate;
- one mutating worktree is active for the developer task;
- user/orchestrator-facing structured questions and consequential permission decisions belong to the lead, not to an uncontrolled nested agent chain.

Do not enable general recursive agent delegation merely to support Dual.

### Developer-side review

A Dual developer handoff is not ready for web final verification merely because Spark reports completion. The lead must inspect the actual implementation and relevant checks after Spark execution.

The lead may steer Spark through additional corrective passes in the same task. There is no arbitrary retry count; change approach when evidence shows the current approach is weak or blocked.

The lead's completed handoff means **developer-reviewed**, not human-accepted.

### Web final verification

For Dual work, web should not repeat the lead's entire line-by-line implementation review by default. It should independently verify the exact remote SHA/range, required CI/check evidence, task-record outcome, material architecture/safety constraints, durable-record truth, and any material residual risk.

Web may deepen review when stakes, risk, security, permissions, destructive migration, or unclear developer evidence justify it.

For `small` and `heavy`, there is no lead reviewer. Because those routes are intentionally bounded/small, web final verification should become proportionally deeper enough to cover the missing developer-side review without turning them into Dual internally.

## Attempts

- Reviewed the current web/developer architecture, current small/heavy agent definitions, OpenCode default configuration, and validator assumptions.
- Defined `dual` as the stable public name for the two-model architecture rather than naming the route after transient model speed/capability.
- Corrected the route model so `small` and `heavy` remain specialized small-task routes and never replace Spark inside Dual.
- Corrected deviation authority so the lead can adapt implementation to current reality while preserving the same requested outcome, with formal deviations recording actual resulting state rather than requesting future permission.
- No source implementation or `main` mutation has been performed.

## Changed approach

The initial architecture discussion treated `small`/`heavy` partly as possible fallbacks and treated higher-level expected-state deviations as something the lead might need to return to web for approval. The accepted design is now different:

- Dual is the default substantive developer and is only Dual when both its lead and Spark roles are available.
- Small/heavy are independent shortcuts for bounded small work, selected directly from task characteristics.
- The lead may change implementation expectations on its own when deep current-state reality requires a better implementation that still delivers the same requested outcome.
- Formal deviations document the resulting current-state difference; Spark's `proposed-deviations` file is only the internal proposal path before the lead decides.

## Checks

- Exact live `main`, `developer`, `web-orchestration`, and `template-development` refs were independently read before creating this record.
- Current developer `opencode.json`, small/heavy agent files, agent-system/design records, and validator were inspected.
- Current web permanent/workflow instructions were inspected for the existing primary-review and small/heavy route assumptions.
- No developer/source files have been changed under this task.

## Blockers / required decisions

No human design decision currently blocks this task.

Implementation should wait for the bounded direct-host Stage 1 proof to establish the selected compatible OpenCode runtime, independent new-repository worktree, direct session/control path, no-replay recovery, push/readback, and canonical CI while the bridge remains intact.

Exact model configuration/provider identifiers and the exact on-disk path/schema of the task-scoped `proposed-deviations` file are implementation details. Choose the smallest stable form that proves the required role/authority behavior and remains replaceable across future model upgrades.

## Remaining work

1. Consume and independently verify `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001` Stage 1 basic direct-host/OpenCode proof.
2. Define stable public `dual` and internal lead/Spark role identities independently of concrete model versions.
3. Configure the lead with the initial Opus 4.6 model and Spark implementer with GPT-5.3-Codex-Spark, keeping model replacement localized.
4. Change OpenCode/agent permissions so the lead can invoke only Spark while Spark/small/heavy cannot recursively delegate.
5. Implement the detailed lead -> Spark execution-packet contract and same-task steering/review loop.
6. Implement one task-scoped `proposed-deviations` file/queue with explicit lead acceptance/rejection and no silent Spark deviation.
7. Implement lead-side review against actual diffs/checks and correction until developer-reviewed completion.
8. Update developer architecture/AS-BUILT/design/deviation/actionable docs for the new topology.
9. Update route/default assumptions and mechanical validators in coordination with `TEMPLATE-INSTRUCTION-MINIMALISM-001`; do not leave validators requiring `small-developer` as the universal default.
10. Prove `small` remains a simple-task route and `heavy` remains a difficult/important-small-task route without using either as a Spark substitute.
11. Run acceptance tasks proving: direct small shortcut, direct heavy shortcut, normal Dual task, accepted Spark proposal, rejected Spark proposal, lead correction after failed/incorrect Spark work, and Dual unavailability failing closed rather than silently substituting another agent.
12. Run focused local checks plus canonical push-triggered CI and independently review exact remote source ranges.
13. Hand the proven Dual capability to `TEMPLATE-AGENT-MEMORY-001` and `TEMPLATE-INSTRUCTION-MINIMALISM-001`; do not retire the bridge from this task.

## Next action

Wait for and inspect the bounded direct-host Stage 1 proof. Then implement and prove the Dual developer topology itself, with AgentMemory disabled/optional during the first acceptance run so developer correctness does not depend on the new memory layer.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- developer `opencode.json`
- developer `AGENTS.md`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `.opencode/skills/task-workflow/SKILL.md`
- developer `.opencode/skills/implementation-records/SKILL.md`
- developer `.opencode/skills/git-sync-and-handoff/SKILL.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/design-record.md`
- developer `docs/architecture/AS-BUILT.md`
- developer `docs/deviations.md`
- developer `scripts/validate-agent-system.mjs`
- developer `scripts/validate-web-orchestrator-integration.mjs`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`

## Last handoff commit

None
