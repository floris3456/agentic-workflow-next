# Template-maintenance deviations

## TD-001 — Full-copy branch replaced by a ledger

- Planned behavior: materialize exact copies of `main`, `developer`, and
  `web-orchestration` in `template-development`.
- Observed reality: main and developer share paths and may differ, while
  web-orchestration deliberately has unrelated authority and history.
- Reason the plan was not followed: a combined tree cannot represent both shared
  path versions and would create duplicated, drifting implementation state.
- Selected alternative: a ledger-only branch records exact refs, dedicated
  AS-BUILT/design/deviations/task history, and portable source-range patches.
- Evidence: source code remains absent from the validated branch; packages are
  generated from exact reviewed source commits and applied without merging.
- Effect: correctness and authority improve; template maintenance remains
  compaction-safe and transferable with less operational complexity.
- Remaining limitation: source work requires access to a canonical checkout or a
  portable package route. Lack of write credentials never permits an unreviewed
  or unauthorised upstream mutation.

## TD-002 — Bootstrap full-tree history replaced before adoption

- Planned behavior: create the approved ledger-only branch directly.
- Observed reality: an initial full-tree integration snapshot was pushed while
  the design question was still being discussed.
- Reason it could not remain: retaining duplicated source in reachable branch
  history would contradict the ledger-only design and create a misleading source
  of implementation truth.
- Selected alternative: after the ledger tree passed validation and before any
  consumer adopted the new branch, replace only `template-development` with one
  parentless commit carrying the exact validated ledger tree. The push requires
  an exact old/new local authorization marker, exact force-with-lease, a one-root
  new commit, and identical old/new trees.
- Evidence: the tracked pre-push hook validates those conditions; remote readback
  verifies the resulting root and tree. No established source ref is modified.
- Effect: the branch begins with a clean, self-contained ledger history. Main,
  developer, and web-orchestration correctness and authority are unaffected.
- Remaining limitation: none after exact remote verification.

## TD-003 — Local object-database package proof replaced by canonical fetch

- Planned behavior: a portable package represents the exact reviewed canonical
  `developer` and `web-orchestration` source ranges without absorbing unrelated
  work that lands later on those branches.
- Observed reality: schema-1 generation verified commit shape and ancestry only
  inside the caller-supplied local repository, then stamped the canonical
  repository value from `source-lock.json`. A different local object database
  could therefore manufacture plausible range/patch evidence. The first schema-2
  draft over-corrected this by requiring each reviewed head to equal the current
  branch tip; when `web-orchestration` later gained an unrelated Scout smoke-task
  continuity record, that rule would have forced unrelated history into the
  package.
- Reason neither prior behavior could remain the provenance authority: local
  commit existence does not prove canonical provenance, while current-tip
  equality conflates canonicality with task membership.
- Selected alternative: schema 2 authenticates the supplied checkout origin,
  requires bases to equal the source-lock review bases, and fetches the current
  canonical branch tips into a sterile temporary Git object database. Each exact
  reviewed head must resolve from that fetched branch history and be an ancestor
  of (or equal to) its current canonical tip. Patch bytes are generated only from
  fetched canonical objects for the locked-base-to-reviewed-head range. The
  manifest embeds the source-lock snapshot plus digest, observed canonical tips,
  reviewed-head relationship markers, and a package SHA-256 over provenance
  metadata and both patch byte streams. Offline validation recomputes all
  byte-level bindings.
- Evidence: focused tests cover deceptive origins, wrong bases, canonical branch
  advance beyond the reviewed head, local-only/forged heads,
  provenance/patch/package tampering, determinism, and downstream apply. Remote
  template-development Actions passes the corrected schema-2 implementation.
- Effect: newly generated packages are provenance-verified rather than merely
  locally self-consistent, while exact reviewed task ranges remain stable even if
  later unrelated canonical commits exist. Historical schema-1 packages remain
  integrity-compatible for downstream use but are explicitly not reclassified as
  provenance-verified.
- Remaining limitation: generation still needs legitimate network access to the
  canonical public Git remote. When that execution surface is unavailable, the
  correct state is a packaging blocker, not a hand-built or downgraded package.

No other current deviation is known.
