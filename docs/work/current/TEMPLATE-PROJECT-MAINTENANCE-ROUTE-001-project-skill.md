# Template-maintenance task progress

## Task ID

TEMPLATE-PROJECT-MAINTENANCE-ROUTE-001

## Status

Completed

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

Both exact source ranges and the reconciled template-development package are
pushed and remotely confirmed. The package passes integrity validation and
dry-runs cleanly from both recorded bases. This dedicated progress snapshot
closes the maintenance cycle.

## Source ranges

- `template-development`: `dd1743d475d4fa98bda2dc533eeae776b7682538..551d8fe45113bd126f47682c8fb4116c1894a0b0` (package handoff before this dedicated snapshot)
- `developer`: `be315eec10030b3d4499a05b823739a2631cb897..e2700f586fe8ab634053eb514bb9da487e881a21`
- `web-orchestration`: `7c1a0094e77ce3fcf06515bf49b3c09b6696d9f8..279631a3e14c6293933852baec98dd662f575277`

## Observed

- A credentialed Project run stopped because its user constraint prohibited
  `web-orchestration` changes while the normal MCP-ON workflow required a task
  context write there.
- The repository has a local template-maintenance skill on
  `template-development`, but the uploaded ChatGPT Project package does not yet
  expose a corresponding route.
- Normal MCP-ON continuity is hard-coded to
  `web-orchestration-only/task-context/**`; template-maintenance evaluation needs
  `docs/work/current/**` on `template-development` as its alternative canonical
  owner.
- Developer AS-BUILT, agent-system, and design records repeat the derived count
  of seven Project Sources. Keeping those exact counts would make them false as
  soon as the focused Source is added.
- The new Source explicitly substitutes one template-development maintenance
  record for normal web task context, imports ordinary MCP-ON continuity fields,
  distinguishes evaluation from reusable changes, and retains independent
  source/package review.
- The permanent router lets the current request override template defaults and
  routine procedures only within non-overridable platform, public-safety,
  no-replay, authority, and exact-SHA boundaries.

## Interpretation

Template maintenance is an exceptional same-mode procedure with a distinct
durable owner. It warrants one focused Source and one always-visible trigger,
not a broad rule claiming that user requests override higher-priority system
or safety boundaries.

## Attempts

None.

## Changed approach

The generic Codex skill initializer was not used because this artifact is a flat
ChatGPT Project Source governed by the package's exact inventory, not a Codex
skill directory. Its concise trigger, focused body, and negative validation
still follow the skill-creator guidance.

## Checks

- Local `template-development` equals live `origin/template-development`.
- Live `main`, `developer`, and `web-orchestration` equal `source-lock.json`.
- Tracked template-development worktree was clean before this record.
- The Project currently validates seven exact Sources and 21 package tests.
- The updated Project validates eight exact Sources and 23 package tests.
- Exact Node 22.13.0 full repository validation passed: bridge 72/72, branch
  initializer 8/8, Project 23/23, and all repository/cross-branch validators.
- Both exact source ranges pass `git diff --check`.
- Change package contains 4 developer paths and 8 web-orchestration paths.
- Both package patches apply cleanly from their exact bases in a disposable
  checkout; manifest digests and ledger validation pass.
- Final exact Node 22.13.0 integrated repository validation passed against the
  pushed source heads; its terminal result was `Repository validation passed.`

## Blockers / required decisions

None.

## Remaining work

None.

## Next action

None. The human may review the exact source and ledger ranges, install the
updated eight-Source Project package, or apply the validated package to a
downstream repository through its normal branch workflow.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/decisions/0001-template-development-ledger.md`
- `docs/deviations.md`
- `changes/TEMPLATE-PROJECT-MAINTENANCE-ROUTE-001/manifest.json`

## Last handoff commit

551d8fe45113bd126f47682c8fb4116c1894a0b0
