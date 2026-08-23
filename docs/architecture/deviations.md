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

## Bridge Scout provider credential

- **Expected state and source:** The delegated local-runtime repair brief named
  `opencode.scout_provider_api_key_file` as a minimum hardened Scout setting; the
  pre-task bridge implementation required only that static OpenAI API-key file.
- **Implemented state:** Schema v1 accepts exactly one static API-key file or one
  filtered OpenAI-only OAuth document at the Scout persistence root's isolated
  OpenCode auth location. A legacy runtime-data location is accepted only as the
  migration source when the persistent file is absent. Other providers, unknown
  fields, a general OpenCode auth store, and dual credential configuration are
  rejected.
- **Reason:** The operator directed the repair to reuse an existing ChatGPT
  subscription while preserving the Scout trust boundary. Normal OpenCode auth
  contains unrelated provider credentials and therefore cannot be mounted or
  read directly by Scout.
- **Impact and residual risk:** OAuth refresh state and OpenCode session data are
  writable in a derived owner-private persistence sibling that survives apply
  bootstrap. Unsafe root/data/state/auth symlinks and structural path corruption
  fail closed. The immutable trusted config/tool/dependency tree remains separate
  and read-only, and persistent storage is not configured as code, config, plugin,
  instruction, HOME, cache, temp, or executable-path authority.
  Active contract probes do not send a model request, so provider-side token or
  subscription failures remain observable only when a later Scout request uses
  the model.
- **Decision and reconciliation:** The operator selected filtered OAuth reuse
  during this repair. Reversal removes `scout_provider_oauth_file` support and
  restores an API-key-only private configuration; acceptance keeps both explicit
  credential modes documented and validated.
