# ADR-0004: Place information by purpose and lifetime

- Status: Proposed
- Date: 2026-08-26

## Context

Some information is always needed, some is needed only in certain situations, some describes current reality, and some exists only for one task or session.

Mixing these kinds of information creates large permanent context, stale rules, and competing sources of truth.

## Decision

Store information in the layer that matches its purpose and lifetime.

- Mechanical rules belong in configuration and permissions.
- Always-needed rules belong in small permanent instructions.
- Stable role behavior belongs with the role.
- Conditional procedures load only when their situation applies.
- Decision records explain durable architectural choices.
- Implementation records describe current reality, not task history.
- Difference records describe material final divergence from an accepted expectation.
- Task records hold accepted task-specific scope when durable authority is useful.
- Progress and memory are continuity aids, not implementation authority.

The current filenames and names for these layers may change without changing the separation itself.

## Consequences

- Normal context stays smaller and easier to trust.
- Rare procedures can stay detailed without burdening every task.
- Current implementation can be understood without replaying task history.
- Maintainers must choose the right home for new information.

## Rejected alternatives

- Put all procedure in one permanent instruction body.
- Repeat the same rules in every role and document.
- Use task progress, memory, or history as current implementation authority.
