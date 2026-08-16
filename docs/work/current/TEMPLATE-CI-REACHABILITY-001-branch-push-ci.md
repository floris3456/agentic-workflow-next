# Template-maintenance task progress

## Task ID

TEMPLATE-CI-REACHABILITY-001

## Status

blocked on deterministic change-package ordering only; requested source implementation and remote acceptance verification are complete

## Task-start template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Review-base template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Public-safe task brief

Make acceptance-critical executable tests on authoritative template branches remotely executable through each branch's canonical push-triggered GitHub Actions path, starting with `web-orchestration`. Add the smallest read-only branch-local workflow that runs the canonical web validator and automatically discovered Node tests, preserve minimal permissions and checkout credentials, establish the reusable CI-reachability rule, add only small robust mechanical regression protection, verify the exact pushed web SHA through the real Actions run and logs, and do not modify or promote `main`.

## Current objective

The requested source outcome is complete and independently reviewed. Preserve the exact reviewed source range and remote acceptance proof until this task's deterministic change package can be produced in repository-owned source-lock order.

## Current position

Exact refs at source review:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833` — unchanged.
- `developer`: `980486182c0ed8a213842477b9b1754de360a430` — unchanged.
- `web-orchestration`: `3891a17bd62b8e4871310766f2a05175aa42cf87` — reviewed source handoff.
- `template-development`: `9509a92d2d40b06a2aa07953c0897f27debb4931` before this dedicated handoff snapshot.

The reusable CI-reachability invariant is now documented in the web-orchestrator template-maintenance Source and in `docs/architecture/AS-BUILT.md`.

## Source ranges

- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion authorized.
- `developer`: unchanged at `980486182c0ed8a213842477b9b1754de360a430`; existing canonical push CI already satisfies the invariant.
- `web-orchestration`: `f3caf6b61cf76ade806824d1c4485c6993bfb150..3891a17bd62b8e4871310766f2a05175aa42cf87`.
- `template-development`: task ledger and AS-BUILT updates begin after `ee8d5e234c713727f008dcdce2ec2e30b19a41cc`; this record is the dedicated handoff snapshot and its containing commit is the exact ledger handoff returned by the orchestrator.

## Observed

- Before this change, `web-orchestration` contained its executable package validator and Node test suite but no `.github/workflows/**` path.
- The orchestrator's local shell could not resolve `github.com`, so local Git/HTTP execution could not provide the requested acceptance proof. No local execution result was substituted for remote evidence.
- `web-orchestration` now contains `.github/workflows/validate-web-orchestration.yml`, triggered only by pushes to `web-orchestration`, with `permissions: contents: read`, pinned checkout/setup-node actions, `persist-credentials: false`, Node `22.13.0`, the canonical package validator command, and bare `node --test`.
- Push Actions run `31917651395` was automatically created for exact head `3891a17bd62b8e4871310766f2a05175aa42cf87`, event `push`, workflow `Validate web orchestration`, and completed successfully on the first actual run.
- Job `95092152519` completed successfully. Its logs show `GITHUB_TOKEN` permissions of `Contents: read` plus unavoidable metadata read, checkout with `persist-credentials: false`, removal of checkout auth before later steps, checkout of exact SHA `3891a17bd62b8e4871310766f2a05175aa42cf87`, Node `v22.13.0`, successful execution of `node web-orchestration-only/validate-package.mjs`, and successful execution of bare `node --test`.
- The validator printed its normal package-success result. Discovery-mode Node testing ran 16 tests, including `canonical push CI is read-only and reaches validator plus discovered Node tests`; all 16 passed with zero failures, skips, or cancellations.
- Exact comparison `f3caf6b61cf76ade806824d1c4485c6993bfb150..3891a17bd62b8e4871310766f2a05175aa42cf87` is four commits ahead, zero behind, and changes only four paths: the new web workflow, `web-orchestration-only/README.md`, `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`, and `web-orchestration-only/validate-package.test.mjs`.
- `developer` already has `.github/workflows/validate-repository.yml` on pushes to `developer`; its canonical validation reaches the bridge test suite and `tests/template-branches.test.mjs`.
- `template-development` already has `.github/workflows/validate-template-development.yml` on pushes to `template-development`; its canonical script runs the ledger validator and `tests/change-package.test.mjs`. Run `31917704546` also succeeded after the AS-BUILT update for this task.
- `source-lock.json` remains unchanged at the predecessor provenance snapshot: `main` `6127611113dfdb66f93a0cfd2d355359aa370833`, `developer` `e2700f586fe8ab634053eb514bb9da487e881a21`, and `web-orchestration` `2b95a9803115b05283494fb3699b9d34c58a91a5`.

## Interpretation

The simple branch-local solution fully meets the practical source requirement. A future web orchestrator can publish an exact `web-orchestration` SHA and obtain authoritative execution of that SHA's package validator and normal Node tests without depending on its own local execution environment. No central dispatcher, issue-based test protocol, bridge extension, write-capable Action, or cross-branch symmetry change is justified.

The reusable invariant is mechanically protected in the existing executable Node acceptance suite rather than by making `validate-package.mjs` depend on repository-root `.github` layout. That keeps the package validator usable as a standalone `web-orchestration-only` validator while the branch-level acceptance suite checks the actual push trigger, read-only permission/credential posture, canonical validator command, and bare discovery-mode test command.

After this change, `developer`, `web-orchestration`, and `template-development` all satisfy the requested CI-reachability invariant. Only `web-orchestration` required source modification.

## Attempts

- The first immediate exact-SHA Actions lookup returned no run while GitHub event propagation was still pending. Exact branch and workflow readback showed the source effect was present; a subsequent read found run `31917651395` in progress, and it then completed successfully. No mutation was replayed.
- The local shell's GitHub DNS lookup failed, which reinforced the need for the remote Actions path but did not block source work or verification through connected GitHub.

## Changed approach

The initial design considered adding repository-root workflow checks directly to `web-orchestration-only/validate-package.mjs`. That would have coupled a deliberately standalone package validator to `.github` layout. The smaller robust enforcement is instead in `validate-package.test.mjs`, which is itself acceptance-critical and now runs automatically through the branch's canonical push CI. No generalized validation infrastructure was added.

## Checks

- Maintenance contract, exact source refs, source lock, current web validator/test suite, branch workflows, and canonical validation scripts inspected before source publication.
- Maintenance task record created and remotely confirmed before the first source edit.
- Exact web workflow read back from final source SHA `3891a17bd62b8e4871310766f2a05175aa42cf87`.
- Exact web Actions run `31917651395` inspected through run metadata, job/step state, and decoded job logs.
- Exact web source range independently compared and every changed path read/reviewed against the requested outcome.
- Read-only Actions posture proven both statically and at runtime: contents read, metadata read only as platform metadata access, no write permission, no secrets referenced by workflow source, and checkout credentials not persisted into later steps.
- Bare `node --test` proven to execute remotely and pass all 16 currently discovered tests; the CI-contract test protects continued use of the bare discovery command.
- Repository-wide audit confirmed existing `developer` and `template-development` canonical push validation already reaches their acceptance-critical executable tests.
- Template-development AS-BUILT update passed canonical push validation in Actions run `31917704546`.
- `main` and `developer` re-read after source implementation and remained unchanged.
- `source-lock.json` re-read and deliberately left unchanged.

## Blockers / required decisions

No source implementation, review, CI, or repository-wide invariant blocker remains.

The template-maintenance package/reconciliation stage remains blocked by the existing predecessor provenance ordering: `source-lock.json` is intentionally held at the earlier review bases until the tracked schema-2 generator can embed and reconcile that snapshot in order. This task must not move the lock, fabricate package provenance, widen another task's range, or generate its package ahead of that dependency.

## Remaining work

After the predecessor source-lock/package dependency is genuinely reconciled, use the tracked template-maintenance generator and validator to package this exact reviewed source range in order, then perform normal package review/reconciliation and archive finalization. No further `web-orchestration`, `developer`, or `main` source change is required for the requested CI outcome.

## Next action

Preserve reviewed web head `3891a17bd62b8e4871310766f2a05175aa42cf87` and wait for the existing repository-owned package ordering dependency before deterministic package generation/reconciliation. Do not promote `main`.

## Relevant durable records

- `.github/workflows/validate-web-orchestration.yml` on `web-orchestration`
- `web-orchestration-only/README.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `.github/workflows/validate-repository.yml` on `developer`
- `scripts/validate-repository.sh` and `scripts/validate-opencode-bridge.sh` on `developer`
- `.github/workflows/validate-template-development.yml` on `template-development`
- `scripts/validate-template-development.sh` on `template-development`
- `docs/architecture/AS-BUILT.md`
- `source-lock.json`
- GitHub Actions run `31917651395`, job `95092152519`

## Last handoff commit

This task record update is the dedicated template-development handoff snapshot; the exact containing commit is returned by the orchestrator and is not self-referenced to avoid recursive record mutation.
