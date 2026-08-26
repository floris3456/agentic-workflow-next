# ADR-0006: Reconcile uncertain effects before retrying

- Status: Proposed
- Date: 2026-08-26

## Context

A timeout, disconnect, or error response does not prove that a mutation had no effect. Repeating it blindly can create duplicates or conflicts.

Building a general recovery state machine for every operation would add permanent complexity to solve an occasional problem.

## Decision

Treat an uncertain mutation result as unknown until observable state shows what happened.

Before retrying or replacing the operation:

1. inspect the smallest useful current evidence;
2. continue from the existing effect if it already happened;
3. retry only when the effect is proven absent and repeating it is safe; and
4. keep one mutating route until the uncertainty is resolved.

After a claimed durable publication, verify the exact resulting state.

The specific tools, refs, services, or recovery markers used to do this may change.

## Consequences

- Duplicate and overlapping mutations are less likely.
- Recovery may require extra inspection before work continues.
- Some ambiguous cases fail closed instead of guessing.
- Recovery complexity stays close to mutations that truly need it.

## Rejected alternatives

- Retry automatically after every timeout or failed response.
- Assume an error means nothing happened.
- Start another mutating route over unresolved work.
- Build a general recovery control plane without a demonstrated need.
