# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

blocked only on genuine networked change-package generation. All reusable source
hardening is implemented, independently reviewed, and passing remote validation.

## Task-start / package review bases

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development task start: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

`source-lock.json` deliberately still contains these source SHAs. They remain the
schema-2 package review-base lock until the real package embeds that snapshot.
`main` is not authorized for change or promotion.

## Public-safe task brief

Harden reusable-template change-package provenance, exact Git repository identity,
and the independent Scout trust boundary while preserving portability, recovery,
exact-ref review, deterministic packaging, public safety, normal developer
OpenCode behavior, and the human-only `main` boundary. Existing pre-hardening
Scouts are not evidence for this task.

## Reviewed source state

### Developer

- exact reviewed/finalized package head:
  `980486182c0ed8a213842477b9b1754de360a430`;
- finalization range from bookkeeping SHA
  `4d3aa8c340ab1503443b14e155b24c52e640194f` is rename-only;
- approved task-record blob
  `e9ce0154342cade46ca3a21299295ccd56f18bff` moved unchanged from
  `docs/work/current/` to `docs/work/archive/`;
- GitHub Actions run `31902593887` succeeded and issue #26 returned correlated
  `Status: completed` at the exact finalization SHA.

### Web-orchestration

- exact reviewed package range:
  `2b95a9803115b05283494fb3699b9d34c58a91a5..6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`;
- the changed Project Source adds a fail-closed hardened-Scout readiness gate,
  forbids fallback to ordinary developer OpenCode/ref-owned instructions, and
  retains exact connected GitHub as proof;
- the canonical branch later advanced to observed tip
  `c20854fd566601cbff2cad9aab12af195fe1e5f0` through five commits that add only
  `web-orchestration-only/task-context/SCOUT-SMOKE-20260815-001.md`, a separate
  closed smoke-test continuity record. The reviewed Scout Source did not change.
  Those later commits are canonical baseline/provenance state, not members of this
  task package.

### Template-development / AWT-001

- initial schema-2 implementation core:
  `f3cdf15cc97cd4bafd8def81f5072806b544451f`, Actions run `31902947107` success;
- durable package documentation through
  `e47edb742e4a1308f09ffa53f6ed9846e5ef2afd`, Actions run `31903048273` success;
- independent branch-advance review exposed that requiring a reviewed package head
  to equal the current canonical tip would force later unrelated commits into the
  package;
- corrected schema-2 core:
  `02f3f85d9506a2b453dee3878aa508335094a593`, changing only
  `scripts/change-package-lib.mjs`, `scripts/create-change-package.mjs`, and
  `tests/change-package.test.mjs`; Actions run `31903434920` succeeded;
- changes/design/deviation/AS-BUILT records are reconciled after that correction.

No `changes/TEMPLATE-TRUST-BOUNDARY-001/manifest.json` exists. The package has not
been fabricated through API writes.

## AWT-001 as built

Schema-1 generation trusted the caller-supplied local Git object database, so
local commit existence/ancestry did not prove canonical provenance. Schema 2 now:

1. authenticates the supplied checkout `origin` against the canonical repository
   in `source-lock.json`;
2. requires requested bases to equal the locked review bases;
3. creates a sterile temporary bare Git repository and fetches the current
   canonical `developer` and `web-orchestration` tips from the canonical URL;
4. requires each exact reviewed package head to resolve from that fetched
   canonical branch history and be an ancestor of (or equal to) its current tip;
   a local-only/divergent head fails closed;
5. generates changed paths and patch bytes only from fetched canonical objects for
   the exact locked-base-to-reviewed-head range, so later unrelated canonical
   commits are observed but not silently included;
6. embeds the exact old source-lock snapshot plus digest, observed canonical tips,
   reviewed-head relationship markers, exact ranges, sorted changed paths, and
   per-patch SHA-256 values; and
7. binds the stable manifest core plus both raw patch streams into a versioned
   package SHA-256. Shared offline validation recomputes all byte-level bindings.

Historical schema 1 remains integrity-compatible but explicitly returns
`provenanceVerified: false`.

Focused tests cover deterministic schema 2, deceptive origin, wrong base,
canonical branch advance beyond a reviewed head, forged/local-only head,
source-lock/patch/package tampering, legacy schema-1 compatibility, and downstream
dry-run/application boundaries. The corrected core passes both the local
no-network fixture and remote template-development Actions.

## Route / active work

- Canonical bridge issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Developer source/finalization route: terminal and absorbed.
- Web-orchestration source route: terminal and absorbed.
- Template-development source route: terminal and independently validated.
- Scouts launched for this maintenance review: none.
- Active repository mutation after this snapshot commit: none.
- Highest accepted bridge command sequence: 10; no unmatched permission/question.

## Command / connector journal

Sequences 1-9 are historical and reconciled. Sequence 10
`47ac6cf4-8d27-4d87-b4f1-b3d61cf6b10a` `finalize` was first refused by the
connector before GitHub because that action required issue number field
`pr_number`; issue readback proved the UUID absent. The refusal was durably
recorded and the exact same envelope/UUID was republished with only the connector
argument name corrected. Sequence 10 then progressed accepted -> applying ->
succeeded, followed by the correlated completed developer response at
`980486182c0ed8a213842477b9b1754de360a430`.

## Checks performed by orchestrator

- Exact developer task-start range and high-risk trust boundaries inspected
  directly; no Scout output accepted as proof.
- Exact failed developer Actions log showed 83/84 bridge tests passing; sole
  failure was an umask-sensitive test fixture. Product private-state enforcement
  stayed strict; fixture changed to `0700`.
- Developer Actions runs `31902255588`, `31902314637`, and `31902593887`
  succeeded after review corrections/finalization.
- Finalization compare is rename-only; archive blob is exactly
  `e9ce0154342cade46ca3a21299295ccd56f18bff`; current developer task path absent.
- Web exact Source range independently reviewed. Later range
  `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35..c20854fd566601cbff2cad9aab12af195fe1e5f0`
  contains only the separate Scout smoke-test task-context file.
- Template-development initial schema-2 core and durable records passed Actions;
  corrected ancestor-of-tip core `02f3f85d9506a2b453dee3878aa508335094a593`
  passed Actions run `31903434920`.
- Direct readback confirms the intended package path is absent.
- `main` remained exactly `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blocker

The only unresolved task requirement is executing the real schema-2 package
step. This chat can write/read GitHub and inspect/retry/read Actions, but its local
Git runtime cannot resolve/reach `github.com`; the repository has no existing
workflow that generates/commits a package; and the connected GitHub action surface
has no workflow-dispatch/start operation. An installable-plugin search found no
separate GitHub Actions execution/dispatch capability.

Adding a task-specific push-triggered workflow only to bypass this environment
would expand the reusable maintenance system and is not the smallest equivalent
route. Hand-building `manifest.json` or patch files through GitHub APIs is
explicitly prohibited by the tracked maintainer contract and would invalidate the
provenance claim.

The required operator/configuration action is narrow: provide a legitimate
synchronized `template-development` checkout with canonical Git network access (or
an equivalent authorized maintainer execution surface) and run the tracked
generator/validator. No source-design or risk-acceptance decision remains.

## Exact resume procedure

On a legitimate maintainer execution surface:

1. re-read exact canonical refs. The package endpoints remain developer
   `980486182c0ed8a213842477b9b1754de360a430` and web-orchestration
   `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35` unless new review changes task
   membership. Later canonical tips are allowed only when those reviewed heads
   remain ancestors of the fetched tips;
2. run `scripts/create-change-package.mjs` for task
   `TEMPLATE-TRUST-BOUNDARY-001` with developer range
   `e2700f586fe8ab634053eb514bb9da487e881a21..980486182c0ed8a213842477b9b1754de360a430`
   and web range
   `2b95a9803115b05283494fb3699b9d34c58a91a5..6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`;
3. validate and commit the generated
   `changes/TEMPLATE-TRUST-BOUNDARY-001/**` bytes unchanged;
4. after the package has embedded the old source lock, reconcile
   `source-lock.json` to the **canonical branch tips observed by the generated
   schema-2 manifest**, not by widening the package range. Update
   `last_reconciled_task` and `last_change_package`, validate again, and record
   exact package/ledger SHAs;
5. independently review the package and source-lock reconciliation, then archive
   this maintenance record unchanged. Never modify/promote `main` as part of
   these steps.

## Next action

Resume only when a legitimate networked maintainer execution surface is
available. Re-read current refs first, run the tracked schema-2 generator for the
exact reviewed endpoints above, and do not hand-build the package.

## Last handoff commit

- developer finalization: `980486182c0ed8a213842477b9b1754de360a430`
- web-orchestration reviewed package head: `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`
- web-orchestration currently observed canonical tip:
  `c20854fd566601cbff2cad9aab12af195fe1e5f0`
- corrected schema-2 core: `02f3f85d9506a2b453dee3878aa508335094a593`
