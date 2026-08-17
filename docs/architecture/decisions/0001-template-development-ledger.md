# ADR-0001: Use an independent template-development ledger

- Status: Accepted
- Date: 2026-08-14

## Context

A project created from this template must be able to diagnose and improve the
template while normal project work continues, preserve that maintenance context
through compaction, and carry an exact reviewed fix between the project and the
canonical template repository.

One combined branch cannot be an exact copy of `main`, `developer`, and
`web-orchestration`: `main` and `developer` may contain different blobs at the
same paths, while `web-orchestration` has an independent history. Copying all
three trees into new paths would create a second, drifting implementation
authority.

## Decision

Keep `template-development` as an independent maintenance branch that is
included when a project is generated with all template branches. It stores:

- exact source locks and cross-branch task continuity;
- template-maintenance AS-BUILT, decisions, deviations, and task progress; and
- deterministic exact-range change packages; and
- the template-development-rooted Workspace Maintenance Agent, its sole
  repository skill authority, its narrow OpenCode plugin, and the validated
  containment/package runtime that implements those maintenance capabilities.

Product, bridge, and web-orchestration implementation remains in isolated
worktrees of the real `developer` and `web-orchestration` branches. The
maintenance runtime named above is intentionally authoritative on
`template-development`; it does not make that branch a copy of either source
tree. Reviewed content moves between repositories as a validated three-range
patch package, never by merging the ledger branch. Every `main` promotion retains
its normal human exact-SHA approval.

## Consequences

- Template work remains recoverable after compaction without polluting product
  history or duplicating source trees.
- Canonical and downstream repositories can exchange the same reviewed content
  even when their branch histories differ.
- A maintenance task has multiple independently pushed source ranges rather than
  artificial cross-branch atomicity.
- A package that changes the maintenance runtime carries a reviewed
  `template-development` implementation range ending before the commit that
  stores the package itself.
- Generated projects must include all branches and keep their source lock
  current; template updates are not automatic.

## Rejected alternatives

- A combined full-copy branch was rejected because overlapping paths cannot
  represent multiple exact versions and copied code would drift.
- Merging the independent histories was rejected because it would blur branch
  authority and bypass each branch's review and promotion rules.
- Keeping only informal notes or an upstream remote was rejected because neither
  provides compaction-safe task state, integrated records, or a deterministic
  content-transfer boundary.
