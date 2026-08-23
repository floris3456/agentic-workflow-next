# Deviation records

When implemented reality materially differs from an accepted expected state, create or update the applicable deviation record in the same commit as the implementation fact it describes. A deviation should state:

- the expected state and its authoritative source;
- the implemented state;
- why the difference exists;
- impact, residual risk, and affected evidence;
- optional human decision or required experiment; and
- the route for reconciliation/reversal.

Failed approaches belong in task-progress unless they create a durable system constraint. Research and automated checks are evidence, not acceptance.

## Spark model availability recovery

- **Expected state and source:** The prior Dual configuration expected the `spark-implementer` role to use `openai/gpt-5.3-codex-spark`.
- **Implemented state:** The Spark role currently uses `openai/gpt-5.6-sol`, matching the current `lead-developer` model configuration. Spark retains the same role, permissions, responsibilities, and required outcome.
- **Reason:** The configured provider hit a usage-limit/cooldown condition that prevented `openai/gpt-5.3-codex-spark` from executing requests, while `openai/gpt-5.6-sol` remained available.
- **Impact and reconciliation:** Dual remains a lead/Spark role architecture; only replaceable model configuration changed. Spark may be changed back to `openai/gpt-5.3-codex-spark` when that model is available again.
