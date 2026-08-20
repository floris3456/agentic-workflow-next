# Template-maintenance task progress

## Task ID

TEMPLATE-HANDOFF-SHA-SEMANTICS-001

## Status

queued

## Task-start template-development SHA

00c8278f0b355bcdb00a566b2305c7a230654c6e

## Review-base template-development SHA

Not yet established. This task is queued and must establish a fresh exact remote
`template-development` review base immediately before activation and source
mutation.

## Public-safe task brief

Separate task completion status from the existence of an exact pushed handoff
snapshot SHA.

Current developer and template-maintainer instructions require a dedicated
handoff snapshot to be pushed before returning control, but also require the
handoff SHA field to be `none` for every status except `completed`. That means a
real pushed review boundary can be deliberately omitted from a `blocked`,
`failed`, or `needs decision` handoff.

This is a serious review/provenance problem. A pushed snapshot SHA identifies the
exact remote state being handed to the web orchestrator. It is not a correctness
or completion claim.

The intended semantics are:

- `Status` alone says whether the task is `completed`, `blocked`, `failed`, or
  `needs decision`.
- `Handoff developer SHA` identifies the exact successfully pushed developer
  snapshot for that handoff whenever one exists, regardless of status.
- `Handoff template-development SHA` does the same for template-maintenance
  handoffs.
- `none` is used only when no trustworthy remote handoff snapshot exists, such as
  a failed push or a stop before any handoff snapshot could be pushed.
- A failed push remains `blocked` with SHA `none` because the local commit is not
  proven remote.
- The web orchestrator treats any reported handoff SHA as a review boundary only,
  never as proof of completion/correctness/acceptance.
- Workspace handoffs already report mutated targets and pushed SHAs separately;
  review them for analogous ambiguity but do not change them without a real need.

## Current objective

When activated, make handoff snapshot identity survive every status and update all
producer, consumer, recovery, documentation, and regression rules that currently
couple SHA presence to `completed`.

## Current position

Planning-only task record. No source mutation has been made for this task.

Exact planning evidence:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: task record created from
  `00c8278f0b355bcdb00a566b2305c7a230654c6e`

Current developer instructions require:

- task-progress to be updated;
- a dedicated handoff snapshot commit to be created and pushed;
- successful snapshot push to be the terminal boundary of that working cycle;
- `Handoff developer SHA` to be the exact pushed SHA only for `completed`, and
  `none` for every other status.

Current template-maintenance instructions have the same coupling for
`Handoff template-development SHA`.

## Source ranges

No task source ranges have started. Establish exact bases at activation.

Planning refs only:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `00c8278f0b355bcdb00a566b2305c7a230654c6e`

## Observed

- The developer task workflow says a normal return of control creates and pushes
  a dedicated handoff snapshot before returning the six-field response.
- `git-sync-and-handoff` says the successful snapshot push is the exact terminal
  boundary for that working cycle.
- The same skill then requires `Handoff developer SHA: none` for all statuses
  except `completed`.
- Developer agent files and the web workflow repeat the same status-to-SHA
  coupling.
- Template-maintenance has the equivalent rule for its own pushed ledger handoff.
- Therefore a `needs decision` or `blocked` cycle can have a real remote snapshot
  but intentionally omit its identity from the handoff.
- If the branch advances before the web orchestrator reviews the handoff, the
  orchestrator must reconstruct the old boundary from repository history instead
  of receiving the exact identity the producer already knew.
- The human considers this a major issue and wants it fixed explicitly.

## Interpretation

Two independent facts are currently conflated:

1. **Task status** — whether the task is complete or why it stopped.
2. **Remote handoff boundary** — which exact pushed commit represents the state
   being returned for review.

These must be separate.

A blocked or decision-waiting task can still have a perfectly valid remote review
boundary. Conversely, a task can say `completed` only if the repository contract
allows it; the mere presence of a SHA never makes work complete.

The safest contract is therefore: report the exact pushed snapshot whenever it
exists, and reserve `none` for the absence of a proven remote snapshot.

## Attempts

1. A read-only structural stress test simulated a developer that completed useful
   partial work, pushed its required handoff snapshot, then legitimately returned
   `needs decision`.
2. Under current instructions the response had to say `Handoff developer SHA:
   none` even though the pushed snapshot existed.
3. The simulation then advanced the branch before web review, demonstrating that
   the handoff had lost its own exact review boundary.
4. The same problem was reproduced for a non-completed template-maintenance
   handoff.
5. The human accepted the finding as a major structural issue and requested a
   proper task record before implementation.

## Changed approach

None. This is a newly queued maintenance task.

## Checks

Planning-only instruction/evidence review completed.
No implementation checks have run because no task source mutation has started.

## Blockers / required decisions

- No human design decision is currently required; the desired semantics are
  explicit in this task.
- This task must remain non-mutating until the currently active template-
  maintenance task is completed/finalized or the human explicitly reprioritizes
  the active task.

## Remaining work

1. Re-establish exact live refs and activate this task with a fresh review base.
2. Update developer response semantics in root/agent/task/handoff documentation so
   every successfully pushed handoff snapshot is reported regardless of status.
3. Preserve the failed-push rule: no confirmed remote snapshot means SHA `none`.
4. Update web-orchestration producer/consumer rules so a handoff SHA is always a
   review boundary, never a completion signal, and so blocked/decision handoffs
   with a SHA are reviewed at that exact commit.
5. Update template-maintenance handoff semantics the same way for
   `Handoff template-development SHA`.
6. Review recovery semantics so a reported non-completed handoff SHA is preserved
   and used during reconciliation rather than discarded because status is not
   `completed`.
7. Audit bridge transport only for compatibility; it currently transports
   projected response text and should not gain semantic acceptance authority.
8. Add regressions for at least:
   - `completed` + pushed snapshot SHA;
   - `needs decision` + pushed snapshot SHA + later branch movement;
   - `blocked` + pushed snapshot SHA;
   - failed push -> `blocked` + `none`;
   - template-maintenance `needs decision` + exact pushed ledger SHA;
   - web review proving SHA presence does not imply completion.
9. Run authoritative branch checks, independently review exact source ranges,
   package the change, and complete normal maintenance handoff.

## Next action

Remain queued. On activation, start by identifying every producer and consumer of
`Handoff developer SHA` and `Handoff template-development SHA`, then change the
shared semantics once rather than patching individual examples independently.

## Relevant durable records

- `AGENTS.md` on `developer`
- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/skills/task-workflow/SKILL.md`
- `.opencode/skills/git-sync-and-handoff/SKILL.md`
- `docs/work/README.md`
- `docs/work/templates/developer-response-template.md`
- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/chatgpt-project/skill-recovery.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/work/templates/maintainer-response-template.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `docs/architecture/branch-workflow.md`
- `docs/deviations.md`

## Last handoff commit

None
