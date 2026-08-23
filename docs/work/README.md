# Template-maintenance work records

`current/` contains canonical task records and optional separate concise task-progress files.

A task record is stable instruction authority: requested outcome, material scope, constraints, required work, expected checks, accepted design, and explicit exceptions. Resumable execution state (current position, attempts, checks run, blockers, next action) belongs in optional separate task-progress, not in the task record.

Completed, cancelled, or superseded task records do not stay in `current/` merely because an archival ceremony has not happened. When archival is desired after review, the record is moved to `archive/`.

These records concern development of the reusable template only. Downstream project work uses that project's normal task records.
