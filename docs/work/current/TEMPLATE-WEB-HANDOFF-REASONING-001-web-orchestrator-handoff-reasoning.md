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
performs its own analysis before sending follow-up implementation or steering
requests.

The web orchestrator is not a message forwarder. Normally, when an implementer
returns `blocked` or `needs decision`, especially when similar blockers repeat,
the web orchestrator must first analyze the blocker itself: inspect exact
evidence, check accepted architecture/design/deviations, distinguish a real
external or human-owned blocker from an implementation misunderstanding, and
decide the next route before asking an implementer to continue.

This is a default, not an absolute rule. Immediate escalation is still correct
when the blocker is already independently proven to be a genuine human-owned
decision, safety/authority boundary, unavailable required capability, or external
condition that further reasoning cannot resolve.

A later structural stress test confirmed the ordinary workflow wording is useful
but found that the same responsibility is not guaranteed when the web
orchestrator routes into a different procedure, especially template maintenance.
The claim-first/blocker-analysis responsibility is a stable web-orchestrator
responsibility and must survive procedure routing.

## Current objective

Finish the handoff-reasoning change by making the claim-first blocker-analysis
rule universal across web-orchestrator routes, while keeping the detailed
procedure proportional and avoiding unnecessary ceremony for simple proven
blockers.

## Current position

A first source change is already implemented directly on canonical
`web-orchestration` at:

- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`

That exact source range is:

- `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`

and changes only:

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/validate-package.test.mjs`

The ordinary workflow now says every developer handoff is a claim to evaluate,
not a diagnosis or next-step instruction to forward. For `blocked` or
`needs decision`, it requires independent blocker analysis before steering or
escalating, with stronger analysis when blockers repeat.

The structural stress test then found a remaining design gap: permanent
instructions route template work to `skill-template-maintenance.md` and say to
load only the needed procedure. Because the new detailed blocker rule currently
lives only in `skill-workflow.md`, a careful template-maintenance run can miss the
new operational rule even though the web orchestrator's overall role is still
reasoning and independent review.

The next source change should therefore be small and architectural: keep a short,
universal claim-first responsibility in permanent web instructions, keep detailed
ordinary behavior in `skill-workflow.md`, and make template-maintenance/recovery
behavior consistent where a blocker handoff can occur.

No portable change package has been generated yet. Packaging should wait until
this universal-rule gap is corrected so the task produces one coherent reviewed
source result rather than packaging a known partial design.

## Source ranges

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7` (partial source range; final head not yet established)
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`

## Observed

- Permanent web instructions already define the web role as reasoning,
  orchestration, and independent review, and say reports are evidence/navigation,
  not human acceptance.
- `skill-workflow.md` now explicitly handles `blocked` and `needs decision`
  handoffs as claims requiring orchestrator analysis before forwarding.
- The ordinary regression test protects that wording in `skill-workflow.md`.
- `skill-template-maintenance.md` has independent-review language, but does not
  contain the same explicit operational rule for blocker handoffs or repeated
  blocker loops.
- Permanent instructions say to load only the procedure needed for the current
  task, so route-specific detail cannot be assumed to remain active after routing.
- The stress test reproduced the gap with a realistic template-maintenance
  blocker: an implementer can propose an architecture/provenance workaround and
  the routed instructions do not explicitly require the web orchestrator to
  classify that blocker before forwarding it.
- The human confirmed this is a real issue and wants the rule to apply across the
  system, not only normal developer work.

## Interpretation

A handoff is evidence to investigate, not an instruction to forward.

This is a stable web-role invariant. The permanent instructions should carry a
short version so it cannot disappear when a conditional procedure is selected.
Detailed route-specific procedure can then explain how to apply it without
turning every simple handoff into a large investigation.

The web orchestrator should normally do more analysis when a blocker is repeated,
architectural, provenance-related, cross-branch, or about responsibility. It
should not perform extra analysis when an already proven external or human-owned
boundary makes the next step obvious.

## Attempts

1. Created and pushed this maintenance task record before the first source change.
2. Added the claim-first blocker-analysis rule to `skill-workflow.md`.
3. Added a focused regression test for ordinary workflow blocker handling.
4. Independently reviewed the exact remote web source range.
5. Ran a read-only multi-role structural stress test against the current role and
   handoff instructions.
6. The stress test found that the new rule is route-local rather than universal,
   so the task scope is now corrected before packaging.

## Changed approach

The first implementation treated blocker analysis as an ordinary-workflow rule.
The stress test showed that was too narrow. The corrected approach is to make the
core claim-first responsibility universal in permanent web instructions and keep
route-specific detail in the conditional skills.

This is not a new human goal; it is the missing structural part of the original
handoff-handling goal.

## Checks

- Exact first web source range reviewed:
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`.
- Read-only stress test exercised ordinary developer, template-maintenance,
  workspace, recovery, finalization, and promotion handoff boundaries.
- Stress-test result for this task: ordinary blocker handling is materially
  improved, but the same invariant is not structurally guaranteed after routing
  to template maintenance.
- No final CI/package completion is claimed because the source design is now
  known to be incomplete.

## Blockers / required decisions

- No human design decision remains for this task.
- Do not package/finalize the current partial web source range until the universal
  route coverage is corrected and reviewed.

## Remaining work

1. Add a short permanent web-orchestrator invariant that every handoff is a claim
   and that nontrivial/repeated blockers normally require independent analysis
   before forwarding, steering, or escalation.
2. Keep detailed ordinary behavior in `skill-workflow.md` and make
   `skill-template-maintenance.md` (and recovery/finalization behavior where
   applicable) consistent with the same responsibility.
3. Add regression coverage proving a wrong blocker is independently classified
   under ordinary work and template maintenance, not only in `skill-workflow.md`.
4. Run the authoritative web package validator/tests on the final exact web SHA.
5. Review the complete web source range, generate the tracked maintenance package,
   reconcile source-lock/package state, and complete normal handoff/finalization.

## Next action

Design the smallest universal permanent rule and route-specific regression before
making another web source edit. Do not duplicate the full ordinary procedure into
permanent instructions.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md`
- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `web-orchestration-only/chatgpt-project/skill-recovery.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `docs/work/current/TEMPLATE-WEB-HANDOFF-REASONING-001-web-orchestrator-handoff-reasoning.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

9d27ccf0ff4ad32b8ed663c2915782d201481ec6
