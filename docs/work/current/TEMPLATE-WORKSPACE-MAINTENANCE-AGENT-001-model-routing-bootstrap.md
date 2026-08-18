# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

In progress; developer-side model routing and closed command admission implemented and validated locally; pending template-development heavy workspace maintainer and web-orchestration reconciliation.

## Task-start developer SHA

`ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9`

## Review-base developer SHA

`ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9`

## Original task brief

Correct the independently reviewed handoff `ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9` on this SAME mapped Gemini session. FIRST require the checkout to be clean, on `developer`, synchronized to remote `ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9`; stop without cleanup or mutation on any mismatch. The first handoff is not accepted. Fix these exact findings without widening scope: (1) `tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs` is fail-open: it falls back to legacy `workspace-maintainer`, accepts Sol or Luna as a valid small route, does not assert small `reasoningEffort: high`, does not require/discover the heavy agent, and does not exercise a heavy workspace start. Make the tracked real-runtime contract fail closed: exact `small-workspace-maintainer` = `cliproxyapi/gemini-3.7-flash-high` / high; exact `heavy-workspace-maintainer` = `openai/gpt-5.6-sol` / max; no legacy-name/model fallback; verify both inventories/permissions and both default-small and explicit-heavy starts when that operator smoke is run. It is acceptable and truthful for the operator smoke to remain unexecuted until template-development supplies the heavy agent; do not weaken assertions to accommodate the current partial template branch. (2) Remove or fail-close the legacy `workspaceAgent` compatibility path that silently maps both small and heavy to one agent; likewise remove any unnecessary legacy constructor alias that can blur the closed route contract. (3) Close command admission before ledger mutation: update `contracts/opencode-bridge/command.schema.json` and `tools/opencode-bridge/src/protocol.ts` so `start`, `workspace.start`, and `route` accept only their exact allowed fields and only `small|heavy` selectors (small optional/default for starts, selector required for route). Add protocol/poller tests proving `luna`, `sol`, unknown fields, and malformed affected arguments are rejected pre-ledger without consuming sequence, while valid small/heavy commands are admitted. Keep `result.schema.json` unchanged only if its lifecycle-only shape is genuinely unaffected, and state that explicitly rather than claiming every schema changed. (4) Strengthen developer validators to pin both route mappings/default/closed selector and the no-legacy-fallback boundary. Update `scripts/validate-web-orchestrator-integration.mjs` to the current five-Source Project file names/contracts rather than removed MCP-ON files. Do NOT modify `web-orchestration`; record that current remote web source still emits legacy Luna and therefore cross-branch integration remains pending for the parent template task. Do not claim that optional cross-branch validation ran unless it actually did. (5) Correct current docs/task record: heavy workspace is Sol/max, not Sol/high; template-development still lacks `heavy-workspace-maintainer`; exact push CI is UNKNOWN on the available evidence; developer-side mapping may be ready, but the parent task remains pending template-development and web-orchestration reconciliation. Remove `fully verified` / `no blockers` overclaims. Preserve Scout runtime and behavior. Run the full relevant developer tests/validators you can actually execute, push a corrective implementation commit and normal handoff snapshot, and return the canonical six fields. Do not touch `main`, `web-orchestration`, `template-development`, packages, or broader workspace-security findings.

## Current objective

Correct developer-side model routing implementation and records after independent review:
1. Make `tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs` fail closed for exact `small-workspace-maintainer` (`cliproxyapi/gemini-3.7-flash-high` / `high`) and `heavy-workspace-maintainer` (`openai/gpt-5.6-sol` / `max`), verifying both inventories, tool/skill permissions, default-small start, and explicit-heavy start.
2. Remove legacy `workspaceAgent` single-agent option and `agents` constructor alias from `CommandExecutor`.
3. Close command admission in `contracts/opencode-bridge/command.schema.json` and `tools/opencode-bridge/src/protocol.ts` for `start`, `workspace.start`, and `route` so legacy `luna|sol` selectors and unknown/malformed argument fields are rejected pre-ledger without consuming sequence.
4. Strengthen developer validators to enforce closed model-agnostic routing and update `scripts/validate-web-orchestrator-integration.mjs` to current 5-Source Project contracts.
5. Reconcile durable records: heavy workspace is Sol/max (`openai/gpt-5.6-sol` / `max`), template-development still lacks `heavy-workspace-maintainer`, operator smoke remains unexecuted pending that agent, remote web source still emits legacy Luna, exact push CI is UNKNOWN on available local evidence, and overall parent task `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` remains pending cross-branch reconciliation.

## Current position

- Verified initial state: git tree clean, on `developer`, at remote commit `ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9`.
- Updated `smoke-workspace-runtime.mjs` to require exact `small-workspace-maintainer` (`cliproxyapi/gemini-3.7-flash-high` / `high`) and `heavy-workspace-maintainer` (`openai/gpt-5.6-sol` / `max`), test both inventories/permissions, and exercise both default-small and explicit-heavy workspace starts.
- Removed legacy `workspaceAgent` and `agents` constructor options from `CommandExecutor` in `commands.ts`.
- Updated `command.schema.json` and `protocol.ts` to enforce closed argument schemas for `start`, `workspace.start`, and `route` with `small|heavy` selectors; `result.schema.json` is unchanged as its lifecycle-only status shape is genuinely unaffected.
- Added protocol and poller regression tests proving pre-ledger rejection of `luna`, `sol`, and unknown/malformed fields without sequence consumption.
- Updated `validate-opencode-bridge.mjs` and `validate-web-orchestrator-integration.mjs`.
- Reconciled architecture docs (`AS-BUILT.md`, `agent-system.md`, `opencode-bridge.md`, `tools/opencode-bridge/AS-BUILT.md`) with heavy workspace Sol/max and explicit multi-branch dependencies.

## Observed

- `./scripts/bootstrap-agent-workflow.sh --check`: passed (tracked Git hooks active).
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed with strengthened closed-routing assertions.
- `npm --prefix tools/opencode-bridge run build`: passed cleanly.
- `npm --prefix tools/opencode-bridge test`: 114/114 passed (including new closed pre-ledger rejection and small/heavy poller tests).
- `node --test tests/template-branches.test.mjs`: 8/8 passed.
- `./scripts/validate-opencode-bridge.sh`: passed (122 total tests).
- `./scripts/validate-repository.sh`: passed.
- `git diff --check`: clean (no whitespace or formatting errors).
- Live operator runtime smoke (`npm run test:workspace-runtime-smoke`) was NOT executed because `template-development` does not yet define `heavy-workspace-maintainer`.
- Cross-branch integration validation (`WOR_WEB_ORCHESTRATION_ROOT`) was NOT executed because `web-orchestration` is unmodified and still carries legacy `luna` selectors.
- Exact push CI status is UNKNOWN on available local evidence.

## Interpretation

Developer-side model-routing source code, schemas, and validators are locally consistent, closed against legacy routes/fields, and covered by deterministic regression tests. The parent task `TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001` remains in progress across branches: `template-development` must supply `heavy-workspace-maintainer` before live operator smoke can execute, and `web-orchestration` must update its command examples from `luna` to `small`.

## Attempts

- Initial update to `smoke-workspace-runtime.mjs` used a relaxed fallback to `workspace-maintainer` and Sol/Luna models for small route. Corrected to fail closed for exact `small-workspace-maintainer` (Gemini Flash high) and `heavy-workspace-maintainer` (Sol max).
- `CommandExecutor` constructor initially retained a fallback mapping `options.workspaceAgent` to both small and heavy routes; removed this compatibility path to enforce distinct agent configuration.
- `command.schema.json` initially defined `arguments: { "type": "object" }` without per-kind arguments validation in `allOf`. Added closed `allOf` branches for `start`, `workspace.start`, and `route`.

## Changed approach

None. Followed the directed corrective review items directly.

## Checks

- `./scripts/bootstrap-agent-workflow.sh --check`: passed.
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed.
- `npm --prefix tools/opencode-bridge run build`: passed.
- `npm --prefix tools/opencode-bridge test`: 114/114 passed.
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

`ae9812ba0bb060d9f3eba056ea91bfbf1a2261b9`
