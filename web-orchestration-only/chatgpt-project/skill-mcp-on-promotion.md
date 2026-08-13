# MCP-ON exact-SHA promotion

## Trigger

Use only after the human explicitly approves one exact fully reviewed final
`developer` SHA.

## Procedure

1. Persist the exact human-approved promotion SHA and public-safe decision
   date/reference. Reconfirm remote `developer` still equals it. Any later change
   invalidates approval and requires review plus a new human decision.
2. Use or reopen the same task-bound issue. Persist then post `promotion.apply`
   with a fresh UUID and next sequence; set `arguments.approved_sha` and
   `expected.developer_sha` to the same approved SHA with expected ref
   `developer`.
3. Permit only the repository's guarded no-content-change `--no-ff` merge to
   `main`, push of `main`, synchronization of `developer` to that accepted merge,
   and push of `developer`. No cleanup, formatting, refactoring, opportunistic
   fix, or creative conflict resolution is authorized.
4. Abort on conflict. Reconcile on `developer`, re-review, and ask again. A
   `failed`, stuck, or `indeterminate` promotion is never automatically retried;
   use recovery.
5. A correlated `succeeded` result is not repository proof. Directly verify exact
   remote `main` and post-promotion `developer` SHAs, merge parents, ancestry,
   and identical content tree. Persist those SHAs, then close the issue.
6. Never merge `web-orchestration` with an implementation history and never
   infer human approval from bridge enablement or a command result.
