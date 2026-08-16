# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

source hardening is complete and independently reviewed; deterministic package generation remains pending on a legitimate networked maintainer execution surface, but it no longer blocks `source-lock.json` reconciliation or later package work

## Task-start / package review bases

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development task start: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

These developer/web SHAs remain this task's exact package range bases. Under the
current source-snapshot contract introduced by
`TEMPLATE-SOURCE-LOCK-SIMPLIFY-001`, they are task evidence rather than values
that must remain frozen in `source-lock.json`. The repository source snapshot has
been reconciled independently to current canonical refs. `main` is not authorized
for change or promotion.

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
- the canonical branch later advanced through unrelated reviewed template work.
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
- `TEMPLATE-SOURCE-LOCK-SIMPLIFY-001` later removed the unnecessary equality
  between package range bases and the repository source snapshot while retaining
  the canonical fetch, ancestry, exact-range, patch-digest, and package-binding
  provenance guarantees.

No `changes/TEMPLATE-TRUST-BOUNDARY-001/manifest.json` exists. The package has not
been fabricated through API writes.

## AWT-001 as built

Schema-1 generation trusted the caller-supplied local Git object database, so
local commit existence/ancestry did not prove canonical provenance. Current
schema 2 now:

1. authenticates the supplied checkout `origin` against the canonical repository
   recorded in `source-lock.json`;
2. creates a sterile temporary bare Git repository and fetches the current
   canonical `developer` and `web-orchestration` tips from the canonical URL;
3. requires each exact package base and reviewed head to resolve from fetched
   canonical objects, requires the base to be an ancestor of its reviewed head,
   and requires the reviewed head to be an ancestor of (or equal to) its current
   canonical tip; a local-only/divergent endpoint fails closed;
4. generates changed paths and patch bytes only from fetched canonical objects for
   the exact task-recorded base-to-reviewed-head range, so later unrelated
   canonical commits are observed but not silently included;
5. embeds the generation-time source snapshot plus digest, observed canonical
   tips, reviewed-head relationship markers, exact ranges, sorted changed paths,
   and per-patch SHA-256 values; the source snapshot is provenance context and
   does not define the range bases; and
6. binds the stable manifest core plus both raw patch streams into a versioned
   package SHA-256. Shared offline validation recomputes all byte-level bindings.

Historical schema 1 remains integrity-compatible but explicitly returns
`provenanceVerified: false`. Existing schema-2 packages whose range bases equal
their embedded source snapshot remain valid.

Focused tests cover deterministic schema 2 with source snapshots independent from
package bases, deceptive origin, non-ancestor range bases, canonical branch
advance beyond a reviewed head, forged/local-only heads, source-snapshot/patch/
package tampering, legacy schema-1 compatibility, and downstream dry-run/
application boundaries.

## Route / active work

- Canonical bridge issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Developer source/finalization route: terminal and absorbed.
- Web-orchestration source route: terminal and absorbed.
- Template-development source route: terminal and independently validated for the
  original hardening; later source-snapshot simplification is tracked separately.
- Scouts launched for this maintenance review: none.
- Active repository mutation for this task: none.
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
- Web exact Source range independently reviewed; later source commits are not
  silently members of this package.
- Template-development initial schema-2 core and durable records passed Actions;
  corrected ancestor-of-tip core `02f3f85d9506a2b453dee3878aa508335094a593`
  passed Actions run `31903434920`.
- Direct readback confirms the intended package path is absent.
- `main` remained exactly `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `TEMPLATE-SOURCE-LOCK-SIMPLIFY-001` subsequently established that canonical
  fetched range ancestry is sufficient for package provenance and reconciled the
  repository source snapshot independently of this pending package.

## Blocker

The only unresolved task requirement is executing the real schema-2 package step.
That requires a legitimate maintainer execution surface with canonical Git network
access. This is now an isolated package-production limitation: it does not freeze
`source-lock.json`, serialize later template tasks, or require any package to be
generated before another task's independently reviewed package.

Hand-building `manifest.json` or patch files through GitHub APIs remains
prohibited by the tracked maintainer contract and would invalidate the provenance
claim.

## Exact resume procedure

On a legitimate maintainer execution surface:

1. re-read exact canonical refs. The package endpoints remain developer
   `e2700f586fe8ab634053eb514bb9da487e881a21..980486182c0ed8a213842477b9b1754de360a430`
   and web-orchestration
   `2b95a9803115b05283494fb3699b9d34c58a91a5..6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`
   unless independent review changes task membership. Later canonical tips are
   allowed when the exact reviewed heads remain ancestors of those tips;
2. run `scripts/create-change-package.mjs` for task
   `TEMPLATE-TRUST-BOUNDARY-001` with those exact base/head ranges;
3. validate and commit the generated
   `changes/TEMPLATE-TRUST-BOUNDARY-001/**` bytes unchanged;
4. independently review the package. Reconcile `source-lock.json` separately only
   if exact remote refs show the current snapshot is stale; package generation
   itself neither consumes nor advances the snapshot; and
5. archive this maintenance record unchanged after its package/finalization
   requirements are actually satisfied. Never modify/promote `main` as part of
   these steps.

## Next action

Generate this task's exact reviewed package when a legitimate networked maintainer
execution surface is available. No later maintenance task needs to wait for that
action, and no source-lock ordering step remains.

## Last handoff commit

- developer finalization: `980486182c0ed8a213842477b9b1754de360a430`
- web-orchestration reviewed package head: `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`
- source-snapshot semantics superseded by `TEMPLATE-SOURCE-LOCK-SIMPLIFY-001`
