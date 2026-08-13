# Task progress

## Task ID

`WOR-001-SCOUT-RUNTIME`

## Status

In progress.

## Task-start developer SHA

`7480d4ede556a068f00abce30da42e4eb064cdd3`

## Review-base developer SHA

`7480d4ede556a068f00abce30da42e4eb064cdd3`

## Original task brief

Implement the Luna/high read-only OpenCode Scout, lightweight concurrent
exact-ref Scout transport and isolation, coexistence with one mutating developer
task, and an explicit concise developer response contract containing status and
the exact pushed handoff developer SHA or `none`. Scout sessions and results must
be task/request correlated and public-safe, may run concurrently without an
orchestration-policy cap, and must be technically denied repository/OpenCode
mutation, Git mutation, delegation, steering, acceptance, or orchestration
synthesis. Update contracts, deterministic tests, validators, AS-BUILT, design,
and deviation records atomically; work only on `developer` and push each coherent
commit.

## Current objective

Implement a separate lightweight Scout lifecycle over the sequence-free request
lane while retaining the one-mutating-task boundary and exact-ref isolation.

## Current position

Implementation and validation are complete in the working tree. The pinned
runtime contract has been reconciled against OpenCode `1.18.16`; only the
coherent implementation commit, push, and final task-progress snapshot remain.

## Observed

- Host OpenCode `1.18.17` resolves repository-agent `reasoningEffort: high` into
  the provider option; the bridge pins OpenCode/SDK `1.18.16`.
- Bridge start can select a named primary agent directly, so Scout does not need
  the `task` tool.
- Current task sessions are one-per-mutating-task; Scout sessions need their own
  request mapping and recovery ownership.
- Existing global open-issue serialization must distinguish mutating task
  sessions from Scout-only issue bindings.
- Pinned OpenCode `1.18.16` exposes resolved agents through `app.agents` without
  a `tools` member. `tool.ids` covers built-ins but not dynamic MCP tools;
  `Permission.disabled` uses the last matching permission rule. Runtime
  enforcement therefore verifies the resolved Luna/high agent, a wildcard deny,
  every live built-in tool, required read/search tools, external-path isolation,
  and explicit mutation/delegation denials before creating a Scout session.
- Session message pages are returned in chronological order after the runtime
  reverses its descending database query, so selecting the final assistant item
  yields the latest response.

## Interpretation

Extend the existing sequence-free request lane with `scout.start` and
`scout.status`, map each Scout independently, and bind its client to a detached
worktree at one verified developer commit. This avoids the mutating issue/task
progress/finalization lifecycle while reusing authorization, projection, event
recovery, and public outbox boundaries.

## Attempts

The initial plan assumed the live agent inventory would expose its resolved tool
map. Pinned `Agent.Info` does not. The implementation now combines resolved
permission rules with `tool.ids`, and additionally requires the wildcard deny so
dynamic MCP tools absent from that inventory remain disabled.

## Changed approach

None.

## Checks

- Prerequisite task remote synchronization verified at
  `7480d4ede556a068f00abce30da42e4eb064cdd3`.
- `opencode --version`: host `1.18.17`.
- `opencode debug agent small-developer`: tracked primary agent model and
  reasoning option resolve; full debug config is intentionally not used.
- Host `opencode debug agent repository-scout`: resolved primary agent is
  `openai/gpt-5.6-luna` with `reasoningEffort: high`; only `read`, `glob`, and
  `grep` are enabled under current runtime flags, while mutation tools are false.
- Pinned source inspection at release commit
  `a3647eb025c7615159d417dcc49fc39fdaeba65b`: agent merge in
  `packages/opencode/src/agent/agent.ts`, tool filtering in
  `packages/opencode/src/session/llm/request.ts`, permission evaluation in
  `packages/opencode/src/permission/index.ts`, and chronological message paging
  in `packages/opencode/src/session/message-v2.ts` support the implemented
  contract.
- `cd tools/opencode-bridge && npm test`: 56 tests, 56 passed, 0 failed on host
  Node `26.4.0` after adding the schema-2-to-3 correlation migration proof.
- Official Node `22.13.0` archive checksum: OK; exact-minimum TypeScript build
  and 56 emitted tests passed, 0 failed. Its expected `node:sqlite`
  experimental warnings were observed.
- `./scripts/validate-repository.sh`: repository validation passed; bridge
  56/56 and branch-initializer 8/8.
- `git diff --check`: passed.

## Blockers / required decisions

None.

## Remaining work

- Commit and push the coherent implementation boundary.
- Record exact synchronization evidence and push the task-progress snapshot.

## Next action

Commit and push the validated implementation boundary.

## Relevant durable records

- `.opencode/agents/`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/{agent-system,design-record,opencode-bridge}.md`
- `contracts/opencode-bridge/`

## Last handoff commit

None.
