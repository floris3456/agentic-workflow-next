# ADR-0002: Prefer the simplest sufficient architecture

- Status: Proposed
- Date: 2026-08-26

## Context

This system has repeatedly gained and later removed workflow layers, control paths, retries, brokers, and mandatory ceremony that were no longer needed.

Some problems still need real complexity, especially safety, security, provenance, containment, and irreversible publication.

## Decision

Choose the simplest architecture that fully satisfies the real requirement.

Add abstractions, workflow layers, validators, state machines, brokers, or control planes only when there is a concrete problem they need to solve.

Keep necessary complexity close to the boundary that needs it and prove it with useful checks.

Do not build generalized machinery for hypothetical future needs when a bounded solution is enough.

## Consequences

- Ordinary work has fewer moving parts and less permanent context.
- New machinery has to justify its cost.
- Agents may use judgment inside clear authority and safety boundaries.
- Safety-critical mechanisms may still be complex when the problem requires it.

## Rejected alternatives

- Keep old machinery only because it already exists.
- Require one generalized workflow for every task.
- Add ceremony or validation without a concrete failure it prevents.
