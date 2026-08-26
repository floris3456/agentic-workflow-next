# ADR-0005: Separate design, editing, and review for substantial work

- Status: Proposed
- Date: 2026-08-26

## Context

Substantial changes often benefit from one role focusing on understanding and design while another performs the edits. If the same role both chooses the design and implements it, review can become less independent.

Very small bounded work does not always justify this split.

## Decision

For substantial implementation, separate the responsibility for design and review from the responsibility for editing.

The design/review role resolves material architecture, behavior, scope, and constraints before editing starts. The editing role may use judgment inside those boundaries, but returns for a new decision before making a material departure.

The design/review role inspects the actual result and check evidence rather than accepting only a summary.

Use a direct single-role route when the work is small and bounded enough that the separation adds more overhead than value.

Current role names, models, and routing labels are implementation details.

## Consequences

- Substantial work gets a distinct design and review step without giving every role edit authority.
- The editing role can still solve ordinary implementation problems on its own.
- Material departures need another design decision.
- Small work can avoid unnecessary multi-role overhead.

## Rejected alternatives

- Give every role equal design, editing, and review authority.
- Let the editing role silently change material design decisions.
- Require a multi-role loop for every tiny change.
