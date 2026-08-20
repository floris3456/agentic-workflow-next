# Template-maintenance task progress

## Task ID

TEMPLATE-WEB-HANDOFF-REASONING-001

## Status

in_progress

## Task-start template-development SHA

407a292eb3c41b3d364d9216a377326c2b98b5b1

## Review-base template-development SHA

407a292eb3c41b3d364d9216a377326c2b98b5b1

## Public-safe task brief

Strengthen the reusable web-orchestration workflow so agent handoffs are handled
as claims and navigation rather than accepted facts, and so the web orchestrator
more clearly performs its own analysis before sending follow-up implementation or
steering requests.

The existing workflow already requires independent review and states that agent
reports, checks, task records, bridge results, and handoffs are not human
acceptance. Preserve that rule and make its operational consequence clearer.

Normally, when an implementer returns `blocked` or `needs decision`, especially
when similar blockers repeat, the web orchestrator should first analyze the
blocker itself: inspect exact evidence, reason about the repository's accepted
architecture/design/deviations, distinguish a real external or human-owned
blocker from an implementation misunderstanding, and decide the next route before
asking the implementer to continue. The implementer should not become the default
owner of orchestration-level diagnosis or architecture decisions merely because
it reported the blocker.

This is a default, not an absolute rule. Immediate escalation without further
orchestrator analysis remains appropriate when the blocker is already proven to
be a genuinely human-owned decision, a safety/authority boundary, an unavailable
required capability, or another condition that independent reasoning cannot
legitimately resolve.

## Current objective

Define and later implement a small, clear handoff-handling rule in the
web-orchestration workflow that makes independent orchestrator reasoning explicit
without adding unnecessary ceremony to simple handoffs.

## Current position

The task record has been created before source implementation. No
`web-orchestration` source has been changed for this task yet.

Exact observed refs at task start:

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`

Likely source authority is
`web-orchestration-only/chatgpt-project/skill-workflow.md`; inspect surrounding
Project instructions and durable records before deciding whether any additional
source file needs to change.

## Source ranges

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`

## Observed

- The current web workflow already says developer checks are perceived results,
  not proof, and requires the web orchestrator to inspect exact remote changed
  ranges and surrounding context itself.
- The completion rule already says task records, bridge results, Scouts,
  developer self-report, CI, and orchestrator notes never equal human acceptance.
- The correction rule already says repeated substantive failure should change
  route or surface the real human-owned decision instead of creating wasteful
  loops.
- The current workflow does not explicitly say what the web orchestrator should
  do immediately after a `blocked` or `needs decision` handoff before sending a
  new steer/request.
- In recent maintenance work, the web orchestrator did independently verify many
  handoff claims and rejected several incorrect `completed` reports. However, it
  also too often used the agent's blocker framing as the starting point for the
  next request and performed deeper architectural reasoning only after additional
  correction cycles. That is weaker than the intended orchestration role.

## Interpretation

A handoff is evidence to investigate, not an instruction to forward.

The web orchestrator has two distinct jobs: coordinate execution and independently
reason about what the evidence means. For nontrivial blockers, especially repeated
ones, it should normally perform the diagnosis first and then give the implementer
a narrower, better-founded request.

The required rule should stay proportional. A simple, proven blocker should not
trigger unnecessary research. A repeated, ambiguous, architectural, provenance,
workflow, or cross-boundary blocker should trigger stronger orchestrator analysis
before another implementation turn.

The orchestrator should also consult accepted durable architecture, design, and
deviation records before treating an agent's proposed workaround or diagnosis as
the desired design.

## Attempts

1. Reviewed the current web-orchestration workflow rule for delegated handoffs,
   independent review, repeated correction, and completion evidence.
2. Recorded the observed gap and the required default behavior in this task
   before source implementation.

## Changed approach

The explicit human priority is to record this workflow defect immediately rather
than continue treating it as an informal lesson from the current maintenance
work.

## Checks

- Exact remote `template-development` task-start SHA re-read before this record.
- Exact remote `web-orchestration` start SHA re-read.
- Current `web-orchestration-only/chatgpt-project/skill-workflow.md` inspected.
- Current template-maintenance task-record format inspected.

## Blockers / required decisions

- No design blocker is known for creating this rule.
- Before consequential source mutation, reconcile the repository's one-mutating-
  template-maintenance-task rule with any still-open maintenance task and use the
  explicit current human priority to choose the safe active route.

## Remaining work

1. Review the web Project package for the smallest authoritative source change.
2. Specify the blocker-handoff rule in simple operational language, including the
   normal case, repeated-blocker strengthening, and narrow exceptions.
3. Add proportional validation or source-level checks if the Project package has
   an existing mechanism for enforcing required workflow language.
4. Independently review the exact `web-orchestration` source range after
   implementation.
5. Update template durable records/package state through the normal maintenance
   procedure.

## Next action

Design the exact web-orchestration wording from the current workflow and accepted
durable architecture/deviation records before selecting an implementation route.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

None
