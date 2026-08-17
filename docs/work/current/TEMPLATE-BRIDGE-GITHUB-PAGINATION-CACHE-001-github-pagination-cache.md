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

The bounded correction and regression are implemented in the working tree. A `304` cached page now uses current then cached next-link metadata and, only when both are absent, derives the immediately following page from canonical positive safe-integer `per_page` / `page` parameters when cached data exactly fills `per_page`. The new focused regression caches exactly 100 comments without a next link, receives `304`, exposes comment 101 with a command marker on page 2, and proves discovery. AS-BUILT is updated with the implemented fact. All requested checks pass; the atomic implementation commit and terminal task-record-only handoff remain.

## Observed

- `cachedPage()` persists page data plus parsed `next` under the page URL and ETag.
- HTTP 304 returns the cached page data and cached `next` value.
- `paginate()` stops when that cached `next` is absent.
- Control issues and issue comments are the only current `paginate()` callers, both with `per_page=100`.
- An exactly full final page can remain body-identical when a new page is created; a 304 can therefore leave a formerly correct cached no-next topology stale.
- Existing pagination tests verify normal multi-page ETag reuse but do not cover creation of a new page after an exactly full cached page.
- The unchanged ordinary multi-page ETag regression still passes after the correction.
- The new exact-boundary regression observes request pages `1`, `1`, `2`, preserves the page-1 ETag conditional request, and discovers command marker 101.
- The full bridge suite now contains 100 passing deterministic tests.

## Interpretation

On 304 only, when neither current response metadata nor cached metadata supplies a next link and the cached page length exactly equals the requested `per_page`, deriving the immediately following page number is sufficient to probe for pagination growth. Empty or partial next pages terminate normally, while existing explicit `next` links remain authoritative.

## Attempts

The first focused build reported that the regression accessed the valid-only `ScannedCommand.envelope` field before TypeScript narrowing. The assertion was narrowed on `valid`, then the same focused command passed all 16 protocol/GitHub tests. No implementation route was abandoned.

## Changed approach

None.

## Checks

- Exact developer/source refs read remotely before task start.
- Current `github.ts`, pagination regression tests, developer agreement, and applicable skills inspected.
- `npm run build && node --test --test-concurrency=1 dist/tests/protocol-github.test.js` — 16 passed, including ordinary multi-page `304` reuse and the new 100-to-101 boundary regression.
- `npm --prefix tools/opencode-bridge test` (run as `npm test` from the package directory) — 100 passed.
- `node scripts/validate-agent-system.mjs` — passed.
- `./scripts/validate-opencode-bridge.sh` — bridge contracts/package structure passed; 100 package tests and 8 branch-history tests passed.
- `./scripts/validate-repository.sh` — repository validation passed; included structure, agent-system, research, hooks, bridge, 100 package tests, and 8 branch-history tests.
- `git diff --check` — passed after implementation and durable-record updates.

## Blockers / required decisions

None.

## Remaining work

Create and immediately push the atomic implementation commit, update this record with that pushed SHA, then create and push the required task-record-only handoff snapshot. Independent review remains with the orchestrator.

## Next action

Commit and push the intended four-file implementation range.

## Relevant durable records

- `tools/opencode-bridge/src/github.ts`
- `tools/opencode-bridge/tests/protocol-github.test.ts`
- `tools/opencode-bridge/AS-BUILT.md`
- parked lifecycle issue #49

## Last handoff commit

None
