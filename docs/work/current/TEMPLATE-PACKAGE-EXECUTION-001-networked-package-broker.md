# Template-maintenance task progress

## Task ID

TEMPLATE-PACKAGE-EXECUTION-001

## Status

source complete; first package execution pending exact-SHA CI observability

## Task-start template-development SHA

ad563cdf00900bfd210f3d15d00cb06001009e99

## Review-base template-development SHA

ad563cdf00900bfd210f3d15d00cb06001009e99

## Public-safe task brief

Provide the reusable template with a legitimate networked maintainer execution
surface for deterministic change-package generation without weakening the
existing provenance contract or hand-building package bytes.

Use the existing tracked `scripts/create-change-package.mjs` generator and
validator through a fixed-operation, template-development-owned GitHub Actions
broker. Requests may contain only exact reviewed three-branch ranges plus bounded
task/revision metadata. The broker may publish only the derived package and its
completed request result to `template-development`.

Do not grant arbitrary shell/network authority to the web orchestrator, do not
merge source histories, do not modify or promote `main`, and do not allow package
requests to widen reviewed ranges or choose arbitrary output paths/commands.

## Current objective

Preserve the reviewed broker source range while the separate CI-observability
capability is added. Then use this broker to generate and independently review
its own package and the pending packages for recently completed maintenance tasks.

## Current position

Exact source heads at broker source review:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833` — unchanged.
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68` — unchanged.
- `web-orchestration`: `d642359993fc1d819517b3fc10e4e704810a03a7` — unchanged.
- `template-development` broker source head: `96dba2b446f9c0c9c377b89dfff8564ed6c8e625`.

The broker source is non-mutating from this point unless later exact validation
finds a defect.

Implemented execution contract:

- `docs/work/package-requests/<task-id>.json` is the only broker request surface;
- request schema rejects commands, repository URLs, output paths, credentials,
  environment values, arbitrary arguments, invalid ranges, and invalid
  supersession;
- output path is derived from task ID/revision;
- processor invokes the existing tracked generator with fixed arguments and binds
  deterministic creation time to the request commit;
- generated schema-3 package is validated for provenance and public safety;
- only the completed request plus four derived package files may change;
- workflow publication rechecks remote `template-development` equals the request
  SHA immediately before commit/push;
- publication stages exactly five expected paths, pushes only the resulting exact
  commit to `template-development`, and independently reads that ref back;
- uncertain publication is a recovery problem and is never replayed automatically.

## Source ranges

- `template-development`: `ad563cdf00900bfd210f3d15d00cb06001009e99..96dba2b446f9c0c9c377b89dfff8564ed6c8e625`
- `developer`: unchanged at `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
- `web-orchestration`: unchanged at `d642359993fc1d819517b3fc10e4e704810a03a7`
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- The tracked package generator already owns canonical fetch, exact range/ancestry
  proof, package-storage exclusion, patch hashing, schema-3 provenance, package
  binding, validation, and public-safety checks.
- The current ChatGPT/local command environment cannot resolve `github.com`, so
  direct local generator execution is genuinely unavailable.
- GitHub Actions is already the repository's accepted canonical networked
  execution surface for branch validation.
- The new broker reuses that surface without adding a general remote shell or a
  second package implementation.
- The exact broker source range is six commits ahead, zero behind, and changes only
  the broker workflow/runtime/tests/docs plus this task record and the existing
  template-maintenance procedure/design.
- Focused request-library syntax and six unit tests passed before publication.
- The currently exposed exact commit-status surface returns no statuses for the
  reviewed broker source SHA. This is the known CI-observability gap, not evidence
  of a failed validation run.

## Interpretation

Package generation is no longer blocked by the local networkless environment at
the source-design level. The broker supplies a legitimate canonical networked
execution path while preserving the existing generator/provenance contract.

Before using a write-capable new workflow for the first real package, the safer
sequence is to make canonical push validation results machine-readable by exact
SHA. That work is a separate capability task and does not require further broker
source mutation.

## Attempts

1. Re-established exact canonical refs and current source-lock state.
2. Confirmed historical CI-reachability already established GitHub Actions as the
   accepted networked validation surface.
3. Proved the local environment cannot reach GitHub through ordinary Git network
   access.
4. Read the exact current generator before selecting the execution design.
5. Built and locally syntax/unit-tested the strict request validator, processor,
   broker validator, workflow, and focused tests.
6. Published the executable core atomically as one Git tree/commit.
7. Added repository procedure/design and a focused broker AS-BUILT record.
8. Independently compared the exact full source range.

## Changed approach

The earlier idea of adding a host/Workspace network broker was replaced by the
smaller repository-owned GitHub Actions operation. This avoids adding general host
network/shell capability to Workspace Maintenance.

## Checks

- Exact remote broker source head independently verified:
  `96dba2b446f9c0c9c377b89dfff8564ed6c8e625`.
- Exact range `ad563cdf00900bfd210f3d15d00cb06001009e99..96dba2b446f9c0c9c377b89dfff8564ed6c8e625`
  reviewed remotely: six commits ahead, zero behind.
- New JS sources pass Node syntax checks.
- Focused `tests/package-request.test.mjs`: 6 passed, 0 failed in the available
  local runtime.
- Canonical push validation remains configured, but exact-SHA result observation
  is not yet machine-readable through the current connector; no CI-pass claim is
  made for this head.

## Blockers / required decisions

No human design decision remains and no source implementation blocker is known.

The only prerequisite before first broker use is the separately authorized
CI-observability capability, so the exact broker source SHA can be verified through
canonical remote validation rather than inferred.

## Remaining work

1. Implement exact-SHA CI status publication on canonical branch validation.
2. Observe authoritative validation for the exact broker source state or a fresh
   descendant containing only CI-observability changes.
3. Submit the broker task's strict package request using its reviewed source range.
4. Reconcile the resulting package/result commit, validate/review its exact
   manifest and patch bytes, then generate pending packages for earlier source
   tasks.
5. Finalize/archive tasks only after their package and required check evidence is
   complete.

## Next action

Treat this task as non-mutating and activate a separate exact-SHA CI-observability
task. Return here after that capability is proven; do not alter `main`.

## Relevant durable records

- `.github/workflows/generate-change-package.yml`
- `scripts/package-request-lib.mjs`
- `scripts/process-package-request.mjs`
- `scripts/validate-package-broker.mjs`
- `tests/package-request.test.mjs`
- `docs/work/package-requests/README.md`
- `docs/architecture/package-generation-broker.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/design/template-maintenance-workflow.md`
- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `source-lock.json`

## Last handoff commit

None
