# Template-maintenance task record

## Task ID

TEMPLATE-HISTORICAL-PUBLIC-RESIDUE-001

## Public-safe task brief

A previously published historical package contains a raw private runtime/session identifier that should not have been persisted to public Git. Do not reproduce that identifier in new records, comments, tests, packages, or handoffs.

The old repository/history is already public evidence; this record exists only because the remaining response is a genuine human-owned decision, not normal implementation work.

## Current fact

The identifier remains recoverable from published Git history. Current/new work must not copy it forward.

Do not describe the history as erased merely because present files/validators are clean.

## Human decision required

Choose one of two outcomes:

1. **Retain published history.** Accept that the historical identifier remains publicly recoverable, keep current/future work from propagating it, and record a short formal deviation describing the retained historical exposure.
2. **Rewrite published history.** Authorize a separately reviewed destructive migration that removes the historical value and repairs affected refs/provenance/downstream state.

No destructive rewrite is authorized by this task record. It requires explicit human approval of the exact migration plan before execution.

## Boundaries

- Do not reproduce the identifier while investigating or documenting the decision.
- Do not block unrelated Direct Host/Dual/instruction/AgentMemory work on this decision unless that work would copy or depend on the exposed historical value.
- Do not rebuild the old package-supersession/validator machinery merely to manage this historical issue.
- If retain-history is chosen, the durable result should be a concise public-safe deviation, not another large workflow subsystem.

## Acceptance criteria

This task closes only after the human explicitly selects retain-history or destructive rewrite and the selected outcome is recorded/executed under its proper authority.
