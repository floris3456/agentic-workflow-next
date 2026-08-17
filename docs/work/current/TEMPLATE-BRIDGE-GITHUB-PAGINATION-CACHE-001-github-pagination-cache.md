# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-GITHUB-PAGINATION-CACHE-001

## Status

Blocked on local runtime-load proof

## Task-start template-development SHA

ed821a140707b13084f8c62e743442dacf4b4201

## Review-base template-development SHA

ed821a140707b13084f8c62e743442dacf4b4201

## Public-safe task brief

Repair a bridge GitHub issue-comment pagination/cache defect that can hide newly created comments after an issue crosses a pagination boundary. Keep the fix bounded to control-plane retrieval/cache behavior and focused regression coverage. Do not modify or promote main or change web-orchestration. Preserve the parked lifecycle task and never replay its unadmitted route command.

## Current objective

Prove the reviewed pagination fix is loaded by the local bridge and makes the original page-2 sequence-22 marker on lifecycle issue #49 discoverable exactly once without reposting it.

## Current position

Fresh canonical refs at task start were developer `5dad89af63057545677e47d546783184b5e8c65d`, template-development `ed821a140707b13084f8c62e743442dacf4b4201`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and main `6127611113dfdb66f93a0cfd2d355359aa370833`.

Canonical lifecycle issue #49 contains route sequence 22 / command `e9a777cb-8e35-4a33-985a-52e553bc05e2`. The marker was published once and remained unacknowledged while a fresh local status observation proved bridge heartbeat and GitHub polling were advancing after publication with no pending command/request/outbox. Issue #49 had crossed the 100-comment page boundary.

The pagination repair used isolated canonical issue #52 after #49 was parked by temporarily removing only its `agentic-bridge` label. Developer task-start record commit is `30e0c897255d39cb76a6f02895f58a478d3fa842`. Sol implemented the bounded source correction at `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4` and pushed task-record-only handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`. Issue #52 published the completed six-field OpenCode handoff, both implementation and handoff repository Actions succeeded, and #52 is closed completed.

Independent review confirms the exact `30e0c897... -> 7bc274c4...` range is two commits and four affected files: the developer task record, `tools/opencode-bridge/src/github.ts`, `tools/opencode-bridge/tests/protocol-github.test.ts`, and `tools/opencode-bridge/AS-BUILT.md`. The implementation preserves explicit current/cached next links and only derives a next-page probe on HTTP 304 when the cached page exactly fills one validated positive safe-integer `per_page`; page arithmetic is safe-integer bounded and the existing pagination origin/loop checks remain authoritative. The focused regression caches exactly 100 comments with no next link, receives 304 on page 1, exposes command-bearing comment 101 on page 2, and proves discovery. Existing ordinary multi-page ETag coverage remains.

After review, #49's `agentic-bridge` label was restored without changing or reposting sequence 22. A bridge diagnostic initially reported multiple open mapped mutating issues because #52 was still open; #52 was then closed, leaving #49 as the sole open mutating control task. Subsequent GitHub reads still show the original sequence-22 marker without accepted/rejected/applying/terminal acknowledgement. A sequence-free status read on #52 proves the bridge heartbeat continued after #49 was relabeled, but remote evidence cannot identify which developer runtime fingerprint/SHA that live bridge process has installed.

## Source ranges

- developer: `5dad89af63057545677e47d546783184b5e8c65d..7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- implementation: `30e0c897255d39cb76a6f02895f58a478d3fa842..3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4`
- handoff: `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4..7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Pre-fix `GitHubClient.cachedPage()` reused cached page data and cached `next` topology on HTTP 304; `paginate()` stopped when cached `next` was absent.
- Control issues and issue comments are the current pagination callers and use `per_page=100`.
- A cached exactly-full final page can remain body-identical while a newly created next page appears, making body ETag validity insufficient to prove pagination topology.
- The fix prioritizes current 304 Link metadata, then cached explicit next metadata, then an exactly-full validated next-page probe.
- The new regression observes pages `1`, `1`, `2`, retains conditional ETag reuse on page 1, and discovers command marker 101.
- Focused protocol/GitHub tests passed 16/16; full bridge tests passed 100/100; agent-system, bridge, repository validators and `git diff --check` passed according to the developer record.
- GitHub repository Actions succeeded for implementation `3f6eae08...` and handoff `7bc274c4...`.
- #52 is terminal, absorbed, independently reviewed, and closed completed.
- #49 is again labeled for bridge control and is the only open mutating control task; promotion-review issues #46-#48 are Scout-only.
- The original #49 sequence-22 marker has not been replayed, replaced, edited, or duplicated.
- A fresh bridge heartbeat after relabel proves a running process, but GitHub does not expose the sync watcher's installed developer SHA/runtime fingerprint.

## Interpretation

The tracked source defect is fixed and independently reviewed. The remaining acceptance uncertainty is local deployment state, not source-review uncertainty: the running bridge may still be the pre-fix process if the developer synchronization watcher has not completed its drain/bootstrap/restart cycle. Replaying sequence 22 would destroy the strongest acceptance evidence and is prohibited. The next safe observation is the Git-private developer-sync status/installed SHA plus current bridge status.

If the local installed SHA is `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98` (or a later descendant containing the fix) and the bridge has polled after #52 closure while sequence 22 remains invisible, the pagination repair is insufficient and needs further source diagnosis. If the installed SHA is older, allow/repair the normal sync watcher deployment first; do not manually replay sequence 22.

## Attempts

1. Reconciled sequence 22 repeatedly without replay; GitHub showed only the original source marker.
2. Fresh local operator status proved the bridge was healthy and polling after sequence 22 was posted.
3. Read pre-fix `github.ts` and identified cached `next` reuse on 304 as the matching pagination-boundary mechanism.
4. Parked #49 by removing only its control label; did not close the issue or change/repost sequence 22.
5. Created the required template and developer task records, then delegated the bounded source repair to Sol on isolated issue #52.
6. Independently reviewed implementation `3f6eae08...`, handoff `7bc274c4...`, exact changed paths, focused regression, and successful GitHub Actions.
7. Restored #49's label without replay. An initial multi-mutating-issue freeze was reconciled by closing completed #52; #49 is now the sole mutating issue.
8. Sequence 22 remains unacknowledged after a fresh remote bridge heartbeat, leaving local runtime-load state as the unresolved fact.

## Changed approach

The lifecycle source task remains paused at its exact original sequence-22 marker. The poller repair is source-complete, but maintenance completion waits for real adapter acceptance against that same marker and for the runtime-load state to be proven locally.

## Checks

- Exact source refs and task bindings independently reread during the repair.
- Exact `30e0c897... -> 7bc274c4...` developer range reviewed: two commits, four intended files only.
- Implementation and handoff GitHub Actions concluded success.
- #52 terminal OpenCode response independently reconciled to exact handoff `7bc274c4...`.
- #52 closed completed only after route terminal/absorbed and independent source review.
- #49 relabel restored; no sequence-22 replay or replacement occurred.
- Open control issues reconciled: #49 is the only mutating task; #46-#48 are Scout-only.

## Blockers / required decisions

Local runtime-load proof is required because connected GitHub cannot read the Git-private developer-sync installed SHA/status. No human decision is required; this is an observation/capability boundary.

`source-lock.json` remains intentionally unchanged until real acceptance and maintenance packaging/finalization are resolved; this task owns its exact source range independently.

## Remaining work

1. Read the local developer-sync `status` and `installed-sha`, local HEAD/origin-developer, and current bridge status without restarting or mutating anything.
2. If the installed runtime is old, let the normal watcher safely synchronize/rebootstrap/restart; diagnose only if its status says blocked/error.
3. Once the installed runtime contains `7bc274c4...`, observe #49. The original sequence-22 marker must be accepted/applied exactly once without reposting.
4. Reconcile that same-session Sol route and complete the remaining lifecycle second-terminal correction.
5. Package this pagination correction on template-development in maintenance order only after real acceptance; do not hand-build provenance.
6. Continue separate lifecycle/path-synthesis/Node-floor/finalization promotion blockers afterward.

## Next action

Obtain one fresh local developer-sync/runtime snapshot; do not restart the bridge or replay sequence 22 before that observation.

## Relevant durable records

- Pagination source issue #52 (closed completed)
- Pagination implementation `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4`
- Pagination developer handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- Canonical lifecycle issue #49 and original sequence-22 command `e9a777cb-8e35-4a33-985a-52e553bc05e2`
- Current web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- Current main `6127611113dfdb66f93a0cfd2d355359aa370833`

## Last handoff commit

None
