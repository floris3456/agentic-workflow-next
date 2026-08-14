# Template-maintenance work records

`current/` contains one public-safe, compaction-safe record per template task
until that task is finalized. A successful maintainer handoff may report
`completed` while its record remains in `current/`; that status means the working
cycle completed successfully, not that archival has occurred. After exact
source/application review and durable-record reconciliation, the exact approved
blob moves unchanged to the same basename under `archive/`.

These records concern development of the reusable template only. Downstream
project work uses that project's normal task records.
