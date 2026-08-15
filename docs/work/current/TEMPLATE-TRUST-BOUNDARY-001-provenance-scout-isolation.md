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

`source-lock.json` matched the three source refs at task start. `main` must remain unchanged and is not authorized for promotion.

## Public-safe task brief

Harden reusable-template trust boundaries across package provenance, Git remote repository identity, and independent Scout isolation. Preserve portability, recovery, exact-ref review, deterministic packaging, public safety, normal developer OpenCode behavior, and human-only `main` promotion. Existing OpenCode Scouts are not evidence for this task until the isolation changes are independently reviewed.

## Current position

Control issue 26 is canonical. No other issue was open when the task started. The delegated Sol developer route is active. The first working cycle created and pushed the required developer task record at interim developer SHA `0b4813240c5ee2358789d01b66293ff9cf91efed` but then idled after permission interactions with an empty projected assistant response; that is not a valid developer handoff. Both requests to read operator-local `.opencode/*` state are now cleared as rejected. Sequence 3 arrived after the second permission had already been rejected upstream and therefore ended `indeterminate` with `PermissionNotFoundError`; it must not be retried. A sequence-4 steer to continue the same developer session is persisted below and is not yet published.

## Independently established findings

- Template package generation validates local commits and ancestry but can stamp `source-lock.json` canonical identity without proving the supplied repository/history is canonical.
- Current package validation binds patch SHA-256 values but has no explicit package provenance/content-binding model.
- Bridge repository validation accepts owner/repository by normalized suffix and does not authenticate Git host.
- Scout worktree creation uses ordinary `git worktree add --detach`; repo-controlled hooks are not disabled.
- Scout startup uses the ordinary OpenCode server, resolves agent/tools from the inspected workspace, and validates only after `app.agents` / `tool.ids` discovery.
- The inspected ref currently controls `.opencode/agents/repository-scout.md`, and the Scout contract allows LSP.
- Exact OpenCode 1.18.16 source confirms built-in `read` resolves repository instructions into a system reminder and asynchronously warms LSP after reads.
- Exact OpenCode 1.18.16 source confirms tool discovery can dynamically import configured custom tools and plugin initialization can execute configured external plugins.

## Implementation / review route

- Developer: delegated Sol because runtime isolation, Git behavior, adversarial tests, and durable records require local tooling and coordinated edits.
- Existing Scouts: prohibited as evidence for this task.
- Independent review: connected GitHub exact files/ranges and proportional checks.
- Web-orchestration and template-development source mutation will not begin until the developer mutating route is terminal and absorbed.

## Issue mapping / active work

- Canonical control issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Related issues: none.
- Selected developer: Sol.
- Active source route: developer.
- Highest accepted command sequence: 3.
- Scouts launched: none.

## Command / interaction journal

- Sequence 1 `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001`, `start`: accepted -> applying -> succeeded; session-start transport only; expected developer `e2700f586fe8ab634053eb514bb9da487e881a21`, ref `developer`.
- Permission aliases `permission-6` and `permission-7`: both requested projected operator-local `.opencode/*` external-directory access. This access was judged unnecessary and outside the task evidence boundary.
- Sequence 2 `c4a7f831-2d64-4a64-9d20-71e3b2c5a102`, `permission.reply`: accepted -> applying -> succeeded; `permission-6` rejected.
- Public event evidence then showed `permission-7` already rejected upstream.
- Sequence 3 `e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103`, `permission.reply`: accepted -> applying -> `indeterminate`; upstream returned `PermissionNotFoundError` because `permission-7` no longer existed. Do not retry.
- Developer then idled with an empty projected assistant response. Remote developer had advanced only to the task-record commit `0b4813240c5ee2358789d01b66293ff9cf91efed`; no six-field handoff was produced.
- Pending sequence 4, to be published byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":4,"command_id":"4f34d2e8-2b65-4bd3-94ae-843a7b7ef104","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"steer","arguments":{"message":"Continue the same TEMPLATE-TRUST-BOUNDARY-001 developer task from the current session and repository state. Both operator-local .opencode external-directory requests are rejected and cleared; do not inspect unrelated global customization. Use tracked repository files plus public/upstream source evidence as needed. Complete the requested bridge repository-identity and Scout isolation implementation, adversarial tests, validators, and durable records; run proportional checks; push the exact developer handoff; then return exactly the six required fields. The remote developer branch currently contains the interim task-record commit 0b4813240c5ee2358789d01b66293ff9cf91efed. Do not modify main or web-orchestration, do not promote, and do not use existing Scouts as evidence."}}
```

## Checks performed by orchestrator

- Exact authenticated branch refs established at task start.
- Maintenance contract, source-lock, package scripts/tests, bridge source/tests/contracts, Project scouting Source, and relevant durable records inspected at exact refs.
- OpenCode 1.18.16 `read.ts`, tool registry, and plugin loader inspected at the pinned upstream tag for the material runtime behaviors.
- Remote developer ref and interim task-record commit independently verified after the first developer cycle.

## Blockers / decisions

No human-owned decision is currently required. If a required Scout isolation property cannot be achieved without a materially larger dependency, stop at that genuine architecture boundary rather than weakening the property.

## Remaining work

Publish sequence 4; absorb the terminal developer handoff; independently review the exact developer range and checks; finalize the developer durable task if repository policy requires it; update the minimal web-orchestration scouting contract; harden and test package provenance on template-development; generate/validate the deterministic change package; reconcile source-lock and maintenance records; return exact source/package handoffs. Do not promote `main`.

## Last handoff commit

None
