# Template-maintenance task progress

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Status

in_progress — migration analysis recorded; no source behavior has been changed by this task yet

## Task-start template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Review-base template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Public-safe task brief

Migrate `floris3456/agentic-workflow-next` from the copied GitHub-Issue/OpenCode bridge architecture to a direct-host orchestration architecture that uses the authorized Remote Desktop Commander capability for local repository and OpenCode access. Remove transport and fallback mechanisms that only existed because the web orchestrator previously lacked direct host access, while retaining the independent safety, authority, review, Scout, Workspace, provenance, CI, task-continuity, no-replay, and exact-SHA promotion boundaries that remain useful.

This task applies to `agentic-workflow-next`. Preserve the original `agentic-workflow-template` repository as an independent historical/legacy implementation unless the human explicitly requests changes there. Do not modify or promote `main` as part of this migration without separate exact-SHA human approval.

The intended target architecture is:

```text
Web orchestrator
├─ connected/public GitHub -> authoritative refs, diffs, review, CI, bounded remote edits
└─ authorized direct host connector -> verified worktrees, local tests, direct OpenCode
   ├─ small/heavy developer
   ├─ hardened read-only Scout
   └─ Workspace Maintenance

GitHub Actions -> independent clean validation of exact pushed SHAs
Human -> only authority that accepts one exact reviewed developer SHA into main
```

Do not create a dual control plane in the new repository. GitHub Issues remain ordinary project artifacts, not an OpenCode RPC bus.

## Current objective

Turn the completed architectural analysis into a safe implementation migration for `agentic-workflow-next`: first make the copied repository independently canonical and establish a dedicated local checkout/worktree set, then replace bridge transport with direct Remote Desktop Commander plus native OpenCode session control, retain and extract the useful Scout and Workspace security boundaries, remove the obsolete package broker and bridge administration surfaces, update all branch-specific instructions/validators/documentation, and prove the replacement end-to-end before deleting the old transport implementation from this repository. A proposed private fixed-operation direct-host adapter is intentionally out of scope for this task and is preserved separately under `TEMPLATE-DIRECT-HOST-ADAPTER-001`.

## Current position

The new repository is a full Git copy with exact imported branch heads, but it is not yet operationally independent because its maintenance provenance still names the original repository. The architectural inventory is complete enough to begin a bounded migration task, but no source-removal or replacement implementation has been performed yet.

Exact live refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

The copied `source-lock.json` still names `https://github.com/floris3456/agentic-workflow-template.git` as canonical and still records older developer/web source SHAs. This mismatch is intentionally left unchanged in this task-record-only commit and must be corrected before direct package generation in the new repository.

## Source ranges

No implementation ranges yet.

Task-start source heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

`main` remains unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- Remote Desktop Commander provides a working terminal/filesystem execution surface with Git network access and authenticated GitHub SSH, removing the original inability to reach the local OpenCode/repository host directly.
- A native OpenCode CLI is available on the authorized host and supports direct `run`, `--agent`, `--session`, `--continue`, `--fork`, `--attach`, interactive operation, and session management. The observed global CLI version is `1.18.18`; the copied repository bridge/Scout contracts currently pin `1.18.16`.
- The existing bridge architecture explicitly routes ChatGPT through public GitHub control issues, an outbound GitHub App bridge, and the local OpenCode HTTP/SSE/WebSocket server. That transport is no longer required in the new repository when the direct host connector is available.
- The current web workflow and recovery Source contain substantial bridge-specific issue/UUID/sequence/status/publication procedure. The task-context template also stores bridge-control fields that become unnecessary under direct private session continuity.
- The developer branch contains a large `tools/opencode-bridge` implementation plus bridge contracts, tests, bootstrap/status/watcher scripts, architecture, and validators. Much of this is transport and durability code rather than core implementation authority.
- The hardened Scout boundary is materially different from the GitHub transport: it uses an exact Git-object snapshot, rejects unsafe Git structures, runs from an external sterile runtime, treats repository instructions as evidence, and exposes only contained read/glob/grep tools. Those protections remain useful with direct host access.
- Workspace Maintenance likewise contains useful independent safety: registered-worktree verification, exact HEAD/status preflight, stable template-development instruction authority, networkless sandbox execution, bounded mutation, mechanical `main` denial, and exact publication readback. These controls remain useful.
- Workspace Maintenance also contains bridge-specific host administration tools (`workspace_bridge_inspect`, `workspace_bridge_start`, `workspace_bridge_reconcile`) that become obsolete when host administration belongs to the web orchestrator through the direct host connector.
- `template-development` contains a write-capable package-generation GitHub Action plus package-request processor/validator/test/documentation. This broker was added only to provide a legitimate networked generator execution surface when the orchestrator lacked one; the direct host connector now provides that surface.
- The tracked change-package generator itself remains valuable. It validates canonical repository identity, performs fresh canonical fetches, proves exact reviewed range ancestry, excludes `changes/**` from portable template patches, binds provenance/digests, and supports validated supersession.
- Canonical GitHub Actions validation remains independently valuable because it proves that the exact pushed remote SHA passes repository-owned checks on a clean runner. Direct host access improves development/diagnosis but does not replace independent remote validation.
- Exact-SHA commit-status publication remains a useful lightweight observability layer for canonical CI and is not equivalent to the obsolete package-generation Action broker.
- The copied repository contains many historical/not-yet-finalized task records and packages originating from the original canonical repository. They must not silently become active task state or package lineage for the new canonical repository.

## Interpretation

### Implementation route preference

For normal or nontrivial implementation, prefer Remote Desktop Commander against the verified local worktree because it provides surrounding repository context, multi-file editing, search, `git diff`, local tests, generators, and normal commit/push behavior in one execution surface. Use direct GitHub mutation only when the change is tiny and precisely known, the exact paths and edits are already established, no local-only tooling or broad context is needed, and remote write/readback is simpler than using the worktree.

Commander implementation and direct GitHub mutation are alternative mutating routes for the same work; do not overlap them. After Commander work is pushed, use GitHub as the independent exact-SHA evidence route to verify the remote head, changed range, and canonical CI. This routing preference does not change authority: remote Git remains authoritative, and local worktree or agent output remains implementation evidence only.

### Obsolete in `agentic-workflow-next`

Remove after the direct replacement is proven:

1. GitHub Issues as an OpenCode command bus: control issues, control labels, hidden command/request markers, public command UUIDs/sequences, issue-to-task binding, bridge-bot result authentication, issue polling/ETag pagination, issue-based question/permission replies, and bridge status requests.
2. The outbound GitHub App bridge daemon and its public transport durability: command ledger, public outbox, issue result delivery, bridge heartbeat/admin lifecycle, and public alias/projection machinery whose purpose is to publish private local OpenCode state safely into GitHub Issues.
3. Generic bridge OpenCode HTTP/SSE/PTY parity and the full operation-manifest compatibility layer for normal developer control. Direct orchestration should use the native OpenCode CLI/session interface instead of maintaining an RPC proxy over every OpenCode operation.
4. Bridge-specific recovery mechanics such as `command.status`, `task.status`, bridge lifecycle states, duplicate-control-issue recovery, outbox replay control, and bridge restart reconciliation. Preserve the generic no-replay principle in a new direct-session recovery procedure.
5. The package-generation Action broker and its request schema/processor/validator/tests/docs. The normal canonical validation Actions remain.
6. Workspace bridge-host administration tools and host bridge registry/systemd/admin-socket machinery.
7. Bridge-specific public task-context fields and journals.

### Retain

Keep and adapt:

1. Remote Git as authoritative repository evidence; local worktrees and agent output remain implementation evidence only.
2. Human-only exact-SHA acceptance/promotion to `main`.
3. Web-orchestrator ownership of reasoning, route choice, independent review, claim-first blocker analysis, and final completion reconciliation.
4. Public routing vocabulary `small` / `heavy`; provider/model details remain internal implementation configuration.
5. Developer authority boundaries: implementation only, no self-acceptance, no subagents, no self-selected escalation, public-safe task-progress/AS-BUILT/deviation updates, exact pushed handoff SHA.
6. Developer task-progress and six-field handoff as compaction/replacement/review continuity.
7. Canonical push-triggered GitHub Actions validation and the exact-SHA status surface.
8. Hardened Scout isolation, rewritten so direct host orchestration launches the trusted Scout runtime without GitHub-Issue transport. A developer agent still must not launch Scouts.
9. Workspace Maintenance worktree verification, target-rule-as-evidence semantics, networkless command sandbox, bounded write/delete, exact preflight, mechanical `main` denial, fixed publication, and one Workspace handoff.
10. Deterministic change packages, canonical provenance, supersession validation, downstream application, and source-lock semantics.
11. No-replay recovery: an interrupted/timed-out host or OpenCode action is ambiguous until the existing process/session, local Git, and remote Git state prove the outcome. Never start a replacement session or repeat a mutation merely because one tool call failed to return cleanly.

### Deferred direct-host adapter

A private fixed-operation adapter that narrows normal Commander/OpenCode operations is intentionally out of scope for this migration. Preserve the idea under the separate queued task `TEMPLATE-DIRECT-HOST-ADAPTER-001`; do not make completion of this migration depend on implementing that adapter.

For this task, use direct Commander plus native OpenCode session controls while retaining the existing hard boundaries: exact worktree/ref verification before mutation, web-only `small`/`heavy` route choice, one mutating route per worktree, private treatment of host/session/process identifiers, no broad auto-approval, same-session continuation, no automatic replay after ambiguous interruption, exact remote Git review, and human-only `main` promotion.

### Required instruction changes

- Permanent web instructions: replace bridge/issue transport rules with direct-host capability rules; explicitly state that host paths, device IDs, process IDs, session IDs, credentials, provider metadata, and raw local output are private and must not be persisted.
- `skill-workflow.md`: replace issue-based Scout/developer delegation with verified worktree preflight plus direct private OpenCode session start/continue/answer/steer/reconcile. Keep exact remote review and small/heavy routing.
- `skill-recovery.md`: rewrite around existing host process/session inspection, private session mapping, worktree/Git state, remote refs, and no-replay reconciliation. Keep ordinary connector-publication recovery only where a real GitHub write is involved.
- `skill-template-maintenance.md`: make direct host/Workspace execution and direct tracked package generation the normal local route; remove package-request/broker fallback from this repository.
- `skill-promotion.md`: remove control-issue/bridge command steps; after exact human approval, use the authorized host connector to invoke the guarded repository promotion script and then independently verify remote refs/parents/tree.
- `skill-prompt-creation.md`: prevent prompts from leaking or prescribing private host/session/device identifiers unless that transport itself is the subject.
- Project installation README: remove GitHub App/control-label/bot/bridge setup; add direct host connector, dedicated clone/worktrees, private host configuration, pinned OpenCode, direct-developer acceptance, Scout isolation acceptance, Workspace verification, GitHub evidence, and canonical CI setup. Do not introduce a global MCP/Commander operating mode.
- Developer agent files: keep role boundaries; change bridge-specific structured-question wording so the question remains pending in the same private OpenCode session for direct response.
- Workspace agents/skill/plugin: remove all `workspace_bridge_*` tools/permissions. Explicitly state that Remote Desktop Commander host administration is outside Workspace-agent authority.

### Expected source removals/rewrites

Developer branch, after Scout extraction/direct-host replacement:

- retire `contracts/opencode-bridge/**` and most/all of `tools/opencode-bridge/**`;
- retire bridge bootstrap/status/attach/watcher/validator scripts whose only purpose is the GitHub-Issue bridge;
- retire `docs/architecture/opencode-bridge.md` as current architecture and replace it with direct-host architecture documentation;
- update README, SECURITY, AGENTS, AS-BUILT, agent-system/design records, repository validators, and canonical CI so they validate the new direct route and extracted Scout rather than the bridge.

Web-orchestration branch:

- rewrite `developer-instructions.md`, `skill-workflow.md`, `skill-recovery.md`, `skill-template-maintenance.md`, `skill-promotion.md`, README, task-context template, package validator, and tests to remove bridge protocol/control-issue assumptions and add direct-host/session no-replay/private-identifier rules.

Template-development branch:

- remove `.github/workflows/generate-change-package.yml`, package-request library/processor/validator/test/docs, and package-generation-broker architecture;
- remove Workspace bridge-host administration implementation/tests/docs;
- retain and update change-package generator/core and Workspace base/common/sandbox/publish tools;
- update Workspace publication to support the selected safe Git transport. The current publisher accepts canonical GitHub HTTPS for real publication while the demonstrated host Git authentication is SSH, so either strict GitHub SSH support must be added or an explicitly safe HTTPS credential route must be configured and validated.

### Imported history/package treatment

The old repository remains in Git history and the imported packages remain historical evidence of the original canonical repository. Do not rewrite their manifests or claim they were generated from `agentic-workflow-next`.

Before normal new-repository maintenance, design a migration for copied `docs/work/current/**` entries so unresolved/completed historical tasks do not all appear as live work. Prefer a dedicated imported-history location/index that preserves exact blobs without falsely marking unresolved tasks as normally finalized. Likewise begin a new active package lineage for the new canonical repository rather than pretending a new-repository package supersedes an original-repository package.

## Attempts

- Performed a full repository inventory across `developer`, `web-orchestration`, and `template-development` and separated transport-specific code from independent authority/security/provenance mechanisms.
- Verified the copied repository branch heads from GitHub before writing this record.
- Read the current `template-development` maintenance contract, task template, and source lock.
- Confirmed the requested task path did not already exist.
- No source implementation, package generation, downstream application, or `main` mutation has been attempted under this task.

## Changed approach

The earlier template architecture used GitHub Issues and a local outbound bridge because the web orchestrator had no direct authorized connection to the machine running OpenCode. The newly available direct host connector removes that environmental constraint. The architecture should therefore stop treating GitHub Issues as an RPC transport and should remove the newly added package-generation Action broker rather than maintain redundant execution paths.

Canonical GitHub Actions validation is deliberately retained because it provides independent clean-runner verification of exact pushed SHAs; this is a different purpose from the obsolete package broker.

Scout and Workspace hardening are also deliberately retained because their purpose is containment and authority separation, not remote transport.

The human explicitly deferred the proposed private fixed-operation direct-host adapter to a separate task. This migration therefore uses direct Commander/native OpenCode as the replacement transport and must not expand scope to build that adapter.

## Checks

- Exact GitHub branch readback at task creation:
  - `main` -> `6127611113dfdb66f93a0cfd2d355359aa370833`
  - `developer` -> `38da09b5e03a84ab08cf6728502184695f946224`
  - `web-orchestration` -> `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
  - `template-development` -> `c3203691fc2a1067c0f0a1647d2f09922ab55454`
- Current maintenance `AGENTS.md`, `.opencode/skills/template-maintenance/SKILL.md`, task template, maintainer response template, and `source-lock.json` inspected at the exact task-start template-development SHA.
- Current `source-lock.json` independently confirmed to still reference the original repository and older developer/web source refs.
- No target source files changed by this task-record creation.

## Blockers / required decisions

No human decision is required merely to preserve this migration plan.

Before consequential migration source work can be considered complete, these implementation uncertainties must be resolved and tested:

1. Create a dedicated local clone/worktree set for `agentic-workflow-next`; never repoint or reuse the original repository's live worktrees as the new repository's canonical working set.
2. Change and independently verify the new repository's canonical identity/source lock before using its package generator.
3. Reconcile the OpenCode version contract: copied runtime assets pin `1.18.16`, while the observed direct CLI is `1.18.18`. Prove the chosen version against agents, permissions, structured questions, continuation, Scout tools, Workspace plugins, and recovery before declaring the replacement compatible.
4. Prove direct structured-question and permission handling through the same OpenCode session without broad auto-approval.
5. Decide and implement the safe Workspace publication transport (strict GitHub SSH support or validated HTTPS credentials).
6. Define the exact imported-history migration for copied current task records and packages without rewriting historical truth.

## Remaining work

Implementation sequence:

1. Establish a dedicated local `agentic-workflow-next` clone and registered worktrees.
2. Re-establish exact new-repository refs and migrate canonical repository identity/source lock.
3. Choose/pin one OpenCode version and add compatibility checks.
4. Acceptance-test direct Commander/native OpenCode small/heavy developer start, structured question, permission response, same-session steering/continuation, timeout reconciliation, exact pushed handoff, and small-to-heavy route transition without overlapping mutation.
5. Extract/repackage the hardened Scout independent of the GitHub-Issue bridge and prove exact-SHA snapshot isolation, no process/network/package/LSP capability, symlink containment, and repository-instruction non-authority.
6. Update web/developer instructions for the direct-host architecture.
7. Remove GitHub-Issue bridge transport/protocol/daemon/recovery/projection code and tests from the new repository.
8. Remove Workspace bridge-host administration tools while preserving Workspace worktree/sandbox/publish safety.
9. Remove the package-generation Action broker and make direct tracked generator execution the maintenance path.
10. Update Workspace publication for the chosen Git authentication path.
11. Migrate imported task/package active-state presentation without rewriting historical blobs/manifests.
12. Update AS-BUILT, architecture, design, deviations, SECURITY/README, branch validators, web package validator/tests, and canonical CI.
13. Run proportional local tests plus full affected repository validation through the direct host capability.
14. Push exact source branches, independently review exact remote ranges, and require fresh canonical push-CI results.
15. Generate and validate the migration change package directly on the authorized maintainer host.
16. Finalize/archive this task only after exact source/package/downstream review required by the maintenance contract. Do not promote `main` without separate human exact-SHA approval.

Required replacement acceptance includes at minimum:

- small and heavy developer start only through web-selected public routing;
- same-session question/permission response and steering;
- private host/session/process identifiers never persisted;
- timeout/interruption reconciliation without duplicate mutation;
- exact remote pushed handoff and canonical CI visibility;
- synchronization recovery on failed push;
- hardened Scout isolation and no developer-launched Scout;
- Workspace target-authority separation and publication;
- deterministic provenance-verified direct package generation;
- exact human-approved promotion with no content mutation;
- no private host path, process/session/device identifier, provider metadata, or credential persisted to Git.

## Next action

Create a completely separate local clone/worktree set for `floris3456/agentic-workflow-next`, verify it is clean and synchronized to the exact remote branch heads recorded above, then make the smallest `template-development` migration that changes the canonical repository identity/source snapshot to the new repository before any direct package generation or cross-branch source implementation.

## Relevant durable records

- `AGENTS.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `.opencode/skills/workspace-maintenance/SKILL.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/agents/workspace-maintainer.md`
- `source-lock.json`
- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `scripts/apply-change-package.mjs`
- `scripts/workspace-maintenance-*.mjs`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/opencode-bridge.md`
- developer `tools/opencode-bridge/**`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- web `web-orchestration-only/task-context/TEMPLATE.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md` (separate queued follow-up; out of scope here)

## Last handoff commit

None
