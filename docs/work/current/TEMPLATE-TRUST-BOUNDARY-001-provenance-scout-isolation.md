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

`source-lock.json` matched the source refs at task start. `main` remains unauthorized for change or promotion.

## Public-safe task brief

Harden reusable-template trust boundaries across package provenance, exact Git repository identity, and independent Scout isolation while preserving portability, recovery, exact-ref review, deterministic packaging, public safety, ordinary developer OpenCode behavior, and human-only `main` promotion. Existing Scouts are not evidence for this task until the hardening is independently reviewed.

## Current position

Issue 26 is canonical. After the earlier execution-state reconciliation, the mapped Sol session later resumed and pushed two commits without a new orchestrator command: source commit `9ab08b8d338c0764899bb553d50dbe491cdc09bc` and handoff snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`. Exact remote comparison shows the source commit implements the AWT-002 host/owner/repository boundary plus safe fail-closed Scout measures, removes the ref-owned Scout agent, updates validators/docs, and leaves Scout launch disabled. The correlated six-field response is `needs decision` with no handoff SHA and names runtime isolation as the blocker. That result is now terminal and absorbed as navigation/evidence, superseding the earlier assumption that the delegation had no later effects.

The human task already authorizes a dedicated Scout-only runtime when required, so the developer's choice among an in-process runtime, audited dependency, or suitable upstream runtime is not itself a human-owned decision. Independent upstream inspection shows a smaller route is available without a new external architecture dependency: pinned OpenCode can run in a separate process with `OPENCODE_DISABLE_PROJECT_CONFIG`, sterile HOME/XDG, no global instructions, project instructions disabled, LSP disabled, and bridge-owned custom read/search tools. OpenCode's config loader attempts package bootstrap for config directories, but its pinned `Npm.install` returns without process execution when those directories are non-writable; the dedicated launcher can therefore copy only trusted bridge config/tools into private read-only directories while keeping separate writable sterile data only for explicitly provisioned provider auth.

## Independently established findings

- AWT-002 source at `f8ed4a7e...` now parses supported HTTPS, `ssh://`, and scp-style remotes and validates Git host plus owner/repository; public GitHub and GHES `/api/v3` derive the host and ambiguous custom API layouts require explicit `github.git_host`.
- AWT-002 adversarial tests cover deceptive hosts/suffixes, malformed paths, encoded components, misleading userinfo, unsupported protocols, Enterprise/custom API behavior, and positive HTTPS/SSH forms.
- Scout source at `f8ed4a7e...` disables hooks/global/system Git config for its retained future-worktree primitive, verifies exact `origin/developer` ancestry, detached/clean state, private-root realpath containment, and rejects escaping/unresolved symlinks; actual `scout.start` currently fails before workspace/OpenCode contact.
- Pinned OpenCode 1.18.16 instruction code does not load repository instruction files when `OPENCODE_DISABLE_PROJECT_CONFIG` is set. Sterile global config/home removes the remaining global instruction sources.
- Pinned OpenCode config discovery always includes global/home/config directories, but background `@opencode-ai/plugin` install calls return without spawning when those config directories are non-writable. Bridge-owned read-only trusted config therefore avoids the package-installer startup side effect.
- Pinned custom tool discovery can load bridge-owned dependency-free tools from that trusted read-only config; built-in `read` need not be enabled. A trusted `scout_read`/`scout_glob`/`scout_grep` layer can enforce realpath containment and avoid instruction/LSP side effects.
- Package generation/validation still needs AWT-001 after developer source review. `source-lock.json` remains the task-start review-base lock until final package generation/reconciliation.

## Route / active work

- Delegated Sol source range: `e2700f586fe8ab634053eb514bb9da487e881a21..f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`, terminal and absorbed as `needs decision`; no human acceptance implied.
- Direct developer continuation: selected from exact current head `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` to implement the already-authorized dedicated Scout runtime and then independently review the full developer range.
- Existing Scouts: none launched and none accepted as evidence.
- Web-orchestration/template-development source changes wait until developer continuation is terminal and reviewed.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Highest accepted bridge command sequence: 7; no new bridge mutation is planned for the direct route.

## Command / interaction journal

- Seq 1 start created the Sol session.
- Seq 2 rejected permission-6.
- Seq 3 permission-7 reply ended indeterminate because upstream had already removed it; never retry.
- Seq 4 and 5 steers were delivered during the stale-session interval.
- Seq 6 abort succeeded.
- Seq 7 post-abort steer was delivered and initially projected `MessageAbortedError`.
- Later autonomous/session recovery produced source `9ab08b8d338c0764899bb553d50dbe491cdc09bc`, snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`, and a six-field `needs decision` response. These later effects are now reconciled; no further developer bridge prompt will be sent while using the direct continuation.

## Checks performed by orchestrator

- Re-established live `developer` after unexpected movement and compared exact `0b481324...` to `f8ed4a7e...`: two commits and the developer-reported source files only.
- Read exact AWT-002 repository-identity code and adversarial tests on remote GitHub.
- Read exact current Scout fail-closed implementation and bridge bootstrap/status behavior.
- Read pinned OpenCode 1.18.16 instruction, config-path, tool-registry, auth, and package-install source needed to evaluate a dedicated runtime without trusting the implementer report.
- Maintainer contract still requires genuine post-review package generation by `scripts/create-change-package.mjs`; no hand-built package substitute.

## Blockers / decisions

No human-owned decision is currently required. The already-authorized dedicated runtime path remains inside task scope and does not add a new external sandbox dependency. If implementation evidence later shows that this route still executes untrusted/global extensions, repository instructions, package installers, LSP/ref-controlled processes, or cannot contain filesystem reads, stop at that concrete architecture boundary rather than weaken the property.

## Remaining work

Implement the dedicated Scout-only runtime directly on `developer` from `f8ed4a7e...`, including immutable/exact workspace preparation or equivalent no-hook/no-filter materialization, trusted contained read/search tools, sterile runtime launcher/config/auth/bootstrap/status behavior, adversarial tests, validators, and truthful durable docs. Run remote CI and exact-range review; finalize/archive the developer task record if repository policy requires it. Then make the minimal aligned web-orchestration scouting Source change, harden/test AWT-001 on template-development, genuinely generate/validate the deterministic package, reconcile source-lock/durable records, and return exact remote source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

Developer navigation handoff snapshot: `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` (`needs decision`, not accepted as completion).
