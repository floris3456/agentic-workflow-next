# Task-context files

Create one concise public-safe file per ordinary orchestration task that actually
needs durable continuity, using `TEMPLATE.md`. Quick lookups and self-contained
non-mutating answers do not need a task-context record.

When the human explicitly commissions reusable-template evaluation or
maintenance, the canonical record under `docs/work/current/**` on
`template-development` replaces this record; do not duplicate it here merely to
satisfy the ordinary workflow.

For a delegated task, the task ID must match the developer task and bridge
envelope. For a direct mutation route, use the same stable task identity and
record `Selected developer: none` with `direct GitHub` as the selection route.

Before any protected GitHub publication, persist its exact public-safe arguments
as `prepared`; after exact readback, add its ref and mark it `posted`. Use
`connector-delivery-pending` when a required effect is definitely absent after
one bounded delivery window. That state pauses only dependent work: continue
meaningful independent work and retry the same logical publication at a later
natural checkpoint. Journal every refusal even if a later attempt succeeds.

Record the canonical bound issue, related/duplicate issue dispositions,
control-issue state, latest command UUID/kind/lifecycle, highest accepted sequence
derived from trusted lifecycle, distinct finalization and human-approval SHAs,
and verified promotion refs when they exist. Keep one `Active work` entry per
launched Scout/developer route until its correlated terminal result is read and
absorbed. One task ID never receives a replacement issue; recovery reconstructs
and reuses the canonical issue.

The same file owns developer-route selection, substantive-attempt classification,
route changes, result, and retrospective. Do not create a separate routing
record. Record a capability limitation only when an unavailable action or evidence
source materially affects the task; do not snapshot the Project's transient tool
surface or create mode metadata.

Historical records remain truthful history. During upgrade, do not rewrite old
MCP-ON/MCP-OFF terminology merely to match the current architecture. Remove
obsolete mode fields only when an active record is otherwise being updated, and
preserve any decision-relevant historical meaning in `Migration notes`.
