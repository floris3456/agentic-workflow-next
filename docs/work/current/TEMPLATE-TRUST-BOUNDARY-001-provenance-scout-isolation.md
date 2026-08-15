# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

in progress

## Task-start / review-base refs

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

`source-lock.json` matched the source refs at task start. `main` is not authorized for change or promotion.

## Public-safe task brief

Harden reusable-template trust boundaries across package provenance, Git remote repository identity, and independent Scout isolation while preserving portability, recovery, exact-ref review, deterministic packaging, public safety, ordinary developer OpenCode behavior, and human-only `main` promotion. Existing OpenCode Scouts are not evidence until the isolation change is independently reviewed.

## Current position

Issue 26 is canonical. The delegated Sol developer route has produced only the required task-record commit at interim `developer` SHA `0b4813240c5ee2358789d01b66293ff9cf91efed`. Two unnecessary operator-local `.opencode/*` permission requests were rejected. Two continuation prompts, a successful mapped-session abort, and a final post-abort continuation prompt were all delivered, but no new OpenCode task event, six-field handoff, or remote developer commit followed. One final sequence-free status read is persisted below to prove current mapped-session state before the delegated route is classified and absorbed.

## Independently established findings

- Package generation can stamp source-lock canonical identity without proving the supplied repository/history is canonical; package validation only binds patch digests today.
- Source-lock was pinned to task-start source refs and should remain the review-base lock through package generation, then reconcile to reviewed heads.
- Bridge origin validation authenticates only an owner/repository suffix, not host; custom `github.api_base_url` requires fail-closed host derivation rather than hard-coded github.com.
- Scout worktree creation does not disable hooks; startup shares ordinary OpenCode, discovers inspected-workspace agents/tools before validation, lets the ref own `repository-scout`, and allows LSP.
- OpenCode 1.18.16 built-in `read` injects repository instructions and warms LSP; external tool/plugin discovery can execute extensions. A trusted Scout runtime therefore needs sterile config plus trusted no-side-effect read/search with realpath containment.
- Bridge bootstrap has no Scout-specific readiness gate.
- Legacy package manifests are schema 1; new provenance validation needs explicit legacy compatibility without representing old packages as newly provenance-valid.
- There is no standalone `scripts/validate-change-package.mjs`; package validation currently lives in `validate-template-development.mjs` and `apply-change-package.mjs`.

## Route / active work

- Developer: delegated Sol; exact GitHub is the independent review boundary.
- Existing Scouts: none launched/prohibited as evidence.
- Web-orchestration/template-development source edits wait until the developer route is terminal and absorbed.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Highest accepted command sequence: 7.

## Command / interaction journal

- Seq 1 `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001` start: succeeded; mapped Sol session created with exact developer guard.
- Seq 2 `c4a7f831-2d64-4a64-9d20-71e3b2c5a102`: permission-6 reject succeeded.
- Seq 3 `e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103`: permission-7 reject ended `indeterminate` because upstream had already rejected/removed it; never retry.
- Seq 4 `4f34d2e8-2b65-4bd3-94ae-843a7b7ef104` steer: succeeded; no new OpenCode turn observed.
- Status `a59300e4-22af-4d94-9805-b63d48e5f201`: succeeded; mapped session idle, latest projected response unchanged/empty, bridge heartbeat live.
- Seq 5 `7c0c9751-c2d3-4c47-a610-9b1723ecf105` steer: succeeded; no new OpenCode turn or developer SHA change.
- Seq 6 `d5fe7280-c92d-4370-b6be-acde4da9e106` abort: succeeded with `result: true`; no Git revert/change.
- Seq 7 `1edcb408-5db7-4bde-898f-51cfb8f56d07` steer: accepted -> applying -> succeeded; final post-abort continuation delivered. After an independent review interval, issue and remote developer state remained unchanged.
- Pending sequence-free status request, to publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","request_id":"ed71b30a-613a-4d99-b010-cba5e630f208","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"task.status","arguments":{}}
```

## Checks performed by orchestrator

Exact refs; maintenance/source-lock/package contracts; bridge source/tests/contracts; Project scouting Source; durable records; and pinned OpenCode 1.18.16 read/config/tool/plugin behavior have been independently inspected. Remote `developer` is still `0b4813240c5ee2358789d01b66293ff9cf91efed`. The maintainer skill requires the final package to be genuinely generated by `scripts/create-change-package.mjs` after exact source review and then committed/validated; no hand-built substitute is permitted.

## Blockers / decisions

No human-owned architecture decision yet. If the final status confirms the same idle/no-response state, stop retrying this developer session, record the delegated route as terminated/absorbed with only its task-record effect, and choose the shortest safe remaining implementation route without pretending the developer completed product work.

## Remaining work

Publish/reconcile the final status read; classify/absorb the delegated route; complete/review developer source through the next justified route; update the minimal web-orchestration contract; harden/test package provenance on template-development; genuinely generate/validate the deterministic package; reconcile source-lock/durable records; return exact source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

None
