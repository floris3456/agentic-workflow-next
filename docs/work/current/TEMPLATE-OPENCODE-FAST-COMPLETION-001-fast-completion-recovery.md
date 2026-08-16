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

Remote refs and the maintenance contract were re-established. No open bridge-control issue exists, so no overlapping mutating route is active. Developer source work has not started.

## Source ranges

- developer: 80ad63319cd746d6205d67781b25e3c327b230bc..pending
- web-orchestration: no source change expected
- main: unchanged at 6127611113dfdb66f93a0cfd2d355359aa370833

## Observed

- Current source lock exactly matches live main, developer, and web-orchestration refs.
- Pinned OpenCode idle state removes the session from the live status map.
- Current bridge recovery treats absent status as inactive and can nudge after one unchanged grace interval.
- Therefore a continuation that resumes and finishes before the first bridge proof can be indistinguishable from stable non-progress unless completion/progress is anchored to evidence from before the reply or another terminal signal.

## Interpretation

The fix should establish post-reply progress relative to pre-reply evidence or reliably recognize terminal normal completion before any nudge claim. Merely increasing the grace duration would not close the logical race.

## Attempts

None yet.

## Changed approach

This task corrects the prior implementation after independent review; it does not reopen or replay the completed prior task.

## Checks

- Exact remote refs read.
- Template-development maintenance contract, task template, source lock, AS-BUILT, and ledger ADR read.
- Open bridge-control issue search returned none.

## Blockers / required decisions

None.

## Remaining work

Implement developer correction, add regression coverage, run focused/full required checks, independently review the exact source range, generate and validate the change package, reconcile source lock/ledger, and hand off.

## Next action

Launch one guarded Luna developer route from exact developer SHA 80ad63319cd746d6205d67781b25e3c327b230bc.

## Relevant durable records

- Prior maintenance package: changes/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001/manifest.json
- Current recovery implementation: tools/opencode-bridge/src/recovery.ts
- Current recovery tests: tools/opencode-bridge/tests/recovery.test.ts

## Last handoff commit

None
