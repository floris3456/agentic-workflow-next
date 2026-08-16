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

Canonical control issue #45 is created but not yet admitted. No other open bridge-control issue exists. Pending guarded start command sequence 1 uses command ID `01c0ce88-6cca-4760-8562-71c34db3409b` against exact developer SHA `80ad63319cd746d6205d67781b25e3c327b230bc` with Luna. No developer source mutation has started yet.

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

1. Created the maintenance ledger and independently confirmed it remotely.
2. Created canonical issue #45 without the bridge-control label; no command has yet been posted.

## Changed approach

This task corrects the prior implementation after independent review; it does not reopen or replay the completed prior task.

## Checks

- Exact remote refs read.
- Template-development maintenance contract, task template, source lock, AS-BUILT, and ledger ADR read.
- Open bridge-control issue search returned none before issue creation.
- New task ID was absent from repository file search and issue search before creation.

## Blockers / required decisions

None.

## Remaining work

Admit one guarded Luna route, implement the developer correction, add regression coverage, run focused/full required checks, independently review the exact source range, generate and validate the change package, reconcile source lock/ledger, and hand off.

## Next action

Apply the bridge-control label to issue #45, post the persisted sequence-1 start command, and reconcile its lifecycle without replay.

## Relevant durable records

- Canonical control issue: #45
- Pending start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Prior maintenance package: changes/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001/manifest.json
- Current recovery implementation: tools/opencode-bridge/src/recovery.ts
- Current recovery tests: tools/opencode-bridge/tests/recovery.test.ts

## Last handoff commit

None
