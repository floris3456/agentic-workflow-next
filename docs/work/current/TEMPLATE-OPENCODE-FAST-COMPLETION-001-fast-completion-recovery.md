# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status

In progress; developer source review clean, terminal recovery pending

## Task-start template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Review-base template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Public-safe task brief

Correct the post-interaction continuation recovery race where a same-session continuation can finish normally before the bridge takes its first recovery proof, causing completed idle/inactive state to be mistaken for stalled work. Keep the change minimal, preserve one-shot same-session recovery and fail-closed interaction safety, add a focused regression test, run proportional bridge/repository checks, and produce a reviewed portable change package. Do not modify or promote main.

## Current objective

Materialize the missed terminal developer event, then package the independently reviewed correction.

## Current position

Issue #45 is canonical. Developer implementation is `61c430590dc7008c845586373f27355847a4ac31`; dedicated task-record-only handoff is `326e9c402f571b82f6497c4da0f9d3722b553dba`. Independent exact-range review finds no blocking source defect: baseline activity and latest assistant completion evidence are captured before permission/question reply; post-reply changed activity or changed terminal assistant-message fingerprint is clean progress/completion; the existing grace and durable one-shot same-session claim remain; and the focused regression covers normal completion before the first post-reply proof. Sequence-free `task.status` still showed stale `starting`, while read-only sequence 4 `c8a6d9fb-b43e-4802-83c1-ccca03ad4456` succeeded with live `session.status = {}`, proving the mapped OpenCode session is inactive/idle. Pending sequence 5 command `addf782f-bf81-4246-ab17-de148654ae16` is `sync.recover`; it invokes existing idempotent recovery/session-history ingestion only and does not prompt, restart, replace, or otherwise re-execute Luna.

## Source ranges

- developer: `80ad63319cd746d6205d67781b25e3c327b230bc..326e9c402f571b82f6497c4da0f9d3722b553dba`
- implementation: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81..61c430590dc7008c845586373f27355847a4ac31`
- handoff snapshot: `61c430590dc7008c845586373f27355847a4ac31..326e9c402f571b82f6497c4da0f9d3722b553dba` (task record only)
- web-orchestration: no source change expected
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Prior defect was real because normal OpenCode idle removes a session from live status.
- New baseline is captured before forwarding permission/question reply; baseline failure blocks recovery rather than allowing an unbaselined nudge.
- Changed session activity or changed terminal assistant-message fingerprint is clean continuation/completion, including inactive status.
- Existing one-second grace remains; it was not lengthened as a substitute for proof.
- Existing same-session claim-before-delivery, no replacement/start/route behavior, outstanding-interaction block, and fail-closed proof errors remain.
- Focused regression simulates unchanged session activity plus inactive status, with assistant completion changing from `tool-calls` to terminal `stop` before the first post-reply proof, and verifies clean/no nudge.
- Luna reports build, focused recovery 19/19, full bridge 96/96, agent-system, bridge, repository (including 8/8 branch initializer), and `git diff --check` passing.
- Remote developer handoff is present; live mapped session is now inactive/idle; only durable terminal event/response projection remains stale.

## Interpretation

The source correction closes the reviewed race and appears minimal/safe. The remaining stale task projection is a recovery/publication problem, not evidence of active developer work. Existing `sync.recover` is the correct idempotent predecessor action because it ingests durable session history without replaying a side effect.

## Attempts

1. Created/bound issue #45 after proving no duplicate task/control route.
2. Guarded Luna start from exact developer SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
3. Proved live busy before declining to steer despite stale projected `starting`.
4. Diagnostic `session.messages` sequence 3 succeeded but its oversized projection was retained locally; it was not replayed.
5. Luna pushed implementation and dedicated handoff without a replacement session/start.
6. Independently reviewed changed paths, pre-reply baseline placement, post-reply proof logic, existing one-shot claim, and exact regression semantics.
7. Sequence-free `task.status` stayed stale; live sequence 4 then proved OpenCode session inactivity/idle.

## Changed approach

The rejected prior implementation used only post-reply evidence. This correction uses a pre-reply baseline and terminal assistant-message evidence without widening the recovery delay or authority.

## Checks

- Exact developer range is three commits ahead of reviewed base.
- Handoff snapshot changes only developer task record.
- `captureContinuationBaseline` runs before both permission and question reply.
- Baseline failure yields blocked continuation proof; reply itself is delivered only once.
- `postReplyProgress` accepts changed activity or changed terminal assistant-message fingerprint.
- Regression proves inactive/unchanged-session fast completion returns `clean`, sends zero prompt nudges, and leaves nudge state `not-attempted`.
- Live `session.status` after handoff is `{}`.

## Blockers / required decisions

None currently.

## Remaining work

Run idempotent terminal recovery; reconcile terminal developer response; generate and validate tracked change package; reconcile source lock/ledger from exact current refs; independently read back final remote state; close issue #45 and create the template-development handoff snapshot. Full `main -> developer` review remains a later promotion-stage obligation.

## Next action

Publish persisted sequence 5 `sync.recover` command `addf782f-bf81-4246-ab17-de148654ae16`; then read `task.status`/terminal publication. Do not restart, steer, or replay Luna.

## Relevant durable records

- Canonical control issue: #45
- Start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Live-status commands: `4cfe0631-adf4-4146-93a4-1dfc540e25ab`, `c8a6d9fb-b43e-4802-83c1-ccca03ad4456`
- Diagnostic messages command: `b02d69c5-2f61-4cd7-ae68-06265af443df`
- Terminal status request: `9849d093-93e8-4414-9c01-f231e7a535c0`
- Pending recovery command: `addf782f-bf81-4246-ab17-de148654ae16`
- Implementation commit: `61c430590dc7008c845586373f27355847a4ac31`
- Developer handoff: `326e9c402f571b82f6497c4da0f9d3722b553dba`

## Last handoff commit

None
