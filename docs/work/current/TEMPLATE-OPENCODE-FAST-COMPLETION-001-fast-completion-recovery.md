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

Canonical control issue #45 is bound. Sequence 1 start command `01c0ce88-6cca-4760-8562-71c34db3409b` was accepted/applying/succeeded and created the mapped Luna developer session. Developer pushed only the required task-start record at `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81`; no implementation commit is remote yet. A sequence-free `task.status` read succeeded but retained stale projected `session_state: starting`, so it is not stall evidence. Pending read-only sequence 2 command `4cfe0631-adf4-4146-93a4-1dfc540e25ab` will query live OpenCode `session.status`; no steer or mutation is planned from stale projection alone.

## Source ranges

- developer: 80ad63319cd746d6205d67781b25e3c327b230bc..pending
- web-orchestration: no source change expected
- main: unchanged at 6127611113dfdb66f93a0cfd2d355359aa370833

## Observed

- Current source lock exactly matches live main, developer, and web-orchestration refs.
- Pinned OpenCode idle state removes the session from the live status map.
- Current bridge recovery treats absent status as inactive and can nudge after one unchanged grace interval.
- Therefore a continuation that resumes and finishes before the first bridge proof can be indistinguishable from stable non-progress unless completion/progress is anchored to evidence from before the reply or another terminal signal.
- The Luna route created and pushed its branch-required task-start record; issue #45 currently exposes no permission/question interaction.

## Interpretation

The fix should establish post-reply progress relative to pre-reply evidence or reliably recognize terminal normal completion before any nudge claim. Merely increasing the grace duration would not close the logical race. Stale durable `starting` state is not evidence that the live session is stalled.

## Attempts

1. Created the maintenance ledger and independently confirmed it remotely.
2. Created and bound canonical issue #45 after proving the task ID absent and no other open bridge-control task.
3. Guarded Luna start sequence 1 succeeded without replay; the required developer task-start record is remote.
4. One sequence-free `task.status` read succeeded and showed only stale projected `starting` state.

## Changed approach

This task corrects the prior implementation after independent review; it does not reopen or replay the completed prior task.

## Checks

- Exact remote refs read.
- Template-development maintenance contract, task template, source lock, AS-BUILT, and ledger ADR read.
- New task ID absence and no pre-existing open bridge-control route confirmed before launch.
- Developer start guard matched exact SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
- Remote task-start commit inspected; it changes only the expected developer task record.

## Blockers / required decisions

None.

## Remaining work

Observe live developer state without interfering with active progress; implement the correction, add regression coverage, run focused/full required checks, independently review the exact source range, generate and validate the change package, reconcile source lock/ledger, and hand off.

## Next action

Publish the persisted read-only sequence-2 `opencode.request` for `session.status`; if live activity is progressing, continue passive observation. Only genuine no-progress with no interaction justifies recovery/steering.

## Relevant durable records

- Canonical control issue: #45
- Start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Task-status request: `bb8f68d3-1d45-426c-b7fd-26099b8893e6`
- Pending live-status command: `4cfe0631-adf4-4146-93a4-1dfc540e25ab`
- Developer task-start commit: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81`
- Prior maintenance package: changes/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001/manifest.json
- Current recovery implementation: tools/opencode-bridge/src/recovery.ts
- Current recovery tests: tools/opencode-bridge/tests/recovery.test.ts

## Last handoff commit

None
