# Template-maintenance workflow design

## Decision authority

[ADR-0001](../architecture/decisions/0001-template-development-ledger.md)
owns the accepted ledger-versus-combined-tree decision. This record defines its
operating workflow.

## Task sequence

1. Web orchestration leads task design, records the public-safe task brief on
   `template-development`, reads `source-lock.json`, and independently establishes
   exact live canonical refs. The source lock is the latest reconciled canonical
   source snapshot, not a task review-base lock.
2. Inspect the downstream symptom and canonical template evidence.
3. Decide whether the reusable fix belongs in the template-development-rooted
   maintenance runtime/package machinery, on `developer`, on
   `web-orchestration`, or across those authorities.
4. Select each source branch's implementation route: default substantive Dual
   (`dual`), or bounded shortcuts (`small`/`heavy`). For bounded direct/delegated
   work executing under a source branch's own authoritative context, follow that
   branch's normal task, durable-record, synchronization, validation, and review
   procedure. For Workspace Maintenance, keep the stable template-development-rooted
   Workspace authority instead of inheriting the target agent workflow; inspect
   target rules as evidence and apply relevant target compatibility/output
   constraints to the branch state being produced. Applicable constraints include
   public safety, `main` authority, synchronization, file placement/format,
   durable implementation truth, and relevant validation. A target record may be
   maintained as an output artifact without transferring target agent/task/handoff
   authority. If the task changes a target rule itself, read the old rule to
   understand existing behavior and impact, but do not let it veto its own
   authorized modification.
5. Review the exact remote range for each changed branch. Record each task's exact
   base and reviewed head in the maintenance record independently of
   `source-lock.json` and independently of later branch work. A Workspace-routed
   task produces one Workspace result; review the exact pushed target SHA rather
   than demanding a second target-agent ceremony.
6. When transfer or release packaging is requested, produce the portable package
   with the tracked `scripts/create-change-package.mjs`. The supplied checkout
   origin must match the canonical repository. The generator fetches current
   canonical `template-development`, `developer`, and `web-orchestration` tips
   into a sterile temporary object database. Each supplied base and reviewed head
   must resolve exactly from fetched canonical objects; the base must be an
   ancestor of the reviewed head, and the reviewed head must be an ancestor of (or
   equal to) the current canonical tip. The template-development reviewed head
   must precede the new package storage. All paths beneath `changes/**` are
   ledger-only change-package storage and are never included in a generated
   portable `template-development.patch`. The generator computes changed paths
   with `--no-renames`, removes all `changes/**` paths, and generates the patch
   from the remaining exact paths using literal pathspecs (`:(literal)<path>`).
7. Validate the package offline. Schema 3 remains provenance-verified when the
   embedded generation-time source snapshot and digest, exact ranges,
   canonical-tip/head-relation fields, per-patch digests, and package binding all
   recompute for all three branches. Supersession chains are verified for
   unambiguous identity, matching historical digests, strictly increasing
   revisions, and acyclicity. Historical schema 1 remains integrity-compatible
   but explicitly is not provenance-verified; existing schema 2 remains
   provenance-compatible.
8. Apply each patch to the downstream matching branch under a new normal task.
9. Review downstream exact ranges and use ordinary human-only promotion.
10. Reconcile `source-lock.json` directly from independently verified exact live
    canonical `main`, `developer`, and `web-orchestration` refs at meaningful
    maintenance checkpoints. Package creation neither consumes nor advances this
    snapshot. Task completion is not blocked on ceremonial archival.

## Workspace target-rule examples

The route distinction is intentionally practical:

- **Adding a missing file:** Workspace Maintenance reads applicable target rules
  and follows relevant placement, naming, format, durable-record, and validation
  requirements for the output.
- **Changing the rule for file creation:** Workspace Maintenance reads the
  existing rule to understand current behavior and downstream impact, then makes
  the bounded authorized rule change under Workspace authority. The old rule is
  evidence of the contract being changed, not authority to block the requested
  change.

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
- Reviewed template-development changed paths contain its own package storage path:
  reject; the generator excludes package storage and superseding packages use
  distinct revision directories.
- Invalid, missing, tampered, ambiguous, or cyclic supersession chain: fail closed
  before package generation or application.
- A stale source snapshot is an observation to reconcile from exact remote refs;
  it does not redefine or block an already reviewed package range.
- Failed/ambiguous source or package push: no completion claim and no automatic
  replay.
- Patch or provenance binding does not validate: reject the package before
  application.
- Patch does not apply cleanly downstream: keep the package unchanged and handle
  adaptation as an explicit downstream implementation decision.
- One source branch succeeds and the other fails: record the partial exact state;
  never imply cross-branch atomicity.
- Canonical generator access is unavailable: preserve the reviewed source state
  and explicit blocker; do not hand-build a package or weaken
  provenance/permissions.
