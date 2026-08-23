# Dual Developer architecture

Status: opt-in implementation route

Dual separates implementation design and review from source editing.

- `lead-developer` is a primary OpenCode agent configured with `openai/gpt-5.6-sol` (a suitable replacement under accepted architecture). It inspects current reality, designs the change, gives detailed instructions to Spark, reviews the resulting diff and checks, and steers corrections. Its edit permission is denied and its shell permission is limited to read/review commands.
- `spark-implementer` is the only source editor inside Dual, configured with `openai/gpt-5.3-codex-spark`. It is a subagent available to the lead through OpenCode's native task tool. It edits files, generates artifacts, runs implementation commands and tests, and reports exact results. It cannot launch subagents.
- Model identities are configuration rather than permanent route semantics.
- `small-developer` and the current heavy developer remain independent routes during this opt-in phase. They are not fallbacks or substitutes within Dual.
- Web selects the route, sequences cross-task work, and performs final independent outcome review. Web does not become an implementation editor or mechanically repeat every lead review step.

A Spark implementation disagreement uses one task-scoped `proposed-deviations.md` working file. Spark records the proposal before implementing the departure; the lead accepts or rejects it. The working file must be resolved before developer completion. Formal deviations remain the durable record when implemented reality materially differs from a prior normative expected state.

Dual uses direct repository and Git evidence. It does not require GitHub Issues as a command bus, bridge mailbox sequencing, MCP modes, compaction recovery, or package finalization.
