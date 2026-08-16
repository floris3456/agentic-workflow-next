# Template-maintenance task progress

## Task ID

TEMPLATE-CI-REACHABILITY-001

## Status

in progress

## Task-start template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Review-base template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Public-safe task brief

Make acceptance-critical executable tests on authoritative template branches remotely executable through each branch's canonical push-triggered GitHub Actions path, starting with `web-orchestration`. Add the smallest read-only branch-local workflow that runs the canonical web validator and automatically discovered Node tests, preserve minimal permissions and checkout credentials, establish the reusable CI-reachability rule, add only small robust mechanical regression protection, verify the exact pushed web SHA through the real Actions run and logs, and do not modify or promote `main`.

## Current objective

Implement and remotely prove branch-owned push CI for `web-orchestration`, then audit `developer`, `web-orchestration`, and `template-development` against the same acceptance-test reachability invariant.

## Current position

Exact live refs at task start:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `980486182c0ed8a213842477b9b1754de360a430`
- `web-orchestration`: `f3caf6b61cf76ade806824d1c4485c6993bfb150`
- `template-development`: `ee8d5e234c713727f008dcdce2ec2e30b19a41cc`

`web-orchestration` contains `web-orchestration-only/validate-package.mjs` and `web-orchestration-only/validate-package.test.mjs` but no `.github/workflows/**` path. `developer` and `template-development` already contain read-only push validation workflows.

## Source ranges

- `main`: unchanged; no promotion authorized.
- `developer`: no source change planned unless the audit finds a real invariant gap.
- `web-orchestration`: pending from `f3caf6b61cf76ade806824d1c4485c6993bfb150`.
- `template-development`: task ledger/design updates begin after `ee8d5e234c713727f008dcdce2ec2e30b19a41cc`.

## Observed

- The current web README documents local commands `node --test web-orchestration-only/validate-package.test.mjs` and `node web-orchestration-only/validate-package.mjs`.
- The web branch currently has no GitHub Actions workflow, so the prior template task could inspect the validator/test source but could not obtain authoritative remote execution when its local runtime could not reach GitHub.
- `developer` has `.github/workflows/validate-repository.yml`, triggered on pushes to `developer`, with `permissions: contents: read`, `persist-credentials: false`, and `./scripts/validate-repository.sh`; that validation reaches bridge tests and `tests/template-branches.test.mjs` through `scripts/validate-opencode-bridge.sh`.
- `template-development` has `.github/workflows/validate-template-development.yml`, triggered on pushes to `template-development`, with `permissions: contents: read`, `persist-credentials: false`, and `./scripts/validate-template-development.sh`; that script runs the ledger validator and `tests/change-package.test.mjs`.
- `source-lock.json` remains deliberately frozen at the predecessor provenance snapshot and does not match current source heads.

## Interpretation

The smallest durable fix is branch-local: add one `web-orchestration` push workflow, have it run the canonical validator plus discovery-mode `node --test`, and make the existing web validator reject removal or material weakening of that CI path. The reusable rule belongs in the web-orchestrator template-maintenance procedure because future orchestrators are the consumers that need remote execution when local execution is unavailable. No central dispatcher or write-capable Actions mechanism is required.

## Attempts

None yet.

## Changed approach

None.

## Checks

- Exact remote branch heads and maintenance contract inspected before this record.
- Existing `developer` and `template-development` push workflows and their canonical validation scripts inspected.
- Exact current web validator, Node test suite, README, and task-continuity rule inspected.

## Blockers / required decisions

No implementation decision is blocked. Deterministic change-package generation/reconciliation remains ordered behind the existing predecessor provenance lock; do not move `source-lock.json` merely to package this task.

## Remaining work

Implement the scoped web changes, verify the exact push-triggered Actions run through jobs/steps/logs, review the exact changed range, update cross-branch durable records, and record package-ordering state without fabricating provenance.

## Next action

Publish the smallest reviewed `web-orchestration` source change from the exact current head, then inspect the automatically triggered Actions run for that exact resulting SHA.

## Relevant durable records

- `web-orchestration-only/README.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `.github/workflows/validate-repository.yml` on `developer`
- `.github/workflows/validate-template-development.yml` on `template-development`
- `docs/architecture/AS-BUILT.md`
- `source-lock.json`

## Last handoff commit

None
