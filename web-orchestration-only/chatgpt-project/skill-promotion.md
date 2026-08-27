# Exact-SHA promotion

## Trigger

Use only after the human explicitly approves one exact `developer` SHA that has
been fully reviewed for promotion to `main`. Never infer approval from task
records, agent reports, checks, CI, earlier intent, or elapsed time.

## Procedure

Use exactly the SHA the human approved. Immediately before mutation, re-read
exact remote `developer` and `main` refs. Require remote `developer` to equal the
approved SHA and require the reviewed promotion preconditions to still hold.
Unexpected movement stops the procedure.

Use only the repository's guarded promotion mechanism. Do not add opportunistic content.
Do not add cleanup, formatting, refactoring, fixes, or generated changes.

Stop on conflict, ambiguous result, unexpected ref movement, ancestry mismatch,
or tree mismatch. Never automatically replay promotion. Reconcile exact state
before any further mutation.

After promotion, independently re-read remote `main` and `developer` and verify
the refs, ancestry/parents, and exact tree relationship required by the guarded
procedure. Report ambiguity instead of claiming success.

Never merge `orchestration` or `workspace` history into `main`.
If the guarded capability is unavailable, preserve the approved SHA and surface
the operator boundary rather than substituting another merge path.
