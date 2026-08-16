# Template-maintenance workflow design

## Decision authority

[ADR-0001](../architecture/decisions/0001-template-development-ledger.md)
owns the accepted ledger-versus-combined-tree decision. This record defines its
operating workflow.

## Task sequence

1. Record the public-safe task brief on `template-development`, read
   `source-lock.json`, and independently establish exact live canonical refs.
   The source lock is the latest reconciled canonical source snapshot, not a task
   review-base lock.
2. Inspect the downstream symptom and canonical template evidence.
3. Decide whether the reusable fix belongs on `developer`,
   `web-orchestration`, or both.
4. Select each source branch's implementation route proportionally: use bounded
   direct connected-GitHub edits when exact scope is already known and remotely
   provable; otherwise use isolated source worktrees when local context/tools or
   independent implementation materially improve confidence. Keep normal source
   task records and component AS-BUILT/deviations current in either route.
5. Review the exact remote range for each changed source branch. Record each
   task's exact base and reviewed head in the maintenance record independently of
   `source-lock.json` and independently of later branch work.
6. Produce the portable package with `scripts/create-change-package.mjs`. The
   supplied checkout origin must match the canonical repository. The generator
   fetches current canonical `developer` and `web-orchestration` tips into a
   sterile temporary object database. Each supplied base and reviewed head must
   resolve exactly from fetched canonical objects; the base must be an ancestor
   of the reviewed head, and the reviewed head must be an ancestor of (or equal
   to) the current canonical tip. Patch bytes are generated from that exact
   reviewed range using only fetched canonical objects, so later unrelated branch
   commits are observed but not silently added to the package. Package range
   bases do not have to equal the repository source snapshot.
7. Validate the package offline. Schema 2 remains provenance-verified when the
   embedded generation-time source snapshot and digest, exact ranges,
   canonical-tip/head-relation fields, per-patch digests, and package binding all
   recompute. Historical schema 1 remains integrity-compatible but explicitly is
   not provenance-verified.
8. Apply each patch to the downstream matching branch under a new normal task.
9. Review downstream exact ranges and use ordinary human-only promotion.
10. Reconcile `source-lock.json` directly from independently verified exact live
    canonical `main`, `developer`, and `web-orchestration` refs at meaningful
    maintenance checkpoints. Package creation neither consumes nor advances this
    snapshot. Update integrated records and archive the approved maintenance task
    when its actual finalization requirements are met.

## One-request experience

A human may request: “Start template maintenance for this problem, update the
canonical template, and apply the reviewed fix to this project.” The orchestrator
may perform routine setup, inspection, proportional source-route selection,
source task design, waiting, review, packaging, source-snapshot reconciliation,
and downstream application without repeated interruption. It must ask for
genuinely consequential scope/security decisions and every exact-SHA main
promotion.

## Failure behavior

- Unknown or moved source ref: inspect the intervening range. Do not silently
  widen the package merely because the branch advanced.
- Supplied package-generation checkout has the wrong canonical origin: fail before
  package output.
- Requested package base does not resolve from fetched canonical history or is not
  an ancestor of the requested reviewed head: fail closed.
- Requested reviewed head does not resolve from the freshly fetched canonical
  branch history or is not an ancestor of its current tip: fail closed as
  local-only/divergent evidence. A reviewed head that remains canonical but is
  older than the tip is allowed so unrelated later work stays out of the package.
- A stale source snapshot is an observation to reconcile from exact remote refs;
  it does not redefine or block an already reviewed package range.
- Failed/ambiguous source push: no package and no completion claim.
- Patch or provenance binding does not validate: reject the package before
  application.
- Patch does not apply cleanly downstream: keep the package unchanged and handle
  adaptation as an explicit downstream implementation decision.
- One source branch succeeds and the other fails: record the partial exact state;
  never imply cross-branch atomicity.
- Canonical write or legitimate maintainer execution access unavailable: preserve
  the reviewed source state and explicit blocker; do not hand-build a package or
  weaken provenance/permissions.
