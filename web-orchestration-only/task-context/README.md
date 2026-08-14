# Task-context files

Create one file per active or completed orchestration task using `TEMPLATE.md`.

The task ID must match the delegated developer task and bridge envelope. Keep the
file concise. Before any GitHub publication, persist its exact public-safe
arguments as `prepared`; after exact readback, add its ref and mark it `posted`.
Use `connector-delivery-pending` when a required effect is definitely absent
after one bounded delivery window. Journal every refusal immediately even if a
later attempt succeeds. Journal every resolved command with command/result refs
and lifecycle state. Clear ordinary terminal pending state only after journaling;
retain an exact envelope as `pre-ledger-rejected` or `terminal-unresolved` until
reconciled, and use `cancelled` only for a definitely unpublished superseded
request.

Record the canonical bound issue, every related/duplicate issue and disposition,
control-issue state, latest command UUID/kind/lifecycle, highest accepted
sequence derived from trusted lifecycle, distinct finalization and human-approval
SHAs, and verified promotion refs. Keep one `Active work` entry per launched
Scout/developer route through its correlated terminal result and record whether
the orchestrator absorbed it. Update after consequential delegation, review,
steering, synchronization recovery, mode-transition reconciliation, and before
human acceptance. One task ID never receives a replacement issue; resume by
reconstructing and reusing its canonical issue.

The same file owns Luna/Sol selection, substantive-attempt classification, route
changes, result, and retrospective. Do not create a separate routing record for
new work. During upgrade, copy any active legacy routing facts into `## Routing`
before retiring the old record; historical Git revisions remain readable.

During upgrade, migrate any active prepared command into `## Pending
publication`, reconstruct `## Active work` from trusted task-correlated issue
history, and use `none` for refusal history that was not durably recorded.

`Last orchestration mode` is continuity metadata only; current-turn mode determination always wins.
