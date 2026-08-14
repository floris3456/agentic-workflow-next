# Template-maintenance agreement

This branch is the coordination ledger for changes to the reusable template.
It is not a project implementation branch and is never merged into another
branch.

## Always-active boundaries

- Work here only when the human explicitly identifies template maintenance.
- Create the task record before source-branch implementation.
- Keep every persisted value public-safe. Never store credentials, private chat,
  personal data, host-local absolute paths, or raw private agent identifiers.
- Record exact remote refs; reports and task notes are navigation, not proof.
- Do not copy source trees into this branch. Actual edits belong on the canonical
  template source branches, using a bounded direct connected-GitHub route when
  proportionality selects it or isolated source checkouts when local execution is
  warranted.
- Do not merge histories. Transfer reviewed content only through a deterministic
  change package.
- Keep one mutating template-maintenance task at a time. Read-only inspection may
  run concurrently.
- Push every ledger commit immediately. A failed push stops ledger mutation until
  synchronization recovery proves the failed commit is remote.
- Human exact-SHA approval remains required for every `main` promotion.
- Do not launch subagents. The orchestrator selects any implementation route.

## Required procedure

Load `.opencode/skills/template-maintenance/SKILL.md` when starting, resuming,
changing, packaging, handing off, or finalizing a maintenance task.

Use `docs/work/templates/task-progress-template.md` and return only the fields in
`docs/work/templates/maintainer-response-template.md` at a handoff boundary.
