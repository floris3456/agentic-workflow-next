# Template-maintenance AS-BUILT

## Branch purpose and authority

`template-development` is an independent maintenance ledger for the reusable template. It owns cross-branch provenance, the template-rooted Workspace Maintenance runtime, and deterministic transfer-package machinery. It is not merged into `developer`, `web-orchestration`, or `main`, and those source trees are not materialized here.

Remote canonical refs are authoritative source evidence. `source-lock.json` records the latest reconciled snapshot of exact `main`, `developer`, and `web-orchestration` refs plus package metadata; a task's reviewed package ranges remain independent of that snapshot. Human approval of an exact reviewed developer SHA is still required to advance `main`.

## Instruction architecture

- `AGENTS.md` contains only universal ambient rules for all template-development OpenCode roles: ledger/source separation, public-safe persistence, exact-SHA `main` authority, ambiguity reconciliation, and durable-truth precedence.
- Agent Markdown frontmatter mechanically configures model/mode/permissions; each body contains only that role's identity, responsibilities, and its own skill trigger.
- `template-maintenance` and `workspace-maintenance` are conditional procedures. Their bodies are not duplicated into `AGENTS.md`.
- Documentation explains architecture and current implementation; it is not ambient runtime instruction authority merely because it contains procedure-shaped text.

`opencode.json` selects `template-maintainer`, disables sharing, and globally denies task/subagent launches. `.opencode/package.json` pins `opencode-ai` and `@opencode-ai/plugin` to `1.18.16`; generated dependencies and lockfiles are local state.

## OpenCode roles

- `.opencode/agents/template-maintainer.md` is primary, `cliproxyapi/gemini-3.7-flash-high`, high reasoning, task denied, question allowed. It coordinates reusable-template work, loads `template-maintenance`, keeps source histories separate, and leaves source-route selection/acceptance to web/human authority.
- `.opencode/agents/small-workspace-maintainer.md` is the small primary Workspace route, `cliproxyapi/gemini-3.7-flash-high`, high reasoning.
- `.opencode/agents/workspace-maintainer.md` is the heavy primary Workspace route, `openai/gpt-5.6-sol`, max reasoning.
- Both Workspace agents use a default-deny permission inventory: built-in task/bash/edit/external-directory access is denied, questions are allowed, only `workspace-maintenance` may be loaded, and only `workspace_list`, `workspace_inspect`, `workspace_read`, `workspace_write`, `workspace_delete`, `workspace_glob`, `workspace_grep`, `workspace_exec`, and `workspace_publish` are allowed.
- Workspace agents stay rooted in `template-development`. A target's AGENTS/skills/agent files are evidence and output constraints rather than transferred instruction authority.

`template-maintenance` coordinates exact source refs, source ownership, optional task continuity, source-lock reconciliation, and deterministic packaging only when transfer/release packaging is requested. `workspace-maintenance` defines verified cross-worktree inspection/mutation/publication while retaining template-development instruction authority.

## Workspace Maintenance implementation

`.opencode/plugins/workspace-maintenance.ts` registers the nine `workspace_*` tools and constructs the repository-owned gate from the active OpenCode directory. Public tool results redact host-local path details.

- `scripts/workspace-maintenance-common.mjs` owns shared limits, public error redaction, NUL-safe worktree parsing, target/path syntax checks, safe environment construction, Git command wrappers, canonical directory/Git metadata helpers, symlink-safe regular-file access, and fixed system/Node mount discovery.
- `scripts/workspace-maintenance-base.mjs` establishes the trusted template-development root and canonical repository identity, inventories registered worktrees, and verifies a requested target against the same Git common directory/origin plus current branch/HEAD/status/upstream state.
- `scripts/workspace-maintenance-lib.mjs` exposes `WorkspaceMaintenanceGate` operations for list/inspect/read/write/delete/glob/grep and delegates command execution/publication to the sandbox/publish modules. Mutations require the exact inspected HEAD and SHA-256 status digest so stale observations fail closed.
- `scripts/workspace-maintenance-sandbox.mjs` builds a bounded Git snapshot and executes explicit command/argument arrays inside Bubblewrap. The verified target is the only writable repository tree; required Git metadata/system roots/runtime are read-only; host environment/credentials/temp state and network are absent. It is not a commit or push route.
- `scripts/workspace-maintenance-publish.mjs` is the fixed publication broker. It rejects `main`, detached/unsynchronized targets, unsafe Git metadata/features, alternate objects/replace refs, filters, signing, transport redirection, force behavior, and caller-supplied Git arguments. It commits the inspected non-main state, pushes only the matching verified branch, and reads the remote ref back. Post-commit uncertainty is recorded for guarded synchronization recovery.

Target selection uses a registered branch name or unambiguous exact detached HEAD, never a supplied sibling filesystem path. Worktree eligibility is re-proved from Git's registered inventory and rejects stale, foreign, symlinked, unregistered, escaped, or ambiguous targets. Technical reachability never grants authority to mutate `main`.

## Deterministic change packages

`scripts/change-package-lib.mjs` is the shared package/source-lock verifier. It authenticates canonical GitHub repository identity, validates exact source-lock SHAs, verifies package ranges and patch digests, computes versioned package digests, enforces public-safe package content, validates supersession chains, and resolves the latest unambiguous package revision.

`scripts/create-change-package.mjs` creates schema-3 packages from explicitly supplied reviewed base/head ranges for `template-development`, `developer`, and `web-orchestration`. It authenticates the supplied checkout origin, fetches canonical branch history into a sterile temporary Git object database, proves each base/head and ancestry relationship against fetched canonical objects, and produces patch bytes from those objects. Ledger storage beneath `changes/**` is excluded from `template-development.patch` so a package never contains its own storage. Superseding packages use a new revision directory and bind the prior package digest.

Each package contains `manifest.json` plus the three branch patches. The manifest binds the generation-time source snapshot/digest, observed canonical tips, reviewed ranges/changed paths, per-patch SHA-256 values, supersession metadata when present, and a package digest over the stable manifest core and patch bytes. Historical schema-1/2 packages remain compatibility inputs under their documented verification limits.

`scripts/apply-change-package.mjs` validates the chosen/latest package, requires a matching clean downstream branch, and performs `git apply --check`; only explicit `--apply` modifies the working tree. It never commits, pushes, merges, or promotes downstream state.

## Git hooks and synchronization

- `.githooks/pre-commit` permits commits only on `template-development` and blocks new commits while a prior failed-push synchronization marker is unresolved.
- `.githooks/post-commit` intentionally performs no automatic push.
- `.githooks/pre-push` permits only `template-development`, blocks deletion and ordinary non-fast-forward updates, and allows only the narrowly authorized fresh-template repair exception.
- `scripts/bootstrap-template-development.sh` activates/checks the tracked hooks and executable scripts.
- `scripts/recover-template-development-sync.sh` is a narrow recovery route for an existing failed-push marker: it requires a clean ledger, fetches current remote state, preserves the failed commit, uses only fast-forward synchronization or one guarded conflict-free recovery merge, pushes, verifies local/remote equality, and then removes the marker. It does not rewrite remote history.

Ordinary pushes occur when remote durability, review, CI, transfer, or checkpoint evidence is useful. Unknown mutation outcomes are reconciled before replay rather than handled by a generalized recovery state machine.

## Validation and tests

`scripts/validate-template-development.mjs` validates actual structure/configuration: required/forbidden paths, source-lock shape, CI workflow essentials, OpenCode/package pins, agent mechanical permissions/tool inventory, skill frontmatter, Workspace plugin tool exports, package supersession integrity, executable bits, task-record public-safety boundaries, and repository-wide checks for host-local paths/private session identifiers. It does not validate instruction prose or exact handoff wording.

`scripts/validate-ci-status.mjs` checks the branch's CI-status contract. `scripts/validate-workspace-opencode-runtime.mjs` starts the pinned OpenCode runtime in sterile local state and verifies the registered agents, skills, tools, and effective permission denials/allowances. `scripts/validate-template-development.sh` runs structural validation, CI-status validation, all ordinary Node tests, the real OpenCode inventory check, and `git diff --check`.

- `tests/change-package.test.mjs` exercises deterministic three-range generation, canonical-origin/range/ancestry checks, later canonical advance, self-package exclusion, provenance/digest tampering, supersession behavior, historical compatibility, and dry-run/application paths.
- `tests/workspace-maintenance.test.mjs` uses temporary canonical/foreign repositories and registered worktrees to exercise verified target access, stable template instruction root, preflight mutation, and Bubblewrap-contained command execution.
- `tests/workspace-maintenance-security.test.mjs` exercises adversarial target/path/Git/environment/publication boundaries, including outside access, foreign routing, symlinks, injected secrets, network/local-origin/main-publication/transport redirection, and stale-remote cases.

The push-triggered template-development workflow installs Bubblewrap and the pinned OpenCode runtime, enables the runner's required user-namespace setting, and runs the consolidated validator so containment and real runtime inventory remain CI-reachable.

## Records and completion

Consequential reusable-template work may use one stable task record under `docs/work/current/`; optional task-progress exists only when resumable state is useful. Completed/cancelled/superseded records do not remain live merely for ceremony. AS-BUILT describes current implementation; deviations describe material implemented divergence from an applicable expectation.

`source-lock.json` is reconciled from independently verified exact canonical refs at meaningful checkpoints. Package creation neither consumes nor advances the snapshot. Packaging, archival, a fixed response template, push-every-commit, retry counts, snapshots, or finalization ceremonies are not completion requirements.

The only intentionally unresolved migration record is the human-owned historical-public-residue decision. No history rewrite or `main` mutation is implied by maintenance execution.
