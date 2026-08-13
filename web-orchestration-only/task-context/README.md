# Task-context files

Create one file per active or completed orchestration task using `TEMPLATE.md`.

The task ID must match the delegated developer task and bridge envelope. Keep the file concise. Before posting any command, persist its exact one-line public-safe JSON envelope as `prepared`; after exact readback, add the command-comment ref and mark it `posted`. Journal every resolved command with command/result refs and lifecycle state. Clear ordinary terminal pending state only after journaling; retain the exact envelope as `pre-ledger-rejected` or `terminal-unresolved` until corrected/reconciled, and use `cancelled` for a definitely unpublished command. Record the control-issue state, latest command UUID/sequence/kind/lifecycle, distinct finalization and human-approval SHAs, and verified promotion refs. Update after consequential delegation, review, steering, synchronization recovery, mode-transition reconciliation, and before human acceptance.

The same file owns Luna/Sol selection, substantive-attempt classification, route
changes, result, and retrospective. Do not create a separate routing record for
new work. During upgrade, copy any active legacy routing facts into `## Routing`
before retiring the old record; historical Git revisions remain readable.

`Last orchestration mode` is continuity metadata only; current-turn mode determination always wins.
