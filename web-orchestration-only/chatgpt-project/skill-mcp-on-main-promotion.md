# Main promotion

## Trigger

Use only after the human explicitly approves an exact final `developer` SHA.

## Procedure

1. Reconfirm remote `developer` equals the approved SHA; if it advanced, review and ask again.
2. Delegate the repository-owned mechanical promotion procedure to Luna.
3. Require an explicit no-content-change `--no-ff` merge into `main` and push `main`.
4. Permit no cleanup, documentation, formatting, refactoring, dependency work, opportunistic fixes, or creative conflict resolution.
5. Abort on conflict. Reconcile on `developer`, re-review, and obtain approval again.
6. Synchronize `developer` to the accepted merge and push it.
7. Verify both remote branches.
8. Never merge `web-orchestration` into or from an implementation branch.
