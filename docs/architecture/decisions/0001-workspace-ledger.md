# ADR-0001: Keep maintenance coordination in an independent history

- Status: Accepted
- Date: 2026-08-14

## Context

A reusable system may have several histories that evolve independently. Maintenance needs to compare and change those histories without turning the maintenance area into a second copy of their source.

Combining independent source trees can create conflicting files, duplicated implementation, and a second place that appears authoritative.

## Decision

Keep maintenance coordination in a history that is separate from the implementation histories it maintains.

That history may hold maintenance-owned tooling, decisions, state snapshots, and transfer metadata. Current implementation truth stays with the history that owns the implementation.

Cross-history work uses exact states and explicit reviewed transfer or targeted edits. Independent histories are not merged merely to make coordination easier.

Branch names, role names, package formats, and the number of maintained histories are implementation details and may change without changing this decision.

## Consequences

- Maintenance can evolve without becoming another implementation source.
- Exact states from separate histories can be correlated without pretending the work is one atomic history.
- Cross-history work may need explicit transfer or more than one reviewed change.
- Readers must look to each owning history for its current implementation truth.

## Rejected alternatives

- Keep full copies of every maintained source tree in the maintenance history.
- Merge independent histories just to coordinate maintenance.
- Rely only on informal notes when exact cross-history state or reviewed transfer is required.
