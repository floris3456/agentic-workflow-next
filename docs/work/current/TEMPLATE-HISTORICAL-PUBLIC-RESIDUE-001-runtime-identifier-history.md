# Template-maintenance task progress

## Task ID

TEMPLATE-HISTORICAL-PUBLIC-RESIDUE-001

## Status

queued

## Task-start template-development SHA

2edd12ce26b0ad0deed5b853566b0a9f3e24cef9

## Review-base template-development SHA

Not yet established. This task is queued and must establish a fresh exact remote
`template-development` review base immediately before activation and any durable
change.

## Public-safe task brief

Separate and resolve the historical public-residue decision that is currently
mixed into `TEMPLATE-PACKAGE-SUPERSESSION-001`.

A previously published, superseded package contains a raw private runtime/session
identifier that should never have been persisted to public Git. Do not reproduce
that identifier in this task record, new commits, comments, tests, package output,
or handoffs.

The known residue is historical/superseded evidence, but it remains reachable in
Git and in the tracked historical package record. Current and future active
packages and mutable records must remain public-safe and must never copy the value
forward.

There are two materially different resolution paths:

1. **Retain history and record an accepted deviation.** Preserve existing Git
   history and immutable historical package evidence, explicitly document that
   the old public residue remains recoverable, and rely on current safeguards to
   prevent recurrence or propagation.
2. **Coordinated destructive history rewrite.** Remove the historical value by
   rewriting published Git history and then repair every affected exact SHA,
   package/provenance binding, clone/worktree, task reference, and downstream
   dependency. This path requires explicit human authorization after reviewing
   its impact; it must never happen automatically.

The current preferred safe direction is the first option because provenance and
exact historical SHAs are important system properties and the known value is a
runtime identifier rather than an established credential. That recommendation is
not itself human acceptance. The human must explicitly choose the residual-risk
policy before this task can close.

If the retain-history option is chosen, create a concise public-safe deviation
record (expected to be the next TD entry) that explains the intended rule,
observed historical residue, why destructive removal was not selected, the
prevention/containment controls, and the remaining limitation. Never include the
identifier itself.

## Current objective

When activated, independently verify the current residue and safeguards, present
the exact human decision in simple terms, then record and complete the selected
safe resolution without mixing it back into package-supersession implementation.

## Current position

Planning-only task record. No historical package bytes, Git history, source
branches, or package state have been changed for this task.

Exact refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: task record created from
  `2edd12ce26b0ad0deed5b853566b0a9f3e24cef9`

The existing `TEMPLATE-PACKAGE-SUPERSESSION-001` record currently carries this
historical-residue decision as its remaining blocker. That mixes a human risk/
history decision with package-supersession implementation, even though the latter
has its own source/package work and validation history.

## Source ranges

No task source ranges have started. Establish exact bases at activation.

Planning refs only:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `2edd12ce26b0ad0deed5b853566b0a9f3e24cef9`

## Observed

- `TEMPLATE-PACKAGE-SUPERSESSION-001` records that a superseded historical package
  contains a previously published runtime identifier.
- Earlier review found that the residue was not merely an old unreachable commit:
  it was also present inside tracked superseded package evidence, so describing it
  only as "history" is incomplete.
- Later package work introduced ledger-only `changes/**` handling and active/new
  package public-safety checks specifically to prevent historical package bytes
  from being recursively copied into new portable packages.
- Existing workflow rules prohibit publishing raw private agent/runtime
  identifiers and prohibit destructive shared-history rewriting without explicit
  human authority.
- The human asked for this concern to receive its own task rather than remain
  mixed into the package-supersession task.

## Interpretation

This is now primarily a human-owned residual-risk/provenance decision, not a
normal implementation blocker.

The system should separate:

- **recurrence prevention**, which current/new validation can enforce;
- **active propagation prevention**, which package generation/resolution can
  enforce; and
- **complete historical erasure**, which is destructive and affects established
  provenance.

A green validator is not proof that old public history has been erased. Likewise,
retaining historical evidence must not be described as if the value is no longer
publicly recoverable.

## Attempts

1. Package-supersession review discovered the historical runtime identifier.
2. Mutable records and later package-generation rules were tightened so new work
   would not deliberately copy raw runtime identifiers forward.
3. The remaining complete-erasure question was left as a human decision because
   removing it from published history requires destructive rewriting.
4. The issue remained inside `TEMPLATE-PACKAGE-SUPERSESSION-001` rather than having
   a dedicated decision record.
5. The human has now requested a separate task for this concern.

## Changed approach

The historical-residue decision is now separated from package-supersession
implementation so each task has one clear owner and completion condition.

## Checks

Planning-only evidence review completed.
No destructive check, package mutation, or history rewrite has been performed.

## Blockers / required decisions

- This task ultimately requires one explicit human decision:
  - retain published historical evidence and accept/document the residual public
    exposure; or
  - authorize a separately planned coordinated destructive history rewrite after
    reviewing its full impact.
- Until that decision is made, no destructive history operation is authorized.
- This task must remain non-mutating until the currently active template-
  maintenance task is completed/finalized or the human explicitly reprioritizes
  the active task.

## Remaining work

1. Re-establish exact live refs and activate this task with a fresh review base.
2. Reverify, without reproducing the value, exactly where the historical residue
   remains reachable and which package revisions are active/superseded.
3. Reverify that mutable task records and active/new package outputs contain no raw
   runtime identifier and that ledger-only package handling prevents recursive
   propagation.
4. Summarize the two resolution choices and their concrete provenance/operational
   impact for the human.
5. Obtain explicit human disposition.
6. If retain-history is chosen:
   - add the public-safe deviation record;
   - state clearly that the historical value remains recoverable;
   - keep recurrence/active-package safeguards enforced;
   - update `TEMPLATE-PACKAGE-SUPERSESSION-001` so this externalized decision is no
     longer ambiguously carried as its own implementation blocker.
7. If destructive removal is chosen:
   - do not rewrite immediately;
   - first create/review a bounded migration plan covering affected refs,
     package/provenance digests, task records, clones/worktrees, downstream
     consumers, and rollback/coordination requirements;
   - require explicit destructive authorization for the exact plan before any
     history rewrite.
8. Run appropriate public-safety/provenance checks, independently review exact
   resulting records, and complete normal maintenance handoff.

## Next action

Remain queued. On activation, verify current residue/safeguards first; do not ask
the human to decide from stale package claims and do not repeat the identifier.

## Relevant durable records

- `docs/work/current/TEMPLATE-PACKAGE-SUPERSESSION-001-same-task-package-supersession.md`
- `docs/deviations.md`
- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `scripts/validate-template-development.mjs`
- `changes/TEMPLATE-PACKAGE-SUPERSESSION-001.rev2/manifest.json`
- current active package manifest for `TEMPLATE-PACKAGE-SUPERSESSION-001` at
  activation time

## Last handoff commit

None
