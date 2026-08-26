# ADR-0008: Validate invariants, not prose

- Status: Proposed
- Date: 2026-08-26

## Context

Validators are useful for permissions, structure, safety, provenance, and other machine-checkable contracts. They become harmful when they freeze instruction wording or workflow ceremony instead of the real requirement.

Passing validation also does not prove that an architectural decision is correct or human-approved.

## Decision

Validate observable invariants and behavior rather than exact prose.

Use tests and validators for mechanical contracts such as configuration, permissions, allowed structure, safety boundaries, provenance, mutation guards, and expected behavior.

Check exact values when the value itself is part of the mechanical contract. Use wording-based checks only when an important concept has no better mechanical representation, and keep those checks as flexible as practical.

Human review remains responsible for meaning, architecture, and acceptance.

Current validator names, test frameworks, and file inventories may change without changing this decision.

## Consequences

- Instructions and documentation can improve without needless validator churn.
- Mechanical safety boundaries remain testable.
- Some semantic rules still need human review.
- Wording-based checks remain an exception rather than the default.

## Rejected alternatives

- Validate complete instructions by exact text.
- Freeze handoff or workflow wording because it is easy to search for.
- Treat successful validation as architectural or human acceptance.
