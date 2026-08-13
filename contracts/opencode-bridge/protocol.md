# GitHub control protocol

Protocol version `agentic-bridge/1` uses one open issue carrying the configured control label per active task. The web orchestrator owns issue bodies and command comments. The bridge owns `bridge-status:*` labels and bridge-authored comments. Repository evidence must still be inspected directly through GitHub; bridge reports are not independent proof.

## Command envelope

Commands are JSON inside a hidden Markdown marker:

```markdown
<!-- agentic-bridge-command
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"9f1c5ea1-e4ab-4ac7-8e8d-af9fdcae6331","task_id":"TASK-001","kind":"start","arguments":{"brief":"Public-safe delegated brief","agent":"luna"},"expected":{"developer_sha":"0123456789abcdef0123456789abcdef01234567","ref":"developer"}}
-->
```

The bridge accepts markers only from an exact configured GitHub login whose current repository association is `OWNER`, `MEMBER`, or `COLLABORATOR`. It scans both the issue body and every comment by design for compatibility and recovery. The generalized Project package deliberately publishes every command, including the initial `start`, as a fresh comment and keeps the editable issue body command-free. Repeated scans are safe because command UUID and task-sequence uniqueness provide durable idempotency. Only one mapped mutating control issue may remain open per repository. The first valid issue command must be `start`; that permanently binds the issue and task locally. Its sequence is exactly `1`, every later command is exactly the prior accepted sequence plus one, and a task cannot admit another command while one is `accepted` or `applying`. A sequence/nonterminal admission rejection is recorded before the command ledger and never becomes executable on a later scan; a corrected command uses a fresh UUID and the still-expected sequence.

The bridge queues and attempts to publish `applying` before entering the command handler. While a command is `applying`, wait: it is pre-indeterminate and must not be reissued. If the bridge restarts before recording a terminal state, recovery changes it to `indeterminate` and never automatically reissues it.

`start` and `promotion.apply` require both expected fields, `expected.ref` equal to `developer`, and a clean checkout. Other commands may include expected guards while implementation files are dirty. Expected state is checked against a freshly fetched, synchronized local `developer` checkout before consequential work.

## Commands

| Kind | Arguments |
| --- | --- |
| `start` | `brief` string; optional `agent` (`luna` or `sol`) and `title` |
| `status` | none |
| `steer` | `message` |
| `route` | `agent`; optional continuation `message` |
| `permission.reply` | public `permission` alias, `reply` (`once`, `always`, `reject`), optional `message` |
| `question.reply` | public `question` alias and ordered `answers` string arrays |
| `abort` | none |
| `events.page` | optional `after` journal cursor and `limit` up to 100 |
| `pty.create` | `command`, optional string `args` and `title`; denied unless local `policy.pty_enabled` is true |
| `pty.input` | public `pty` alias and bounded `data`; denied unless local `policy.pty_enabled` is true |
| `pty.read` | public `pty` alias, optional `after` cursor and bounded `limit`; diagnostic local-state read available even when PTY mutations are disabled |
| `pty.resize` | public `pty` alias, positive `rows` and `cols`; denied unless local `policy.pty_enabled` is true |
| `pty.remove` | public `pty` alias; denied unless local `policy.pty_enabled` is true |
| `finalize` | finalization `message` |
| `sync.recover` | none |
| `promotion.apply` | exact `approved_sha`, equal to `expected.developer_sha`; locally disabled by default and emitted only after explicit human exact-SHA approval |
| `opencode.request` | `operation_id` and optional generic `request` containing `path`, `query`, `wildcard`, and `body` |

The legacy sequenced `status` command performs a live OpenCode session read and
remains for protocol compatibility. It is not the durable recovery view below and
is not used by the redesigned Project package.

Generic reads are available from the pinned operation manifest. Generic mutations require an exact local `allowed_mutations` entry. `blocked-web` operations remain unavailable. `local-secret` operations require an exact `allowed_local_secret_operations` entry. Generic requests contain only well-shaped `path`, `query`, `wildcard`, and `body` transport fields. Caller-supplied `directory`, `workspace`, or `location` query routing is rejected so every request stays pinned to the configured local project. Explicit `{"alias":"session-1"}` values resolve task-owned private IDs locally; task-bound aliases cannot be used by another task. Explicit `{"secret_ref":"provider-token"}` values resolve mode-restricted local files only for local-secret operations. Raw OpenCode IDs, absolute local paths, and literal secret-like values are rejected from generic GitHub requests.

## Sequence-free recovery requests

Read reconciliation uses a separate UUID-idempotent marker and ledger. It has no
`sequence`, never changes `task_sequences`, never begins a command handler, and
cannot repeat an underlying mutation:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"29cb2445-e3b7-4f8f-bbf4-fdb005a0438f","task_id":"TASK-001","kind":"command.status","arguments":{"command_id":"9f1c5ea1-e4ab-4ac7-8e8d-af9fdcae6331"}}
-->
```

Post a request only on its existing task-bound issue.

| Kind | Arguments | Durable result |
| --- | --- | --- |
| `command.status` | exact `command_id` UUID | matching task's exact ledger or pre-ledger-rejection state, known projected result/error, timestamps, applying age, and service heartbeat |
| `task.status` | none | mapped session alias/agent/state and latest projected developer response plus event/update timestamps |

The result is navigation and recovery evidence. It does not prove implementation
completion, correctness, synchronization, review, or acceptance.

## Machine markers

For a canonical command marker, the hashed byte range starts immediately after the newline following `agentic-bridge-command` and ends immediately before `-->`. Canonical writers emit one compact JSON line followed by a newline, so that trailing newline is part of the SHA-256 input. `marker_hash` is the lowercase hexadecimal SHA-256 of those exact UTF-8 bytes; line-ending or whitespace changes therefore change the hash.

A status for a parsed command uses this exact machine-marker shape before public prose:

```markdown
<!-- agentic-bridge-status
{"protocol":"agentic-bridge/1","command_id":"<uuid>","task_id":"<task-id>","sequence":1,"state":"<state>"}
-->
```

A rejected marker that could not be bound to a parsed command uses:

```markdown
<!-- agentic-bridge-status
{"protocol":"agentic-bridge/1","marker_hash":"<sha256>","state":"rejected"}
-->
```

A parsed read request uses an `agentic-bridge-request-status` marker containing
exactly `protocol`, `request_id`, `task_id`, `kind`, and `state`. A request
that cannot be parsed or task-bound uses the same marker with exactly
`protocol`, `marker_hash`, and `state: rejected`.

The outbox appends `<!-- agentic-bridge-outbox:<sha256> -->`, where that digest hashes the durable UTF-8 outbox dedupe key. Only a matching marker in a comment authored by the configured App bot proves that write was delivered.

## Results and recovery

The bridge first queues an accepted ACK, then `applying`, then a terminal status/result comment and one current status label. Comments carry deterministic bridge-bot-only dedupe markers. Spoofed markers from other authors are ignored. GitHub writes live in the SQLite outbox, are paced, delivered in strict FIFO order, retried with rate-limit guidance, and survive restart. FIFO blocking prevents an older retry from overtaking and later regressing a newer status.

Raw OpenCode results and events remain in the mode-restricted local database. GitHub projection replaces private session, PTY, permission, question, message, workspace, and event IDs, including embedded text and object-key occurrences, with globally unique task-scoped aliases, redacts secret-like fields and text, removes local paths, neutralizes active Markdown, limits depth/collections/strings, and retains oversized results locally. Local-secret failures publish fixed non-sensitive text while detailed upstream errors remain local.

After a mapped developer session emits `session.idle` or `session.error`, the
committed event creates a durable response-delivery record. The bridge structurally
selects the latest assistant message, applies the existing public projection,
stores that projected response with the mapped task, and queues it to the bound
issue. Retrieval/publication failures remain pending and retry idempotently. The
bridge does not parse, validate, approve, reject, or otherwise interpret handoff
fields. `task.status` returns the same latest projected value for missed-result
recovery.

Permission and question events remain projected after the raw event is committed.
Durable session history, project sync history, legacy live SSE, canonical
reconciliation, and deduplication recover local state without claiming unsupported
SSE `Last-Event-ID` replay.

For a genuinely stuck `applying` command, issue one `command.status` request and
compare its applying age with the published service heartbeat. Do not poll
indefinitely and do not retry the mutation. If both command state and a current
heartbeat remain ambiguous beyond the operation's bounded wait, a local operator
stops and restarts the bridge after inspecting the process/upstream state. Restart
converts the durable `applying` entry to `indeterminate`; the orchestrator then
reconciles remote/task evidence before deciding whether any fresh command is safe.
