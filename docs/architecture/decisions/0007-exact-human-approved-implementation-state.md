# ADR-0007: Require human approval of an exact accepted implementation state

- Status: Proposed
- Date: 2026-08-26

## Context

Active implementation can keep moving while a human is reviewing it. A branch name, task, report, or successful check does not identify one exact state that was approved.

Promotion can also become ambiguous if the target changes or publication is interrupted.

## Decision

A consequential accepted or release state may advance only from one exact implementation state explicitly approved by a human.

Immediately before promotion, re-establish the exact source and target states. The promoted content must match the approved implementation state and must not gain opportunistic fixes or unrelated changes during promotion.

If promotion becomes uncertain, reconcile the actual state before any retry. Verify the final accepted state after publication.

Current branch names, merge shape, and promotion script names are implementation details. The durable requirement is exact human approval and exact resulting content.

## Consequences

- Accepted state is tied to what the human actually reviewed.
- New implementation movement may require a new review.
- Automated checks and agent review remain evidence, not acceptance.
- Promotion needs strict preconditions and final verification.

## Rejected alternatives

- Promote automatically after checks pass.
- Treat approval of a moving branch or task as approval of any later state.
- Add cleanup or fixes during promotion.
- Retry an uncertain promotion without first inspecting the result.
