# Template-maintenance task progress

## Task ID

TEMPLATE-PROJECT-MAINTENANCE-ROUTE-001

## Status

In progress

## Task-start template-development SHA

dd1743d475d4fa98bda2dc533eeae776b7682538

## Review-base template-development SHA

dd1743d475d4fa98bda2dc533eeae776b7682538

## Original task brief

> Yeah fair. We'll do this at a later time though. Let's first create the missing template maintenance skill. You would also need to create the trigger in the developer instructions

## Current objective

Add a concise ChatGPT Project Source for template-maintenance work and a
permanent routing trigger that directs template evaluation or changes to the
`template-development` ledger without weakening normal authority boundaries.

## Current position

The ledger task is initialized before source inspection or implementation.
Exact live refs match the recorded source lock.

## Source ranges

- `developer`: `be315eec10030b3d4499a05b823739a2631cb897..be315eec10030b3d4499a05b823739a2631cb897` (expected unchanged)
- `web-orchestration`: `7c1a0094e77ce3fcf06515bf49b3c09b6696d9f8..pending`

## Observed

- A credentialed Project run stopped because its user constraint prohibited
  `web-orchestration` changes while the normal MCP-ON workflow required a task
  context write there.
- The repository has a local template-maintenance skill on
  `template-development`, but the uploaded ChatGPT Project package does not yet
  expose a corresponding route.

## Interpretation

Template maintenance is an exceptional same-mode procedure with a distinct
durable owner. It warrants one focused Source and one always-visible trigger,
not a broad rule claiming that user requests override higher-priority system
or safety boundaries.

## Attempts

None.

## Changed approach

None.

## Checks

- Local `template-development` equals live `origin/template-development`.
- Live `main`, `developer`, and `web-orchestration` equal `source-lock.json`.
- Tracked template-development worktree was clean before this record.

## Blockers / required decisions

None.

## Remaining work

- Commit and push this start record.
- Audit the current Project routing, inventory, installation, and validator.
- Implement and validate the minimal template-maintenance Source and trigger.
- Push the source range, create the exact package, and complete this ledger.

## Next action

Commit the start record, then inspect the isolated `web-orchestration` source
worktree.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/decisions/0001-template-development-ledger.md`
- `docs/deviations.md`

## Last handoff commit

None
