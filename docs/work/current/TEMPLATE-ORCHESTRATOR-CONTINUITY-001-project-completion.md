# Template-maintenance task progress

## Task ID

TEMPLATE-ORCHESTRATOR-CONTINUITY-001

## Status

In progress

## Task-start template-development SHA

e1c7db3ac1158370ffa35c249287722801f6e450

## Review-base template-development SHA

e1c7db3ac1158370ffa35c249287722801f6e450

## Original task brief

> Great incorporate all these things while keeping the same mindset as before: minimalism and effectiveness. Also use the system you just built for template development. While you are at it create the ADR in docs that I just stated 2 sentences before.

## Current objective

Integrate the reusable completion barrier and connector-delivery recovery rules into the minimal MCP-ON Project package, and add an ADR for the template-development ledger decision.

## Current position

The ledger task is initialized before source-branch edits. Exact live source refs match `source-lock.json`; source implementation has not started.

## Source ranges

- `developer`: `be315eec10030b3d4499a05b823739a2631cb897..be315eec10030b3d4499a05b823739a2631cb897` (expected unchanged)
- `web-orchestration`: `9f83a8eebc401c820acc8b7a2b0cc0733319950b..pending`

## Observed

- Current Project policy already covers canonical task issues, trusted lifecycle reconstruction, no mutation replay, interaction priority, exact-SHA review, and Scout synthesis.
- It lacks one explicit all-launched-work completion barrier, a durable active-work/absorption ledger, connector-refusal evidence, and continuation of an indispensable unpublished operation across bounded delivery windows.
- The template-development design exists as a design record and AS-BUILT, but no numbered architecture decision record captures the accepted ledger-versus-combined-tree choice.
- GitHub connector readback confirmed exact remote heads: `main` `6127611113dfdb66f93a0cfd2d355359aa370833`, `developer` `be315eec10030b3d4499a05b823739a2631cb897`, `web-orchestration` `9f83a8eebc401c820acc8b7a2b0cc0733319950b`, and `template-development` `e1c7db3ac1158370ffa35c249287722801f6e450`.

## Interpretation

Keep the always-visible rule to one sentence, put operational detail in existing MCP-ON Sources, and add only the task-context fields needed to survive compaction. Smoke-only probes remain outside the installed package.

## Attempts

- A shell `git fetch` was blocked before GitHub by the environment HTTPS tunnel (`CONNECT 403`). Read-only GitHub connector ref lookups provided live remote evidence without changing state.

## Changed approach

None.

## Checks

- Pre-change tracked worktree: clean.
- Local template-development HEAD equals live `origin/template-development`: observed.
- Cached source refs equal live GitHub refs and `source-lock.json`: observed.

## Blockers / required decisions

None.

## Remaining work

- Commit and push this start record.
- Implement and validate the Project package changes on `web-orchestration`.
- Add and validate the template-development ADR.
- Review exact source ranges, create the portable change package, reconcile source lock/AS-BUILT/progress, and push the final ledger handoff.

## Next action

Commit and remotely verify the start record, then edit the isolated `web-orchestration` worktree.

## Relevant durable records

- `docs/design/template-maintenance-workflow.md`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- Planned `docs/architecture/decisions/0001-template-development-ledger.md`

## Last handoff commit

None
