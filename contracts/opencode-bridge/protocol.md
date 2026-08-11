# GitHub control protocol

Protocol version `agentic-bridge/1` uses one open issue carrying the configured control label per active task. The web orchestrator owns issue bodies and command comments. The bridge owns `bridge-status:*` labels and bridge-authored comments. Repository evidence must still be inspected directly through GitHub; bridge reports are not independent proof.

## Command envelope

Commands are JSON inside a hidden Markdown marker:

```markdown
<!-- agentic-bridge-command
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"9f1c5ea1-e4ab-4ac7-8e8d-af9fdcae6331","task_id":"TASK-001","kind":"start","arguments":{"brief":"Public-safe delegated brief","agent":"luna"},"expected":{"developer_sha":"0123456789abcdef0123456789abcdef01234567","ref":"developer"}}
-->
```

The bridge accepts markers only from an exact configured GitHub login whose current repository association is `OWNER`, `MEMBER`, or `COLLABORATOR`. Only one mapped control issue may remain open per repository. The first valid issue command must be `start`; that permanently binds the issue and task locally. Sequence numbers increase monotonically per task. Command UUID and task-sequence uniqueness provide durable idempotency. A command interrupted while `applying` becomes `indeterminate` and is never automatically reissued.

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
| `pty.create` | `command`, optional string `args` and `title`; locally disabled by default |
| `pty.input` | public `pty` alias and bounded `data` |
| `pty.read` | public `pty` alias, optional `after` cursor and bounded `limit` |
| `pty.resize` | public `pty` alias, positive `rows` and `cols` |
| `pty.remove` | public `pty` alias |
| `finalize` | finalization `message` |
| `sync.recover` | none |
| `promotion.apply` | exact `approved_sha`, equal to `expected.developer_sha`; locally disabled by default and emitted only after explicit human exact-SHA approval |
| `opencode.request` | `operation_id` and optional generic `request` containing `path`, `query`, `wildcard`, and `body` |

Generic reads are available from the pinned operation manifest. Generic mutations require an exact local `allowed_mutations` entry. `blocked-web` operations remain unavailable. `local-secret` operations require an exact `allowed_local_secret_operations` entry. Generic requests contain only well-shaped `path`, `query`, `wildcard`, and `body` transport fields. Caller-supplied `directory`, `workspace`, or `location` query routing is rejected so every request stays pinned to the configured local project. Explicit `{"alias":"session-1"}` values resolve task-owned private IDs locally; task-bound aliases cannot be used by another task. Explicit `{"secret_ref":"provider-token"}` values resolve mode-restricted local files only for local-secret operations. Raw OpenCode IDs, absolute local paths, and literal secret-like values are rejected from generic GitHub requests.

## Results and recovery

The bridge first queues an accepted ACK, then a terminal status/result comment and one current status label. Comments carry deterministic bridge-bot-only dedupe markers. Spoofed markers from other authors are ignored. GitHub writes live in the SQLite outbox, are paced, delivered in strict FIFO order, retried with rate-limit guidance, and survive restart. FIFO blocking prevents an older retry from overtaking and later regressing a newer status.

Raw OpenCode results and events remain in the mode-restricted local database. GitHub projection replaces private session, PTY, permission, question, message, workspace, and event IDs, including embedded text and object-key occurrences, with globally unique aliases, redacts secret-like fields and text, removes local paths, neutralizes active Markdown, limits depth/collections/strings, and retains oversized results locally. Local-secret failures publish fixed non-sensitive text while detailed upstream errors remain local. Permission, question, idle, and error events can be projected after the raw event is committed. Durable session history, project sync history, legacy live SSE, canonical reconciliation, and deduplication recover local state without claiming unsupported SSE `Last-Event-ID` replay.
