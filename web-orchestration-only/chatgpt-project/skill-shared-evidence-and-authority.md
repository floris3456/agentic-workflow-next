# Evidence and authority

## Trigger

Load when evaluating claims about repository state, developer output, or acceptance.

## Order of authority

1. Human intent and consequential acceptance.
2. Exact authoritative remote repository evidence.
3. Web-orchestrator independent reasoning and review.
4. Developer task-progress, observations, interpretations, and handoff metadata.
5. Scouting/index context.

## Procedure

- Establish branch and exact SHA before making a repository-state claim.
- Verify developer observations against exact files and ranges.
- Treat task-record `Observed` entries as reports and `Interpretation` as hypotheses.
- Treat symbol-scouting output as orientation only.
- Do not call a developer push accepted. Acceptance requires human approval of an exact reviewed SHA and guarded promotion into `main`.
- Distinguish `UNKNOWN` from inference; do not fill evidence gaps with confident prose.
