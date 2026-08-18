# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

Developer-side model-routing architecture complete and validated; ready for handoff snapshot.

## Task-start developer SHA

`e8574647aaeb1dc87b955191189eac0a5904c132`

## Review-base developer SHA

`e8574647aaeb1dc87b955191189eac0a5904c132`

## Original task brief

Resume the existing mapped session after the verified runtime refresh. The independent smoke on issue #57 proved `small-developer` now executes as `cliproxyapi/gemini-3.7-flash-high`, and the accidental branch is absent. FIRST verify the current checkout is clean, on `developer`, and exactly at remote `e8574647aaeb1dc87b955191189eac0a5904c132`; if not, stop without cleanup or mutation and report the exact state. If exact, continue the parent task and finish only the developer-side model-routing architecture described in this issue: public selectors become model-agnostic `small|heavy` with small default; small developer remains Gemini/high; heavy developer remains Sol/high; `workspace.start` gains closed `small|heavy` selection with small default mapped to `small-workspace-maintainer` / `heavy-workspace-maintainer`; current schemas, protocol/examples, source, tests, validators, runtime smoke expectations, current docs/AS-BUILT/deviations, and the existing parent developer progress record must agree. Preserve Scout behavior, do not touch template-development, main, web-orchestration, or packages. Run proportional/full relevant checks, push each commit, and end with the normal exact pushed handoff snapshot.

## Current objective

Finish the developer-side model-routing architecture by replacing legacy `luna|sol` public selector vocabulary with model-agnostic `small|heavy` (default `small`), configuring `start` to map `small` to `small-developer` (`cliproxyapi/gemini-3.7-flash-high` with `high` reasoning) and `heavy` to `large-developer` (`openai/gpt-5.6-sol` with `high` reasoning), and configuring `workspace.start` to accept closed `small|heavy` selection with default `small` mapped to `small-workspace-maintainer` and `heavy-workspace-maintainer`. Ensure all protocol docs, schemas, source, tests, validators, and architecture records agree while preserving Scout behavior.

## Current position

- Absorbed bootstrap commits `4dcd3f58fde789c88c2a31d866f82264a6ff89eb`, `8d767012c2faba67d173351f817dfe98ed31f245`, `3f50f73d9e64fd416994f2ffd0b62c5461094b60`, and `e8574647aaeb1dc87b955191189eac0a5904c132`.
- Updated `tools/opencode-bridge/src/commands.ts` with `AgentRoute = "small" | "heavy"`, default `"small"`, `developerAgents` (`small-developer` / `large-developer`), `workspaceAgents` (`small-workspace-maintainer` / `heavy-workspace-maintainer`), closed validation throwing `agent must be small or heavy`, `start()` handling `agent` for both developer and workspace kinds, and `changeRoute()` rejecting workspace route changes with `fixed workspace route`.
- Updated `tools/opencode-bridge/src/service.ts` to configure `developerAgents` and `workspaceAgents`.
- Updated `contracts/opencode-bridge/protocol.md` command envelope example and command table.
- Updated `scripts/validate-agent-system.mjs` to validate `small-developer.md` with `cliproxyapi/gemini-3.7-flash-high` and `high` reasoning effort.
- Updated `scripts/validate-web-orchestrator-integration.mjs` to validate start command `agent` against `["small", "heavy"]`.
- Updated `scripts/validate-opencode-bridge.mjs` and `tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs`.
- Updated bridge test suites in `tools/opencode-bridge/tests/workspace.test.ts`, `workflow.test.ts`, `projection-commands.test.ts`.
- Updated durable architecture records `README.md`, `docs/architecture/AS-BUILT.md`, `docs/architecture/agent-system.md`, `docs/architecture/opencode-bridge.md`, `docs/architecture/design-record.md`, and `tools/opencode-bridge/AS-BUILT.md`.

## Observed

- Verified start state: git working tree clean, on `developer`, at remote commit `e8574647aaeb1dc87b955191189eac0a5904c132`.
- Accidental remote branch `noop-temp-should-not-create` was absent.
- `scripts/validate-agent-system.mjs`: passed after updating `small-developer` expected model to `cliproxyapi/gemini-3.7-flash-high` / `high`.
- `scripts/validate-opencode-bridge.mjs`: passed.
- `npm --prefix tools/opencode-bridge run build`: passed cleanly with TypeScript compiler.
- `npm --prefix tools/opencode-bridge test`: passed all 113 tests in 6.8s.
- `node --test tests/template-branches.test.mjs`: passed all 8 branch tests.
- `./scripts/validate-opencode-bridge.sh`: passed all contracts, build, and 121 total tests.
- `./scripts/validate-repository.sh`: passed all pre-implementation checks, agent-system validation, research checks, hook validation, and bridge tests.
- `git diff --check`: clean (no whitespace or formatting errors).

## Interpretation

The developer-side model-routing architecture is complete, consistent, and fully verified. Public selector vocabulary across developer start, workspace start, and developer route commands is model-agnostic `small|heavy` with `small` default. The underlying agent mappings correctly bind to Gemini Flash high for small developer and workspace maintainer, and GPT 5.6 Sol high for heavy developer and workspace maintainer. Scout trusted runtime remains unchanged on pinned OpenCode with `openai/gpt-5.6-luna`.

## Attempts

- Initial test run identified missing assignment of `currentGitState` and `workspaceRuntime` during `CommandExecutor` constructor refactoring; restored both properties and resolved all test failures.
- Unique session ID constraint in SQLite state was handled in `workspace.test.ts` fixture client by incrementing session counter on repeated `session.create` calls.

## Changed approach

None. The implementation followed the directed model-routing architecture specifications directly.

## Checks

- `./scripts/bootstrap-agent-workflow.sh --check`: passed.
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed.
- `npm --prefix tools/opencode-bridge run build`: passed.
- `npm --prefix tools/opencode-bridge test`: 113/113 passed.
- `node --test tests/template-branches.test.mjs`: 8/8 passed.
- `./scripts/validate-opencode-bridge.sh`: passed.
- `./scripts/validate-repository.sh`: passed.
- `git diff --check`: passed.

## Blockers / required decisions

None. All developer-side model routing changes are implemented and verified.

## Remaining work

1. Create and push the implementation commit on `developer`.
2. Create and push the dedicated handoff snapshot commit.
3. Return the six-field completion response.

## Next action

Stage all modified implementation files, create the implementation commit, push it to origin/developer, create the handoff snapshot commit, push it, and report completion.

## Relevant durable records

- `README.md`
- `contracts/opencode-bridge/protocol.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/design-record.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-workspace-maintenance-agent.md`
- `docs/work/current/TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001-model-routing-bootstrap.md`

## Last handoff commit

`3d3cbad0bbfb7feff60b64be10860aeec7a242f3`
