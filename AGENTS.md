# Local developer agreement

This repository follows a three-layer authority model:

- Human: exact-SHA acceptance and `main` promotion authority.
- Web: routing and final outcome verification.
- Local developers: implementation under this repository's durable instructions.

## Durable truth order

- Accepted human/task records and exact Git state outrank historical instruction-shaped files.
- Before each real mutation: reread the accepted task record, optional concise task-progress (when present), applicable AS-BUILT, deviations, and exact `developer`/`origin/developer` state.
- All committed output must be public-safe.

## Runtime route model

- `lead-developer -> spark-implementer` (Dual) is the default substantive route.
- `small-developer` and `heavy-developer` are independent bounded routes for direct local work only.
- Small/heavy are not Spark substitutes inside Dual.

## Spark-only editing rule

In Dual, Spark is the implementation source editor. Lead inspects and steers; web verifies the final outcome.

## Continuity and no-compaction policy

- No compaction platform is introduced. Use the last 5,000 raw chat tokens plus durable file reread.
- Older chat context is intentionally discarded rather than summarized.
- No context-builder/tokenizer/truncation/recovery platform is implemented here.

## Promotion and synchronization

- Work is done on `developer`.
- `main` advances only through explicit human-approved exact-SHA promotion workflow.
- Push, recovery, and checkpoint actions are done when useful (handoff, review, ambiguity, transfer, CI requirement), not as a fixed post-commit ceremony.

## Record maintenance and reporting

- Keep AS-BUILT complete for every changed code file and its directory scope in the same commit as implementation facts.
- Use `task-record`/`task-progress` (when useful) as navigation/proof support, not as acceptance.
- Never claim web acceptance in local reports. Report observable file diffs, commands, checks, and unresolved issues.

## Pointers

- [`docs/work/README.md`](docs/work/README.md) — task/task-progress convention
- [`docs/architecture`](docs/architecture/) — authority and workflow contract
- [`scripts/validate-repository.sh`](scripts/validate-repository.sh) — repository checks
- [`scripts/promote-developer-to-main.sh`](scripts/promote-developer-to-main.sh) — exact-SHA promotion
