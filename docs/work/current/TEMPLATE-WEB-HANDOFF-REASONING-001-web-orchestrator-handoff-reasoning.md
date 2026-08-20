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

The human has explicitly authorized the web orchestrator to implement this
instruction change directly and to continue the dependent role-routing and
Workspace target-rule instruction tasks sequentially. This authorization does not
change the human-only `main` promotion boundary or authorize destructive history
changes.

## Current objective

Finish the handoff-reasoning change by making the claim-first blocker-analysis
rule universal across web-orchestrator routes, while keeping the detailed
procedure proportional and avoiding unnecessary ceremony for simple proven
blockers.

## Current position

The first source change is already implemented directly on canonical
`web-orchestration` at:

- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`

Its exact first source range is:

- `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`

The ordinary workflow now says every developer handoff is a claim to evaluate,
not a diagnosis or next-step instruction to forward, and requires stronger
orchestrator analysis for repeated blockers.

Current exact remote refs immediately before the universal-rule correction:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `768ffca52b9f6831f848ba3459d06ae41194b551`

The next direct source change will keep a short universal claim-first rule in
`developer-instructions.md`, keep detailed ordinary behavior in
`skill-workflow.md`, and make `skill-template-maintenance.md` explicitly apply the
same responsibility to source/maintainer blocker handoffs. The web package
validator/tests will protect both the permanent and template-maintenance rule.

No portable change package has been generated. Packaging remains a separate
networked-maintainer execution step and must not be hand-built.

## Source ranges

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7` (partial; final head not yet established)
- `developer`: unchanged at `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`

## Observed

- Permanent web instructions define the web role as reasoning, orchestration, and
  independent review, but do not yet state the operational claim-first blocker
  rule.
- `skill-workflow.md` explicitly handles `blocked` and `needs decision` handoffs
  as claims requiring orchestrator analysis before forwarding.
- `skill-template-maintenance.md` has independent-review language, but does not
  contain the same explicit operational rule for blocker handoffs or repeated
  blocker loops.
- Permanent instructions say to load only the procedure needed for the current
  task, so route-specific detail cannot be assumed to remain active after routing.
- The structural stress test reproduced the gap with a realistic
  template-maintenance blocker.
- The human confirmed this is a real issue and explicitly authorized direct web
  source implementation.

## Interpretation

A handoff is evidence to investigate, not an instruction to forward.

This is a stable web-role invariant. The permanent instructions should carry a
short version so it cannot disappear when a conditional procedure is selected.
Detailed route-specific procedure should explain how to apply it without turning
every simple handoff into a large investigation.

The web orchestrator should normally do more analysis when a blocker is repeated,
architectural, provenance-related, cross-branch, or about responsibility. It
should not perform extra analysis when an already proven external or human-owned
boundary makes the next step obvious.

## Attempts

1. Created and pushed this maintenance task record before the first source change.
2. Added the claim-first blocker-analysis rule to `skill-workflow.md`.
3. Added a focused regression test for ordinary workflow blocker handling.
4. Independently reviewed the exact first remote web source range.
5. Ran a read-only multi-role structural stress test.
6. The stress test found that the new rule was route-local rather than universal.
7. The human authorized direct implementation of the corrected universal rule.

## Changed approach

The first implementation treated blocker analysis as an ordinary-workflow rule.
The stress test showed that was too narrow. The corrected approach is to make the
core claim-first responsibility universal in permanent web instructions and keep
route-specific detail in the conditional skills.

## Checks

- Exact first web source range reviewed:
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`.
- Read-only stress test exercised ordinary developer, template-maintenance,
  workspace, recovery, finalization, and promotion handoff boundaries.
- No final CI/package completion is claimed yet because the universal correction
  has not yet been published.

## Blockers / required decisions

- No human design decision remains for this task.
- No destructive or `main` action is authorized.
- Portable package generation remains dependent on a legitimate networked
  maintainer execution surface; this does not block source correction or exact
  remote review.

## Remaining work

1. Add the short universal claim-first blocker-analysis invariant to permanent web
   instructions.
2. Make template-maintenance handoff/blocker handling explicitly consistent with
   the invariant.
3. Add validator/regression coverage for both permanent and template-maintenance
   behavior.
4. Run canonical web push CI and independently review the complete exact web
   source range.
5. Mark source work complete/package pending, then move sequentially to the
   authorized role-routing task.
6. Generate/review the tracked package later on a legitimate networked maintainer
   execution surface.

## Next action

Publish the smallest permanent/template-maintenance instruction correction and
its focused regression checks directly on `web-orchestration`.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md`
- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `docs/work/current/TEMPLATE-WEB-HANDOFF-REASONING-001-web-orchestrator-handoff-reasoning.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

9d27ccf0ff4ad32b8ed663c2915782d201481ec6
