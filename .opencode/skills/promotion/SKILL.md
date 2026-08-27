---
name: promotion
description: Guard human-approved exact-SHA promotion from developer to main.
compatibility: local-orchestrator
---

# Exact-SHA promotion

Use only after the human explicitly approves one exact fully reviewed `developer` SHA for `main`. Never infer approval from records, reports, checks, CI, earlier intent or elapsed time.

Immediately before mutation, re-read exact remote `developer` and `main`. Require `developer` to equal the approved SHA and require reviewed promotion preconditions to still hold. Unexpected movement stops the procedure.

Use only the repository's guarded promotion mechanism. Add no opportunistic cleanup/fixes/refactors. Never blindly replay an uncertain promotion; reconcile exact state first.

After promotion, independently re-read remote refs and verify the required ancestry/parents/tree relationship. Never merge `orchestration` or `workspace` history into `main`. If the guarded capability is unavailable, preserve the approved SHA and surface the operator boundary.
