# Task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

Substantive developer source is implemented, independently reviewed, corrected,
and passing the repository's GitHub Actions validation at
`8941c2f89a595b16835a5326e42d5a1ec9d7a32c`. This record reconciles the review
findings and is ready for the repository's finalization/archive workflow.

## Task-start developer SHA

`e2700f586fe8ab634053eb514bb9da487e881a21`

## Review-base developer SHA

`e2700f586fe8ab634053eb514bb9da487e881a21`

## Original task brief

Harden the reusable template's Git repository identity and independent Scout trust
boundary. Authenticate Git host plus owner/repository across supported HTTPS and
SSH forms; make Scout checkout/runtime/prompt/tools independent of inspected-ref
or unrelated global OpenCode state; exclude LSP/process/package/download side
effects; preserve exact-ref, concurrency, recovery, projection, and normal
developer behavior; add adversarial tests and reconcile durable records. Do not
use existing Scouts as evidence for this task, change `main`, or promote.

## Current objective

Preserve the reviewed separate pinned OpenCode `1.18.16` Scout runtime, exact-tree
Git-object snapshots, trusted contained read/search tools, canonical repository
identity, and fail-closed readiness/recovery behavior through finalization and the
template change-package workflow.

## Current position

The delegated Sol route first produced the task record and later implemented the
repository-identity and hardened Scout runtime. Independent connected-GitHub review
found two post-handoff corrections:

1. GitHub Actions exposed one umask-sensitive test fixture: the test pre-created
   `private/scout-snapshots` with ambient permissions, while the product correctly
   requires private state directories. The fixture now creates that path with
   mode `0700`.
2. Bridge startup authenticated `origin`, but `scout.start` could later fetch
   `origin/developer` without re-running that identity/synchronization check. The
   Scout readiness gate now calls `synchronizedGitState(config)` immediately
   before starting/probing the Scout runtime and preparing the requested snapshot,
   so a changed or unsynchronized origin fails closed.

The exact corrected substantive source SHA is
`8941c2f89a595b16835a5326e42d5a1ec9d7a32c`.

## Observed

- `repository-identity.ts` parses supported HTTPS, `ssh://`, and scp-style SSH
  remotes and compares exact Git host, owner, and repository. Public GitHub and
  standard GHES `/api/v3` derive their Git host; ambiguous custom API layouts
  require explicit `github.git_host`.
- The Scout runtime is installed outside `repository_root`, uses exact pinned
  OpenCode/plugin `1.18.16`, a distinct authenticated loopback endpoint, sterile
  HOME/XDG/temp/config paths, explicit provider auth, read-only trusted config,
  project/default-plugin/external-skill disablement, and LSP/formatter disabled.
- No ref-owned `repository-scout` agent remains. The trusted Luna/high prompt,
  permission contract, and `scout_read`/`scout_glob`/`scout_grep` tools are
  bridge/runtime-owned.
- Scout snapshots are materialized from `ls-tree`/`cat-file` Git objects rather
  than checkout/worktree, reject gitlinks and `.git`, strip regular-file
  write/execute bits, preserve symlinks only as inert evidence, and re-hash every
  reused path.
- Trusted Scout tools use filesystem/path APIs only, bound UTF-8 evidence, never
  follow symlink directories, and enforce lexical plus realpath containment.
- Historical weaker worktree mappings fail recovery rather than being reused.

## Interpretation

The separate runtime removes inspected-ref configuration and built-in OpenCode
`read` from the Scout evidence path instead of claiming permissions alone make
those mechanisms safe. The added per-start synchronization check closes the
reviewed gap between bootstrap-time origin authentication and later
`origin/developer` consumption.

## Attempts

- A configured isolated ordinary OpenCode Scout was rejected because pinned
  upstream behavior showed built-in `read` can attach repository instructions and
  warm LSP while configuration discovery can execute/install extensions.
- The first separate-runtime handoff passed the developer's local checks but its
  clean GitHub Actions run failed one test because the fixture depended on the
  local umask. The Actions job log identified the exact failing assertion; the
  product's private-directory check was retained and only the fixture was fixed.

## Changed approach

- The runtime architecture changed from ordinary/ref-owned OpenCode to a separate
  externally installed pinned Scout server with bridge-owned prompt/tools.
- Review correction preserved the runtime design but added an immediate
  `synchronizedGitState(config)` gate before every new Scout start.
- The CI correction changed only test setup permissions and did not weaken the
  product boundary.

## Checks

- Exact developer range from task start through the completed delegated handoff
  was inspected through connected GitHub, including repository identity, config,
  Scout server, snapshot manager, trusted tools, service wiring, tests, validators,
  setup/security/architecture records, and pinned upstream OpenCode behavior.
- GitHub Actions run `31884302516` for implementation SHA
  `a26cb7578fdc86a9514e72072a639caeea1c906e` failed exactly one of 84 bridge
  tests: the hardened Scout start fixture pre-created a group/world-accessible
  private snapshot root under the runner's umask.
- Direct correction commit `080dbf883cd6e567db7db934816b3f526ba17325`
  changes only that fixture to request mode `0700`.
- Direct correction commit `8941c2f89a595b16835a5326e42d5a1ec9d7a32c`
  adds exactly one production line: re-run `synchronizedGitState(config)` in the
  Scout readiness gate before runtime/snapshot start.
- GitHub Actions run `31902255588` for
  `8941c2f89a595b16835a5326e42d5a1ec9d7a32c` completed successfully under the
  repository's full `Validate repository` workflow.
- `main` remained `6127611113dfdb66f93a0cfd2d355359aa370833` throughout review.

## Blockers / required decisions

None in developer source. Promotion remains human-only and is not requested.

## Remaining work

- Finalize/archive this developer task record under the repository's normal
  finalization policy after the exact bookkeeping handoff is reviewed.
- Complete independent review/reconciliation of the `web-orchestration` source.
- Implement and validate template-development change-package provenance hardening,
  reconcile `source-lock.json`, genuinely generate/validate the deterministic
  package, and record exact source/package SHAs.

## Next action

Treat the resulting task-record-only commit as the developer bookkeeping handoff,
confirm its GitHub Actions result, then proceed to source finalization and the
remaining template-maintenance package work without changing `main`.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/design-record.md`
- `docs/architecture/deviations.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `SECURITY.md`

## Last handoff commit

`8941c2f89a595b16835a5326e42d5a1ec9d7a32c`
