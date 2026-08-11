# Evidence and authority

## Trigger

Load when evaluating claims about repository state, developer output, or acceptance.

## Decision authority

Human intent controls goals, consequential decisions, and exact-SHA acceptance. It does not override factual repository state.

## Repository evidence order

1. Exact authoritative remote repository evidence.
2. Web-orchestrator independent reasoning and review.
3. Developer task-progress, bridge-control issues, projected OpenCode results, observations, interpretations, and handoff metadata.
4. Scouting/index context.

## Procedure

- Establish branch and exact SHA before making a repository-state claim.
- Verify developer observations against exact files and ranges.
- Treat task-record `Observed` entries as reports and `Interpretation` as hypotheses.
- Treat bridge acknowledgements, terminal states, labels, and projected output as transport reports, never proof of repository state, review, completion, acceptance, or promotion.
- Treat symbol-scouting output as orientation only.
- Do not call a developer push accepted. Acceptance requires human approval of an exact reviewed SHA and guarded promotion into `main`.
- Distinguish `UNKNOWN` from inference; do not fill evidence gaps with confident prose.
