# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-GITHUB-PAGINATION-CACHE-001

## Status

In progress

## Task-start template-development SHA

ed821a140707b13084f8c62e743442dacf4b4201

## Review-base template-development SHA

ed821a140707b13084f8c62e743442dacf4b4201

## Public-safe task brief

Repair a bridge GitHub issue-comment pagination/cache defect that can hide newly created comments after an issue crosses a pagination boundary. Keep the fix bounded to control-plane retrieval/cache behavior and focused regression coverage. Do not modify or promote main or change web-orchestration. Preserve the parked lifecycle task and never replay its unadmitted route command.

## Current objective

Make paginated GitHub control scans discover a newly created next page even when an earlier cached page returns HTTP 304 with an unchanged body, then prove the original parked sequence-22 marker can be discovered exactly once after restoring its control label.

## Current position

Fresh canonical refs at task start: developer `5dad89af63057545677e47d546783184b5e8c65d`, template-development `ed821a140707b13084f8c62e743442dacf4b4201`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, main `6127611113dfdb66f93a0cfd2d355359aa370833`.

Canonical lifecycle issue #49 contains route sequence 22 / command `e9a777cb-8e35-4a33-985a-52e553bc05e2`. The marker was published once and remained unacknowledged. A later fresh local status observation proved bridge heartbeat and GitHub polling were advancing after that publication with no pending command/request/outbox. GitHub issue #49 had more than 100 comments, while remote readback still showed no accepted/rejected/applying/terminal marker for sequence 22.

The `agentic-bridge` label has been temporarily removed from #49, leaving the issue open and the sequence-22 source marker unchanged. This parks the canonical lifecycle task and prevents the unadmitted route from executing while the poller is repaired. A public recovery note on #49 records that it must not be replayed or replaced.

## Source ranges

- developer: `5dad89af63057545677e47d546783184b5e8c65d..pending`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- `GitHubClient.cachedPage()` caches both page data and the parsed `next` link under the page URL/ETag.
- On HTTP 304, `cachedPage()` returns the cached `next` value rather than deriving pagination from current response metadata.
- `paginate()` stops when the returned page has no cached `next` value.
- `listIssueComments()` uses this cached pagination path with `per_page=100`.
- Issue #49 crossed 100 comments. Sequence 22 is on the later page but was not admitted even though the bridge successfully polled GitHub afterward.
- This is consistent with page 1 remaining body-identical across the 100-to-101 transition, receiving 304, and reusing a cached pre-boundary `next` value that omitted page 2.
- Current repository search found no focused regression for a 304 response whose pagination topology changes at a page boundary.

## Interpretation

The strongest current explanation is a pagination-topology cache bug: an ETag-valid cached page body is not sufficient to cache whether a next page now exists. The fix should not disable caching globally or duplicate control markers. It should make pagination discovery authoritative even when a cached page returns 304, with focused tests for the boundary transition and stable multi-page behavior.

## Attempts

1. Reconciled sequence 22 repeatedly without replay; GitHub showed only the original source marker.
2. Fresh local operator status proved the bridge was healthy and polling after sequence 22 was posted.
3. Read current `github.ts` and identified cached `next` reuse on 304 as the matching pagination-boundary mechanism.
4. Parked #49 by removing only its control label; did not close the issue or change/repost sequence 22.

## Changed approach

The lifecycle source task is temporarily parked because its control marker cannot be consumed reliably. Repair the control-plane pagination defect first, then restore #49 and continue the same lifecycle task/session without replay.

## Checks

- Exact live source refs independently reread before this ledger write.
- Exact #49 comments reread; sequence 22 has no bridge acknowledgement.
- Current `tools/opencode-bridge/src/github.ts` inspected at developer `5dad89af63057545677e47d546783184b5e8c65d`.
- #49 label removal remotely confirmed.

## Blockers / required decisions

None for the bounded poller correction.

`source-lock.json` still reflects the previously reconciled source/package state and is not being advanced here because the active lifecycle maintenance task has an unfinalized source range/package dependency. This task keeps its own exact review base/range.

## Remaining work

Implement the smallest pagination/cache correction on developer with focused tests; run repository CI; independently review the exact source range. Then restore the `agentic-bridge` label on #49 and prove the original sequence-22 marker is discovered/admitted exactly once without reposting it. Reconcile the resulting same-session Sol route before returning to lifecycle work. Package this poller correction later in maintenance order without widening another task's range.

## Next action

Implement and validate the paginated-comment 304 boundary correction on developer using a bounded source route.

## Relevant durable records

- Canonical lifecycle issue #49 and original sequence-22 command `e9a777cb-8e35-4a33-985a-52e553bc05e2`
- Current developer `5dad89af63057545677e47d546783184b5e8c65d`
- Current template-development `ed821a140707b13084f8c62e743442dacf4b4201`
- Current web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- Current main `6127611113dfdb66f93a0cfd2d355359aa370833`

## Last handoff commit

None
