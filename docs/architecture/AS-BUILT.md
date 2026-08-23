# AS-BUILT: repository workflow

## Current implementation status

This repository is a human-controlled implementation template. Native OpenCode on the authorized host is the active local execution path. Route selection supports direct web/GitHub for tiny exact low-risk changes, small and heavy as bounded independent local routes, and Dual as the default substantive local route. Direct Host, Dual, Minimalism, and representative Dual proof are complete. No remote-control bridge or replacement control plane is part of the implementation.

## Active OpenCode agents and permissions

The required active `.opencode/agents/` roles are:

- `lead-developer.md` is a primary agent configured with `openai/gpt-5.6-sol` and high reasoning effort. It denies editing. Its shell map denies `*` first and allows only repository inspection and review commands (`pwd`, file/list/search reads, Git status/diff/log/show/ref/tree inspection, targeted Node/npm tests, and repository validation). Its nested task map is exactly wildcard deny plus `spark-implementer: allow`; structured questions are allowed for lead-level decisions.
- `spark-implementer.md` is a subagent configured with the currently available `openai/gpt-5.6-sol` and high reasoning effort. It allows repository read/edit/search/list/shell work, denies further task delegation, denies external-directory access, and denies direct structured questions. Spark is the sole implementation source editor inside Dual and reports the complete uncommitted diff, exact command/check results, and proposed-deviation status to the lead.
- `small-developer.md` is a primary bounded route for tiny/very-low-risk work, currently configured with `cliproxyapi/gemini-3.7-flash-high`. It denies task delegation and questions, keeps normal work repository-relative, forbids parent/sibling rediscovery or reconstructed checkout paths, leaves external-directory requests approval-visible, and implements directly with proportional checks.
- `heavy-developer.md` is a primary bounded route for difficult or subtle work that still fits one small direct session, currently configured with `openai/gpt-5.6-sol`. It denies task delegation and questions.

The former active `large-developer.md` file is removed. Additional future agent files are not prohibited by the validator. Small/heavy are route choices, not fallback attempts and not Spark substitutes; if Dual is unavailable, web makes a fresh route decision. Model IDs are replaceable configuration; the current lead/Spark equality records the bounded Small recovery from the unavailable Spark model without changing role or permission boundaries.

## OpenCode project configuration

`opencode.json`:

- selects `lead-developer` as `default_agent`;
- disables sharing;
- globally denies task launches unless an agent-specific map narrows that boundary;
- keeps global external-directory access approval-gated (`ask`) rather than broadly allowed; and
- disables automatic compaction and pruning with `{ "auto": false, "prune": false }`.

There is no context-builder, tokenizer, truncation recovery, summary fallback, or compaction platform. Bounded continuation receives the last 5,000 raw chat tokens, older chat is discarded rather than summarized, and agents reread canonical task/durable records plus exact Git state.

## Active route and package scope

Web owns orchestration, web research, task/outcome design, route selection, and final outcome/system verification. Direct web/GitHub is for tiny exact low-risk changes web can make more simply; `small-developer` is for very simple bounded local work; `heavy-developer` is for difficult, important, or subtle work that remains small and bounded; and `lead-developer -> spark-implementer` is the default substantive local route. For Dual, web does not routinely duplicate the lead's deep implementation analysis or review.

The active implementation uses native OpenCode direct routes only. Small and heavy remain independent bounded routes, and Dual remains the default substantive route. Deterministic transfer/release package generation and provenance remain available when explicitly requested; no package Action/request broker or replacement transport is retained.

Source implementation does not require a change package. Generate or apply deterministic transfer/release packages only when an accepted task explicitly requests transfer, downstream application, or release packaging.

## Tracked Git hooks and workflow scripts

Tracked hooks now consist of:

- `.githooks/pre-commit`: blocks commits while an exact promotion has pending developer synchronization, blocks unsanctioned direct commits on `main`, and restricts commits to `developer` or sanctioned `main` promotion state. It no longer enforces failed-push markers.
- `.githooks/pre-merge-commit`: blocks unsanctioned merge commits on `main` and delegates the remaining branch/promotion checks to `pre-commit`. It no longer authorizes sync-recovery merges.
- `.githooks/pre-push`: blocks ref deletion and ordinary non-fast-forward pushes; validates the narrowly authorized fresh-template repair; and guards exact human-approved `main` promotion merge identity, parentage, tree equality, and remote-main expectation.

The former `.githooks/post-commit` automatic developer push and failed-sync-marker creator is removed. Commits are not automatically pushed. Push/checkpoint/handoff activity occurs when remote durability, review, transfer, CI, interruption recovery, or ambiguity reconciliation makes it useful.

Script state:

- `scripts/agentmemory-server.sh` is an executable server launcher for pinned `@agentmemory/agentmemory@0.9.22`. It derives the data directory dynamically at runtime from Git common metadata (`.git/agentmemory` via `git rev-parse --git-common-dir`), never persists absolute host paths, unsets remote AI provider keys to prevent cloud leakage, and exports mandatory local environment variables (`EMBEDDING_PROVIDER=local`, `AGENTMEMORY_AUTO_COMPRESS=false`, `AGENTMEMORY_INJECT_CONTEXT=false`, `AGENTMEMORY_ALLOW_AGENT_SDK=false`).
- `scripts/agentmemory-lib.mjs` implements pure agent memory logic: strict whitelist enforcement of the four stable roles (`lead-developer`, `spark-implementer`, `small-developer`, `heavy-developer`), default scope rules (Spark own; Lead/Small/Heavy team), visible author rendering, memory input safety rejection (blocking reasoning, secrets, private runtime IDs, absolute host paths, and raw logs), HTTP communication with local server endpoints, and non-blocking clean degradation when the server is unavailable or offline.
- `.opencode/tools/agentmemory.ts` wraps `scripts/agentmemory-lib.mjs` and registers OpenCode custom tools `agentmemory_remember` and `agentmemory_recall` using `@opencode-ai/plugin`.
- `scripts/bootstrap-agent-workflow.sh` installs/checks only pre-commit, pre-merge-commit, and pre-push; apply mode makes tracked shell scripts executable and sets `core.hooksPath`, while check mode verifies the existing configuration and executable hooks.
- `scripts/initialize-template-branches.sh` still safely no-ops for valid ancestry and only repairs clean synchronized fresh unrelated one-commit template roots after metadata/tree-shape and active-task checks. It preserves the developer tree, writes a backup ref, and uses a pre-push-authorized exact `force-with-lease`. It no longer reads a synchronization-failure marker.
- `scripts/promote-developer-to-main.sh` retains exact human-approved developer-SHA promotion, exact merge parents/tree, pending promotion evidence, remote verification, and developer synchronization. It no longer blocks on the removed synchronization-failure marker.
- `scripts/recover-remote-sync.sh` is removed. Unknown mutation outcomes are reconciled by inspecting current process/session plus local and remote Git state before any evidence-based retry; no replacement recovery state machine is introduced.

## Validators and ordinary repository checks

- `scripts/validate-agent-system.mjs` is an executable structural safety validator. It parses agent frontmatter into nested maps and checks OpenCode config, positive existence of the four required agent roles, their modes and current documented models, lead edit/shell/task boundaries, Spark edit/task/external/question boundaries, small/heavy task and question denial, retired `large-developer.md` absence, hook/core-script existence and executable bits (including `scripts/agentmemory-server.sh`), expected removals, and active references to retired skills. It does not prohibit additional future agent files and intentionally does not validate exact prose, route attempts, lifecycle/retry/finalization/snapshot rules, compaction recovery, or response templates.
- `scripts/validate-preimplementation.mjs` checks required repository/docs/task-template presence and local Markdown links while excluding immutable archived snapshots and research's separately validated evidence format.
- `scripts/validate-repository.sh` runs preimplementation structure, agent-system structure, CI-status structure, ordinary research validation, generated research-evidence-manifest verification, research evidence regression tests, agent memory test suite, and tracked-hook checks.
- `scripts/validate-web-orchestrator-integration.mjs` is removed together with `WOR_WEB_ORCHESTRATION_ROOT` cross-branch coupling.
- Ordinary `validate-research.mjs` and `generate-research-evidence-manifest.mjs --check` remain active repository checks; both research walks fail closed against symlink entries without following targets or reading outside content.
- Exact-English, response-template, obsolete lifecycle/retry, snapshot/finalization, compaction recovery, and route-attempt validators removed by this cutover are not replaced.

## Mechanical tests

- `tests/dual-agent-config.test.mjs` uses a small indentation-aware frontmatter parser rather than brittle line matching. It proves the lead primary/edit-deny/review-shell/nested-task boundary, Spark subagent/edit/task/external/question boundary, current models for all four required roles, bounded small/heavy primary task/question denial, retired large absence, and OpenCode default/share/global-permission/compaction settings without prohibiting additional future agent files.
- `tests/agentmemory.test.mjs` proves author attribution on memory capture, team cross-role recall with visible authors, orphan author discarding, own isolation and default role scopes, safety rejections (reasoning, secrets, private IDs, absolute host paths, raw logs), and clean graceful fallback on unavailable server.
- `tests/template-branches.test.mjs` copies only the remaining tracked hooks into disposable repositories. It proves exact developer-tree-preserving repair and backup ref creation, correct-ancestry no-op, and refusal of established/shallow roots, generation-fingerprint mismatch, local/remote mismatch, unsuitable shared ancestry, dirty state, and active task records. The obsolete synchronization-failure-marker refusal case is removed.
- `tests/research-evidence.test.mjs` proves that the research validation and manifest generation walks reject symlinked files and symlinked directories beneath the research tree with clear repository-relative errors without following targets, hashing/reading external files, or mutating the committed manifest.

## Task, progress, deviation, and completion semantics

- One canonical task-record is accepted instruction authority for consequential work. Tiny one-turn work may omit one when durable continuity adds negligible value.
- Optional concise task-progress records resumable execution state only: current position, material observations/failed approaches, checks, blockers, remaining work, and next action. They are not duplicate task authority or acceptance evidence.
- Formal deviations under `docs/architecture/deviations.md` describe durable current implemented reality that materially differs from an applicable prior normative expectation.
- Spark's exactly one task-scoped `proposed-deviations.md` is temporary Dual working state for a material challenge to lead instructions. Spark stops before the departure; lead disposition is required before implementation resumes; no unresolved proposal remains at completion.
- AS-BUILT completeness remains an instruction-level invariant: every changed code file's applicable directory/component AS-BUILT must remain sufficiently complete and accurate to reconstruct implemented reality. No new verifier merely restates this judgment requirement.
- Web performs final outcome/system verification; local implementation and lead review do not claim web or human acceptance.
- There is no mandatory push-every-commit, handoff-only commit, finalization, archive move, package generation/application, retry-count, snapshot, or lifecycle ceremony. Useful checks and durable records still accompany the implementation facts they describe.

## Branch authority

- `developer` is the active implementation branch.
- `main` advances only through explicit human-approved exact-SHA promotion.
- `web-orchestration` is a separate retained branch for orchestration/installation continuity and is not a root path in the developer tree or active implementation truth.
