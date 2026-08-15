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

Control issue 26 is canonical. No other issue was open when the task started. The delegated Sol developer route is active. The first working cycle pushed only the required developer task record at interim SHA `0b4813240c5ee2358789d01b66293ff9cf91efed`, then idled without a valid six-field handoff after two operator-local `.opencode/*` permission requests were rejected. Sequence 3 later returned `indeterminate` because that second permission object had already disappeared; it must not be retried. Sequence 4 successfully delivered a continuation steer to the same session. After substantial independent inspection with no newer mailbox event, one sequence-free `task.status` reconciliation request is now pending publication; it does not repeat work or consume command sequence.

## Independently established findings

- Package generation validates local commits/ancestry but can stamp `source-lock.json` canonical identity without proving the supplied repository/history is canonical.
- Package validation binds individual patch SHA-256 values but has no explicit provenance/content-binding model.
- Bridge repository validation accepts owner/repository by normalized suffix and does not authenticate Git host.
- Scout worktree creation uses ordinary `git worktree add --detach`; repo-controlled hooks are not disabled.
- Scout startup uses the ordinary OpenCode server, resolves agent/tools from the inspected workspace, and validates only after `app.agents` / `tool.ids` discovery.
- The inspected ref currently controls `.opencode/agents/repository-scout.md`, and the Scout contract allows LSP.
- OpenCode 1.18.16 built-in `read` resolves repository instructions into a system reminder and asynchronously warms LSP after reads.
- OpenCode 1.18.16 tool discovery can dynamically import configured custom tools, and plugin initialization can execute configured external plugins.
- Bridge bootstrap currently has no Scout-specific readiness gate; it checks ordinary OpenCode compatibility, labels, and bridge state only.
- Legacy change packages are schema 1 manifests with range metadata and per-patch hashes; a new provenance schema needs an explicit compatibility policy.

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
- Highest accepted command sequence: 4.
- Scouts launched: none.

## Command / interaction journal

- Seq 1 `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001` `start`: accepted -> applying -> succeeded; session-start transport only; exact developer guard `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `permission-6` and `permission-7`: unnecessary projected operator-local `.opencode/*` external-directory reads; both were rejected.
- Seq 2 `c4a7f831-2d64-4a64-9d20-71e3b2c5a102` `permission.reply`: accepted -> applying -> succeeded; `permission-6` rejected.
- Seq 3 `e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103` `permission.reply`: accepted -> applying -> `indeterminate`; upstream `PermissionNotFoundError` because `permission-7` was already rejected/disappeared. Do not retry.
- Developer then idled with an empty projected assistant response; remote developer contained only interim task-record commit `0b4813240c5ee2358789d01b66293ff9cf91efed`.
- Seq 4 `4f34d2e8-2b65-4bd3-94ae-843a7b7ef104` `steer`: accepted -> applying -> succeeded; continuation delivered to the same Sol session, with the permission boundary and original outcome restated.
- Pending sequence-free request, to publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","request_id":"a59300e4-22af-4d94-9805-b63d48e5f201","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"task.status","arguments":{}}
```

## Checks performed by orchestrator

- Exact authenticated branch refs established at task start.
- Maintenance contract, source-lock, package scripts/tests, bridge source/tests/contracts, Project scouting Source, and relevant durable records inspected at exact refs.
- OpenCode 1.18.16 `read.ts`, tool registry, and plugin loader inspected at the pinned upstream tag for material runtime behaviors.
- Remote developer ref/interim task-record commit independently verified after the first cycle.
- Maintainer skill confirms final package must be generated by `scripts/create-change-package.mjs` after exact source-range review and then committed/validated; no hand-built package substitute is acceptable.

## Blockers / decisions

No human-owned decision is currently required. If a required Scout isolation property cannot be achieved without a materially larger dependency, stop at that genuine architecture boundary rather than weakening the property.

## Remaining work

Publish/reconcile the single `task.status` request; absorb the terminal developer handoff; independently review the exact developer range and checks; finalize the developer durable task if repository policy requires it; update the minimal web-orchestration scouting contract; harden/test package provenance on template-development; genuinely generate and validate the deterministic change package; reconcile source-lock and maintenance records; return exact source/package handoffs. Do not promote `main`.

## Last handoff commit

None
