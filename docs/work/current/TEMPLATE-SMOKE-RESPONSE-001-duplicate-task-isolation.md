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

The bridge implementation, protocol, architecture, AS-BUILT, and deterministic
regression are updated. Focused bridge validation passes; the implementation is
ready for its coherent source commit before cross-branch integration.

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
- Developer source `npm test`: 72 passed, 0 failed.
- `git diff --check`: passed.

## Blockers / required decisions

None.

## Remaining work

- Commit and push the coherent bridge implementation.
- Complete and validate the independent web-orchestration prevention rules.
- Run full cross-branch repository validation.
- Reconcile this record and push the developer handoff snapshot.

## Next action

Commit and push the coherent bridge implementation and records.

## Relevant durable records

- `docs/architecture/opencode-bridge.md`
- `tools/opencode-bridge/AS-BUILT.md`

## Last handoff commit

None
