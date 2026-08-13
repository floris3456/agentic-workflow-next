# Task progress

## Task ID

`BRIDGE-LIVE-SMOKE-001`

## Status

In progress.

## Task-start developer SHA

`802aecea59a3420e4c41cc2c336605e68fd79041`

## Review-base developer SHA

`802aecea59a3420e4c41cc2c336605e68fd79041`

## Original task brief

> This was the response from the testing agent I want you to identify the problem and fix it immediately.

Context: disposable issue #6 failed after posting contract-invalid Scout and
start envelopes supplied by the standalone smoke prompt.

## Current objective

Keep the public protocol strict while making mandatory Git guards a durable
pre-ledger admission rule, making parser diagnostics identify unknown fields,
and adding regression evidence for the exact live failure shapes.

## Current position

The strict runtime/schema, durable admission, precise diagnostic, protocol,
AS-BUILT, and deterministic regressions are implemented. Exact Node 22.13.0
focused and full repository/cross-branch validation pass. Commit, push, and
controlled bridge restart remain.

## Observed

- Both Scout requests contained unsupported `arguments.sha`, branch text in
  `arguments.ref`, and an array for `arguments.scope`.
- The start command placed `expected` under `arguments`, so the parsed command
  had no top-level expected-state guard.
- Strict Scout parsing correctly rejected its inputs. Start entered the ledger
  and consumed sequence 1 before executor guard validation failed.
- No open control issue or active bridge mutation remains. Both services are
  active and enabled; local and remote `developer` match exactly.

## Interpretation

Aliases or implicit field relocation would weaken a closed safety contract. The
smallest robust bridge change is precise diagnostics plus durable admission-time
rejection of missing or invalid mandatory guards, without consuming sequence.

## Attempts

- A direct `node --test --experimental-strip-types tests/*.test.ts` invocation
  failed before test execution because the TypeScript tests intentionally import
  build-time `.js` paths. The supported build-then-test path was used instead and
  passed.

## Changed approach

None.

## Checks

- Exact Node `22.13.0` TypeScript build: passed.
- Exact Node `22.13.0` bridge suite: 62/62 passed.
- New regressions prove the issue-#6 `sha` diagnostic, durable rejection of a
  nested guard, unchanged sequence 1, mandatory promotion guard, and
  `command.status` recovery of the pre-ledger rejection.
- Exact Node `22.13.0` full repository validation: passed, including bridge
  62/62, branch initializer 8/8, agent/research/structure checks, standalone
  Project validation, and cross-branch integration.
- Exact Node `22.13.0` Project package tests: 14/14 passed.
- `git diff --check`: passed.

## Blockers / required decisions

None.

## Remaining work

- Commit and push the coherent developer change.
- Install the built candidate by controlled bridge restart and verify service
  health/boot enablement.
- Record the exact pushed handoff snapshot.

## Next action

Commit and push the validated implementation candidate.

## Relevant durable records

- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`

## Last handoff commit

`802aecea59a3420e4c41cc2c336605e68fd79041`
