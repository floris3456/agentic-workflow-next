# Template-maintenance task record

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Status

in_progress — direct-host migration plan aligned with Dual developer and persistent-memory sequencing; runtime/source migration not yet implemented

## Task-start template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Review-base template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Public-safe task brief

Migrate `floris3456/agentic-workflow-next` from the copied GitHub-Issue/OpenCode bridge transport to a direct-host architecture using authorized Remote Desktop Commander access plus native OpenCode sessions. Remove runtime and transport mechanisms that existed only because the web orchestrator could not directly reach the host, while preserving remote-Git authority, exact-SHA verification, canonical CI, no-replay recovery, public-safety boundaries, and human-only `main` promotion.

Preserve `floris3456/agentic-workflow-template` as the legacy bridge edition unless the human explicitly requests changes there. Do not modify or promote `main` under this task without separate exact-SHA human approval.

### Responsibility boundary

This record owns **runtime/transport migration**:

- establish independent `agentic-workflow-next` local worktrees and canonical identity;
- select/prove the compatible direct-host OpenCode runtime substrate;
- prove direct Commander/native OpenCode session execution and same-session interaction;
- prove direct interruption/timeout reconciliation without duplicate mutation;
- remove GitHub-Issue bridge transport/runtime and bridge-only host administration after the replacement architecture is proven;
- remove the package-generation Action broker after direct tracked generation is proven;
- update runtime-facing architecture, tests, and validators for the retained system.

This record does **not** own:

- the Dual lead -> Spark developer architecture, which is owned by `TEMPLATE-DUAL-DEVELOPER-001`;
- persistent AgentMemory/shared-isolated recall/context reconstruction, which is owned by `TEMPLATE-AGENT-MEMORY-001`;
- general instruction/lifecycle/reviewer/route semantics, which are owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

Do not duplicate those task records' model roles, route policy, proposed-deviation rules, task-record/task-progress semantics, review split, memory precedence, handoff/checkpoint, durable-record, package-trigger, or validator-design semantics here.

The migration now has an explicit staged dependency chain rather than a circular bootstrap:

1. **Direct-host base proof:** this task proves the new host/OpenCode substrate while the bridge remains intact.
2. **Dual developer proof:** `TEMPLATE-DUAL-DEVELOPER-001` proves the lead -> Spark developer and preserves `small`/`heavy` as separate small-task routes.
3. **Memory/context proof:** `TEMPLATE-AGENT-MEMORY-001` adds attributed persistent memory and deterministic context reconstruction after Dual works without it.
4. **Instruction/validator cutover:** `TEMPLATE-INSTRUCTION-MINIMALISM-001` makes the proven route/review/memory/context semantics operative and migrates validators atomically.
5. **Representative direct-path proof and destructive retirement:** one real task succeeds through the new operative architecture, then this task removes bridge/runtime/broker machinery only after independent evidence shows it is no longer required.

The private fixed-operation host adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001`. It is optional future work and must not block this migration.

Scout extraction, general Workspace Maintenance redesign, imported-history cleanup, package release/application, and archival are not prerequisites for the core direct-host migration unless a later accepted task-record explicitly makes them so. Bridge-specific Workspace operations, tests, docs, and validators remain in scope when they exist only to administer the obsolete transport.

## Current objective

Complete the migration without deleting the old transport before the entire replacement stack has been independently proven.

### Stage 1 — prove the direct-host substrate with the bridge intact

Prove the smallest runtime foundation required by later tasks:

```text
Web orchestrator
├─ GitHub -> authoritative refs, ranges, CI/status evidence
└─ Remote Desktop Commander -> verified new-repository worktree + native OpenCode session/runtime

GitHub Actions -> independent validation of exact pushed SHAs
Human -> only authority accepting one exact reviewed developer SHA into main
```

Stage 1 must prove:

- new-repository worktree/canonical identity;
- one selected/pinned compatible OpenCode runtime;
- start/continue/control of a native primary developer session;
- structured question/permission handling without broad auto-approval;
- interruption/timeout/no-replay reconciliation;
- exact commit/push, remote readback, and canonical CI;
- no private host/session/process/device/provider/credential data persisted to Git.

Stage 1 does not need to implement the final Dual topology or AgentMemory. It proves the substrate those tasks consume. Do not remove bridge/runtime code during this proof.

Before normal broad direct-host mutation or destructive bridge retirement, independently prove that GitHub server-side controls protect `main` from unauthorized/direct mutation. Local hooks are defense in depth, not the only protection. If adequate server-side protection cannot be proven or established under existing authority, that becomes a named human-owned risk decision rather than an implementation assumption.

### Stage 2 — Dual developer proof

After Stage 1, `TEMPLATE-DUAL-DEVELOPER-001` proves the new default substantive developer:

- lead developer performs deep implementation analysis, detailed Spark instruction, review, and steering;
- Spark performs fast editing/testing and may propose, but not silently apply, departures from lead instructions;
- `small` remains a simple-task shortcut;
- `heavy` remains a difficult/important-small-task shortcut;
- neither `small` nor `heavy` substitutes for Spark inside `dual`.

The bridge remains available while this is proven.

### Stage 3 — persistent memory/context proof

After Dual works without memory, `TEMPLATE-AGENT-MEMORY-001` proves stable-role memory attribution, shared/isolated recall, privacy filtering, and deterministic context reconstruction that removes routine compaction dependence. Memory failure must degrade safely to Git-backed durable truth.

The bridge still remains available.

### Stage 4 — instruction/validator cutover

After Stages 1-3 are proven, `TEMPLATE-INSTRUCTION-MINIMALISM-001` changes operative web/developer/template instructions and validators so the new direct-host/Dual/memory/context architecture is the normal path. The bridge remains physically present during this semantic cutover.

### Stage 5 — representative proof and destructive retirement

Run one representative substantive task through the operative `dual` path with lead review, web final verification, attributed memory/context reconstruction as applicable, exact remote evidence, and canonical CI while bridge runtime is still present but unused.

Only after independent review confirms there is no required bridge dependency may this task remove the obsolete bridge control plane, bridge-only host administration, and package Action broker without rebuilding their complexity elsewhere.

## Current position

The new repository is a full Git copy but is not yet operationally independent because its maintenance provenance still names the original repository. Direct host access and native OpenCode are available, but the copied operative instructions/runtime still describe the GitHub-Issue bridge and the current developer architecture still has only single-model `small`/`heavy` routes.

Exact source heads at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

The copied `source-lock.json` still names `https://github.com/floris3456/agentic-workflow-template.git` and records older developer/web source SHAs. Correcting canonical identity is part of this task.

Independent architecture review first replaced the circular direct-host/instruction bootstrap with a proof/cutover/retirement sequence. A later accepted architecture change introduced the Dual developer and AgentMemory/context reconstruction, so the sequence now explicitly proves those capabilities between the base direct-host proof and semantic cutover.

## Source ranges

No runtime/source implementation ranges yet.

Task-start heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

## Observed

- Remote Desktop Commander provides terminal/filesystem execution, Git network access, and authenticated GitHub access on the authorized host.
- Native OpenCode supports direct run/session/continue/interactive operation. The observed host CLI is `1.18.18`; copied bridge/Scout assets reference `1.18.16`, so one compatible version must be selected and proven for the direct path.
- The existing bridge routes ChatGPT through public GitHub control issues, a GitHub App bridge, and local OpenCode HTTP/SSE/WebSocket APIs. That transport is no longer needed for the new repository once the full direct architecture is proven and adopted by the instruction layer.
- Bridge-specific issue UUID/sequence/lifecycle/recovery, public projection/outbox, and host daemon administration exist primarily to compensate for the old connectivity constraint.
- The package-generation Action broker similarly exists to provide a networked generator surface that direct host access can replace after direct tracked generation is proven.
- The tracked change-package generator, canonical GitHub Actions validation, exact-SHA status reporting, guarded promotion, remote-Git authority, and no-replay principle remain independently useful.
- Current branch metadata reports `protected: false` for `main`; repository-ruleset status has not been independently proven through the available connected endpoint. Therefore server-side `main` protection remains an explicit Stage 1/Stage 5 verification requirement, not an assumed fact.
- The new `dual` route, AgentMemory integration, and context-reconstruction runtime are planned but not implemented. They must be proven before bridge retirement because the final operative architecture depends on them.

## Interpretation

### Runtime to remove after full cutover proof

1. GitHub Issues as an OpenCode command/request bus, including control labels, hidden command/request markers, UUID/sequence protocol, issue-task binding, polling, mailbox, and issue-based question/permission relay.
2. The outbound GitHub App bridge daemon, durable command ledger, outbox/public projection, heartbeat/admin lifecycle, and bridge-specific reconciliation.
3. Generic OpenCode HTTP/SSE/PTY parity and compatibility machinery maintained only for the bridge transport.
4. Bridge-specific recovery/status operations whose only purpose is the public transport.
5. The write-capable package-generation Action broker and its request-processing surface, after direct execution of the tracked generator with canonical network access is proven.
6. Workspace bridge-host administration functions whose only purpose is starting/inspecting/reconciling the retired bridge.
7. Runtime tests/docs/validators whose only contract is the retired bridge.

### Runtime to retain

- exact remote Git as authoritative repository evidence;
- canonical push-triggered GitHub Actions and exact-SHA status visibility;
- direct native OpenCode execution with `dual` as the normal substantive developer plus specialized single-model `small` and `heavy` routes as defined by the instruction/Dual records;
- same-session question/permission/steering capability without broad auto-approval;
- the proven AgentMemory/context-reconstruction runtime defined by `TEMPLATE-AGENT-MEMORY-001`, without making memory authoritative over Git-backed durable truth;
- tracked change-package generation/provenance code, without making package creation part of source completion unless separately requested;
- guarded exact-SHA promotion with human-only authority;
- public-safety/private-runtime-data boundaries;
- no automatic replay after uncertain interruption.

Instruction semantics for selecting/using these retained capabilities are owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

### Direct-host recovery contract to prove

The direct path must support one tool-neutral no-replay rule:

- after timeout, disconnect, unknown response, failed publication, or another ambiguous mutation result, do not repeat the mutation automatically;
- first reconcile the existing process/session plus local worktree/Git state and exact remote Git state;
- if the original effect is still active or already completed, continue/review that effect rather than creating another one;
- replace or retry only after evidence proves the original effect absent or impossible to continue;
- unresolved ambiguity blocks only dependent mutation until reconciled.

The runtime proof belongs here. Concise instruction wording belongs to `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

### Package boundary

The deterministic package generator and provenance contract are retained. This task removes only the Action/request broker after direct canonical generation is proven. Whether a package is required for a particular maintenance outcome is an instruction/task-record decision owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`, not a runtime requirement of this migration.

## Attempts

- Audited the copied bridge, web workflow/recovery, package broker, Scout boundary, Workspace boundary, canonical CI, package generator, and source-lock behavior.
- Verified direct-host capability and native OpenCode CLI exist.
- Split the private adapter into `TEMPLATE-DIRECT-HOST-ADAPTER-001`.
- Split instruction/lifecycle redesign into `TEMPLATE-INSTRUCTION-MINIMALISM-001`.
- Independently reviewed the original two active plans and removed their circular bootstrap.
- Incorporated the later accepted Dual developer and AgentMemory/context-reconstruction architecture as explicit intermediate proof stages instead of letting either silently expand this runtime task's ownership.
- No runtime/source migration or `main` mutation has been performed under this task.

## Changed approach

The initial record attempted to preserve and migrate too many adjacent systems at once and duplicated instruction redesign details. It was first narrowed to direct-host runtime transition and then staged so capability proof precedes semantic cutover and destructive retirement.

The latest architecture adds two explicit intermediate proofs:

- prove the Dual developer on top of the direct-host substrate; and
- prove AgentMemory/context reconstruction on top of a working Dual developer.

This record remains the runtime substrate/retirement bookend. It does not absorb those tasks merely because they must complete before the old bridge can be removed.

Scout extraction and general Workspace redesign remain outside core completion. Bridge-specific Workspace administration remains in scope because it is part of the obsolete transport implementation.

## Checks

- Exact task-start source heads were independently read from GitHub.
- Current live `main`, `developer`, `web-orchestration`, and `template-development` heads were re-read before the latest planning amendments.
- Current `source-lock.json` was confirmed to still reference the original repository.
- Direct host/OpenCode capability was confirmed available before designing the replacement path.
- Current branch metadata was checked for `main`; server-side ruleset protection remains unproven and therefore required acceptance evidence rather than an assumption.
- Current small/heavy developer topology and the newly accepted Dual/memory task ownership were reviewed for sequencing.
- No source/runtime files have been changed by planning commits for this task.

## Blockers / required decisions

No human decision blocks the bounded Stage 1 base capability proof.

Normal broad direct-host mutation and destructive bridge retirement must not proceed until server-side `main` protection is independently proven. If adequate protection is not present or cannot be established under existing authority, the resulting named residual risk requires a human decision.

Before bridge removal is considered complete, prove:

1. independent new-repository worktrees and canonical identity;
2. one selected/pinned compatible OpenCode version for the direct path;
3. direct primary session start/continuation and structured question/permission handling;
4. interruption/timeout reconciliation without duplicate mutation;
5. exact push, remote readback, and canonical CI on the resulting SHA;
6. no private host/session/process/device/provider/credential data persisted to Git;
7. server-side `main` protection independent of local hooks;
8. `TEMPLATE-DUAL-DEVELOPER-001` has proven the final developer topology, including no silent Spark replacement by small/heavy;
9. `TEMPLATE-AGENT-MEMORY-001` has proven attributed memory/context reconstruction and safe memory failure behavior;
10. `TEMPLATE-INSTRUCTION-MINIMALISM-001` has made the new architecture operative and removed required bridge dependence from instructions/validators;
11. one representative substantive task has succeeded through the operative `dual` path before destructive retirement.

## Remaining work

1. Establish separate `agentic-workflow-next` clone/worktrees and verify origin/branch/HEAD/status.
2. Correct canonical repository identity/source metadata for the new repository.
3. Independently prove or establish server-side `main` protection before normal broad host mutation.
4. Select/prove the OpenCode runtime and direct primary session start, continuation, structured interaction, and no-replay reconciliation while the bridge remains intact.
5. Prove one end-to-end direct native OpenCode -> meaningful commit -> push -> GitHub exact readback -> canonical CI cycle without using the bridge as transport.
6. Hand the proven Stage 1 substrate to `TEMPLATE-DUAL-DEVELOPER-001`; do not delete bridge code.
7. After Dual proof, hand execution to `TEMPLATE-AGENT-MEMORY-001`; keep the bridge intact.
8. After memory/context proof, hand the proven capability set to `TEMPLATE-INSTRUCTION-MINIMALISM-001` for the semantic/design/template/validator cutover; keep bridge code present during that cutover.
9. Run a representative substantive task through the operative `dual` workflow and independently confirm the bridge is not required for normal execution/recovery/context continuity.
10. Remove GitHub-Issue bridge transport/runtime/protocol/recovery/projection code and bridge-only host administration, including bridge-specific Workspace operations/docs/tests/validators.
11. Prove direct execution of the tracked change-package generator with canonical network access, then remove the package-generation Action/request broker while retaining generator/provenance code.
12. Update runtime architecture/security/docs/tests/validators for behavior actually retained, including new direct-host/Dual/memory runtime facts.
13. Run focused checks plus canonical push-triggered validation and independently review exact remote ranges.
14. Stop when the requested source migration is proven. Package release/application, historical cleanup, Scout/general Workspace redesign, archival, and `main` promotion remain separate outcomes unless explicitly requested.

## Next action

Begin Stage 1 only: establish the independent new-repository worktrees/canonical identity and prove the bounded direct-host/OpenCode substrate, no-replay recovery, push/readback, CI, and server-side `main` protection requirements while leaving the existing bridge intact. After that proof, pause destructive runtime changes and hand execution to `TEMPLATE-DUAL-DEVELOPER-001`.

## Relevant durable records

- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- `source-lock.json`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/opencode-bridge.md`
- developer `tools/opencode-bridge/**`
- developer `docs/architecture/branch-workflow.md`
- developer `opencode.json`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- template-development package-generator and package-broker assets
- template-development Workspace bridge-host administration assets

## Last handoff commit

None
