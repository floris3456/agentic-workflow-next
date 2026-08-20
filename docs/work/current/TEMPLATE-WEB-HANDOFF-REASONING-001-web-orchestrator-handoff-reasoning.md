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

Package and hand off the implemented web-orchestration blocker-handoff reasoning
rule after the tracked web package checks can be run on an authorized execution
surface.

## Current position

The source change is implemented directly on canonical `web-orchestration`.
Remote head is:

- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`

The exact task source range is three commits from
`7e29c07e6ac9fc65a2cb2a8957514bc03500cc17` to
`64e9aacd0168053d5be5b4931d9d22cb5762edb7` and changes only:

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/validate-package.test.mjs`

The workflow now explicitly says every developer handoff is a claim to evaluate,
not a diagnosis or next-step instruction to forward. For `blocked` or
`needs decision`, the web orchestrator normally investigates the claimed blocker
itself before steering or escalating, using exact evidence plus accepted
architecture, design, and deviation records. Repeated or similar blockers require
deeper orchestrator analysis before another steer, route change, or implementation
request. The rule stays proportional and permits direct escalation when a blocker
is already independently proven to be a human-owned decision, safety/authority
boundary, unavailable required capability, or external condition that further
reasoning cannot resolve.

A focused source-level regression test now asserts those three parts of the rule.
The first version of that test had one whitespace-sensitive regex; it was caught
by independent review and corrected before this record was reconciled.

No portable change package has been generated in this chat. The tracked package
must not be hand-built, and the currently available direct-GitHub route does not
provide the authorized local maintainer execution needed to run the repository's
package generator.

`source-lock.json` has not been silently advanced. It still records the prior
reconciled snapshot while the earlier not-yet-finalized maintenance work remains
in repository history; this task keeps its own exact source range independently.

## Source ranges

- `template-development`: `407a292eb3c41b3d364d9216a377326c2b98b5b1..HEAD`
- `web-orchestration`: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..c6b747f00ad7509c1340fc11fca1466abb8eb1f9`

## Observed

- The previous web workflow already said developer checks are perceived results,
  not proof, and required the web orchestrator to inspect exact remote changed
  ranges and surrounding context itself.
- The completion rule already said task records, bridge results, Scouts,
  developer self-report, CI, and orchestrator notes never equal human acceptance.
- The previous correction rule already said repeated substantive failure should
  change route or surface the real human-owned decision instead of creating
  wasteful loops.
- The missing operational rule was what the web orchestrator should normally do
  immediately after a `blocked` or `needs decision` handoff before sending another
  request.
- The exact remote source range is confined to the workflow rule and its focused
  regression test.
- Current canonical `developer` remains
  `c6b747f00ad7509c1340fc11fca1466abb8eb1f9` and `main` remains
  `6127611113dfdb66f93a0cfd2d355359aa370833`.
- The available connected GitHub status surfaces did not expose a check or
  push-workflow result for the final web source SHA, so a full CI pass is not
  claimed here.

## Interpretation

A handoff is evidence to investigate, not an instruction to forward.

The web orchestrator has two distinct jobs: coordinate execution and independently
reason about what the evidence means. For nontrivial blockers, especially repeated
ones, it should normally perform the diagnosis first and then give the implementer
a narrower, better-founded request.

The new rule also makes the boundary clearer: the implementer does not become the
default owner of orchestration-level diagnosis or architecture merely because it
reported a blocker.

The source implementation is complete and independently reviewed remotely. The
remaining blocker is packaging/check execution, not source design.

## Attempts

1. Created and pushed this maintenance task record before source mutation.
2. Re-read the canonical web workflow and Project package validation structure.
3. Selected the bounded direct-GitHub source route because the exact files and
   wording were known and no local repository exploration was needed.
4. Added the blocker-handoff reasoning rule to `skill-workflow.md`.
5. Added one focused source-level regression to `validate-package.test.mjs`.
6. Independently checked the new test patterns against the actual wrapped workflow
   wording, found one whitespace-sensitive mismatch, and corrected it.
7. Reviewed the exact remote task-start-to-source-head range and re-read the final
   source files from GitHub.

## Changed approach

Implementation used bounded direct GitHub edits rather than delegation because
this task was a small, exact Project-package wording change with a focused
regression and remote reviewable scope.

The human explicitly prioritized this new maintenance task while an earlier
maintenance record remains not finalized. No previous mutating agent/source route
was left active; this task used one sequential direct source route and did not
rewrite prior package history or source-lock state.

## Checks

- Exact remote `web-orchestration` source range reviewed:
  `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..64e9aacd0168053d5be5b4931d9d22cb5762edb7`.
- Range contains exactly two changed files: `skill-workflow.md` and
  `validate-package.test.mjs`.
- Final workflow readback confirms the new claim-first blocker-analysis rule,
  repeated-blocker strengthening, proportional exceptions, and implementer/
  orchestrator responsibility boundary.
- Final test readback confirms three focused assertions for those requirements.
- Independent regex reproduction confirmed all three new assertions match the
  final workflow wording after the whitespace correction.
- Connected GitHub combined-status and commit-workflow-run surfaces returned no
  observable final check result; no CI pass is claimed.

## Blockers / required decisions

1. **Tracked checks/package execution surface:** this chat can edit and review the
   canonical source through connected GitHub but cannot run the repository-owned
   web package validator/tests or the tracked template-maintenance package
   generator on an authorized local maintainer checkout. The package must not be
   hand-built.
2. No human design decision is currently required for the source behavior.

## Remaining work

1. On an authorized maintainer execution surface, run the web package validator
   and discovered Node tests against exact web SHA
   `64e9aacd0168053d5be5b4931d9d22cb5762edb7`.
2. If those checks pass, generate the tracked template-maintenance change package
   for this task from the exact reviewed ranges.
3. Push and independently review the package bytes/manifest.
4. Reconcile source-lock/package records through the repository-owned procedure.
5. Complete the normal maintenance handoff/finalization steps.

## Next action

Run the tracked web validation and package generator from an authorized maintainer
checkout without changing the reviewed web source range unless a real check failure
requires a correction.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/validate-package.test.mjs`
- `docs/work/current/TEMPLATE-WEB-HANDOFF-REASONING-001-web-orchestrator-handoff-reasoning.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `source-lock.json`

## Last handoff commit

9d27ccf0ff4ad32b8ed663c2915782d201481ec6
