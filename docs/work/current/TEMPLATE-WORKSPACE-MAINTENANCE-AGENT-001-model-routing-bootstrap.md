# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

In progress; active-session gate and fail-closed quiescent instance refresh implemented and validated locally; model-routing changes re-reviewed and verified; pending template-development heavy workspace maintainer and web-orchestration reconciliation.

## Task-start developer SHA

`76e335d8968368c013e072ffc2029ab24866f882`

## Review-base developer SHA

`76e335d8968368c013e072ffc2029ab24866f882`

## Original task brief

Continue the existing parent template-maintenance task TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001; do not create a new repository task identity. FIRST require a clean synchronized developer checkout at exact remote 76e335d8968368c013e072ffc2029ab24866f882 and establish your actual live provider/model/reasoning route. Proceed only if it is exactly small-developer on cliproxyapi/gemini-3.7-flash-high with high reasoning; otherwise stop without mutation. The independently reviewed 76e335d handoff is not accepted yet because scripts/watch-developer-sync.sh can see pending_commands/pending_requests == 0 while an OpenCode developer/workspace session is still nonterminal, then stop the bridge and run scripts/bootstrap-opencode-bridge.sh; that bootstrap calls /instance/dispose for the developer root and template-development worktree, which can terminate the still-running session. This matches the observed session.error after the prior corrective publication. Fix this fail-open runtime refresh path without widening the generic web mutation allowlist: developer synchronization/rebootstrap must not dispose or restart an OpenCode directory instance while any relevant mapped developer/workspace session is nonterminal. Prefer a bridge-owned/durable active-session gate or an equivalent fail-closed mechanism, with tests that reproduce the case where command/request queues are empty but a session remains busy. Preserve safe agent-cache refresh for truly quiescent instances. Also re-review the current model-routing changes from ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9 through 76e335d8968368c013e072ffc2029ab24866f882: small developer Gemini/high; heavy developer Sol/high; public selectors small|heavy; workspace.start default-small and explicit-heavy; closed schema/protocol admission; strict workspace runtime smoke; current five-Source cross-validator; Scout behavior unchanged. Correct any concrete regression you find. Bring the existing parent developer progress record current with the actual final handoff state and truthful remaining cross-branch blockers. Run the full relevant developer repository validation, bridge build/typecheck/tests, focused watcher/bootstrap tests, and git diff --check. Push each commit and finish with the normal exact pushed handoff snapshot. Do not mutate template-development, web-orchestration, main, packages, or broader workspace-security findings.

## Current objective

Fix the fail-open runtime refresh path in developer synchronization and rebootstrap without widening generic web mutation allowlists:
1. Implement durable active-session tracking (`listActiveTaskSessions`, `listActiveScoutSessions`, `active_task_sessions` in `bridgeStatus`) and fail-closed instance cache refresh (`refreshOpenCodeInstances` / `opencode-bridge refresh-instances`).
2. Update `scripts/bootstrap-opencode-bridge.sh` and `scripts/watch-developer-sync.sh` to prevent disposing directory instances or restarting/updating while any relevant mapped developer or workspace session is nonterminal.
3. Re-review model-routing changes from `ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9` through `76e335d8968368c013e072ffc2029ab24866f882` (small developer Gemini/high, heavy developer Sol/high, selectors `small|heavy`, closed schema/protocol admission, strict workspace runtime smoke, 5-source cross-validator, Scout unchanged).
4. Add focused tests reproducing the case where command/request queues are empty but a session remains busy, and proving safe refresh for truly quiescent instances.
5. Reconcile task records and architecture docs with truthful remaining cross-branch blockers.

## Current position

- Verified clean, synchronized checkout at exact remote `76e335d8968368c013e072ffc2029ab24866f882`.
- Confirmed active live provider/model/reasoning route is `cliproxyapi/gemini-3.7-flash-high` with high reasoning (`small-developer`).
- Implemented `terminalSessionState` canonical helper in `tools/opencode-bridge/src/util.ts`.
- Implemented `listActiveTaskSessions` and `listActiveScoutSessions` on `BridgeState` in `tools/opencode-bridge/src/state.ts`.
- Updated `bridgeStatus` in `tools/opencode-bridge/src/service.ts` to report `active_task_sessions`, `active_developer_sessions`, and `active_workspace_sessions`.
- Implemented `refreshOpenCodeInstances` in `tools/opencode-bridge/src/service.ts` and `refresh-instances` in `tools/opencode-bridge/src/cli.ts` to gate `/instance/dispose` behind complete quiescence checks (0 pending commands, 0 pending requests, 0 pending deliveries, 0 active mapped task sessions, and no busy/retry sessions on OpenCode server).
- Updated `scripts/bootstrap-opencode-bridge.sh` to use `node "$package/dist/src/cli.js" refresh-instances --config "$config"`.
- Updated `scripts/watch-developer-sync.sh` to include `active_task_sessions`, `pending_response_deliveries`, and `pending_outbox` in `bridge_pending()`.
- Re-reviewed model routing changes from `ae9812b` through `76e335d`: small developer Gemini/high (`cliproxyapi/gemini-3.7-flash-high` / `high`), heavy developer Sol/high (`openai/gpt-5.6-sol` / `high`), public selectors `small|heavy`, `workspace.start` default `small` and explicit `heavy`, closed schema/protocol admission, strict workspace runtime smoke, current 5-Source Project cross-validator, and unchanged Scout behavior.
- Added tests in `tools/opencode-bridge/tests/state.test.ts` and `tools/opencode-bridge/tests/workspace.test.ts` for active session querying and fail-closed / quiescent instance refresh.
- Updated `scripts/validate-opencode-bridge.mjs` and durable architecture records `AS-BUILT.md`, `opencode-bridge.md`.

## Observed

- `./scripts/bootstrap-agent-workflow.sh --check`: passed (tracked Git hooks active).
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed.
- `npm --prefix tools/opencode-bridge run build`: passed cleanly.
- `npm --prefix tools/opencode-bridge test`: 118/118 passed (including new active-session gate and fail-closed/quiescent instance refresh tests).
- `node --test tests/template-branches.test.mjs`: 8/8 passed.
- `./scripts/validate-opencode-bridge.sh`: passed (126 total tests).
- `./scripts/validate-repository.sh`: passed.
- `git diff --check`: clean (no whitespace or formatting errors).
- Live operator runtime smoke (`npm run test:workspace-runtime-smoke`) was NOT executed because `template-development` does not yet define `heavy-workspace-maintainer`.
- Cross-branch integration validation (`WOR_WEB_ORCHESTRATION_ROOT`) was NOT executed because `web-orchestration` is unmodified and still carries legacy `luna` selectors.
- Exact push CI status is UNKNOWN on available local evidence.

## Interpretation

The active-session gate and fail-closed instance refresh eliminate the race condition where `watch-developer-sync.sh` or `bootstrap-opencode-bridge.sh` could dispose an active OpenCode directory instance while a developer or workspace task session is still nonterminal. The bridge-owned `refreshOpenCodeInstances` procedure enforces strict quiescence before calling `/instance/dispose`, preserving agent cache refresh for truly quiescent instances while protecting running sessions. Model-routing architecture and closed command admission are fully consistent with repository requirements.

## Attempts

- Initial test fixture in `workspace.test.ts` required `github.allowed_authors`, `github.comment_author`, and `github.installation_id` in `loadBridgeConfig`, and completing queued response deliveries before asserting quiescence. Corrected and verified across all 118 tests.

## Changed approach

None. Implemented the directed active-session gate, fail-closed instance refresh, and watcher synchronization updates directly.

## Checks

- `./scripts/bootstrap-agent-workflow.sh --check`: passed.
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed.
- `npm --prefix tools/opencode-bridge run build`: passed.
- `npm --prefix tools/opencode-bridge test`: 118/118 passed.
- `node --test tests/template-branches.test.mjs`: 8/8 passed.
- `./scripts/validate-opencode-bridge.sh`: passed.
- `./scripts/validate-repository.sh`: passed.
- `git diff --check`: passed.

## Blockers / required decisions

1. `template-development` branch currently lacks `heavy-workspace-maintainer` (`openai/gpt-5.6-sol` / `max`), so live operator runtime smoke cannot execute against that worktree until the heavy agent is added there.
2. `web-orchestration` branch currently still emits legacy `luna` selectors in its Project command examples; cross-branch integration remains pending until web orchestration is updated to `small`.
3. Exact remote push CI status is UNKNOWN from local workspace evidence.

## Remaining work

1. Commit and push the corrective developer implementation commit on `developer`.
2. Commit and push the dedicated developer handoff snapshot commit on `developer`.
3. Await template-development heavy agent implementation and web-orchestration selector updates for parent task reconciliation.

## Next action

Stage modified files, commit and push the corrective implementation commit, commit and push the handoff snapshot commit, and return the six-field response.

## Relevant durable records

- `README.md`
- `contracts/opencode-bridge/command.schema.json`
- `contracts/opencode-bridge/result.schema.json`
- `contracts/opencode-bridge/protocol.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/design-record.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-workspace-maintenance-agent.md`
- `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-model-routing-bootstrap.md`

## Last handoff commit

`76e335d8968368c013e072ffc2029ab24866f882`
