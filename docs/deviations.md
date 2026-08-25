# Template-maintenance deviations

## TD-001 — Full-copy branch replaced by a ledger

- Planned behavior: materialize exact copies of `main`, `developer`, and `web-orchestration` in `template-development`.
- Observed reality: main and developer share paths and may differ, while web-orchestration deliberately has unrelated authority and history.
- Reason the plan was not followed: a combined tree cannot represent both shared path versions and would create duplicated, drifting implementation state.
- Selected alternative: a ledger-only branch records exact refs, dedicated AS-BUILT/design/deviations/task history, and portable source-range patches.
- Evidence: source code remains absent from the validated branch; packages are generated from exact reviewed source commits and applied without merging.
- Effect: correctness and authority improve; template maintenance remains transferable with less operational complexity.
- Remaining limitation: source work requires access to a canonical checkout or a portable package route. Lack of write credentials never permits an unreviewed or unauthorized upstream mutation.

## TD-002 — Bootstrap full-tree history replaced before adoption

- Planned behavior: create the approved ledger-only branch directly.
- Observed reality: an initial full-tree integration snapshot was pushed while the design question was still being discussed.
- Reason it could not remain: retaining duplicated source in reachable branch history would contradict the ledger-only design and create a misleading source of implementation truth.
- Selected alternative: after the ledger tree passed validation and before any consumer adopted the new branch, replace only `template-development` with one parentless commit carrying the exact validated ledger tree. The push requires an exact old/new local authorization marker, exact force-with-lease, a one-root new commit, and identical old/new trees.
- Evidence: the tracked pre-push hook validates those conditions; remote readback verifies the resulting root and tree. No established source ref is modified.
- Effect: the branch begins with a clean, self-contained ledger history. Main, developer, and web-orchestration correctness and authority are unaffected.
- Remaining limitation: none after exact remote verification.

## TD-003 — Local object-database package proof replaced by canonical fetch

- Planned behavior: a portable package represents the exact reviewed canonical `developer` and `web-orchestration` source ranges without absorbing unrelated work that lands later on those branches.
- Observed reality: schema-1 generation verified commit shape and ancestry only inside the caller-supplied local repository, then stamped the canonical repository value from `source-lock.json`. A different local object database could therefore manufacture plausible range/patch evidence. The first schema-2 draft over-corrected this by requiring each reviewed head to equal the current branch tip; a later revision still unnecessarily required package bases to equal `source-lock.json`, which serialized otherwise independent maintenance packages behind the source snapshot.
- Reason those behaviors could not remain the provenance authority: local commit existence does not prove canonical provenance, current-tip equality conflates canonicality with task membership, and source-snapshot equality conflates the ledger's current baseline with a task's exact reviewed range.
- Selected alternative: schema 2 authenticates the supplied checkout origin and fetches current canonical branch tips into a sterile temporary Git object database. Each exact package base and reviewed head must resolve from fetched canonical objects; the base must be an ancestor of the reviewed head, and the reviewed head must be an ancestor of or equal to its current canonical tip. Patch bytes are generated only from fetched canonical objects for that exact base-to-reviewed-head range. The manifest embeds the generation-time source snapshot plus digest as provenance context, observed canonical tips, reviewed-head relationship markers, and a package SHA-256 over provenance metadata and patch bytes. `source-lock.json` is independently reconciled to exact live canonical refs and does not define package membership.
- Evidence: focused tests cover a source snapshot newer than the package base, deceptive origins, non-ancestor bases, canonical branch advance beyond the reviewed head, local-only or forged heads, source-snapshot/patch/package tampering, determinism, and downstream apply. Remote template-development Actions executes these fixtures through the canonical push validation path.
- Effect: newly generated packages remain provenance-verified while exact reviewed task ranges are independent from later canonical state and other pending package work. Historical schema-1 packages remain integrity-compatible but are not reclassified as provenance-verified; existing schema-2 packages remain valid as a subset of the relaxed snapshot relation.
- Remaining limitation: generation still needs legitimate network access to the canonical public Git remote. When that execution surface is unavailable, only that package remains pending; the source snapshot and unrelated maintenance tasks are not blocked.

## TD-004 — Implementation-neutral ledger extended with its rooted maintenance runtime

- Planned behavior: keep `template-development` implementation-neutral and carry only `developer` plus `web-orchestration` ranges in each portable package.
- Observed reality: the accepted template-rooted maintenance role, its guarded verified-target tools, package machinery, and executable validation intentionally run with `template-development` as their project and source root. At the time this deviation was accepted, a two-range package could carry the then-current developer bridge route while omitting the maintenance runtime that route required. The bridge has since been retired; the three-range package design remains current because template-development still owns executable maintenance runtime and transfer state.
- Reason the plan could not remain: describing executable maintenance assets as neutral ledger state hid a real authority boundary, and omitting that branch's reviewed range produced incomplete downstream transfer.
- Selected alternative: `template-development` remains independent, is never merged into a source branch, and owns only its rooted maintenance runtime and ledger/package state. Small and heavy are capacity variants of one role that uses the same verified-target boundary for the ledger root and other registered worktrees. Schema 3 carries exact `template-development`, `developer`, and `web-orchestration` ranges. The template-development range excludes all package storage paths beneath `changes/**` so package storage is never transferred inside another package. Superseding packages coexist in distinct revision directories and bind the historical package's exact SHA-256 digest. The independently reconciled source lock remains a three-source snapshot and is not required to contain a self-referential resulting SHA.
- Evidence: generator/application fixtures cover template range ancestry, canonical advance, self-package rejection, digest tampering, wrong-base dry run, and clean application; the real pinned OpenCode inventory check loads both maintenance capacities, their two allowed skills, the guarded plugin, and its tool inventory.
- Effect: architecture and transfer bytes match the actual feature without copying product/source trees into the maintenance branch or weakening any branch's own commit, push, review, or promotion procedure.
- Remaining limitation: arbitrary repository commands require non-root Linux and `/usr/bin/bwrap`; unsupported hosts fail closed instead of receiving a weaker cwd-only process boundary.

No other current deviation is known.
