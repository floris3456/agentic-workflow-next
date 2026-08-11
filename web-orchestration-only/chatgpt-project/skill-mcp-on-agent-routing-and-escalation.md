# Agent routing and escalation

## Trigger

Use before every initial agent selection, before selecting Sol, after a failed Luna approach, or when classifying an attempt.

## Default

Luna is the default for every independent task.

## Substantive Luna attempt

Count an attempt only when the brief was actionable, required access and tools worked, no external blocker prevented work, Luna tried a coherent material approach, and that approach failed the required outcome or validation.

Do not count missing information, permissions, connector failure, poor task specification, transient syntax error, or environmental retry.

## Sol

- Escalate after Luna's second substantive failure.
- Select Sol immediately only when intrinsic complexity or ambiguity makes two Luna attempts predictably unreliable or wasteful.
- Importance, size alone, or preference is insufficient.
- Luna never promotes itself; there is no automatic tier after Sol.
- The next independent task returns to Luna.

## Bridge routing

- Set the orchestrator-selected agent explicitly in the initial `start` command.
- To change the existing task's route, prepare `route` on the same issue with a fresh UUID, the next sequence, required `arguments.agent` of `luna` or `sol`, and an optional public-safe `arguments.message`. Persist the pending envelope before posting it.
- A correlated `succeeded` result confirms route-command handling, not implementation success. The developer or bridge never selects Sol independently.

## Persistence

Create `web-orchestration-only/agent-routing/<task-id>.md` when the initial default-Luna or exceptional-Sol route is selected. Record date, remote ref, attempt count, route, and reason before delegation, then add the start issue/command ref after exact readback. Append every later route change and retain result/retrospective. Keep developer and bridge diagnosis separate from orchestrator classification.
