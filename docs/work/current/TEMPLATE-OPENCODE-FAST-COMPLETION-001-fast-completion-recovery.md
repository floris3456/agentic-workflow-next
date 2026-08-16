# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status

In progress; developer source review underway

## Task-start template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Review-base template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Public-safe task brief

Correct the post-interaction continuation recovery race where a same-session continuation can finish normally before the bridge takes its first recovery proof, causing completed idle/inactive state to be mistaken for stalled work. Keep the change minimal, preserve one-shot same-session recovery and fail-closed interaction safety, add a focused regression test, run proportional bridge/repository checks, and produce a reviewed portable change package. Do not modify or promote main.

## Current objective

Independently review and package the completed developer correction.

## Current position

Issue #45 is the canonical route. Luna sequence 1 started the mapped session; read-only sequence 2 proved it live-busy; diagnostic sequence 3 eventually succeeded with an oversized message result retained locally. Developer implementation is pushed at `61c430590dc7008c845586373f27355847a4ac31`; dedicated task-record-only handoff is pushed at `326e9c402f571b82f6497c4da0f9d3722b553dba`. Exact range review confirms the implementation captures mapped-session activity plus latest assistant completion evidence before permission/question reply, compares post-reply activity/terminal-message evidence, and preserves the existing bounded grace plus durable one-shot claim. The focused fast-completion regression simulates inactive status with unchanged session activity but a post-reply assistant message changing from `tool-calls` to terminal `stop`, and asserts clean/no nudge. No blocking source defect has been found so far. Pending sequence-free `task.status` request `9849d093-93e8-4414-9c01-f231e7a535c0` will reconcile the terminal mapped-session response before the developer route is marked absorbed.

## Source ranges

- developer: `80ad63319cd746d6205d67781b25e3c327b230bc..326e9c402f571b82f6497c4da0f9d3722b553dba`
- implementation: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81..61c430590dc7008c845586373f27355847a4ac31`
- handoff snapshot: `61c430590dc7008c845586373f27355847a4ac31..326e9c402f571b82f6497c4da0f9d3722b553dba` (task record only)
- web-orchestration: no source change expected
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Source lock exactly matched live source refs at task start.
- The prior logical race was real because normal OpenCode idle removes the session from live status.
- New recovery baseline is captured before forwarding the reply; unavailable baseline blocks recovery rather than falling back to an unbaselined nudge.
- Post-reply changed session activity or changed terminal assistant-message fingerprint is clean progress/completion, including absent/inactive status.
- Existing one-second grace remains; it was not lengthened as a substitute for proof.
- Existing same-session claim-before-delivery path, no replacement/start/route behavior, outstanding-interaction block, and fail-closed proof errors remain in place.
- The new regression covers completion before the first post-reply proof, not merely progress between first and second proof.
- Luna reports focused recovery tests 19/19, full bridge tests 96/96, agent-system validation, bridge validation, repository validation (including 8/8 branch initializer tests), build, and `git diff --check` passing. These are execution evidence pending package/review reconciliation.

## Interpretation

The source correction addresses the reviewed race by anchoring continuation evidence before the reply. It appears minimal and preserves the prior safety model. Developer execution is not considered absorbed until its terminal mapped response is reconciled and the exact remote range/package checks are complete.

## Attempts

1. Created and bound issue #45 after proving no duplicate task/control route.
2. Guarded Luna start from exact developer SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
3. Ignored stale projected `starting` and proved live status `busy` before deciding not to steer.
4. A diagnostic `session.messages` read was retained locally because its projected result exceeded GitHub limits; it was not replayed.
5. Luna pushed implementation and a dedicated handoff snapshot without a second session or start.
6. Independently inspected the exact changed path set, recovery baseline/proof logic, command reply ordering, and focused regression.

## Changed approach

The rejected prior implementation used only post-reply evidence. This correction uses a pre-reply baseline and terminal assistant-message evidence without widening the grace interval or recovery authority.

## Checks

- Exact remote developer range is three commits ahead of the reviewed base.
- Handoff snapshot changes only the developer task record.
- `captureContinuationBaseline` runs before `permission.reply` and `question.reply`.
- Baseline failure maps to blocked continuation proof; the reply itself is still delivered once.
- `postReplyProgress` accepts changed session activity or changed terminal assistant-message fingerprint.
- Regression test proves inactive/unchanged-session fast completion returns `clean`, sends zero prompt nudges, and leaves nudge state `not-attempted`.

## Blockers / required decisions

None currently.

## Remaining work

Reconcile terminal developer response, finish exact source review, generate and validate the tracked change package, reconcile source lock/ledger from exact current refs, independently read back final remote state, and close/handoff the maintenance task. Full `main -> developer` promotion review remains a later promotion-stage obligation.

## Next action

Publish the persisted sequence-free `task.status` request `9849d093-93e8-4414-9c01-f231e7a535c0` on issue #45 and reconcile the terminal mapped response without replay.

## Relevant durable records

- Canonical control issue: #45
- Start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Live-status command: `4cfe0631-adf4-4146-93a4-1dfc540e25ab`
- Diagnostic messages command: `b02d69c5-2f61-4cd7-ae68-06265af443df`
- Pending terminal status request: `9849d093-93e8-4414-9c01-f231e7a535c0`
- Implementation commit: `61c430590dc7008c845586373f27355847a4ac31`
- Developer handoff: `326e9c402f571b82f6497c4da0f9d3722b553dba`

## Last handoff commit

None
