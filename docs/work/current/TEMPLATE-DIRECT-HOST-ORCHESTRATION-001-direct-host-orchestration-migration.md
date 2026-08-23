# Template-maintenance task record

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Status

in_progress — direct-host migration plan simplified; runtime/source migration not yet implemented

## Task-start template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Review-base template-development SHA

c3203691fc2a1067c0f0a1647d2f09922ab55454

## Public-safe task brief

Migrate `floris3456/agentic-workflow-next` from the copied GitHub-Issue/OpenCode bridge transport to direct authorized host access through Remote Desktop Commander plus native OpenCode. Remove transport and host-administration machinery that exists only because the web orchestrator previously could not reach the host directly.

Preserve the important boundaries: exact remote Git as repository truth, normal repository tests/CI, no automatic replay of an ambiguous mutation, public-safe persistence, and human-only exact-SHA `main` acceptance. Do not add a new RPC/control plane merely to replace the old bridge.

This task owns the direct-host substrate and later bridge/broker retirement. It does not own the Dual developer design, cross-system instruction redesign, or AgentMemory integration.

## Execution order

This task is the first and fifth step of the current migration:

1. **Direct Host — substrate:** establish the independent new-repository worktree/canonical identity and prove direct native OpenCode control, ordinary push/readback/CI, and no-replay recovery while the old bridge still exists.
2. **Dual Developer — opt-in:** implement and prove `dual` as an explicit selectable route. Do not make it the global default yet.
3. **Instruction Minimalism — cutover:** simplify web/developer/template instructions, make `dual` the default substantive route, establish the web/lead/Spark responsibility split, remove routine compaction completely, retain the last 5k raw conversation tokens, and instruct agents to re-read the durable files they need.
4. **Representative Dual task:** run one normal substantive task through the operative Dual route and perform web final outcome verification.
5. **Direct Host — retirement:** remove the obsolete GitHub-Issue bridge, bridge-only host administration, bridge-only recovery/protocol/tests/docs, and the package Action/request broker. Retain the deterministic package generator/provenance code.
6. **Agent Memory:** add attributed shared/isolated AgentMemory as a non-blocking enhancement after the core workflow is stable.

AgentMemory is not a prerequisite for steps 3–5. A memory integration problem must not keep the old bridge alive.

## Responsibility boundary

This record owns:

- independent `agentic-workflow-next` worktree/canonical repository identity;
- a compatible direct native OpenCode runtime and normal session control;
- direct question/permission/steering capability needed by the selected developer route;
- simple no-replay reconciliation after timeout/disconnect/unknown mutation state;
- removal of GitHub-Issue bridge transport/runtime and bridge-only host administration after the replacement path is proven;
- removal of the package Action/request broker after direct use of the tracked generator is available;
- runtime-facing AS-BUILT/docs/tests needed to describe the retained implementation.

It does not own:

- lead/Spark developer behavior — `TEMPLATE-DUAL-DEVELOPER-001`;
- route/review/task-record/task-progress/deviation/compaction/lifecycle semantics — `TEMPLATE-INSTRUCTION-MINIMALISM-001`;
- AgentMemory runtime and memory policy — `TEMPLATE-AGENT-MEMORY-001`.

The previously proposed private host adapter is no longer part of the plan. Start with direct Commander/native OpenCode and add another abstraction only if actual use later proves one is needed.

## Current position

Exact live source refs at this planning revision:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `38da09b5e03a84ab08cf6728502184695f946224`
- `web-orchestration`: `e12cea6092ea6bd66d5b1451e488d38e229bc47d`
- `template-development` planning base: `87c48bb7e29f9ad0cef61cf0f0edcea670e71825`

The copied `source-lock.json` still names the old repository and older source refs. Correcting canonical identity belongs to this task.

No runtime/source migration has yet been performed under this task.

## Required outcome

### Step 1 — direct-host substrate

Prove the smallest useful direct loop while leaving the bridge intact:

- the host is operating in the intended `agentic-workflow-next` worktree/repository;
- native OpenCode can start/continue the selected developer session;
- structured interaction can be handled without broad auto-approval;
- after an ambiguous interruption, existing local/session/Git/remote state is inspected before any retry;
- a normal meaningful change can be committed/pushed and read back exactly from GitHub;
- the branch's ordinary CI/check path can run on that pushed state;
- private host/session/credential data is not written to Git.

Do not build a special verifier framework for this. Use direct observation, ordinary repository checks, and exact remote readback.

### Step 5 — retirement

After the instruction cutover and one representative Dual task prove the bridge is unnecessary, remove:

- GitHub Issues as an OpenCode command/request bus;
- bridge command UUID/sequence/mailbox/projection machinery;
- the GitHub App bridge daemon and bridge-specific recovery/state;
- bridge-only Workspace host-administration operations;
- bridge-only scripts/tests/docs/validators;
- the package-generation Action/request broker.

Retain:

- Remote Desktop Commander/native OpenCode direct execution;
- exact remote Git and normal push-triggered CI;
- `dual`, `small`, and `heavy` developer routes as defined by the instruction/Dual records;
- the tracked deterministic change-package generator/provenance code for cases where a package is actually requested;
- guarded human-only `main` promotion;
- no-replay recovery and public-safe persistence.

## Recovery rule

Keep recovery tool-neutral and short:

1. do not automatically repeat an operation whose effect is unknown;
2. inspect the existing process/session when relevant, local worktree/Git state, and exact remote Git state;
3. continue/review the existing effect when it is active or completed;
4. retry/replace only after evidence shows the original effect did not occur or cannot continue.

Do not recreate bridge-style sequence ledgers or generalized recovery state machines.

## Verification philosophy

Prefer instructions and direct evidence over mechanical workflow enforcement.

Use ordinary tests/CI and a small focused smoke check where they materially prove behavior. Do not add complex validators, exact-prose checks, exhaustive scenario matrices, or custom verification infrastructure merely because a rule is written down. Add stronger mechanics later only if real failures show they are worth the complexity.

## Remaining work

1. Establish the correct independent new-repository worktree and canonical identity.
2. Select/prove the direct OpenCode runtime and simple session/interaction/no-replay path.
3. Prove one ordinary direct OpenCode -> commit -> push -> exact GitHub readback -> normal CI cycle with the bridge still present.
4. Hand the proven substrate to `TEMPLATE-DUAL-DEVELOPER-001`.
5. After the Dual opt-in proof and `TEMPLATE-INSTRUCTION-MINIMALISM-001` cutover, run one representative substantive Dual task.
6. Remove bridge transport/runtime, bridge-only host administration, and bridge-only supporting assets.
7. Prove direct use of the tracked package generator and remove only the Action/request broker.
8. Update current runtime AS-BUILT/docs and run proportional ordinary checks.
9. Stop when the requested source migration is proven. AgentMemory, package transfer/application, historical cleanup, general Workspace redesign, and `main` promotion are separate outcomes unless explicitly requested.

## Next action

Execute only step 1 of the migration: establish/prove the direct-host substrate while leaving the bridge intact. Then hand execution to `TEMPLATE-DUAL-DEVELOPER-001`.

## Relevant durable records

- `docs/work/current/TEMPLATE-DUAL-DEVELOPER-001-dual-developer-architecture.md`
- `docs/work/current/TEMPLATE-INSTRUCTION-MINIMALISM-001-instruction-system-redesign.md`
- `docs/work/current/TEMPLATE-AGENT-MEMORY-001-agent-memory-context-reconstruction.md`
- `source-lock.json`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- developer `docs/architecture/agent-system.md`
- developer `docs/architecture/opencode-bridge.md`
- developer `docs/architecture/branch-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`

## Last handoff commit

None
