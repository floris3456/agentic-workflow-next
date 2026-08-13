# Template-maintenance task progress

## Task ID

TEMPLATE-SMOKE-RESPONSE-001

## Status

In progress

## Task-start template-development SHA

08d7eb82ea13eca3285ad562f19106d84233471d

## Review-base template-development SHA

08d7eb82ea13eca3285ad562f19106d84233471d

## Original task brief

Immediately after implementing the new template-development workflow, identify
the problems in the web orchestrator's saved smoke-test response and fix them.
Use the operator-provided external response file, and start using the new branch
for this task. The host-local response path is intentionally not persisted.

## Current objective

Diagnose each concrete functional failure evidenced by the saved smoke response,
fix the reusable template on its authoritative source branch or branches, prove
the correction, and create a portable change package.

## Current position

The developer and web-orchestration repairs are pushed and synchronized, the
live bridge is running the source fix, the disposable smoke is safely closed,
and the exact cross-branch change package has been generated and dry-run
verified. Final ledger validation and handoff reconciliation remain.

## Source ranges

- Ledger: `08d7eb82ea13eca3285ad562f19106d84233471d..HEAD`.
- Developer: `ccfa12dc2783c7e8fc336abc503e083b69112a71..be315eec10030b3d4499a05b823739a2631cb897`.
- Web-orchestration: `04e111dd874c2f431805b52b3eb24c6b04de95b8..9f83a8eebc401c820acc8b7a2b0cc0733319950b`.
- Main baseline: `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- The saved checkpoint named issue 16 as the guard and omitted issue 15, even
  though issue 15 already held terminal Scout, rejected-start, and cross-task
  isolation evidence for the exact same guard task ID.
- Issue 16 repeated that guard task ID. Its first `scout.start` reached
  `BridgeState.bindIssueTask`, whose correct uniqueness exception escaped the
  poller. Each poll then aborted before durable accepted commands/requests were
  applied.
- Main issue sequence 9 and its status request were already accepted, so the
  checkpoint's reported highest accepted sequence 6 was stale. The issue-16
  exception starved both entries.
- An isolated prototype localized duplicate command/request markers into
  bounded rejections. Its full bridge suite passed 72/72. The identical compiled
  output was deployed without changing tracked developer files; issue 16 then
  received three rejections, sequence 9 reached its expected policy failure,
  and all bridge queues drained.
- A public cancellation note was posted to the disposable main issue and issues
  14, 15, and 16 were closed. No open control-label issue remains.
- The durable bridge source now preserves one task/one issue, rejects duplicate
  issue markers without aborting polling, and proves accepted work is not
  starved.
- The Project now maps every open issue by exact task ID, reuses one canonical
  issue, posts nothing on later duplicates, reconstructs the complete journal
  and highest accepted sequence, and records related issue dispositions.
- The standalone external smoke prompt is updated to v4.2 with the same
  task-to-issue map and resume rules; it remains external operator material.

## Interpretation

The invariant was sound but both prevention and containment were incomplete.
The smallest complete repair is defense in depth: the web layer never creates a
replacement task issue, while the bridge treats an unexpected duplicate as a
per-marker rejection rather than a poll-loop failure.

## Attempts

- A first public-issue cleanup helper built an empty URL and had no external
  effect. The corrected helper used the bridge's existing in-memory GitHub App
  authentication, posted one public-safe cancellation note, and closed the three
  disposable issues.
- The first package invocation used an incomplete web SHA and failed before
  creating output. The exact remote 40-character SHA was resolved and the
  package was generated successfully without deleting or overwriting anything.

## Changed approach

Because the live smoke's tracked checkout and expected SHA had to remain intact,
the bridge repair was first proven in a detached scratch worktree and deployed
as byte-identical ignored build output. After queues drained and the disposable
run was closed, the source task followed the normal developer workflow and the
service was rebuilt from pushed source. The scratch worktree was then removed.

## Checks

- Template-development local and remote matched at task start.
- The ledger validation passed before this task started.
- Live recovery: issue 16 received three task-binding rejections; main sequence
  9 reached terminal `failed` at the intended policy boundary; pending command,
  request, response-delivery, and outbox counts reached zero.
- Exact Node 22.13.0 Project validation: passed; 18/18 tests.
- Exact Node 22.13.0 full repository validation: bridge 72/72, branch initializer
  8/8, Project 18/18, structure/agent/research/cross-branch checks passed;
  `Repository validation passed.`
- Source exact-range `git diff --check`: passed on both branches.
- Change package: 8 developer paths and 10 web-orchestration paths; both patches
  passed clean dry-run application from their exact bases.

## Blockers / required decisions

None. No residual live-validation gap exists for the observed duplicate-binding
failure; a fresh full v4.2 credentialed smoke remains an optional external
observation, not required for runtime correctness.

## Remaining work

- Run final ledger validation.
- Commit and push the package/source-lock/continuity update.
- Mark this task completed and push its dedicated ledger handoff snapshot.

## Next action

Run final ledger validation, then commit and push the portable package and
reconciled source lock.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`

## Last handoff commit

None
