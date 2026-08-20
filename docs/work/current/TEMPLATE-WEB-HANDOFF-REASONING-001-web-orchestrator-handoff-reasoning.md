# Template-maintenance task progress

## Task ID

TEMPLATE-WEB-HANDOFF-REASONING-001

## Status

blocked

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

A structural stress test found that the first implementation protected only the
ordinary workflow. The human then explicitly authorized direct correction so the
claim-first/blocker-analysis responsibility survives procedure routing.

## Current objective

Source implementation is complete. Preserve the reviewed exact web range and
finish package/check reconciliation when the required execution/evidence surface
is available.

## Current position

The universal source correction is now published on canonical
`web-orchestration` at:

- `web-orchestration`: `cc5a521c70f4198947ec0360cf60cb95876dff3b`

The complete source range for this task is:

- `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..cc5a521c70f4198947ec0360cf60cb95876dff3b`

The first part of that range added detailed blocker reasoning to
`skill-workflow.md`. The final four commits from
`64e9aacd0168053d5be5b4931d9d22cb5762edb7..cc5a521c70f4198947ec0360cf60cb95876dff3b`
then:

- add a short permanent claim-first invariant to
  `developer-instructions.md`;
- apply the same responsibility explicitly to template-maintenance blocker
  handoffs;
- require both rules in the standalone web package validator; and
- add focused Node regressions proving the permanent and template routes cannot
  silently lose the behavior.

Exact final four-file comparison shows only:

- `web-orchestration-only/chatgpt-project/developer-instructions.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`

The connected GitHub commit-status surface exposed no status records for the final
head. The repository's push-triggered web workflow remains present, but a final
run/result is not claimed without direct observable run evidence.

No portable change package has been generated. Packaging must not be hand-built.

## Source ranges

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..cc5a521c70f4198947ec0360cf60cb95876dff3b`
- `developer`: unchanged at `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`

## Observed

- The permanent instructions now say every handoff is a claim to evaluate, not a
  diagnosis/decision/next step to forward.
- The permanent rule explicitly covers nontrivial and repeated blockers and
  requires exact evidence plus accepted architecture/design/deviation and
  responsibility checks before steering/rerouting/escalation.
- The template-maintenance skill now applies the permanent claim-first rule to
  source/maintainer `blocked` and `needs decision` handoffs and strengthens
  repeated-blocker analysis.
- Direct escalation remains allowed for independently proven human-owned,
  safety/authority, unavailable-capability, or unresolvable external blockers.
- The validator and test suite now mechanically require the permanent and
  template-maintenance forms of the rule.
- Exact remote comparison proves the final correction touched only the four
  intended web files.

## Interpretation

The intended responsibility split is now explicit at the permanent role level:
implementers report what happened; the web orchestrator decides what it means and
what happens next; the human is involved only for genuinely human-owned decisions.

The source design problem is resolved. Remaining work is packaging and direct CI
run observation, not instruction design.

## Attempts

1. Added the first ordinary-workflow claim-first rule and regression.
2. Stress-tested the role/handoff system and found the route-local gap.
3. Recorded the gap and obtained explicit human authorization for direct source
   correction.
4. Added the permanent role invariant.
5. Added template-maintenance-specific blocker handling.
6. Added standalone validator and Node regression protection.
7. Independently compared the exact final remote source range.

## Changed approach

The first implementation treated blocker analysis as an ordinary-workflow rule.
The corrected design makes it a permanent web-role invariant, with route-specific
detail only where useful.

## Checks

- Exact final web head exists remotely:
  `cc5a521c70f4198947ec0360cf60cb95876dff3b`.
- Exact final correction range
  `64e9aacd0168053d5be5b4931d9d22cb5762edb7..cc5a521c70f4198947ec0360cf60cb95876dff3b`
  is four commits ahead, zero behind, and changes exactly four intended files.
- Final source files and validation patterns were read/reviewed directly.
- Connected combined-status lookup returned no observable statuses for the final
  web head, so no CI-pass claim is made.

## Blockers / required decisions

1. Portable change-package generation requires a legitimate networked maintainer
   execution surface and must not be simulated or hand-built.
2. Direct final push-CI run evidence is not currently exposed by the connected
   status lookup used here. This is an evidence-surface limitation, not a known
   source failure.
3. No human design decision remains for this task.

## Remaining work

1. Observe/verify the canonical web push validation result for the final exact
   source SHA when a run lookup surface is available.
2. Generate and validate the tracked maintenance package on a legitimate
   networked maintainer execution surface.
3. Reconcile package/source-lock state through the repository-owned procedure and
   finalize/archive the task when its full maintenance contract is satisfied.

## Next action

Source mutation for this task is finished. Proceed to the explicitly authorized
role-routing task while preserving this exact reviewed source range for later
package/check reconciliation.

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
