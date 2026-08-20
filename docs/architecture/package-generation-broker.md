# Package-generation broker AS-BUILT

## Purpose

The template-development package-generation broker provides one bounded networked
execution surface for the existing deterministic change-package generator when a
maintainer's current execution environment cannot perform the generator's required
fresh canonical Git fetches.

It does not add a new package format, a general remote shell, or a second source
of provenance truth. `scripts/create-change-package.mjs` remains the package
implementation authority.

## Request boundary

Package requests live under `docs/work/package-requests/<task-id>.json` and are
validated by `scripts/package-request-lib.mjs`. A request contains only:

- schema version and a fresh public-safe request UUID;
- status and task ID;
- revision plus deterministic same-task supersession metadata; and
- exact reviewed base/head commits for `template-development`, `developer`, and
  `web-orchestration`.

The schema has no command, repository URL, output path, credential, environment,
or arbitrary argument fields. Output is derived as `changes/<task-id>` for the
first revision or `changes/<task-id>.revN` later. Revision N must supersede the
immediately preceding revision for the same task.

## Execution boundary

`.github/workflows/generate-change-package.yml` runs only for pushes to
`template-development` that touch package-request JSON paths. Its first executable
gate requires the triggering commit to change exactly one request JSON file.
Checkout uses two-commit history and does not persist credentials.

The workflow validates the ledger and broker contract, then
`scripts/process-package-request.mjs` requires a clean checkout at the exact
triggering SHA, validates the request, derives the output, and invokes the tracked
package generator with fixed arguments. The generator performs its existing
sterile canonical fetch, ancestry/range proof, schema-3 provenance construction,
package digest binding, and public-safety validation. `SOURCE_DATE_EPOCH` is
bound to the request commit time so retried generation from the same request is
byte-deterministic before publication.

After generation the processor updates the request to `completed` with the exact
triggering SHA, derived package path, and package digest, then requires the only
working-tree changes to be that request file plus the four generated package
files.

## Publication boundary

The workflow's repository-content write permission is used only by the final
publication step. Immediately before commit it fetches `template-development` and
requires the remote tip to equal the original request SHA. It stages only the
completed request and derived package directory, verifies the exact five staged
paths, creates one package/result commit, pushes that exact commit only to
`refs/heads/template-development`, and performs an independent public ref readback.

Any branch movement, unexpected path, malformed request, existing output,
validation failure, commit/push failure, or mismatching readback fails closed.
An uncertain publication is reconciled from remote state and is never replayed
automatically.

GitHub Actions package-result pushes made with the workflow token are not a new
orchestration authority. The package bytes and manifest become ordinary remote Git
evidence and still require independent review under template-maintenance rules.

## Safety and authority

The broker never targets `main`, does not merge independent histories, cannot
widen reviewed ranges beyond the exact request, and does not accept source content
as executable instruction. Human exact-SHA `main` promotion authority is
unchanged.

A broker run proves only that the fixed package operation executed and published a
specific remote result. It does not establish human acceptance, downstream
application, or source correctness.

## Verification

- `scripts/validate-package-broker.mjs` validates the workflow's request-only
  trigger, bounded permissions/checkout posture, required freshness/publication
  guards, and every tracked request/package binding.
- `tests/package-request.test.mjs` protects strict request fields, exact SHA/path
  semantics, deterministic revision/supersession paths, completed-result binding,
  and the workflow's narrow trigger/credential posture.
- `scripts/validate-template-development.sh` runs the broker validator before the
  repository's discovered Node tests and runtime validation.
