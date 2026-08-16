# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status

In progress; developer source reviewed, terminal proof reconciliation pending

## Task-start template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Review-base template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Public-safe task brief

Correct the post-interaction continuation race where normal same-session work can finish before the bridge's first post-reply proof and be mistaken for stalled work. Keep the fix minimal, preserve fail-closed one-shot same-session recovery, add the missing fast-completion regression, run proportional checks, and produce a reviewed change package. Do not modify or promote main.

## Current objective

Prove the mapped Luna route terminal from live evidence, then package the reviewed source.

## Current position

Developer implementation `61c430590dc7008c845586373f27355847a4ac31` and task-record-only handoff `326e9c402f571b82f6497c4da0f9d3722b553dba` are remote. Independent exact-range review finds no blocking source defect: pre-reply baseline activity/latest-assistant completion evidence is captured before permission/question reply; post-reply changed activity or changed terminal assistant fingerprint is clean completion; baseline/proof failure blocks; the existing grace and durable claim-before-delivery remain; and the regression covers completion before the first post-reply observation with inactive status and unchanged session activity. Luna reports build, focused recovery 19/19, bridge 96/96, agent-system, bridge/repository validation, 8/8 branch-initializer tests, and `git diff --check` passing.

Bridge durable `task.status` remains stale at `starting`. Live sequence 4 `session.status` returned `{}`, proving the mapped session inactive/idle. Sequence 5 `sync.recover` succeeded but did not materialize the missing terminal task projection. Pending read-only sequence 6 command `84787149-8736-4666-bca0-85dba278997d` will read `session.messages` with `limit:1`; terminal latest-assistant evidence matching the handoff will independently prove route termination without restart, replay, prompt, or steer.

## Source ranges

- developer: `80ad63319cd746d6205d67781b25e3c327b230bc..326e9c402f571b82f6497c4da0f9d3722b553dba`
- implementation: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81..61c430590dc7008c845586373f27355847a4ac31`
- handoff: `61c430590dc7008c845586373f27355847a4ac31..326e9c402f571b82f6497c4da0f9d3722b553dba` (task record only)
- web-orchestration: unchanged for this task
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Normal OpenCode idle removes the session from live status; the prior race was real.
- New recovery anchors proof before the reply instead of merely increasing delay.
- Regression proves inactive/unchanged-session fast completion returns `clean`, sends zero nudge, and leaves nudge state `not-attempted`.
- Remote handoff exists and live status is inactive; only bridge terminal projection is stale.

## Interpretation

The source fix closes the reviewed race while preserving the prior recovery authority. Missing terminal projection is a control-plane reconciliation issue, not evidence that Luna is still working.

## Attempts

1. Bound canonical issue #45 and guarded Luna start from exact developer SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
2. Proved live `busy` before declining to steer despite stale projected `starting`.
3. Diagnostic messages sequence 3 was retained locally because its projection exceeded GitHub limits; it was not replayed.
4. Luna pushed implementation and handoff without replacement session/start.
5. Independently reviewed exact source/test behavior.
6. Live status proved inactive; idempotent `sync.recover` succeeded but durable task projection stayed stale.

## Changed approach

The rejected prior implementation used only post-reply evidence. This correction uses a pre-reply baseline plus terminal assistant-message evidence without widening recovery authority or delay.

## Checks

- Exact developer range and handoff-only final commit verified remotely.
- Baseline placement before both reply kinds verified.
- Fail-closed baseline/proof behavior and one-shot claim preserved.
- Fast-completion regression semantics inspected directly.

## Blockers / required decisions

None currently.

## Remaining work

Read latest live terminal message; mark developer route absorbed if proven; generate/validate tracked package; reconcile source lock/ledger from exact refs; final remote readback; close #45; create template-development handoff. Full `main -> developer` promotion review remains separate and later.

## Next action

Publish sequence 6 read-only `opencode.request` command `84787149-8736-4666-bca0-85dba278997d` for `session.messages` with task-owned alias `session-54` and `limit:1`.

## Relevant durable records

- Issue #45
- Start: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Live status: `c8a6d9fb-b43e-4802-83c1-ccca03ad4456`
- Recovery: `addf782f-bf81-4246-ab17-de148654ae16`
- Pending latest-message read: `84787149-8736-4666-bca0-85dba278997d`
- Implementation: `61c430590dc7008c845586373f27355847a4ac31`
- Developer handoff: `326e9c402f571b82f6497c4da0f9d3722b553dba`

## Last handoff commit

None
