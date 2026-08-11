# Main promotion

## Trigger

Use only after the human explicitly approves an exact final `developer` SHA.

## Procedure

1. Require a persisted human-approved promotion SHA and public-safe decision date/reference. Reconfirm remote `developer` equals that approved SHA; if it advanced or the approval record is absent, review and ask again.
2. Use or reopen the same task-bound control issue; never create a replacement issue for that task.
3. Prepare `promotion.apply` with a fresh UUID and next sequence, `arguments.approved_sha` equal to the approved SHA, and `expected.developer_sha` equal to the same SHA with ref `developer`. Persist the pending envelope before posting it. Local promotion enablement does not replace human approval.
4. The repository-owned procedure must perform an explicit no-content-change `--no-ff` merge into `main`, push `main`, synchronize `developer` to the accepted merge, and push `developer`.
5. Permit no cleanup, documentation, formatting, refactoring, dependency work, opportunistic fixes, or creative conflict resolution.
6. Abort on conflict. Reconcile on `developer`, re-review, and obtain approval again.
7. Treat `failed` or `indeterminate` as a stop condition; never retry promotion automatically.
8. After a correlated `succeeded` result, independently verify both remote branches and no-content-change ancestry. Persist the resulting remote `main` and post-promotion `developer` SHAs, then close the issue and record its closed state. Bridge success is not repository evidence.
9. Never merge `web-orchestration` into or from an implementation branch.
