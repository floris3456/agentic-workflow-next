# Task progress

## Task ID

TEMPLATE-SMOKE-RESPONSE-001

## Status

Completed

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

The bridge containment, deterministic regression, contracts, implementation
records, and cross-branch validator are pushed. The independent Project
correction is pushed. Exact-minimum integrated validation and the live service
check pass; this source task is ready for orchestrator/human review.

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
- Exact Node 22.13.0 Project package tests: 18 passed, 0 failed.
- Exact Node 22.13.0 cross-branch validator: passed against
  `web-orchestration` `52ddf36e9bb08006db3a1fc35128f2ee3bdefc13`.
- Exact Node 22.13.0 full repository validation: bridge 72/72, branch
  initializer 8/8, Project 18/18, structure/agent/research/cross-branch checks
  passed; final result `Repository validation passed.`
- Exact developer range `ccfa12dc2783c7e8fc336abc503e083b69112a71..2a4a6ce7c3e1587fc80bb8553fd85d6c67d1b147`:
  `git diff --check` passed; 8 changed paths, 225 insertions, 7 deletions.
- Running bridge: active, OpenCode `1.18.16` compatible, and command/request/
  response-delivery/outbox pending counts all zero.

## Blockers / required decisions

None.

## Remaining work

None for this source task. Independent review, downstream package application,
and any human-approved promotion remain outside developer implementation.

## Next action

Web/template-maintenance orchestrator reviews the exact developer and
web-orchestration ranges and packages the approved content.

## Relevant durable records

- `docs/architecture/opencode-bridge.md`
- `tools/opencode-bridge/AS-BUILT.md`

## Last handoff commit

None
