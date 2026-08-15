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

Issue 26 is canonical. The delegated Sol developer route is the only active source mutation. It pushed only its required task record at interim `developer` SHA `0b4813240c5ee2358789d01b66293ff9cf91efed`, then idled after two unnecessary operator-local `.opencode/*` permission requests were rejected. Two same-session continuation prompts were accepted by the bridge but produced no new OpenCode message/event or remote Git change. A sequence-free status read proved the mapped session idle with a live bridge heartbeat and the same empty projected tool-call response. Sequence 6 then called the mapped session abort operation as a bounded state-clear recovery and succeeded with `result: true`; this does not revert files or Git. One final same-session continuation prompt is now persisted below.

## Independently established findings

- Package generation validates local commits/ancestry but can stamp `source-lock.json` canonical identity without proving the supplied repository/history is canonical.
- Package validation binds per-patch SHA-256 but has no explicit provenance/content-binding model.
- Source-lock was pinned to the task-start source refs; keep those refs as review-base lock through package generation, then reconcile source-lock to reviewed heads afterward.
- Bridge repository validation accepts owner/repository by normalized suffix without authenticating Git host; custom `github.api_base_url` means the acceptable Git host must be derived fail-closed from API/repository identity rather than hard-coded.
- Scout worktree creation does not disable hooks; startup shares ordinary OpenCode, discovers inspected-workspace agents/tools before validation, lets the ref own `repository-scout`, and allows LSP.
- OpenCode 1.18.16 built-in `read` injects repository instructions and warms LSP; custom tool/plugin discovery can execute extensions. Project config can be disabled and external plugins suppressed, but a trusted read/search layer is still required for no-side-effect reads and realpath containment.
- Bridge bootstrap currently has no Scout-specific readiness gate.
- Legacy package manifests are schema 1; new provenance validation needs explicit legacy compatibility without treating old packages as newly provenance-valid.

## Route / active work

- Developer: delegated Sol; exact GitHub is the independent review boundary.
- Existing Scouts: none launched/prohibited as evidence.
- Web-orchestration/template-development source edits wait until developer mutation is terminal and absorbed.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Highest accepted command sequence: 6.

## Command / interaction journal

- Seq 1 `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001` start: accepted -> applying -> succeeded; initial Sol session created with exact developer guard.
- `permission-6` / `permission-7`: projected operator-local `.opencode/*`; both rejected.
- Seq 2 `c4a7f831-2d64-4a64-9d20-71e3b2c5a102`: permission-6 reject succeeded.
- Seq 3 `e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103`: permission-7 reject ended `indeterminate` with `PermissionNotFoundError` because upstream had already removed it. Never retry.
- Seq 4 `4f34d2e8-2b65-4bd3-94ae-843a7b7ef104` steer: succeeded, no new OpenCode turn observed.
- Sequence-free status `a59300e4-22af-4d94-9805-b63d48e5f201`: succeeded; mapped session idle, latest projected response unchanged/empty, live bridge heartbeat.
- Seq 5 `7c0c9751-c2d3-4c47-a610-9b1723ecf105` steer: accepted -> applying -> succeeded, again with no new OpenCode event or developer SHA change observed.
- Seq 6 `d5fe7280-c92d-4370-b6be-acde4da9e106` abort: accepted -> applying -> succeeded; OpenCode returned `result: true`, status `aborted`. No Git content was reverted or changed by the bridge operation.
- Pending sequence 7, to publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":7,"command_id":"1edcb408-5db7-4bde-898f-51cfb8f56d07","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"steer","arguments":{"message":"The stale mapped OpenCode turn was successfully aborted. Resume TEMPLATE-TRUST-BOUNDARY-001 now in this same Sol session from the existing developer task-record commit. Do not inspect operator-local .opencode or unrelated global customization. Implement the full requested repository-identity and Scout trust-boundary hardening, focused adversarial tests, validators, and truthful durable records; run proportional checks; push the exact developer handoff; then return exactly the required six fields. If the session still cannot execute the task, return a valid blocked or needs decision six-field response naming the concrete execution blocker rather than idling silently."}}
```

## Checks performed by orchestrator

Exact refs; maintenance/source-lock/package contracts; bridge source/tests/contracts; Project scouting Source; durable records; and pinned OpenCode 1.18.16 read/config/tool/plugin behavior have been independently inspected. The maintainer skill requires the final package to be genuinely generated by `scripts/create-change-package.mjs` after exact source review and then committed/validated; no hand-built substitute is permitted.

## Blockers / decisions

No human-owned architecture decision yet. Current risk is developer execution-state recovery rather than source evidence. If this final post-abort continuation also cannot produce a valid terminal developer response, stop repeating prompts and reconcile the local OpenCode/operator boundary explicitly.

## Remaining work

Publish/reconcile seq 7; absorb/review the terminal developer range; finalize its durable task if required; make the minimal reviewed web-orchestration contract change; harden/test package provenance on template-development; genuinely generate/validate the deterministic package; reconcile source-lock/durable records; return exact source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

None
