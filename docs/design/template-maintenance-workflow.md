# Template-maintenance workflow design

## Decision authority

[ADR-0001](../architecture/decisions/0001-template-development-ledger.md)
owns the accepted ledger-versus-combined-tree decision. This record defines its
operating workflow.

## Task sequence

1. Record the public-safe task brief and source lock on `template-development`.
2. Inspect the downstream symptom and canonical template evidence.
3. Decide whether the reusable fix belongs on `developer`,
   `web-orchestration`, or both.
4. Select each source branch's implementation route proportionally: use bounded
   direct connected-GitHub edits when exact scope is already known and remotely
   provable; otherwise use isolated source worktrees when local context/tools or
   independent implementation materially improve confidence. Keep normal source
   task records and component AS-BUILT/deviations current in either route.
5. Review the exact remote range for each changed source branch. Preserve the
   task's source-lock SHAs as the review-base lock until package generation.
6. Produce the portable package with `scripts/create-change-package.mjs`. For
   schema-2 generation the supplied checkout origin must match the canonical
   repository, requested bases must equal the source-lock review bases, and
   requested heads must equal freshly fetched canonical `developer` and
   `web-orchestration` tips. The generator uses those fetched objects—not the
   supplied checkout object database—to produce the patches, then binds the
   embedded source-lock snapshot, fetched heads, manifest metadata, and both
   patch byte streams into the package SHA-256.
7. Validate the package offline. Schema 2 is provenance-verified only when the
   embedded lock, range relationships, per-patch digests, and package binding all
   recompute. Historical schema 1 remains integrity-compatible but is explicitly
   not provenance-verified.
8. Apply each patch to the downstream matching branch under a new normal task.
9. Review downstream exact ranges and use ordinary human-only promotion.
10. Reconcile `source-lock.json` to the reviewed source heads only after the
    package has captured the prior review-base snapshot; update integrated records
    and archive the approved maintenance task.

## One-request experience

A human may request: “Start template maintenance for this problem, update the
canonical template, and apply the reviewed fix to this project.” The orchestrator
may perform routine setup, inspection, proportional source-route selection,
source task design, waiting, review, packaging, and downstream application
without repeated interruption. It must ask for genuinely consequential
scope/security decisions and every exact-SHA main promotion.

## Failure behavior

- Unknown or moved source ref: stop source mutation and reconcile.
- Supplied package-generation checkout has the wrong canonical origin: fail before
  package output.
- Requested package base differs from the locked review base, or requested head
  differs from the freshly fetched canonical branch tip: fail closed and require
  review/reconciliation; never package the stale or local-only range.
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
