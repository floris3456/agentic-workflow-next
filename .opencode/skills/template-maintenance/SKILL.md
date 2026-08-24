---
name: template-maintenance
description: Coordinate reusable-template work across exact canonical branches and optional deterministic transfer packages.
compatibility: template-development ledger branch
---

# Template maintenance

Use this skill for the `template-maintainer` route.

## Establish current state

- Require the active branch to be `template-development`; before mutation, reconcile the working tree and `origin/template-development`.
- Read the accepted task/outcome, `source-lock.json`, and only the durable records needed for the change.
- Treat `source-lock.json` as a reconciled snapshot of canonical refs, not as authority over a task's independently reviewed source range.
- Resolve current canonical source refs from remote evidence before relying on stored SHAs.

## Source ownership

- Keep source implementation on its canonical branch. Never copy `developer` or `web-orchestration` source trees into this ledger and never merge their independent histories here.
- Web selects the source implementation route. Work executing inside a source branch uses that branch's runtime and records; Workspace Maintenance instead stays rooted here and loads `workspace-maintenance`.
- Keep template-development-owned maintenance runtime, package machinery, and their durable records on this branch.
- A source commit is evidence only after its exact remote ref is read back.

## Package only when needed

- Generate a change package only when transfer, downstream application, or release packaging is requested.
- Use the tracked `scripts/create-change-package.mjs` over exact reviewed template-development/developer/web-orchestration ranges; do not hand-build package bytes or weaken provenance.
- Package storage under `changes/**` is ledger-only and is excluded from portable template-development patch content. Superseding packages use a distinct revision directory and preserve earlier packages unchanged.
- Apply a package only through `scripts/apply-change-package.mjs`; application changes the matching downstream working tree but does not commit, push, merge, or promote it.

## Continuity and completion

- Keep the canonical task record stable when one exists; use concise task-progress only when resumable execution state is useful.
- Reconcile `source-lock.json` from independently verified canonical refs at meaningful maintenance checkpoints.
- Push when remote durability, review, CI, transfer, or checkpoint evidence is useful.
- Report the exact ledger/source SHAs, package path when one was requested, checks run, and any blocker/decision. No archival, fixed handoff template, or package is required merely to call the task complete.
