# Task progress

## Task ID

TEMPLATE-BRIDGE-GITHUB-PAGINATION-CACHE-001

## Status

In progress.

## Task-start developer SHA

`5dad89af63057545677e47d546783184b5e8c65d`

## Review-base developer SHA

`5dad89af63057545677e47d546783184b5e8c65d`

## Original task brief

Repair the bridge GitHub paginated-control cache defect that can hide newly created issue comments after an issue crosses a pagination boundary. Preserve ETag caching and all existing admission/no-replay behavior. The exact reproduced condition is an open control issue with more than 100 comments where a later command marker exists on a new page, fresh bridge polls continue successfully, but the marker is never admitted because a 304 cached full page can reuse an old no-next-page topology. Implement the smallest robust correction for 100-to-101 and later exact-page-boundary growth, add focused regression coverage, keep AS-BUILT truthful in the same implementation commit, and run proportional bridge/repository checks. Do not modify main or web-orchestration. Do not alter the parked lifecycle task marker or replay it; that task will be resumed only after this poller fix is independently verified.

## Current objective

Make cached paginated GitHub collection reads discover a newly created next page after a 304 response on an exactly full cached page, without disabling ETag caching globally or changing command semantics.

## Current position

Task record created from exact remote developer `5dad89af63057545677e47d546783184b5e8c65d`. The canonical lifecycle issue is parked by temporarily removing its control label; its unadmitted sequence-22 marker remains unchanged. Source inspection identified `GitHubClient.cachedPage()` / `paginate()` as the bounded implementation surface and `tools/opencode-bridge/tests/protocol-github.test.ts` as the existing pagination/ETag regression surface.

## Observed

- `cachedPage()` persists page data plus parsed `next` under the page URL and ETag.
- HTTP 304 returns the cached page data and cached `next` value.
- `paginate()` stops when that cached `next` is absent.
- Control issues and issue comments are the only current `paginate()` callers, both with `per_page=100`.
- An exactly full final page can remain body-identical when a new page is created; a 304 can therefore leave a formerly correct cached no-next topology stale.
- Existing pagination tests verify normal multi-page ETag reuse but do not cover creation of a new page after an exactly full cached page.

## Interpretation

On 304 only, when neither current response metadata nor cached metadata supplies a next link and the cached page length exactly equals the requested `per_page`, deriving the immediately following page number is sufficient to probe for pagination growth. Empty or partial next pages terminate normally, while existing explicit `next` links remain authoritative.

## Attempts

None beyond source/reproduction inspection.

## Changed approach

None.

## Checks

- Exact developer/source refs read remotely before task start.
- Current `github.ts`, pagination regression tests, developer agreement, and applicable skills inspected.

## Blockers / required decisions

None.

## Remaining work

Implement the bounded cached-page continuation fallback, add the exact boundary regression, update AS-BUILT in the same implementation commit, run CI/focused checks, independently review the exact commit, then create a task-record-only handoff snapshot.

## Next action

Create one atomic implementation commit containing source, focused regression, AS-BUILT, and this task-progress update.

## Relevant durable records

- `tools/opencode-bridge/src/github.ts`
- `tools/opencode-bridge/tests/protocol-github.test.ts`
- `tools/opencode-bridge/AS-BUILT.md`
- parked lifecycle issue #49

## Last handoff commit

None
