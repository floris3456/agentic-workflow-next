# Current agent-system design record

## Decision

Use the following split for implementation:

- Human approval and exact-SHA promotion authority.
- Web orchestration, web research, task/outcome design, route selection, and final outcome/system verification; for Dual, web does not routinely duplicate lead deep implementation analysis or review.
- Direct web/GitHub for tiny exact low-risk changes web can make more simply.
- Dual (`lead-developer` + `spark-implementer`) as the default substantive local route.
- `small-developer` for very simple bounded local work and `heavy-developer` for difficult, important, or subtle work that remains small and bounded.

## Roles

- Model IDs are configuration and can change without altering routing semantics.
- Spark is the only implementation source editor in Dual.
- Lead provides design, invariants, and implementation checks.
- Small/heavy never substitute for Spark; if Dual is unavailable, web makes a fresh route decision.

## Branches and promotion

- `developer` is active implementation.
- `main` is exact human-approved implementation.
- `./scripts/promote-developer-to-main.sh` performs controlled promotion only.

## Route continuity and records

- Canonical task-record: one accepted `docs/work/current/<task-id>-<slug>.md` for consequential work.
- Task-progress is optional and separate when useful.
- AS-BUILT must stay complete for changed directories.
- Formal deviations record material implementation divergence from the prior normative design.

## Direct Host position

Native OpenCode on the authorized host is the active local implementation path. Direct Host, Dual, Minimalism, and representative Dual proof are complete; no replacement RPC/control plane is introduced. The active bounded routes are `small-developer`, `heavy-developer`, and the default Dual route.

Generate or apply a transfer/release package only when the accepted task requests one; package ceremony is not a default completion requirement.
