# Deterministic change-package generation

## Purpose

Template maintenance retains one deterministic, provenance-verified change-package
generator for transfer or release requests. Packaging is conditional; it is not a
required ceremony for ordinary maintenance. There is no package request broker or
GitHub Actions command bus.

`scripts/create-change-package.mjs` is the generation authority, and
`scripts/change-package-lib.mjs` is the shared verifier used by generation,
application, and ledger validation. `scripts/apply-change-package.mjs` validates
and applies a selected package to a matching downstream branch without committing,
pushing, merging, or promoting.

## Deterministic and provenance-bound operation

The generator requires exact reviewed base/head commits for
`template-development`, `developer`, and `web-orchestration`. It authenticates the
supplied checkout's canonical origin, creates a sterile temporary bare repository,
fetches the current canonical branch tips, and proves every supplied endpoint and
ancestry relationship from those fetched objects. It generates exact range patches,
excludes ledger-only `changes/**` storage from the template patch, and never widens
the reviewed range to unrelated later commits.

Schema-3 manifests record the generation-time source snapshot, observed canonical
tips, exact reviewed ranges, changed paths, per-patch digests, and a package digest
binding the provenance metadata and all three patch streams. Superseding packages
use distinct revision directories and bind the historical package's exact digest.
Historical package evidence under `changes/**` remains immutable and is validated
by the shared verifier.

## Safety and authority

Generation never writes source branches, targets `main`, merges histories, or
creates an alternate orchestration authority. A package is reviewed as ordinary
ledger evidence and does not establish human acceptance or downstream correctness.
If canonical generator access is unavailable, preserve the reviewed state and
record the blocker; do not hand-build package bytes or weaken provenance.

## Verification

`tests/change-package.test.mjs` covers deterministic three-range generation,
canonical-origin and ancestry checks, canonical branch advance, template package
self-exclusion, digest and provenance tampering, historical compatibility, and
clean downstream application. `scripts/validate-template-development.sh` runs the
shared ledger/package validation, discovered Node tests, workspace containment, and
the real pinned OpenCode inventory check.
