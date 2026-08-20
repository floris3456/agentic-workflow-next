# Task progress

## Task ID

TEMPLATE-CI-OBSERVABILITY-001

## Status

in_progress

## Task-start developer SHA

1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68

## Review-base developer SHA

1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68

## Original task brief

Add machine-readable exact-SHA commit-status reporting to the existing canonical
repository validation workflow without changing validation commands or promotion
authority. Keep checkout credentials non-persistent, add only commit-status write
permission, report only canonical push runs, and do not modify or promote `main`.

## Current objective

Make the existing developer/main validation workflow publish one stable commit
status for the exact pushed SHA after validation completes.

## Current position

Direct GitHub source route selected under the active reusable-template maintenance
task. Exact developer start SHA is
`1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`. No developer CI source file has
changed yet for this task.

## Observed

- `.github/workflows/validate-repository.yml` already runs canonical validation on
  pushes to `developer` and `main` and uses `persist-credentials: false`.
- Its token permission is currently only `contents: read`.
- The connected combined commit-status API currently has no workflow-published
  context to expose this validation result.

## Interpretation

The smallest developer-side change is `statuses: write` plus one final push-only
status-reporting step and a focused static validator reached by the canonical
repository validation script.

## Attempts

None before this source boundary.

## Changed approach

None.

## Checks

Exact start workflow and branch head reviewed. Implementation checks pending.

## Blockers / required decisions

None. No `main` mutation or promotion is authorized.

## Remaining work

1. Add push-only exact-SHA status reporting to the canonical workflow.
2. Add a focused static regression validator and run it through repository validation.
3. Review the exact developer range and observe the new commit status.

## Next action

Apply the bounded developer workflow/validation edits.

## Relevant durable records

- `.github/workflows/validate-repository.yml`
- `scripts/validate-repository.sh`
- `scripts/validate-ci-status.mjs`

## Last handoff commit

None
