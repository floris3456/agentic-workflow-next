# Agent routing and escalation

## Trigger

Use before selecting Sol, after a failed Luna approach, or when classifying an attempt.

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

## Persistence

Update `web-orchestration-only/agent-routing/<task-id>.md` with date, ref, attempt count, route, reason, result, and retrospective. Keep developer diagnosis separate from orchestrator classification.
