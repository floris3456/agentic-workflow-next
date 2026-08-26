# ADR-0003: Separate authority by responsibility

- Status: Proposed
- Date: 2026-08-26

## Context

Different parts of the system can inspect or change overlapping state. Technical access alone does not say who should make a decision or own a change.

Without clear ownership, orchestration, implementation, maintenance, review, and acceptance can blur together.

## Decision

Assign authority by responsibility, not by tool access, working directory, model, or current role name.

Keep these responsibilities separate:

- orchestration and independent outcome review;
- implementation of the actual project or product;
- maintenance of reusable system or template structure; and
- human acceptance of consequential release state.

A role may inspect another area without taking over that area's authority. Cross-boundary work must keep the original ownership clear.

Exact role names and where the roles run may change without changing this decision.

## Consequences

- Ownership and review boundaries stay clear.
- Technical reach does not silently grant broader authority.
- Work that crosses responsibilities may need explicit routing or separate changes.
- Automated checks and agent reports remain evidence, not human acceptance.

## Rejected alternatives

- Let one role own orchestration, implementation, maintenance, review, and acceptance.
- Treat access to a worktree or tool as permission to own that work.
- Merge responsibility boundaries just to reduce handoffs.
