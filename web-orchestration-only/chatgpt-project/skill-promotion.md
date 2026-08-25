# Exact-SHA promotion

## Trigger

Use only after the human explicitly approves one exact, fully reviewed final
`developer` SHA for promotion to `main`. Task records, agent reports, checks, CI,
general intent, or time never imply this approval.

## Procedure

1. Record the approved SHA and public-safe decision reference.
2. Immediately re-read remote `developer` and `main`. Require `developer` to equal
   the approved SHA and all reviewed ancestry and promotion preconditions to
   remain true.
3. Use only the repository's guarded promotion operation. Carry exactly the
   approved developer content and only synchronization defined by that operation.
   Do not add cleanup, formatting, fixes, generated changes, or other
   opportunistic content.
4. Stop on conflict, ref movement, ancestry or tree mismatch, or ambiguous result.
   Reconcile exact state before any retry. Never automatically replay promotion.
5. Re-read remote `main` and `developer` after the operation and verify the exact
   refs, expected ancestry or merge parents, and required content-tree relation.
6. Never merge `web-orchestration` or `template-development` history into `main`.

If the guarded operation is unavailable, preserve the approved SHA and report the
operator boundary. Do not substitute another merge path.
