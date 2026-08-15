# Exact-SHA promotion

## Trigger

Use only after the human explicitly approves one exact fully reviewed final
`developer` SHA for promotion to `main`. Never infer approval from prior chat,
bridge state, labels, CI, a task record, or a command result.

## Procedure

1. Persist the exact human-approved SHA and a public-safe decision date/reference.
   Re-read remote `developer` immediately before promotion and require it still
   equals that SHA. Any later `developer` commit invalidates approval and requires
   review plus a new human decision.
2. Use the existing canonical task control issue when the repository's guarded
   promotion path requires one. Persist the exact promotion command before
   publication; its `approved_sha` and expected `developer_sha` must both equal
   the human-approved SHA and the expected ref must be `developer`.
3. Permit only the repository's guarded no-content-change promotion operation:
   the approved `developer` content may be merged to `main` through the defined
   non-fast-forward path, `main` pushed, and `developer` synchronized to the
   accepted merge. No cleanup, formatting, refactoring, opportunistic fix, or
   creative conflict resolution is authorized.
4. Abort on any conflict or unexpected branch movement. Reconcile on `developer`,
   re-review the new exact state, and ask the human again. Never automatically
   retry a failed, stuck, ambiguous, or indeterminate promotion; load recovery.
5. A correlated command `succeeded` result proves only command handling. Directly
   verify exact remote `main` and post-promotion `developer` SHAs, merge parents,
   ancestry, and identical content tree. Persist those verified refs before
   closing the task issue.
6. Never merge `web-orchestration` or `template-development` histories into
   `main`. They are independent source/ledger branches and promotion authority
   applies only to the exact reviewed `developer` SHA the human accepted.

If the guarded promotion capability is unavailable, do not substitute another
merge path or claim promotion. Preserve the reviewed SHA and state the exact
capability/operator boundary.
