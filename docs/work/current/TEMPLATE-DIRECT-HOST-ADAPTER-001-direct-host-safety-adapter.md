# Template-maintenance task progress

## Task ID

TEMPLATE-DIRECT-HOST-ADAPTER-001

## Status

queued — explicitly out of scope for `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`

## Task-start template-development SHA

95c257ac726b4d650e3b0b9b28c25014a2c4624a

## Review-base template-development SHA

95c257ac726b4d650e3b0b9b28c25014a2c4624a

## Public-safe task brief

After the direct-host migration is established and proven, independently evaluate whether `agentic-workflow-next` should add a small private fixed-operation host adapter in front of normal Remote Desktop Commander/OpenCode operations. The purpose would be to reduce routine host authority and centralize exact worktree/ref/session/no-replay guards without recreating the retired GitHub-Issue bridge, public RPC protocol, or second orchestration control plane.

This task is intentionally deferred. It must not block or expand `TEMPLATE-DIRECT-HOST-ORCHESTRATION-001`. Until the human explicitly activates this task, the migration may use direct Commander plus native OpenCode session controls under the retained safety and authority rules.

## Current objective

Preserve the proposed adapter hardening idea and its requirements so it can be evaluated later against the actual direct-host architecture rather than implemented prematurely.

## Current position

No adapter design or implementation is authorized in the active migration. The current proposal is only a candidate future hardening layer.

Potential future scope, if activated:

- inspect the then-current direct Commander/OpenCode workflow and identify which routine host operations materially benefit from a narrower fixed interface;
- consider registered repository/worktree resolution, exact start-SHA guards, web-selected `small`/`heavy` routing, same-session continuation, private session/process state, one mutating route per worktree, bounded public-safe summaries, and remote Git readback;
- prevent arbitrary model/variant/directory/share/auto-approval overrides in any standard adapter route;
- keep private host paths, device/process/session identifiers, credentials, provider metadata, and raw local output outside tracked Git;
- preserve no-replay recovery so an interrupted or timed-out operation is reconciled before any replacement or retry;
- avoid rebuilding GitHub-Issue transport, bridge polling, public command UUID/sequence protocols, public projection/outbox machinery, or a general remote shell abstraction.

## Source ranges

None. This task is queued and has no implementation range.

## Observed

- Remote Desktop Commander provides direct authorized host access, so the GitHub-Issue/OpenCode bridge is no longer required as the normal transport in the new repository.
- Direct Commander has broader host authority than the old bounded bridge operations, which creates a possible future hardening opportunity.
- The active migration already retains independent worktree/ref checks, route authority, private-identifier rules, no-overlap mutation, no-replay recovery, exact remote review, and human-only `main` promotion; an adapter is not required to preserve those rules at migration time.

## Interpretation

A private fixed-operation adapter may later improve defense in depth and reduce accidental host-scope widening, but its value and smallest correct shape should be judged only after the direct-host baseline is operational. Premature implementation risks recreating unnecessary control-plane complexity before real usage shows which operations need narrowing.

This task should therefore begin with evaluation, not an assumption that an adapter must exist. A valid future outcome may be a smaller adapter than originally imagined or a documented decision that direct Commander controls are sufficient.

## Attempts

None. The idea was separated from the active direct-host migration at the human's request before implementation.

## Changed approach

The adapter was originally included as part of the direct-host migration plan. The human explicitly moved it out of scope so the bridge-removal migration can proceed without waiting for an additional abstraction layer.

## Checks

- Parent migration task: `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`.
- No source, runtime, host configuration, package, or `main` change is part of this queued record.

## Blockers / required decisions

Intentional queue state. Do not activate or implement without a later explicit human request.

## Remaining work

When explicitly activated:

1. Re-read the then-current direct-host architecture and actual operational pain points.
2. Decide whether an adapter materially improves safety, reliability, or token efficiency over direct Commander controls.
3. If justified, design the smallest fixed-operation interface and private state model that preserves existing authority boundaries without creating another public protocol.
4. Implement and test proportionally, including interruption/no-replay, overlapping-session prevention, private-identifier non-persistence, route restrictions, and remote Git verification.
5. Update architecture/instructions only for behavior actually adopted.

## Next action

Remain queued. Do nothing until the human explicitly activates this task after or during evaluation of the direct-host baseline.

## Relevant durable records

- `docs/work/current/TEMPLATE-DIRECT-HOST-ORCHESTRATION-001-direct-host-orchestration-migration.md`
- developer `AGENTS.md`
- developer `.opencode/agents/small-developer.md`
- developer `.opencode/agents/large-developer.md`
- developer `docs/architecture/agent-system.md`
- web `web-orchestration-only/chatgpt-project/developer-instructions.md`
- web `web-orchestration-only/chatgpt-project/skill-workflow.md`
- web `web-orchestration-only/chatgpt-project/skill-recovery.md`

## Last handoff commit

None
