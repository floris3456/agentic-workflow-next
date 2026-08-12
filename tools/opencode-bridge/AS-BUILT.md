# AS-BUILT: OpenCode bridge

**Status:** Developer implementation complete for `AGENTIC-BRIDGE-001`; live GitHub App/native ChatGPT account exercise remains operator-owned

## Contract and transport

The bridge pins OpenCode and `@opencode-ai/sdk` `1.18.16`, upstream release commit `a3647eb025c7615159d417dcc49fc39fdaeba65b`, and live OpenAPI SHA-256 `c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1`. The generated manifest classifies all 188 released operations: 182 ordinary HTTP operations, four SSE operations, and two PTY WebSocket operations. It records method, path, transport, effect, and web policy. Added, removed, or routing-changed operations are explicit compatibility failures.

`OpenCodeClient` rejects non-loopback or credential-bearing URLs, keeps Basic Auth internal, exposes the exact SDK for health, and serializes every HTTP operation from operation ID plus path/query/body arguments. It handles deep-object query values, JSON/text/diff/binary/empty responses, and the explicit `v2.fs.read` wildcard that upstream OpenAPI/SDK generation omits. SSE parsing is explicit and preserves CRLF semantics across arbitrary stream-chunk boundaries. PTY obtains one-use tickets, connects real WebSockets for either released prefix, persists cursor-addressed bounded output before advancing, supports input, and reconnects with fresh tickets.

Consequential OpenCode commands re-run live version/hash compatibility and fail closed on drift. Diagnostic reads remain available. API capability is independent of web policy.

## Durable recovery

`RecoveryCoordinator` combines legacy project SSE, direct per-session v2 history/SSE, project sync history, event-ID deduplication, aggregate cursors, and canonical session/status/permission/question/message reconciliation. Events enter SQLite before callbacks. Reconnect loops use bounded exponential backoff and jitter. It does not send or claim standard SSE `Last-Event-ID`; a transient event that upstream never durably records can remain unrecoverable after complete outage.

SQLite uses Node's built-in `node:sqlite` and requires Node `22.13.0` or newer. Configuration lexically confines the state file outside the tracked working tree or beneath its Git directory. The state loader requires an owner-only parent, rejects an existing final path that is a symlink or non-regular file, creates a mode `0700` parent, and normalizes the database to mode `0600`; it does not claim to reject symlinks in every ancestor component. SQLite enables WAL, full synchronization, foreign keys, and a busy timeout. It stores command state/results, task/session and issue mappings, public aliases, events/cursors, GitHub outbox/cache, compatibility, reconciliation, PTY metadata/output, and service health. UUID and task-sequence uniqueness are fail-closed. An interrupted `applying` command becomes `indeterminate` on restart and is never reissued.

## GitHub control plane

The foreground service authenticates as a GitHub App by signed JWT, requests a one-repository installation token downscoped to Issues write and Contents read, rejects broader/insufficient returned permissions, caches until near expiry, and refreshes once after `401`. REST uses version `2026-03-10`, HTTPS-only credential-free API URLs, serial pagination with origin/loop limits, persisted ETags, and primary/secondary rate-limit timing.

Polling reads open labeled issues and comments only from exact configured authors with `OWNER`, `MEMBER`, or `COLLABORATOR` association. One open mapped control issue serializes repository work. The first command must be `start`; issue/task binding, UUID, and sequence state are durable. Polling is faster while a control issue is open and slower while idle.

Bridge comments and label changes use a paced durable outbox. Comments carry deterministic dedupe markers, but only a marker authored by the configured App bot suppresses a retry. Status publication removes stale bridge-owned labels and adds one current label without replacing unrelated labels. Outbox completion can be reconstructed from terminal commands after restart.

## Commands and policy

`agentic-bridge/1` provides guarded start, status, steer, Luna/Sol route, permission reply, question reply, abort, bounded event pages, PTY create/input/read/resize/remove, finalization, synchronization recovery, exact-SHA promotion, and generic `opencode.request`. Start and promotion require a clean synchronized `developer` checkout plus exact expected ref/SHA. Promotion is disabled by default and delegates to the existing guarded script only after the web orchestrator has received explicit human exact-SHA approval. PTY create/input/resize/remove are denied unless `policy.pty_enabled` is true; bounded cursor-based `pty.read` is a diagnostic local-state read and remains available.

Generic HTTP reads are available from the manifest. Expert mutations and local-secret operations require separate exact local allowlists; sharing remains blocked from web transport. State-changing PTY operations and promotion have independent default-deny switches. Generic requests accept only well-shaped path/query/wildcard/body transport fields, remain pinned to the bridge's configured project rather than caller-supplied directory/workspace/location routing, resolve task-owned local aliases, reject raw OpenCode IDs and absolute paths, and permit `secret_ref` only for local-secret operations.

`PublicProjection` maps private session/PTY/permission/question/message/workspace/event IDs, including IDs embedded in text and object keys, plus opaque semantic project IDs to globally unique durable aliases. Task-bound aliases cannot be resolved from another task. For recognized OpenCode message parts it publishes only text parts; reasoning, tool, step, and unknown part classes remain local. Provider metadata and reasoning/encrypted-content fields are omitted. It also redacts sensitive fields and token-like text, replaces absolute/private paths, neutralizes active Markdown in comments, and bounds depth, collections, strings, and total bytes. Raw results/events remain local. Local-secret operations and their failure details publish only a safe local-TUI action or fixed non-sensitive error; detailed results remain local.

## Configuration and operation

The strict schema-v1 JSON loader rejects unknown fields, requires config/password/private-key/secret files to have owner-only permissions with no group/other bits (`0600` is recommended), validates one repository identity and minimum polling intervals, and keeps runtime values outside Git. Each instance has a unique ID, loopback URL/port, state path, App installation mapping, and process lock. Stale locks are recoverable; live duplicate processes are refused. Heartbeat, errors, compatibility, command backlog, and outbox backlog are available through the status CLI.

OpenCode and the bridge remain separate portable foreground processes. `bootstrap-opencode-bridge.sh` installs/builds and verifies or creates prerequisites; `--check` does not create labels/state. `opencode-attach.sh` passes credentials through child environment rather than command arguments and attaches the ordinary TUI to the same server. No systemd, webhook, tunnel, self-hosted runner, public OpenCode listener, or custom ChatGPT MCP is required.

The template initializer repairs only complete-history, synchronized clean one-commit unrelated `main`/`developer` roots with matching author/committer identities, author/committer times, subject, and path/mode/type tree shape, plus no active task record. Branch-specific blobs may differ. It creates a local old-root backup ref, then one exact developer-tree-preserving child of main and a hook-validated exact `force-with-lease`. Correct ancestry no-ops; shallow, established, shared, dirty, unsynchronized, active-task, sync-failed, or otherwise ambiguous history is refused; `web-orchestration` is untouched.

## Verification

The supported runtime is Node `22.13.0` or newer. Strict TypeScript build and `npm test` pass 43 deterministic tests, and the emitted suite has also been exercised on the exact minimum Node `22.13.0`; validation on a newer host is reported as that host runtime rather than evidence of a second minimum. Coverage includes all-operation preparation, contract drift, serialization, SSE, PTY, SQLite security/durability, recovery/reconciliation, App auth/token rotation/permissions, conditional polling, authorization/serialization, outbox spoof/rate-limit handling, projection/redaction, secret/alias policy, high-level workflow commands, promotion transport, and restart recovery. Node `22.13.0` emits its expected upstream `node:sqlite` experimental warning.

Eight disposable-Git tests prove correct-ancestry no-op, fresh unrelated-root repair with identical developer tree and an old-root backup, and refusal of established/shallow, generated-fingerprint-mismatched, local-HEAD-mismatched, shared-ancestry, dirty, active-task, and synchronization-failed-marker states. Repository validation includes bridge structure/contracts, package tests, branch tests, mandatory agent-system/research checks, and active hooks. A real authenticated loopback OpenCode `1.18.16` run returned the exact version/hash, 188-operation manifest, `compatible: true`, and a successful project read.

No GitHub App private key/installation and no native ChatGPT connected-app account are available in this environment. Those live external interactions are not claimed; deterministic doubles cover the complete local command path and the operator log records the residual exercise.
