# AS-BUILT: OpenCode bridge

**Status:** Implementation in progress for `AGENTIC-BRIDGE-001`

## Contract boundary

The bridge pins OpenCode and `@opencode-ai/sdk` `1.18.16`, upstream release commit `a3647eb025c7615159d417dcc49fc39fdaeba65b`, and live OpenAPI SHA-256 `c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1`. The generated operation manifest classifies all 188 released operations: 182 ordinary HTTP operations, four SSE operations, and two PTY WebSocket operations. It records method, path, transport, effect, and web policy. Missing, added, or transport-changed operations are compatibility failures rather than silently ignored capabilities.

## Core transports

- `OpenCodeClient` rejects non-loopback server URLs, uses Basic Auth internally, exposes the official generated SDK client for typed health checks, and serializes every manifest-classified JSON HTTP operation from operation ID plus path/query/body arguments.
- The HTTP serializer supports path parameters, form query values, OpenAPI deep-object query values, JSON requests, JSON/text/diff responses, and local base64 retention for binary responses. An explicit wildcard argument covers `v2.fs.read`, whose released `*` route is not represented as an OpenAPI path parameter and cannot be populated by the generated SDK.
- SSE parsing is explicit so events can be persisted before projection and so reconnect/recovery policy is controlled by the bridge rather than hidden inside the generated SDK.
- PTY support uses the released short-lived ticket endpoint followed by a real WebSocket. It serializes received frames, parses OpenCode's cursor control frame, captures bounded output with absolute cursors, supports input, and can run a persistent reconnect loop that obtains a fresh ticket from its persisted cursor.

## Durable state

SQLite state uses Node's built-in `node:sqlite` API and therefore requires Node `22.13.0` or newer. The database is created mode `0600` beneath a mode `0700` parent, enables WAL, full synchronization, foreign keys, and a busy timeout, and stores command/idempotency state, task/session and public-alias mappings, event journals/cursors, GitHub outbox work, compatibility checks, reconciliation snapshots, ETags, and PTY output. Command UUID and task-sequence uniqueness fail closed; an applying command is never automatically reissued after an ambiguous interruption.

## Verification

`npm test` compiles the package under strict TypeScript and runs 21 deterministic tests covering the complete transport inventory, generic preparation of every classified HTTP operation, serialization and response handling, request timeouts, fail-closed contract drift, SSE framing/media checks, PTY ticket/cursor/input/reconnect and persistence-failure behavior, SQLite permissions, command idempotency and restart ambiguity, event cursors, outbox behavior, aliases, and bounded PTY output. The same emitted suite passes under the declared minimum Node `22.13.0`; `node:sqlite` emits its upstream experimental warning at that runtime floor. A real authenticated loopback OpenCode `1.18.16` check also returns the expected version, contract hash, and compatible result.

The current package is a core library only. It does not yet contain the long-lived recovery coordinator, GitHub App control plane, public projection, configuration loader, service CLI, bootstrap scripts, or template-branch initializer required to complete `AGENTIC-BRIDGE-001`.
