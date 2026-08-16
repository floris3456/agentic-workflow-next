# Template-maintenance task progress

## Task ID

TEMPLATE-CI-REACHABILITY-001

## Status

requested source implementation and remote acceptance verification are complete; portable package generation remains pending only on a legitimate networked maintainer execution surface, with no source-lock ordering dependency

## Task-start template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Review-base template-development SHA

ee8d5e234c713727f008dcdce2ec2e30b19a41cc

## Public-safe task brief

Make acceptance-critical executable tests on authoritative template branches remotely executable through each branch's canonical push-triggered GitHub Actions path, starting with `web-orchestration`. Add the smallest read-only branch-local workflow that runs the canonical web validator and automatically discovered Node tests, preserve minimal permissions and checkout credentials, establish the reusable CI-reachability rule, add only small robust mechanical regression protection, verify the exact pushed web SHA through the real Actions run and logs, and do not modify or promote `main`.

## Current objective

The requested source outcome is complete and independently reviewed. Preserve the exact reviewed source range and remote acceptance proof; generate its portable package independently when a legitimate networked maintainer execution surface is available.

## Current position

Exact refs at source review:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833` — unchanged.
- `developer`: `980486182c0ed8a213842477b9b1754de360a430` — unchanged.
- `web-orchestration`: `3891a17bd62b8e4871310766f2a05175aa42cf87` — reviewed source handoff for this task.
- `template-development`: `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c` — original dedicated ledger handoff.

The reusable CI-reachability invariant is documented in the web-orchestrator
template-maintenance Source and in `docs/architecture/AS-BUILT.md`.

`TEMPLATE-SOURCE-LOCK-SIMPLIFY-001` later made `source-lock.json` the latest
reconciled canonical source snapshot rather than a package review-base lock. That
removes this task's former package-ordering blocker without changing its exact
reviewed web range or acceptance evidence.

## Source ranges

- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion authorized.
- `developer`: unchanged at `980486182c0ed8a213842477b9b1754de360a430`; existing canonical push CI already satisfies the invariant.
- `web-orchestration`: `f3caf6b61cf76ade806824d1c4485c6993bfb150..3891a17bd62b8e4871310766f2a05175aa42cf87`.
- `template-development`: original task ledger/AS-BUILT range begins after `ee8d5e234c713727f008dcdce2ec2e30b19a41cc` and was handed off at `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c`.

## Observed

- Before this task, `web-orchestration` contained its executable package validator and Node test suite but no `.github/workflows/**` path.
- The orchestrator's local shell could not resolve `github.com`, so local Git/HTTP execution could not provide the requested acceptance proof. No local execution result was substituted for remote evidence.
- `web-orchestration` added `.github/workflows/validate-web-orchestration.yml`, triggered only by pushes to `web-orchestration`, with `permissions: contents: read`, pinned checkout/setup-node actions, `persist-credentials: false`, Node `22.13.0`, the canonical package validator command, and bare `node --test`.
- Push Actions run `31917651395` was automatically created for exact head `3891a17bd62b8e4871310766f2a05175aa42cf87`, event `push`, workflow `Validate web orchestration`, and completed successfully on the first actual run.
- Job `95092152519` completed successfully. Its logs show `GITHUB_TOKEN` permissions of `Contents: read` plus metadata read, checkout with `persist-credentials: false`, removal of checkout auth before later steps, checkout of exact SHA `3891a17bd62b8e4871310766f2a05175aa42cf87`, Node `v22.13.0`, successful execution of `node web-orchestration-only/validate-package.mjs`, and successful execution of bare `node --test`.
- Discovery-mode Node testing ran 16 tests, including `canonical push CI is read-only and reaches validator plus discovered Node tests`; all 16 passed with zero failures, skips, or cancellations.
- Exact comparison `f3caf6b61cf76ade806824d1c4485c6993bfb150..3891a17bd62b8e4871310766f2a05175aa42cf87` is four commits ahead, zero behind, and changes only the new web workflow, `web-orchestration-only/README.md`, `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`, and `web-orchestration-only/validate-package.test.mjs`.
- `developer` already has `.github/workflows/validate-repository.yml` on pushes to `developer`; its canonical validation reaches the bridge test suite and `tests/template-branches.test.mjs`.
- `template-development` already has `.github/workflows/validate-template-development.yml` on pushes to `template-development`; its canonical script runs the ledger validator and `tests/change-package.test.mjs`.
- At the original handoff, `source-lock.json` remained at an older provenance snapshot under the then-current package-ordering design. The later source-snapshot simplification reconciled it independently from exact current canonical refs and removed that ordering role.

## Interpretation

The simple branch-local solution fully meets the practical source requirement. A future web orchestrator can publish an exact `web-orchestration` SHA and obtain authoritative execution of that SHA's package validator and normal Node tests without depending on its own local execution environment. No central dispatcher, issue-based test protocol, bridge extension, write-capable Action, or cross-branch symmetry change is justified.

The reusable invariant is mechanically protected in the existing executable Node acceptance suite rather than by making `validate-package.mjs` depend on repository-root `.github` layout. That keeps the package validator usable as a standalone `web-orchestration-only` validator while the branch-level acceptance suite checks the actual push trigger, read-only permission/credential posture, canonical validator command, and bare discovery-mode test command.

After this change, `developer`, `web-orchestration`, and `template-development` all satisfy the requested CI-reachability invariant. Only `web-orchestration` required source modification.

The later source-snapshot simplification changes only template package/ledger ordering, not this task's CI result or reviewed source membership.

## Attempts

- The first immediate exact-SHA Actions lookup returned no run while GitHub event propagation was still pending. Exact branch and workflow readback showed the source effect was present; a subsequent read found run `31917651395` in progress, and it then completed successfully. No mutation was replayed.
- The local shell's GitHub DNS lookup failed, which reinforced the need for the remote Actions path but did not block source work or verification through connected GitHub.

## Changed approach

- The initial design considered adding repository-root workflow checks directly to `web-orchestration-only/validate-package.mjs`. That would have coupled a deliberately standalone package validator to `.github` layout. The smaller robust enforcement is instead in `validate-package.test.mjs`, which is itself acceptance-critical and runs automatically through the branch's canonical push CI. No generalized validation infrastructure was added.
- Under the original template-maintenance provenance contract, the task preserved an older source-lock/package ordering dependency. `TEMPLATE-SOURCE-LOCK-SIMPLIFY-001` later explicitly removed that dependency and made the lock an independent current source snapshot.

## Checks

- Maintenance contract, exact source refs, source lock, current web validator/test suite, branch workflows, and canonical validation scripts inspected before source publication.
- Maintenance task record created and remotely confirmed before the first source edit.
- Exact web workflow read back from source SHA `3891a17bd62b8e4871310766f2a05175aa42cf87`.
- Exact web Actions run `31917651395` inspected through run metadata, job/step state, and decoded job logs.
- Exact web source range independently compared and every changed path read/reviewed against the requested outcome.
- Read-only Actions posture proven both statically and at runtime: contents read, metadata read only as platform metadata access, no write permission, no secrets referenced by workflow source, and checkout credentials not persisted into later steps.
- Bare `node --test` proven to execute remotely and pass all 16 then-discovered tests; the CI-contract test protects continued use of the bare discovery command.
- Repository-wide audit confirmed existing `developer` and `template-development` canonical push validation already reaches their acceptance-critical executable tests.
- Template-development AS-BUILT handoff validation succeeded under its canonical push CI.
- `main` and `developer` remained unchanged.
- `TEMPLATE-SOURCE-LOCK-SIMPLIFY-001` later reconciled the source snapshot independently and mechanically removed the package-base/source-snapshot equality requirement.

## Blockers / required decisions

No source implementation, review, CI, repository-wide invariant, or source-lock ordering blocker remains.

Portable package generation still requires a legitimate networked maintainer execution surface because the tracked generator must obtain fresh canonical Git objects. This package-production limitation is isolated to this task and does not block later template work or source-snapshot reconciliation.

## Remaining work

When a legitimate networked maintainer execution surface is available, generate this task's deterministic package from its exact reviewed web range, validate/review the generated bytes, and perform normal package/task finalization. No predecessor package or source-lock step is a prerequisite.

## Next action

Generate this task's exact reviewed package when a legitimate maintainer execution surface is available. Later maintenance tasks do not need to wait for it. Do not promote `main`.

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
- `docs/work/current/TEMPLATE-SOURCE-LOCK-SIMPLIFY-001-current-source-snapshot.md`
- GitHub Actions run `31917651395`, job `95092152519`

## Last handoff commit

Original template-development handoff: `8391a21842a7c2d3d545f0addb6bc3ca38a4b40c`; later source-snapshot semantics are tracked separately.
