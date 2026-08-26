# Exact-SHA promotion

## Trigger

Use only after the human explicitly approves one exact, fully reviewed final
`developer` SHA for promotion to `main`. Never infer approval from task records,
agent reports, checks, CI, prior general intent, or the passage of time.

## Procedure

1. Record the exact human-approved SHA and public-safe decision reference.
2. Immediately before mutation, fetch or otherwise re-read exact remote
   `developer` and `main` refs. Require remote `developer` to equal the approved
   SHA and require the reviewed ancestry and promotion preconditions still to
   hold. Any unexpected movement invalidates the operation pending review and a
   new human decision when necessary.
3. Use only the repository's guarded promotion procedure. It may carry the exact
   approved `developer` content to `main` and perform only the synchronization
   explicitly defined by that procedure. Do not add cleanup, formatting,
   refactoring, fixes, generated changes, or any other opportunistic content.
4. Stop on conflict, ambiguous result, unexpected ref movement, ancestry
   mismatch, or tree mismatch. Reconcile exact local and remote state before any
   retry. Never improvise conflict resolution or automatically replay promotion.
5. After promotion, independently re-read remote `main` and `developer`. Verify
   the resulting refs, expected ancestry and merge parents, and the exact content
   tree relationship required by the guarded procedure. Report ambiguity rather
   than claiming success.
6. Never merge `web-orchestration` or `template-development` history into `main`.
   Promotion authority applies only to the exact reviewed `developer` SHA the
   human approved.

If the guarded capability is unavailable, preserve the approved SHA and state the
operator boundary. Do not substitute a different merge path. Promotion never
includes unrelated content changes.
