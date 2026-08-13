# Task progress

## Task ID

TEMPLATE-SMOKE-RESPONSE-001

## Status

In progress

## Task-start developer SHA

ccfa12dc2783c7e8fc336abc503e083b69112a71

## Review-base developer SHA

ccfa12dc2783c7e8fc336abc503e083b69112a71

## Original task brief

Repair the reusable bridge so a second open control issue that repeats an
already-bound task ID is rejected per marker without aborting the poll cycle or
starving durable accepted work. Preserve one-task/one-issue binding, no-replay,
sequence, task isolation, and public projection. Add deterministic regression
coverage and update AS-BUILT/architecture facts. The source fix must support the
matching web-orchestration prevention rules maintained independently.

## Current objective

Contain duplicate task issues at the authenticated marker boundary and prove
that one bad issue cannot prevent already accepted commands or requests from
running.

## Current position

The source task is initialized after the abandoned disposable smoke run was
reconciled and its three issues were closed. No source implementation file has
yet changed in this task.

## Observed

- A second issue reused a task ID already durably bound to an earlier issue.
- `BridgeState.bindIssueTask` correctly rejected the conflicting binding by
  throwing, but the poller did not convert that expected conflict into a
  per-marker rejection.
- The uncaught conflict aborted each poll cycle after acknowledgements could be
  queued, so durable accepted work remained unapplied.
- A runtime-equivalent prototype rejected the duplicate markers, let the poll
  complete, and drained the previously accepted command and request.

## Interpretation

The one-task/one-issue constraint is correct. Its expected violation must be a
localized admission rejection rather than a control-loop exception.

## Attempts

- An initial direct GitHub cleanup helper used an invalid constructed URL and
  produced no external effect. The corrected helper used explicit string
  concatenation, posted one cancellation note, and closed the three disposable
  issues successfully.

## Changed approach

None.

## Checks

- Prototype focused regression: passed.
- Prototype bridge suite: 72 tests passed, 0 failed.
- Live runtime prototype: duplicate issue received three terminal rejections;
  pending commands, requests, response deliveries, and outbox all reached zero.

## Blockers / required decisions

None.

## Remaining work

- Apply the proven source and regression changes.
- Reconcile bridge architecture and AS-BUILT documentation.
- Run focused and full repository validation.
- Commit and push the implementation and handoff snapshot.

## Next action

Apply the isolated, already-tested poller and regression changes to developer.

## Relevant durable records

- `docs/architecture/opencode-bridge.md`
- `tools/opencode-bridge/AS-BUILT.md`

## Last handoff commit

None
