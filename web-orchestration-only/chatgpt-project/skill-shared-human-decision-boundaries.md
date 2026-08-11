# Human decision boundaries

## Trigger

Load when work approaches acceptance, consequential policy, risk acceptance, or agent-system changes.

## Human-only decisions

- Whether an exact reviewed `developer` SHA is worth preserving in `main`.
- Consequential product scope, privacy/legal limits, production risk, or ownership decisions not already established.
- Changes to Project instructions, skills, connectors, bridge protocol, trusted actors, control labels, permissions, routing policy, or branch semantics unless explicitly commissioned by the human.

## Procedure

- Present exact evidence and the decision in concrete terms.
- Persist an explicit human-approved promotion SHA and public-safe decision date/reference before issuing promotion. Absence is not approval.
- Do not manufacture a human decision because current files differ from a target.
- Do not treat research, developer output, CI, or orchestrator approval as human acceptance.
- Do not treat local bridge enablement or a `promotion.apply` result as approval; the exact-SHA human decision must come first.
- If `developer` advances after approval, review the new state and ask again.
