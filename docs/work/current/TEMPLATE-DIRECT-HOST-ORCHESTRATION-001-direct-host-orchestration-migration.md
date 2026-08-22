# Template-maintenance task record

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Status

in_progress — direct-host migration plan hardened; runtime/source migration not yet implemented

## Task-start template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Review-base template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Public-safe task brief

Migrate `floris3456/agentic-workflow-next` from the copied GitHub-Issue/OpenCode bridge transport to a direct-host architecture using authorized Remote Desktop Commander access plus native OpenCode sessions. Remove runtime and transport mechanisms that existed only because the web orchestrator could not directly reach the host, while preserving remote-Git authority, exact-SHA review, canonical CI, no-replay recovery, public-safety boundaries, and human-only `main` promotion.

Preserve `floris3456/agentic-workflow-template` as the legacy bridge edition unless the human explicitly requests changes there. Do not modify or promote `main` under this task without separate exact-SHA human approval.

### Responsibility boundary

This record owns **runtime/transport migration**:

- establish independent `agentic-workflow-next` local worktrees and canonical identity;
- prove direct Commander/native OpenCode execution and same-session interaction;
- prove direct interruption/timeout reconciliation without duplicate mutation;
- remove GitHub-Issue bridge transport/runtime and bridge-only host administration;
- remove the package-generation Action broker after direct tracked generation is proven;
- update runtime-facing architecture, tests, and validators for the retained system.

This record does **not** own the general instruction/lifecycle redesign. That is owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`. Do not implement or duplicate its task-record/task-progress, handoff, route-selection, push/checkpoint, durable-record, package-trigger, or validator-design semantics here.

The two tasks have an explicit staged boundary rather than a circular dependency:

1. **Direct-host capability proof:** this task proves the new host/runtime path while the existing bridge remains intact and available as rollback evidence.
2. **Instruction/validator cutover:** `TEMPLATE-INSTRUCTION-MINIMALISM-001` changes operative instructions and validators so normal work no longer requires the bridge.
3. **Destructive retirement:** this task resumes and removes bridge/runtime/broker machinery only after the new instruction path has been proven without bridge dependence.

The private fixed-operation host adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001`. It is optional future work and must not block this migration.

Scout extraction, general Workspace Maintenance redesign, imported-history cleanup, package release/application, and archival are not prerequisites for the core direct-host migration unless a later accepted task-record explicitly makes them so. Bridge-specific Workspace operations, tests, docs, and validators are in scope when they exist only to administer the obsolete bridge.

## Current objective

Complete the migration in three stages without creating a hybrid architecture that deletes the old path before the new one is independently proven.

### Stage 1 — prove direct-host capability with the bridge intact

Prove the smallest complete direct-host loop:

```text
Web orchestrator
├─ GitHub -> authoritative refs, diffs, review, CI
└─ Remote Desktop Commander -> verified worktree + native OpenCode small/heavy

GitHub Actions -> independent validation of exact pushed SHAs
Human -> only authority accepting one exact reviewed developer SHA into main
```

Stage 1 must prove worktree identity, one selected OpenCode version, small/heavy session operation, same-session questions/permissions/steering, no-replay recovery, exact push/readback, and canonical CI. Do not remove bridge/runtime code during this proof.

Before normal broad direct-host mutation or destructive bridge retirement, independently prove that GitHub server-side controls protect `main` from unauthorized/direct mutation. Local hooks are defense in depth, not the only protection. If server-side protection cannot be proven, that becomes a named human-owned risk decision rather than an implementation assumption.

### Stage 2 — instruction/validator cutover

After Stage 1 is proven, `TEMPLATE-INSTRUCTION-MINIMALISM-001` changes the operative workflow and validators so direct-host operation is the normal path and the old bridge is no longer required. The bridge remains physically present during this semantic cutover.

### Stage 3 — destructive retirement

After a representative task succeeds through the new path and independent review confirms there is no required bridge dependency, remove the obsolete bridge control plane, bridge-only host administration, and package Action broker without rebuilding their complexity elsewhere.

## Current position

The new repository is a full Git copy but is not yet operationally independent because its maintenance provenance still names the original repository. Direct host access and native OpenCode are available, but the copied operative instructions and runtime still describe the GitHub-Issue bridge.

Exact source heads at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

The copied `source-lock.json` still names `https://github.com/floris3456/agentic-workflow-template.git` and records older developer/web source SHAs. Correcting canonical identity is part of this task.

An independent architecture/reliability review of the current plan found that the main remaining design risk is sequencing: the direct-host record previously asked to implement enough instruction redesign to start itself, while the instruction task relied on direct-host capabilities. The staged boundary above removes that circular bootstrap.

## Source ranges

No runtime/source implementation ranges yet.

Task-start heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

## Observed

- Remote Desktop Commander provides terminal/filesystem execution, Git network access, and authenticated GitHub access on the authorized host.
- Native OpenCode supports direct run/session/continue/interactive operation. The observed host CLI is `1.18.18`; copied bridge/Scout assets reference `1.18.16`, so one compatible version must be selected and proven for the direct path.
- The existing bridge routes ChatGPT through public GitHub control issues, a GitHub App bridge, and local OpenCode HTTP/SSE/WebSocket APIs. That transport is no longer needed for the new repository once the direct path is proven and adopted by the instruction layer.
- Bridge-specific issue UUID/sequence/lifecycle/recovery, public projection/outbox, and host daemon administration exist primarily to compensate for the old connectivity constraint.
- The package-generation Action broker similarly exists to provide a networked generator surface that direct host access can replace after direct tracked generation is proven.
- The tracked change-package generator, canonical GitHub Actions validation, exact-SHA status reporting, guarded promotion, remote-Git authority, and no-replay principle remain independently useful.
- Current branch metadata reports `protected: false` for `main`; repository-ruleset status has not been independently proven through the available connected endpoint. Therefore server-side `main` protection is an explicit Stage 1/Stage 3 verification requirement, not an assumed fact.

## Interpretation

### Runtime to remove after cutover proof

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
- native `small` / `heavy` OpenCode developer routes selected by the web orchestrator;
- same-session question/permission/steering capability without broad auto-approval;
- tracked change-package generation/provenance code, without making package creation part of source-completion unless separately requested;
- guarded exact-SHA promotion with human-only authority;
- public-safety and private-runtime-data boundaries;
- no automatic replay after uncertain interruption.

Instruction semantics for how these retained capabilities are selected and used are owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

### Direct-host recovery contract to prove

The direct path must support one tool-neutral no-replay rule:

- after timeout, disconnect, unknown response, failed publication, or another ambiguous mutation result, do not repeat the mutation automatically;
- first reconcile the existing process/session plus local worktree/Git state and exact remote Git state;
- if the original effect is still active or already completed, continue/review that effect rather than creating another one;
- replace or retry only after evidence proves the original effect absent or impossible to continue;
- unresolved ambiguity blocks only dependent mutation until reconciled.

The runtime proof belongs here. The concise instruction wording belongs to `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

### Package boundary

The deterministic package generator and provenance contract are retained. This task removes only the Action/request broker after direct canonical generation is proven. Whether a package is required for a particular maintenance outcome is an instruction/task-record decision owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`, not a runtime requirement of this migration.

## Attempts

- Audited the copied bridge, web workflow/recovery, package broker, Scout boundary, Workspace boundary, canonical CI, package generator, and source-lock behavior.
- Verified the direct-host capability and native OpenCode CLI exist.
- Split the private adapter into `TEMPLATE-DIRECT-HOST-ADAPTER-001`.
- Split instruction/lifecycle redesign into `TEMPLATE-INSTRUCTION-MINIMALISM-001` so this record no longer owns those semantics.
- Independently reviewed the two active plans together and replaced their circular bootstrap with the three-stage proof/cutover/retirement sequence.
- No runtime/source migration or `main` mutation has been performed under this task.

## Changed approach

The initial record attempted to preserve and migrate too many adjacent systems at once and duplicated instruction redesign details. The plan first narrowed this task to direct-host runtime transition, then an independent review found that the two tasks still depended on each other to start.

The corrected approach is now deliberately asymmetric: this task can perform a bounded, non-destructive capability proof under the current system; the instruction task then performs the semantic/validator cutover; only afterward does this task perform destructive bridge retirement.

Scout extraction and general Workspace redesign remain outside the core completion requirements. Bridge-specific Workspace administration remains in scope because it is part of the obsolete transport implementation.

## Checks

- Exact task-start source heads were independently read from GitHub.
- Current live `main`, `developer`, `web-orchestration`, and `template-development` heads were re-read before this planning amendment and matched the source heads used by the review except for expected later template-development planning commits.
- Current `source-lock.json` was confirmed to still reference the original repository.
- Direct host/OpenCode capability was confirmed available before designing the replacement path.
- Current branch metadata was checked for `main`; server-side ruleset protection remains unproven and is therefore a required acceptance check rather than an assumption.
- No source/runtime files have been changed by the planning commits for this task.

## Blockers / required decisions

No human decision blocks the bounded Stage 1 capability proof.

Normal broad direct-host mutation and destructive bridge retirement must not proceed until server-side `main` protection is independently proven. If adequate protection is not present or cannot be established under existing authority, the resulting named residual risk requires a human decision.

Before bridge removal is considered complete, prove:

1. independent new-repository worktrees and canonical identity;
2. one selected/pinned OpenCode version for the direct path;
3. direct small/heavy session start and same-session continuation;
4. structured question and permission handling without broad auto-approval;
5. interruption/timeout reconciliation without duplicate mutation;
6. exact push, remote readback, and canonical CI on the resulting SHA;
7. no private host/session/process/device/provider/credential data persisted to Git;
8. server-side `main` protection independent of local hooks;
9. the instruction/validator cutover has removed required bridge dependence;
10. one representative task has succeeded through the new path before destructive retirement.

## Remaining work

1. Establish separate `agentic-workflow-next` clone/worktrees and verify origin/branch/HEAD/status.
2. Correct canonical repository identity/source metadata for the new repository.
3. Independently prove or establish server-side `main` protection before normal broad host mutation.
4. Select/prove the OpenCode version and direct small/heavy session start, continuation, structured interaction, and no-replay reconciliation while the bridge remains intact.
5. Prove one end-to-end direct OpenCode -> meaningful commit -> push -> GitHub exact readback/review -> canonical CI cycle without using the bridge as transport.
6. Hand the proven capability boundary to `TEMPLATE-INSTRUCTION-MINIMALISM-001` for the semantic and validator cutover; do not delete bridge code during that cutover.
7. Run a representative task under the simplified direct workflow and independently confirm the bridge is no longer required for normal execution/recovery.
8. Remove GitHub-Issue bridge transport/runtime/protocol/recovery/projection code and bridge-only host administration, including bridge-specific Workspace operations/docs/tests/validators.
9. Prove direct execution of the tracked change-package generator with canonical network access, then remove the package-generation Action/request broker while retaining generator/provenance code.
10. Update runtime architecture/security/docs/tests/validators for behavior actually retained, including AS-BUILT/deviation/actionable-doc obligations defined by the instruction task.
11. Run focused checks plus canonical push-triggered validation and independently review exact remote ranges.
12. Stop when the requested source migration is proven. Package release/application, historical cleanup, Scout/general Workspace redesign, archival, and `main` promotion remain separate outcomes unless explicitly requested.

## Next action

Begin Stage 1 only: establish the independent new-repository worktrees/canonical identity and prove the bounded direct-host/OpenCode execution, recovery, push/readback, CI, and server-side `main` protection requirements while leaving the existing bridge intact. After that proof, pause destructive runtime changes and hand execution to `TEMPLATE-INSTRUCTION-MINIMALISM-001` for the semantic/validator cutover.

## Relevant durable records

- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- `source-lock.json`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/opencode-bridge.md`
- developer `tools/opencode-bridge/**`
- developer `docs/architecture/branch-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- web `web-orchestration-only/chatgpt-project/skill-promotion.md`
- template-development package-generator and package-broker assets
- template-development Workspace bridge-host administration assets

## Last handoff commit

None
