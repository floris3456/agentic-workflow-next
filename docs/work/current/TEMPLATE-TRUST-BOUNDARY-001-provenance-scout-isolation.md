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

Issue 26 is the one canonical control issue; none existed when the task began. The delegated Sol developer route remains the only active source mutation. Its first cycle pushed only the required task record at interim `developer` SHA `0b4813240c5ee2358789d01b66293ff9cf91efed`, then idled without a valid handoff after two unnecessary operator-local `.opencode/*` permission requests were rejected. Sequence 4 delivered a continuation steer but produced no new OpenCode message/event. A sequence-free `task.status` then proved the mapped session is still idle, the latest projected response is the same empty tool-call message, and the bridge heartbeat is current. One focused same-session prompt retry is pending below.

## Independently established findings

- Package generation validates local commits/ancestry but can stamp `source-lock.json` canonical identity without proving the supplied repository/history is canonical.
- Package validation binds per-patch SHA-256 but has no explicit provenance/content-binding model.
- Bridge repository validation accepts owner/repository by normalized suffix without authenticating Git host.
- Scout worktree creation uses ordinary `git worktree add --detach`; repo-controlled hooks are not disabled.
- Scout startup uses the ordinary OpenCode server, resolves agent/tools from the inspected workspace, and validates only after `app.agents` / `tool.ids` discovery.
- The inspected ref controls `.opencode/agents/repository-scout.md`; the Scout contract allows LSP.
- OpenCode 1.18.16 built-in `read` injects repository instructions and asynchronously warms LSP; tool/plugin discovery can dynamically execute configured extensions.
- OpenCode config discovery includes global config/home `.opencode`, project `.opencode` unless explicitly disabled, and optional configured directories. `OPENCODE_DISABLE_PROJECT_CONFIG`, `--pure`/`OPENCODE_PURE`, and sterile HOME/XDG are therefore material parts of any separate Scout runtime, not substitutes for a trusted read layer.
- Bridge bootstrap currently has no Scout-specific readiness gate.
- Legacy change packages are schema 1 manifests; a provenance schema change needs explicit compatibility behavior.

## Route / active work

- Developer: delegated Sol; exact GitHub is the independent review boundary.
- Existing Scouts: none launched and prohibited as evidence.
- Web-orchestration/template-development source edits wait until developer mutation is terminal and absorbed.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Highest accepted command sequence: 4.

## Command / interaction journal

- Seq 1 `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001` start: accepted -> applying -> succeeded; initial Sol session created with exact `developer` guard `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `permission-6` / `permission-7`: projected operator-local `.opencode/*`; both rejected as unnecessary/out of evidence boundary.
- Seq 2 `c4a7f831-2d64-4a64-9d20-71e3b2c5a102`: permission-6 reject succeeded.
- Seq 3 `e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103`: permission-7 reject ended `indeterminate` with `PermissionNotFoundError` because upstream had already rejected/removed it. Never retry.
- Seq 4 `4f34d2e8-2b65-4bd3-94ae-843a7b7ef104` steer: accepted -> applying -> succeeded; prompt delivery returned success but no subsequent OpenCode event/message was observed.
- Sequence-free task-status request `a59300e4-22af-4d94-9805-b63d48e5f201`: accepted -> succeeded; mapped session idle, latest projected response unchanged/empty, live bridge heartbeat.
- Pending sequence 5, to publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":5,"command_id":"7c0c9751-c2d3-4c47-a610-9b1723ecf105","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"steer","arguments":{"message":"Resume and finish TEMPLATE-TRUST-BOUNDARY-001 now in the same mapped Sol session. The previous continuation prompt was accepted by the bridge but produced no new OpenCode message. Do not request or inspect operator-local .opencode/global customization. Continue from the existing developer task-record commit, implement the full requested repository-identity and Scout trust-boundary hardening with focused adversarial tests and truthful durable records, run proportional checks, push the exact developer handoff, and return exactly the required six fields. If execution itself is blocked, return a valid blocked/needs decision six-field response with the concrete blocker instead of idling silently."}}
```

## Checks performed by orchestrator

Exact branch refs; maintenance/source-lock/package contracts; bridge source/tests/contracts; Project scouting Source; durable records; and pinned OpenCode 1.18.16 `read`, config-path/flags, tool registry, and plugin loader have been independently inspected. The maintainer skill requires the final package to be genuinely generated by `scripts/create-change-package.mjs` after exact source review and then committed/validated; it will not be hand-built.

## Blockers / decisions

No human-owned decision yet. If a required Scout isolation property genuinely needs a materially larger dependency, implement all safe independent fixes and stop at that architecture decision rather than weaken the property.

## Remaining work

Publish sequence 5; absorb/review the terminal developer range; finalize its durable task if required; make the minimal reviewed web-orchestration contract change; harden/test package provenance on template-development; genuinely generate/validate the deterministic package; reconcile source-lock/durable records; return exact source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

None
