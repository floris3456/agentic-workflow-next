# Template-maintenance task record

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Status

in_progress — direct-host migration plan established; runtime/source migration not yet implemented

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
- remove GitHub-Issue bridge transport/runtime and bridge-only host administration;
- remove the package-generation Action broker after direct tracked generation is available;
- update runtime-facing architecture, tests, and validators for the retained system.

This record does **not** own the general instruction/lifecycle redesign. That is owned by `TEMPLATE-INSTRUCTION-MINIMALISM-001`. Do not duplicate its task-record/task-progress, handoff, route-selection, durable-record, or validator-design rules here.

The private fixed-operation host adapter remains separately deferred under `TEMPLATE-DIRECT-HOST-ADAPTER-001`.

Scout extraction, Workspace Maintenance redesign, imported-history cleanup, package release/application, and archival are not prerequisites for the core direct-host migration unless a later accepted task-record explicitly makes them so. Bridge-specific pieces of those systems may still be removed when they are runtime dependencies of the obsolete transport.

## Current objective

Establish and prove the smallest complete direct-host loop:

```text
Web orchestrator
├─ GitHub -> authoritative refs, diffs, review, CI
└─ Remote Desktop Commander -> verified worktree + native OpenCode small/heavy

GitHub Actions -> independent validation of exact pushed SHAs
Human -> only authority accepting one exact reviewed developer SHA into main
```

Then delete the obsolete bridge control plane and package broker from the new repository without rebuilding their complexity elsewhere.

## Current position

The new repository is a full Git copy but is not yet operationally independent because its maintenance provenance still names the original repository. Direct host access and native OpenCode are available, but the copied operative instructions and runtime still describe the GitHub-Issue bridge.

Exact source heads at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

The copied `source-lock.json` still names `https://github.com/floris3456/agentic-workflow-template.git` and records older developer/web source SHAs. Correcting canonical identity is part of this task.

## Source ranges

No runtime/source implementation ranges yet.

Task-start heads:

- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development`: `c3203691fc2a1067c0f0a1647d2f09922ab55454`

## Observed

- Remote Desktop Commander provides terminal/filesystem execution, Git network access, and authenticated GitHub access on the authorized host.
- Native OpenCode supports direct run/session/continue/interactive operation. The observed host CLI is `1.18.18`; copied bridge/Scout assets reference `1.18.16`, so one compatible version must be selected and proven for the direct path.
- The existing bridge routes ChatGPT through public GitHub control issues, a GitHub App bridge, and local OpenCode HTTP/SSE/WebSocket APIs. That transport is no longer needed for the new repository.
- Bridge-specific issue UUID/sequence/lifecycle/recovery, public projection/outbox, and host daemon administration exist primarily to compensate for the old connectivity constraint.
- The package-generation Action broker similarly exists to provide a networked generator surface that direct host access now supplies.
- The tracked change-package generator, canonical GitHub Actions validation, exact-SHA status reporting, guarded promotion, remote-Git authority, and no-replay principle remain independently useful.

## Interpretation

### Runtime to remove

After the direct path is proven, retire from active architecture:

1. GitHub Issues as an OpenCode command/request bus, including control labels, hidden command/request markers, UUID/sequence protocol, issue-task binding, polling, mailbox, and issue-based question/permission relay.
2. The outbound GitHub App bridge daemon, durable command ledger, outbox/public projection, heartbeat/admin lifecycle, and bridge-specific reconciliation.
3. Generic OpenCode HTTP/SSE/PTY parity and compatibility machinery maintained only for the bridge transport.
4. Bridge-specific recovery/status operations whose only purpose is the public transport. Preserve no-replay by reconciling direct host process/session/local Git/remote Git state instead.
5. The write-capable package-generation Action broker and its request-processing surface. Retain the tracked generator itself.
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

## Attempts

- Audited the copied bridge, web workflow/recovery, package broker, Scout boundary, Workspace boundary, canonical CI, package generator, and source-lock behavior.
- Verified the direct-host capability and native OpenCode CLI exist.
- Split the private adapter into `TEMPLATE-DIRECT-HOST-ADAPTER-001`.
- Split instruction/lifecycle redesign into `TEMPLATE-INSTRUCTION-MINIMALISM-001` so this record no longer owns those semantics.
- No runtime/source migration or `main` mutation has been performed under this task.

## Changed approach

The initial record attempted to preserve and migrate too many adjacent systems at once and duplicated instruction redesign details. The current plan narrows this task to the direct-host runtime transition itself.

Scout extraction and Workspace redesign are no longer core completion requirements. The instruction system's task-record/task-progress semantics, developer lifecycle, handoff shape, route policy, durable-record rules, and prose-validator strategy are owned only by `TEMPLATE-INSTRUCTION-MINIMALISM-001`.

## Checks

- Exact task-start source heads were independently read from GitHub.
- Current `source-lock.json` was confirmed to still reference the original repository.
- Direct host/OpenCode capability was confirmed available before designing the replacement path.
- No source/runtime files have been changed by the planning commits for this task.

## Blockers / required decisions

No human decision currently blocks the core direct-host migration.

Before bridge removal is considered complete, prove:

1. independent new-repository worktrees and canonical identity;
2. one selected/pinned OpenCode version for the direct path;
3. direct small/heavy session start and same-session continuation;
4. structured question and permission handling without broad auto-approval;
5. interruption/timeout reconciliation without duplicate mutation;
6. exact push, remote readback, and canonical CI on the resulting SHA;
7. no private host/session/process/device/provider/credential data persisted to Git.

## Remaining work

1. Establish separate `agentic-workflow-next` clone/worktrees and verify origin/branch/HEAD/status.
2. Correct canonical repository identity/source metadata for the new repository.
3. Implement enough of `TEMPLATE-INSTRUCTION-MINIMALISM-001` that the operative workflow uses the direct-host path rather than bridge-era procedure.
4. Select/prove the OpenCode version and direct small/heavy session interaction/recovery path.
5. Remove GitHub-Issue bridge transport/runtime/protocol/recovery/projection code and bridge-only host administration.
6. Remove the package-generation Action broker while retaining direct tracked generator/provenance code.
7. Update runtime architecture/security/docs/tests/validators only for behavior actually retained.
8. Run focused local checks plus canonical push-triggered validation; independently review exact remote ranges.
9. Complete the source migration when the direct loop and bridge removal are proven. Package release/application, historical cleanup, Scout/Workspace redesign, archival, and `main` promotion remain separate outcomes unless explicitly requested.

## Next action

Apply the minimal instruction redesign needed for direct-host operation, then establish the independent new-repository worktrees/canonical identity and prove one end-to-end direct OpenCode -> push -> GitHub review -> CI cycle before deleting the bridge runtime.

## Relevant durable records

- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-DIRECT-HOST-ADAPTER-001-direct-host-safety-adapter.md`
- `source-lock.json`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/opencode-bridge.md`
- developer `tools/opencode-bridge/**`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`
- template-development package-generator and package-broker assets

## Last handoff commit

None
