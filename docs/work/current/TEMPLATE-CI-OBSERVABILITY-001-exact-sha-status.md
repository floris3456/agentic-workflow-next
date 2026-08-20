# Template-maintenance task progress

## Task ID

TEMPLATE-CI-OBSERVABILITY-001

## Status

in_progress

## Task-start template-development SHA

8eeca88e656f7314ee7e916ccfe11ad82c745377

## Review-base template-development SHA

8eeca88e656f7314ee7e916ccfe11ad82c745377

## Public-safe task brief

Make each authoritative branch's canonical validation result directly observable
by exact commit SHA through GitHub commit statuses, without changing the validation
commands or giving workflows repository-content write access.

For `developer`, `web-orchestration`, and `template-development`, keep the existing
canonical validation workflow and non-persistent checkout posture. Add only the
minimum `statuses: write` permission and a final status-reporting step that runs
after validation, maps the job result to GitHub's commit-status states, posts one
stable branch-specific context for the exact `github.sha`, and links to the exact
Actions run.

Do not modify or promote `main`. `main` may continue to run its existing developer
workflow, but no human acceptance or promotion semantics change.

## Current objective

Create machine-readable exact-SHA validation evidence that the web orchestrator
can read through GitHub's combined commit-status API, then prove it on fresh
canonical pushes across the affected authoritative branches.

## Current position

Exact refs at activation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
- `web-orchestration`: `d642359993fc1d819517b3fc10e4e704810a03a7`
- `template-development`: `8eeca88e656f7314ee7e916ccfe11ad82c745377`

The package-generation broker task is source-complete and non-mutating while this
capability is implemented.

## Source ranges

- `developer`: starts at `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
- `web-orchestration`: starts at `d642359993fc1d819517b3fc10e4e704810a03a7`
- `template-development`: starts at `8eeca88e656f7314ee7e916ccfe11ad82c745377`
- `main`: unchanged

## Observed

- All three authoritative branches already have canonical push-triggered
  validation workflows.
- Exact recent push-run results are not exposed by the currently available
  commit-to-workflow-run connector; its commit lookup is limited to PR-triggered
  runs.
- The combined commit-status API is available but currently returns no statuses
  for the reviewed recent SHAs.
- GitHub's current REST documentation supports creating commit statuses with
  repository `Commit statuses: write` permission and states `success`, `failure`,
  `error`, or `pending`.
- GitHub Actions expressions expose `job.status`; a final step may run with
  `always()` so it can report the result of preceding validation steps.
- Existing checkouts already use `persist-credentials: false`.

## Interpretation

The missing piece is result projection, not new validation infrastructure. Each
workflow should remain authoritative for its own branch and publish a compact
status record for the exact SHA it already validates.

Stable contexts make the connected combined-status read a deterministic proof
route without coupling the web orchestrator to Actions run-list discovery.

## Attempts

1. Confirmed the existing CI-reachability task already proved canonical push
   validation on all authoritative branches.
2. Queried combined status for the package-broker source SHA and received no
   statuses.
3. Reviewed current GitHub documentation for commit-status permissions/states and
   Actions `job.status`/`always()` behavior.
4. Inspected the exact current developer, web, and template validation workflows.

## Changed approach

No generalized CI dispatcher is needed. Add one narrow status-reporting tail to
each existing canonical validation workflow.

## Checks

Planning and exact workflow/source evidence reviewed. Implementation checks
pending.

## Blockers / required decisions

No human decision remains. No `main` mutation or promotion is authorized.

## Remaining work

1. Add stable exact-SHA status reporting to developer validation.
2. Add stable exact-SHA status reporting to web-orchestration validation.
3. Add stable exact-SHA status reporting to template-development validation.
4. Add branch-owned mechanical regression checks without weakening existing
   validation.
5. Independently review exact source ranges.
6. Observe the new commit statuses for fresh exact SHAs and confirm links/context/
   states are correct.
7. Return to package generation once exact-SHA remote validation is observable.

## Next action

Publish the smallest branch-local workflow changes and regression protection,
then query each exact pushed SHA through the combined commit-status API.

## Relevant durable records

- `.github/workflows/validate-repository.yml` on `developer`
- `.github/workflows/validate-web-orchestration.yml` on `web-orchestration`
- `.github/workflows/validate-template-development.yml` on `template-development`
- `scripts/validate-agent-system.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `scripts/validate-template-development.mjs`
- `docs/work/current/TEMPLATE-CI-REACHABILITY-001-branch-push-ci.md`

## Last handoff commit

None
