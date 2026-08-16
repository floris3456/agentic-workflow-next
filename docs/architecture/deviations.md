# Deviation records

When an accepted plan, design, milestone, or gate differs materially from implementation, create or update the applicable deviation record in the same commit as the implementation fact it describes. A deviation should state:

- the expected state and its authoritative source;
- the implemented state;
- why the difference exists;
- impact, residual risk, and affected evidence;
- the required human decision or experiment; and
- the route for reconciliation, acceptance, or reversal.

Failed approaches belong in task-progress unless they create a durable system constraint. Research and automated checks are evidence, not acceptance.

## Bridge Scout provider credential

- **Expected state and source:** The delegated local-runtime repair brief named
  `opencode.scout_provider_api_key_file` as a minimum hardened Scout setting; the
  pre-task bridge implementation required only that static OpenAI API-key file.
- **Implemented state:** Schema v1 accepts exactly one static API-key file or one
  filtered OpenAI-only OAuth document at the Scout runtime's isolated OpenCode
  auth location. Other providers, unknown fields, a general OpenCode auth store,
  and dual credential configuration are rejected.
- **Reason:** The operator directed the repair to reuse an existing ChatGPT
  subscription while preserving the Scout trust boundary. Normal OpenCode auth
  contains unrelated provider credentials and therefore cannot be mounted or
  read directly by Scout.
- **Impact and residual risk:** OAuth refresh state is writable inside the
  otherwise sterile runtime data area and is preserved by apply bootstrap. The
  immutable trusted config/tool/dependency tree remains separate and read-only.
  Active contract probes do not send a model request, so provider-side token or
  subscription failures remain observable only when a later Scout request uses
  the model.
- **Decision and reconciliation:** The operator selected filtered OAuth reuse
  during this repair. Reversal removes `scout_provider_oauth_file` support and
  restores an API-key-only private configuration; acceptance keeps both explicit
  credential modes documented and validated.
