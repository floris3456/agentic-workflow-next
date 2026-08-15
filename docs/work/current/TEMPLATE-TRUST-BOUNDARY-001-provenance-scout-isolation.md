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

Issue 26 is canonical. The mapped Sol session later pushed source commit `9ab08b8d338c0764899bb553d50dbe491cdc09bc` and handoff snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`. Exact review confirms the source commit implements AWT-002 host/owner/repository validation plus safe fail-closed Scout measures and leaves `scout.start` disabled. Its correlated six-field response is `needs decision` with no completed handoff SHA.

The human task already authorizes a dedicated Scout-only runtime when required. Independent inspection of pinned OpenCode 1.18.16 resolves the developer's architecture question without a new human decision: use a separate pinned OpenCode process with project configuration disabled, sterile HOME/XDG, bridge-owned immutable config/agent/tools, no built-in read/glob/grep/LSP access, and trusted contained Scout-specific read/search tools. Make both runtime config discovery directories non-writable so the pinned background `@opencode-ai/plugin` bootstrap returns before spawning a package manager. Keep writable sterile data only for explicitly provisioned provider auth. The bridge/Scout runtime installation is trusted infrastructure and must execute from an installed/reviewed package outside the untrusted `repository_root`; the inspected ref remains data only.

A direct Git-data-object publication attempt was abandoned before moving any branch ref after readback of the first unreferenced staged blob did not match the local content-address hash. No developer branch content was changed by that attempt. To avoid hand-transcribing a ~95 KB security patch, the implementation route is switched back to the same existing Sol session with the independently resolved architecture below.

## Independently established findings

- AWT-002 at `f8ed4a7e...` parses legitimate HTTPS, `ssh://`, and scp-style remotes, authenticates host + owner + repository, derives public GitHub and GHES hosts, requires explicit `github.git_host` when a custom API base is ambiguous, and has focused deceptive-host/path/userinfo tests.
- Current Scout fail-closed source verifies exact canonical `origin/developer` ancestry and disables hooks/global/system Git config for its retained workspace primitive, but `scout.start` intentionally remains disabled.
- OpenCode 1.18.16 project instruction loading is skipped with `OPENCODE_DISABLE_PROJECT_CONFIG`; sterile global config/home removes remaining operator-global instruction sources.
- Its custom-tool registry can load bridge-owned dependency-free tools. Built-in `read` need not be enabled and therefore need not inject repository instructions or warm LSP.
- Its config loader attempts background `@opencode-ai/plugin` installation for config directories, but pinned `Npm.install` returns without process execution when those directories are not writable. Trusted read-only runtime config directories therefore close that startup side effect.
- Runtime flags support pure/project-disabled operation, default-plugin and external-skill disablement, Claude-instruction disablement, LSP-download disablement, and experimental-feature disablement.
- A stronger exact-view primitive is available without checkout: materialize the requested commit tree with `git ls-tree` + `git cat-file blob` after canonical-origin fetch/ancestry verification. This runs no checkout hook, clean/smudge filter, executable from the ref, or repository config extension and produces a `.git`-less immutable snapshot.
- Trusted `scout_read`/`scout_glob`/`scout_grep` can enforce realpath containment, never follow symlink directories, reject symlink escape, bound reads/searches, and spawn no shell/LSP/package/network process.
- Package generation/validation still needs AWT-001 after developer source review. `source-lock.json` remains the task-start review-base lock until final package generation/reconciliation.

## Route / active work

- Delegated Sol source range `e2700f586fe8ab634053eb514bb9da487e881a21..f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`: terminal/absorbed as `needs decision` navigation; no human acceptance implied.
- Direct continuation from `f8ed4a7e...`: canceled before any branch ref/content change because staged-blob readback detected a content mismatch.
- Same-session Sol continuation: selected to implement the already-resolved dedicated runtime using repository-local tooling, with exact GitHub review afterward.
- Existing Scouts: none launched and none accepted as evidence.
- Web-orchestration/template-development source changes wait until developer continuation is terminal and reviewed.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Highest accepted bridge command sequence: 7.

## Command / interaction journal

- Seq 1 start created the Sol session.
- Seq 2 rejected permission-6.
- Seq 3 permission-7 reply ended indeterminate because upstream had already removed it; never retry.
- Seq 4 and 5 steers were delivered during the stale-session interval.
- Seq 6 abort succeeded.
- Seq 7 post-abort steer was delivered and later session recovery produced source `9ab08b8d338c0764899bb553d50dbe491cdc09bc`, snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`, and the six-field `needs decision` response.
- Pending sequence 8, to be published byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":8,"command_id":"a73e1c51-1e10-47ae-b9bc-755f0a09c108","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"steer","arguments":{"message":"Architecture decision resolved within the already-authorized task: implement the hardened Scout runtime rather than leaving scout.start disabled. Preserve the reviewed AWT-002 repository-identity work already at developer f8ed4a7e570ff173dc6c8dbbc533735916f8ed41. Use a separate pinned OpenCode 1.18.16 Scout server and make the inspected ref untrusted data only. Required implementation properties: (1) replace checkout/worktree materialization for Scout execution with an exact commit-tree snapshot built from canonical origin/developer objects using safe Git plumbing (for example ls-tree + cat-file blob) after origin identity + fetch + ancestry verification; no checkout hooks, filters, repo executables, .git, or writable snapshot; preserve repo symlinks as evidence and fail closed on unsupported gitlinks/submodules; (2) add a separate mandatory loopback opencode.scout_base_url distinct from ordinary developer OpenCode so normal developer behavior remains unchanged; (3) provide a bridge-owned Scout runtime launcher/config/agent/tools from the trusted bridge installation, and fail serve/auth if that runtime package is executing from inside repository_root; operator must run/install the reviewed runtime outside the untrusted checkout; (4) sterile Scout HOME/XDG/config/data, disable project config, pure mode, default plugins, external skills, Claude/repo instructions, LSP and LSP downloads, experimental tools, auto-update/model fetch/web UI/watcher as applicable; do not inherit arbitrary OPENCODE/provider/global customization; keep only explicit provider auth in sterile data; (5) use only dependency-free trusted scout_read/scout_glob/scout_grep tools; built-in read/glob/grep/lsp/bash/edit/task/skill/web/MCP/question/todo/external_directory and unlisted dynamic tools must resolve deny; trusted tools must realpath-confine access, never follow symlink directories, reject escape, bound UTF-8 reads/search, and spawn no process/network/package manager; (6) both OpenCode discovery/config directories must be read-only so pinned config dependency bootstrap cannot spawn npm/bun; fail closed on platforms where this non-writable guarantee is not implemented/audited rather than claiming isolation; (7) bootstrap --check actively probes dedicated Scout version/manifest/agent/tool contract and fails clearly if absent/misconfigured; bridge run/status should keep normal developer transport alive while reporting Scout runtime unavailable, and scout.start must fail clearly; recovery must not resume historical Scout sessions/workspaces whose stored workspace path is not the newly hardened snapshot; (8) preserve exact-ref Scout concurrency/recovery/public-safe result correlation. Add adversarial tests for malicious executable checkout hook, configured smudge filter, repo-local OpenCode agent/tool/plugin/instructions, unrelated inherited global/provider env, trusted-prompt replacement resistance, AGENTS.md as ordinary evidence only, no LSP/process/download path, symlink escape, local-only/foreign ref rejection, concurrent/recovery behavior, ordinary developer endpoint separation, and bootstrap/status runtime absence/misconfiguration. Update validators and all truthful SECURITY/architecture/setup/AS-BUILT/deviation/task records; remove every obsolete claim that Scout LSP or the ref-owned agent is available. Run bridge tests/build, agent-system/opencode-bridge/web-integration validators, full validate-repository, and any focused runtime/snapshot checks. Do not use Scouts as evidence for this task, do not read operator-local unrelated .opencode state, do not modify main or web-orchestration, and do not promote or rewrite history. Push the exact developer handoff and return exactly the six required fields; if a concrete remaining isolation property still cannot be proved after implementing this design, return needs decision with exact evidence rather than weakening it."}}
```

## Checks performed by orchestrator

- Re-established live `developer` after unexpected movement and reviewed the exact delayed Sol source/handoff range.
- Read exact AWT-002 repository-identity source and adversarial tests on remote GitHub.
- Read exact current Scout fail-closed implementation and bridge bootstrap/status behavior.
- Read pinned OpenCode 1.18.16 instruction, config-path, runtime-flag, tool-registry, auth, built-in LSP/read, and package-install paths needed to resolve the dedicated-runtime architecture independently.
- Verified the direct publication attempt moved no Git ref; the mismatching staged blob remains unreachable and is not part of any branch.
- Maintainer contract still requires genuine post-review package generation by `scripts/create-change-package.mjs`; no hand-built package substitute.

## Blockers / decisions

No human-owned decision currently remains. The dedicated runtime design is inside the user's explicit scope and preserves the task's hard isolation properties without adding an external sandbox dependency. If implementation evidence still shows any inspected-ref/global extension execution, repository instruction control, package installer/LSP/ref-controlled process, uncontrolled network/download, or filesystem escape, stop at that concrete boundary rather than weaken it.

## Remaining work

Publish/reconcile sequence 8; absorb and independently review the resulting exact developer range and checks; finalize/archive developer task record if required. Then make the minimal aligned web-orchestration scouting Source change, harden/test AWT-001 on template-development, genuinely generate/validate the deterministic package, reconcile source-lock/durable records, and return exact remote source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

Developer navigation handoff snapshot: `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` (`needs decision`, not accepted as completion).
