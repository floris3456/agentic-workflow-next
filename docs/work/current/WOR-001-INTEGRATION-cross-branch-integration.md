# Task progress

## Task ID

`WOR-001-INTEGRATION`

## Status

In progress.

## Task-start developer SHA

`d2ddfd6aa5c34d1abe8d1f2127108c859f262045`

## Review-base developer SHA

`d2ddfd6aa5c34d1abe8d1f2127108c859f262045`

## Original task brief

Prove the independently implemented `developer` bridge/Scout runtime and
`web-orchestration` Project package satisfy one compatible redesign contract;
provide deterministic evidence for every approved acceptance scenario; reconcile
tests, validators, contracts, AS-BUILT/design/deviation records, and all task
progress; run complete validation on exact Node 22.13.0; and publish synchronized,
mechanically clean branch candidates without modifying or promoting `main`.

## Current objective

Publish the validated integration boundary, reconcile exact candidate SHAs, and
leave both independent branch candidates ready for the one final review.

## Current position

Developer Tasks 1-2 and independent Project-package Task 3 are completed and
pushed. A developer-side cross-branch validator now checks the exact supplied
Project checkout against developer schemas, agents, response/Scout contracts,
non-semantic transport, and lifecycle behavior; focused host checks pass.

## Observed

- The Project validator encodes all seven approved orchestration acceptance
  scenarios and parses the four sequence-free request examples plus the sequence
  1 mutating start example.
- Developer bridge tests cover the runtime lifecycle, status, projected response,
  Scout concurrency, and isolation requirements independently.

## Interpretation

Keep the independent histories separate. Add cross-branch compatibility evidence
to the smallest authoritative developer-owned contract/test surface and leave
Project-only judgment policy in the web package validator.

The integration validator is opt-in to ordinary repository validation through
`WOR_WEB_ORCHESTRATION_ROOT`; this keeps normal implementation runtime and clones
independent from the unrelated branch while making candidate validation exact
when both worktrees are present.

## Attempts

The first integration-validator run compared two required Markdown phrases
without normalizing line wrapping. It correctly stopped but produced two false
contract mismatches; comparison now normalizes whitespace while retaining exact
wording and the validator passes.

## Changed approach

None.

## Checks

- Task-start local and remote `developer`:
  `d2ddfd6aa5c34d1abe8d1f2127108c859f262045`.
- Task-start Project package `web-orchestration`:
  `d89b22a439047558ffccbda32a04b14a376b170a`.
- Authority `main` remains
  `6127611113dfdb66f93a0cfd2d355359aa370833`.
- Host `node scripts/validate-web-orchestrator-integration.mjs
  <independent-package>`: passed for protocol `agentic-bridge/1`, four request
  kinds, exact six-field handoff, Scout/runtime boundaries, and Project revision
  `d89b22a439047558ffccbda32a04b14a376b170a`.
- Host `node scripts/validate-agent-system.mjs`: passed after strengthening the
  exact completed/blocked/failed/needs-decision and push/SHA response checks.
- Host `node scripts/validate-opencode-bridge.mjs`: passed.
- `git diff --check`: passed.
- Exact Node 22.13.0 full integrated
  `WOR_WEB_ORCHESTRATION_ROOT=<independent-package> ./scripts/validate-repository.sh`:
  passed; pre-implementation, agent-system, research/manifest, hooks, bridge
  contracts, 56/56 bridge tests, 8/8 branch-initializer tests, and cross-branch
  integration all passed. The expected upstream `node:sqlite` experimental
  warnings were observed.
- Exact Node 22.13.0 Project suite: 9/9 passed; standalone validator passed with
  eight exact Sources, distinct modes/scouting, seven scenarios, five continuity
  files, and protocol `agentic-bridge/1`.

## Blockers / required decisions

None.

## Remaining work

Inspect exact branch ranges, complete and push task records, and verify candidate
synchronization before the sole final reviewer.

## Next action

Audit and publish the developer integration boundary.

## Relevant durable records

- `contracts/opencode-bridge/`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/{agent-system,design-record,opencode-bridge}.md`
- `docs/architecture/AS-BUILT.md`
- `docs/work/current/WOR-001-BRIDGE-LIFECYCLE-bridge-lifecycle-and-recovery.md`
- `docs/work/current/WOR-001-SCOUT-RUNTIME-scout-and-developer-runtime.md`
- `scripts/validate-web-orchestrator-integration.mjs`

## Last handoff commit

None.
