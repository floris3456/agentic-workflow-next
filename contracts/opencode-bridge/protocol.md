# GitHub control protocol

Protocol version `agentic-bridge/1` uses one open issue carrying the configured control label per active task. The web orchestrator owns issue bodies and command comments. The bridge owns `bridge-status:*` labels and bridge-authored comments. Repository evidence must still be inspected directly through GitHub; bridge reports are not independent proof.

## Command envelope

Commands are JSON inside a hidden Markdown marker:

```markdown
<!-- agentic-bridge-command
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"9f1c5ea1-e4ab-4ac7-8e8d-af9fdcae6331","task_id":"TASK-001","kind":"start","arguments":{"brief":"Public-safe delegated brief","agent":"small"},"expected":{"developer_sha":"0123456789abcdef0123456789abcdef01234567","ref":"developer"}}
-->
```

The bridge accepts markers only from an exact configured GitHub login whose current repository association is `OWNER`, `MEMBER`, or `COLLABORATOR`. It scans both the issue body and every comment by design for compatibility and recovery. The generalized Project package deliberately publishes every command, including the initial `start`, as a fresh comment and keeps the editable issue body command-free. Repeated scans are safe because command UUID and task-sequence uniqueness provide durable idempotency. One task ID binds to exactly one issue, and only one mapped mutating control issue may remain open per repository. A marker on a second issue that repeats an already-bound task ID is rejected locally; it cannot replace the binding or abort polling of other issues. The first valid issue command must be either `start` or `workspace.start`; that permanently binds the issue and task locally. Its sequence is exactly `1`, every later command is exactly the prior accepted sequence plus one, and a task cannot admit another command while one is `accepted` or `applying`. Every authenticated, parse-valid command rejected before the command ledger is recorded by UUID without consuming sequence, including duplicate issue/task binding, unbound/mismatched-task commands, a first mutation other than `start` or `workspace.start`, the one-open-mutating-issue gate, sequence/nonterminal failures, and mandatory-guard failures. A later scan returns that same rejection; a corrected command uses a fresh UUID and the still-expected sequence.

The bridge queues and attempts to publish `applying` before entering the command handler. While a command is `applying`, wait: it is pre-indeterminate and must not be reissued. If the bridge restarts before recording a terminal state, recovery changes it to `indeterminate` and never automatically reissues it.

`start` and `promotion.apply` require `expected.developer_sha` plus
`expected.ref: developer`, and a clean synchronized developer checkout.
`workspace.start` instead requires `expected.template_development_sha` plus
`expected.ref: template-development`. Before that start, the bridge explicitly
fetches the template-development remote ref and discovers exactly one registered,
real, non-symlink worktree on that branch. It proves the shared Git common
directory, exact configured GitHub repository identity, branch, HEAD, upstream
when present, clean state, and equality with the fetched remote ref. No public
command or tracked configuration carries the private worktree path. A missing or
misplaced mandatory guard is a durable pre-ledger rejection and does not consume
sequence; the corrected command uses a fresh UUID. Other commands may include
runtime-appropriate expected guards while implementation files are dirty.

## Commands

| Kind | Arguments |
| --- | --- |
| `start` | `brief` string; optional `agent` (`small` or `heavy`, default `small`) and `title` |
| `workspace.start` | `brief` string; optional `agent` (`small` or `heavy`, default `small`) and `title` |
| `status` | none |
| `steer` | `message` |
| `route` | `agent` (`small` or `heavy`); optional continuation `message` |
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

## Sequence-free recovery and Scout requests

Durable reconciliation and read-only Scout launch use a separate UUID-idempotent
marker and ledger. It has no command `sequence`, never changes the accepted
command ledger, and never enters a mutating command handler:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"29cb2445-e3b7-4f8f-bbf4-fdb005a0438f","task_id":"TASK-001","kind":"command.status","arguments":{"command_id":"9f1c5ea1-e4ab-4ac7-8e8d-af9fdcae6331"}}
-->
```

Post status requests only on their existing task-bound issue. `scout.start` may
establish a task/issue binding when no mutating task exists there; this does not
make that issue a mutating-task issue. Multiple Scout-only issues may be open,
and any useful number of independent Scout starts may execute concurrently with
one mutating developer task. Runtime resource preparation may queue briefly but
there is no policy concurrency cap. A second issue cannot establish the same
task ID; its requests receive bounded rejection output while the original
binding and unrelated poll work continue.

| Kind | Arguments | Durable result |
| --- | --- | --- |
| `command.status` | exact `command_id` UUID | matching task's exact ledger or pre-ledger-rejection state, known projected result/error, timestamps, applying age, and service heartbeat |
| `task.status` | none | mapped session kind/alias/agent/state and latest projected task response plus event/update timestamps; the legacy developer-response field remains populated only for developer sessions |
| `scout.start` | exactly four fields: focused string `question`, exact lowercase 40-character SHA in `ref`, bounded string `scope`, and string `expected_evidence` | one dedicated-runtime Luna/high session over the immutable exact-tree snapshot, or an explicit fail-closed runtime/probe error; UUID admission/no-replay semantics remain durable |
| `scout.status` | exact `scout_request_id` UUID | matching task/request start state, exact ref, session state, and latest projected Scout response |

`command.status`, `task.status`, and `scout.status` are local durable reads and
never repeat work. A restart while one of these reads is applying requeues and
recomputes it under the same request UUID from local state. `scout.start` creates
and prompts at most one read-only session per request UUID; a restart while that
request is applying marks it indeterminate and never repeats a side effect.
Runtime absence or probe failure stops before session creation or normal-server
contact. Historical worktree mappings/results remain queryable locally but are
not contacted. All results are navigation
and recovery evidence; they do not prove implementation completion, correctness,
synchronization, review, or acceptance.

No ref-owned Scout agent is tracked. Snapshot preparation fetches `developer`,
requires the exact requested commit in canonical `origin/developer` history, and
uses `git ls-tree` plus `git cat-file` rather than checkout/worktree. Gitlinks and
`.git` entries are rejected, regular files are non-writable/non-executable,
directories are read-only, and symlinks are preserved as inert target text. Every
reuse verifies all paths, types, modes, and Git blob hashes; historical worktree
mappings fail recovery.

The distinct loopback runtime is bridge-installed outside `repository_root` with
exact OpenCode/plugin `1.18.16`, sterile HOME/XDG/temp/environment, read-only
config/dependencies, explicit provider auth, and project/default-plugin/external-
skill/watcher/LSP/formatter disablement. Its bridge-owned Luna/high prompt and
wildcard-deny policy expose only `scout_read`, `scout_glob`, and `scout_grep`.
These tools never follow symlinks, enforce lexical/realpath containment and bounds,
and have no process, package, LSP, mutation, delegation, web, interaction, or
network primitive. Bootstrap probes installation, version/OpenAPI, agent, prompt,
permissions, and tool inventory; no normal developer endpoint fallback exists.

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

A parsed sequence-free request uses an `agentic-bridge-request-status` marker containing
exactly `protocol`, `request_id`, `task_id`, `kind`, and `state`. A request
that cannot be parsed or task-bound uses the same marker with exactly
`protocol`, `marker_hash`, and `state: rejected`.

The outbox appends `<!-- agentic-bridge-outbox:<sha256> -->`, where that digest hashes the durable UTF-8 outbox dedupe key. Only a matching marker in a comment authored by the configured App bot proves that write was delivered.

## Results and recovery

The bridge first queues an accepted ACK, then `applying`, then a terminal status/result comment and one current status label. Comments carry deterministic bridge-bot-only dedupe markers. Spoofed markers from other authors are ignored. GitHub writes live in the SQLite outbox, are paced, delivered in strict FIFO order, retried with rate-limit guidance, and survive restart. FIFO blocking prevents an older retry from overtaking and later regressing a newer status.

Raw OpenCode results and events remain in the mode-restricted local database. GitHub projection replaces private session, PTY, permission, question, message, workspace, and event IDs, including embedded text and object-key occurrences, with globally unique task-scoped aliases, redacts secret-like fields and text, removes local paths, neutralizes active Markdown, limits depth/collections/strings, and retains oversized results locally. Local-secret failures publish fixed non-sensitive text while detailed upstream errors remain local.

After a mapped developer or workspace session emits `session.idle` or
`session.error`, the event journal row, durable cursor, session kind/state, and
response-delivery row commit in one SQLite transaction. The bridge structurally
selects the latest assistant message through the client pinned to that session
runtime, applies the existing public projection, stores that projected response
with the mapped task, and queues it to the bound issue. Retrieval/publication
failures remain pending and retry idempotently. The bridge does not parse,
validate, approve, reject, or otherwise interpret handoff fields. `task.status`
returns the same latest projected value for missed-result recovery.

After a mapped Scout session idles or errors, the same committed-event,
atomic-delivery, and public-projection path selects its latest assistant response,
stores it under the exact task and Scout request, and queues it to the bound issue
with the requested ref. Workspace legacy events have deterministic local identity
when upstream omits an event ID. The canonical lifecycle fallback creates one
stable synthetic terminal event, so restart recovery is idempotent and never
replays the prompt. `scout.status` provides missed-result recovery. The bridge
does not turn Scout facts into an orchestration or implementation decision.

Permission and question events remain projected after the raw event is committed.
Pending mapped interactions are also reconstructed from `permission.list` and
`question.list` with stable event identity; re-presentation repairs a missing
idempotent outbox entry without duplicating the public comment. Durable session
history, project sync history, repository/workspace legacy live SSE, this focused
interaction recovery, the Scout lifecycle fallback, and deduplication recover
local state without claiming unsupported SSE `Last-Event-ID` replay.

After a successful `permission.reply` or `question.reply`, the bridge records
the resolved interaction in the private state database. Before sending that
reply, it captures the exact mapped session's activity timestamp and latest
assistant-message completion evidence. It then validates both pending
interaction lists, the mapped task session status/activity on its persisted
runtime, and (when the
baseline is available) the latest assistant-message evidence. A changed
post-reply activity timestamp or changed terminal assistant message is clean
continuation, including when the completed session is absent from
`session.status`. Otherwise an initial non-progressing observation waits a
bounded one-second grace before all evidence is read again. Any `busy`/`retry`
status or changed activity timestamp is clean continuation; only unchanged live
session activity with no outstanding interaction can reach the durable claim for
one fixed same-session continuation nudge using the existing agent and the fixed
directory for that runtime. Missing or malformed baseline/live session evidence
fails closed. The public
command result includes `continuation_recovery.outcome`:
`recovered` means the nudge was sent, `clean` means the session was already
progressing, `blocked` means safety proof or delivery was unavailable, and
`already-recovered` means the persisted episode was already sent. A claim is
recorded before the request, so an uncertain request is never replayed. The
bridge never calls `session.create`, `start`, or route changes on this path.
Outstanding interactions, missing mappings/status, malformed lists, and API
errors fail closed with no nudge.

Workspace sessions persist `session_kind: workspace` and use a lazily created
OpenCode client whose fixed directory is the verified template-development
worktree. Status, steer/finalize, generic requests, structured replies,
same-session continuation proof/nudge, abort, durable/canonical recovery, and
terminal delivery all select that client from the durable session kind. Restart
re-proves the same registered worktree and repository identity without requiring
the worktree to remain clean or at its start SHA. Workspace route changes,
bridge PTYs, and `promotion.apply` are denied; normal developer routing and the
human exact-SHA authority over `main` are unchanged.

The normal developer config leaves in-worktree read/edit/shell defaults intact
and sets `external_directory` to `ask`. It does not add a broad external-path
allow rule. Genuine outside-worktree access therefore remains visible for local
OpenCode/orchestrator approval; repository-relative guidance prevents parent or
sibling path walks from turning a missing in-scope path into an implicit scope
change.

For a genuinely stuck `applying` command, issue one `command.status` request and
compare its applying age with the published service heartbeat. Do not poll
indefinitely and do not retry the mutation. If both command state and a current
heartbeat remain ambiguous beyond the operation's bounded wait, a local operator
stops and restarts the bridge after inspecting the process/upstream state. Restart
converts the durable `applying` entry to `indeterminate`; the orchestrator then
reconciles remote/task evidence before deciding whether any fresh command is safe.
