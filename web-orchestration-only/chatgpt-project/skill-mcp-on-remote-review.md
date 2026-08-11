# MCP-ON remote review

## Trigger

Use after a developer handoff, after finalization, or whenever exact remote state must be established.

## Required range

- First handoff: task-start `developer` SHA to current handoff SHA.
- Later handoff: last reviewed `developer` SHA to current handoff SHA.
- Finalization: substantive-approval SHA to finalization SHA.

## Procedure

1. Confirm the reported SHA exists on remote `developer`.
2. Investigate branch, ancestry, intervening commits, and reporting error if report and remote disagree.
3. Compare the entire required range, not only task-progress snapshots.
4. Inspect changed files and exact supporting context.
5. Verify checks from reproducible remote evidence where possible; developer results remain perceived results.
6. Treat task-progress, bridge comments, projected OpenCode output, command status, and issue labels as navigation and reporting, not proof.
7. Confirm implementation records accompany commits whose facts they alter.
8. Record findings and exact range in task context.
9. Advance the review base only to an exact state inspected sufficiently for later review. Reviewed does not imply approved.
