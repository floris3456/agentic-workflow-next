# Template-maintenance workflow design

## Decision

Use an independent lightweight ledger branch plus exact source worktrees. Do not
create a fourth combined implementation tree.

## Why

`main` and `developer` can hold different blobs at the same paths, so one working
tree cannot be an exact copy of both. `web-orchestration` intentionally has an
independent history. A combined branch would duplicate content, drift, blur
authority, and require custom path splitting before every transfer.

A ledger-only branch preserves the desired history and compaction recovery while
letting every actual change remain in its normative source tree.

## Task sequence

1. Record the human's exact brief and source lock on `template-development`.
2. Inspect the downstream symptom and canonical template evidence.
3. Decide whether the reusable fix belongs on `developer`,
   `web-orchestration`, or both.
4. Implement on isolated exact source branches with their normal task records and
   component AS-BUILT/deviations.
5. Review the exact remote range for each changed source branch.
6. Produce and validate the portable package.
7. Apply each patch to the downstream matching branch under a new normal task.
8. Review downstream exact ranges and use ordinary human-only promotion.
9. Update source lock, integrated records, and archive the approved maintenance
   task.

## One-request experience

A human may request: “Start template maintenance for this problem, update the
canonical template, and apply the reviewed fix to this project.” The orchestrator
may perform routine setup, inspection, source task design, waiting, review,
packaging, and downstream application without repeated interruption. It must ask
for genuinely consequential scope/security decisions and every exact-SHA main
promotion.

## Failure behavior

- Unknown or moved source ref: stop source mutation and reconcile.
- Failed/ambiguous source push: no package and no completion claim.
- Patch does not apply cleanly downstream: keep the package unchanged and handle
  adaptation as an explicit downstream implementation decision.
- One source branch succeeds and the other fails: record the partial exact state;
  never imply cross-branch atomicity.
- Canonical write access unavailable: produce a reviewed package for an
  authorized maintainer; do not weaken permissions.
