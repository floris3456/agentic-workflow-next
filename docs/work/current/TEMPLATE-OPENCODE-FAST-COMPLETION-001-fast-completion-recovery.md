# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status

In progress

## Task-start template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Review-base template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Public-safe task brief

Correct the post-interaction continuation recovery race where a same-session continuation can finish normally before the bridge takes its first recovery proof, causing completed idle/inactive state to be mistaken for stalled work. Keep the change minimal, preserve one-shot same-session recovery and fail-closed interaction safety, add a focused regression test, run proportional bridge/repository checks, and produce a reviewed portable change package. Do not modify or promote main.

## Current objective

Make fast normal completion after permission/question reply classify as clean continuation rather than trigger a recovery nudge.

## Current position

Canonical control issue #45 is bound. Sequence 1 start command `01c0ce88-6cca-4760-8562-71c34db3409b` succeeded and created the mapped Luna developer session. Developer pushed only the required task-start record at `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81`; no implementation commit is remote yet. Sequence-free `task.status` retained stale projected `starting`. Read-only sequence 2 `4cfe0631-adf4-4146-93a4-1dfc540e25ab` succeeded with live `session.status` = `busy`, proving active work. No permission/question or terminal developer response is currently published. Pending read-only sequence 3 command `b02d69c5-2f61-4cd7-ae68-06265af443df` will read mapped live `session.messages`; it is diagnostic only and does not steer or mutate the session.

## Source ranges

- developer: 80ad63319cd746d6205d67781b25e3c327b230bc..pending
- web-orchestration: no source change expected
- main: unchanged at 6127611113dfdb66f93a0cfd2d355359aa370833

## Observed

- Current source lock exactly matched live main, developer, and web-orchestration refs at task start.
- Pinned OpenCode idle state removes the session from the live status map.
- Current bridge recovery treats absent status as inactive and can nudge after one unchanged grace interval.
- Therefore a continuation that resumes and finishes before the first bridge proof can be indistinguishable from stable non-progress unless completion/progress is anchored to evidence from before the reply or another terminal signal.
- Luna created and pushed its branch-required task-start record.
- Live sequence-2 status proved the mapped session was `busy`; stale durable `starting` was not stall evidence.
- Issue #45 exposes no permission/question interaction or terminal developer response as of the latest reconciliation.

## Interpretation

The fix should establish post-reply progress relative to pre-reply evidence or reliably recognize terminal normal completion before any nudge claim. Merely increasing the grace duration would not close the logical race. Stale durable state is not evidence that the live session is stalled.

## Attempts

1. Created the maintenance ledger and independently confirmed it remotely.
2. Created and bound canonical issue #45 after proving the task ID absent and no other open bridge-control task.
3. Guarded Luna start sequence 1 succeeded without replay; the required developer task-start record is remote.
4. Sequence-free `task.status` showed only stale projected `starting` state.
5. Read-only sequence 2 live status succeeded and proved `session-54` was busy; no steer was sent.

## Changed approach

This task corrects the prior implementation after independent review; it does not reopen or replay the completed prior task.

## Checks

- Exact remote refs read at task start.
- Template-development maintenance contract, task template, source lock, AS-BUILT, and ledger ADR read.
- New task ID absence and no pre-existing open bridge-control route confirmed before launch.
- Developer start guard matched exact SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
- Remote task-start commit inspected; it changes only the expected developer task record.
- Latest issue scan shows no interaction or terminal response.

## Blockers / required decisions

None.

## Remaining work

Observe live developer state without interfering with active progress; implement the correction, add regression coverage, run focused/full required checks, independently review the exact source range, generate and validate the change package, reconcile source lock/ledger, and hand off.

## Next action

Publish persisted read-only sequence 3 `opencode.request` for `session.messages` using task-owned session alias `session-54`; fresh tool/message progress means continue passive observation. Only genuine no-progress with no interaction justifies recovery/steering.

## Relevant durable records

- Canonical control issue: #45
- Start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Task-status request: `bb8f68d3-1d45-426c-b7fd-26099b8893e6`
- Live-status command: `4cfe0631-adf4-4146-93a4-1dfc540e25ab`
- Pending live-messages command: `b02d69c5-2f61-4cd7-ae68-06265af443df`
- Developer task-start commit: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81`
- Prior maintenance package: changes/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001/manifest.json
- Current recovery implementation: tools/opencode-bridge/src/recovery.ts
- Current recovery tests: tools/opencode-bridge/tests/recovery.test.ts

## Last handoff commit

None
