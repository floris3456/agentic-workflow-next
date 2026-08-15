# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

in progress

## Task-start / review-base refs

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

`source-lock.json` matched these source refs at task start and remains the
review-base lock until genuine package generation. `main` is not authorized for
change or promotion.

## Public-safe task brief

Harden reusable-template change-package provenance, exact Git repository identity,
and the independent Scout trust boundary while preserving portability, recovery,
exact-ref review, deterministic packaging, public safety, normal developer
OpenCode behavior, and the human-only `main` boundary. Existing pre-hardening
Scouts are not evidence for this task.

## Current position

Developer source is finalized and independently proven at
`980486182c0ed8a213842477b9b1754de360a430`. Its finalization range from reviewed
bookkeeping SHA `4d3aa8c340ab1503443b14e155b24c52e640194f` is one rename only: the exact
approved task-record blob `e9ce0154342cade46ca3a21299295ccd56f18bff` moved from
`docs/work/current/` to the same basename under `docs/work/archive/`, with zero
content changes. The current path is absent, the archive blob matches exactly,
and GitHub Actions run `31902593887` succeeded. The correlated issue #26 response
is `Status: completed` at that exact finalization SHA.

The one-file `web-orchestration` source range from
`2b95a9803115b05283494fb3699b9d34c58a91a5` to
`6a7793738bcb12b92bc7a7bc43fde1fcebe61e35` is independently reviewed and
accepted. It adds a fail-closed hardened-Scout readiness gate, prohibits fallback
to ordinary developer OpenCode/ref-owned instructions, and retains exact connected
GitHub as the proof route.

The sole active source route is now bounded direct `template-development` work for
AWT-001 package provenance. Package generation itself remains a separate required
local maintainer execution after source review; it will not be simulated with API
writes.

## Independent findings / review

- Repository identity authenticates exact Git host plus owner/repository across
  supported HTTPS/SSH forms; ambiguous custom API layouts require explicit
  `github.git_host`.
- Hardened Scouts use a distinct pinned OpenCode `1.18.16` endpoint outside the
  repository, bridge-owned prompt/model/permissions/tools, sterile config, exact
  Git-object snapshots, no checkout/worktree, realpath-contained trusted tools,
  and fail-closed historical recovery.
- Review corrections retained the product's private-state check while making its
  test fixture request `0700`, and added `synchronizedGitState(config)` immediately
  before every new Scout start. Corrected source/bookkeeping/finalization CI is
  green.
- AWT-001 gap: `scripts/create-change-package.mjs` verifies only objects in the
  supplied local repository, then stamps canonical identity from `source-lock.json`.
  A malicious or unrelated local object database can therefore manufacture
  plausible base/head/patch evidence. Schema-1 package validation/application
  bind per-patch hashes but do not attest canonical repository/base/head
  provenance.
- Planned schema 2 keeps `source-lock.json` source SHAs as task review-base locks,
  authenticates the supplied checkout origin, fetches canonical developer/web
  heads into a sterile temporary Git object database, requires locked bases and
  fetched canonical heads, generates patches only from those fetched objects,
  embeds a canonicalized source-lock snapshot, and binds manifest provenance plus
  patch bytes into an offline-verifiable package digest. Existing schema-1
  packages remain explicitly legacy-compatible rather than being reclassified as
  provenance-valid.

## Route / active work

- Canonical control issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Developer source/finalization route: terminal and absorbed.
- Developer finalization SHA: `980486182c0ed8a213842477b9b1754de360a430`.
- Developer archived task blob: `e9ce0154342cade46ca3a21299295ccd56f18bff`.
- Web-orchestration reviewed source: `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`.
- Existing Scouts: none launched or used as evidence.
- Active mutation: direct connected-GitHub on `template-development` for AWT-001;
  no other repository-mutating route overlaps it.

## Command / connector journal

Sequences 1-9 are historical and reconciled. Sequence 10
`47ac6cf4-8d27-4d87-b4f1-b3d61cf6b10a` `finalize` was first refused by the
connector before GitHub because the connector expected issue number field
`pr_number`; issue readback proved the UUID absent. The refusal was durably
recorded and the exact same envelope/UUID was republished with only the connector
argument name corrected. Sequence 10 then progressed accepted -> applying ->
succeeded, and the later correlated completed response produced finalization SHA
`980486182c0ed8a213842477b9b1754de360a430`. Highest accepted command sequence is
10. No task-correlated permission/question remains.

## Checks performed by orchestrator

- Full developer task-start range and high-risk trust boundaries inspected
  directly; no Scout output accepted as proof.
- Exact failed implementation Actions log: 83/84 bridge tests passed; sole failure
  was the umask-sensitive private snapshot test fixture.
- Direct correction `080dbf883cd6e567db7db934816b3f526ba17325`
  changed only that fixture mode; `8941c2f89a595b16835a5326e42d5a1ec9d7a32c`
  added only the per-start synchronization/origin gate.
- GitHub Actions runs `31902255588` (corrected substantive source), `31902314637`
  (bookkeeping), and `31902593887` (finalization) all succeeded.
- Finalization compare is rename-only; archive blob equals
  `e9ce0154342cade46ca3a21299295ccd56f18bff`; current task path is absent.
- Web-orchestration changed-file range independently reviewed and matches the
  hardened runtime contract.
- `main` remains exactly `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blockers / decisions

No developer/web source blocker remains. This environment has connected GitHub
source writes and remote CI, but its local Git has no GitHub network/DNS access,
and the repository contains no workflow that performs package generation/commit.
Therefore source hardening can be implemented/reviewed here, but the final package
must wait for the tracked maintainer execution surface unless an equivalent
legitimate local route becomes available. The package will not be hand-built.

## Remaining work

Implement and review AWT-001 schema-2 provenance on `template-development`, with
focused tests for canonical/forged origins, wrong locked bases, stale/forged heads,
patch/provenance tampering, deterministic binding, and legacy schema-1 handling.
Run/read template-development CI. Then genuinely execute/validate
`scripts/create-change-package.mjs` for developer
`e2700f586fe8ab634053eb514bb9da487e881a21..980486182c0ed8a213842477b9b1754de360a430`
and web-orchestration
`2b95a9803115b05283494fb3699b9d34c58a91a5..6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`,
reconcile `source-lock.json` to reviewed heads, update maintenance AS-BUILT/
deviations, and finalize this ledger. Never modify/promote `main`.

## Next action

Implement the bounded AWT-001 source/tests directly on `template-development`,
read back the exact range, and use its Actions workflow as the executable proof
before attempting any package generation.

## Last handoff commit

- developer finalization: `980486182c0ed8a213842477b9b1754de360a430`
- web-orchestration reviewed source: `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`
