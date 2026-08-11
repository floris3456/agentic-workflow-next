# OpenCode bridge architecture

## Boundary

The bridge replaces direct ChatGPT-to-OpenCode MCP transport with:

```text
ChatGPT native GitHub integration
-> public-safe GitHub control issue
-> outbound-polling local GitHub App bridge
-> authenticated loopback OpenCode HTTP/SSE/WebSocket API
-> Luna or Sol implementation agent
```

GitHub remote inspection remains the independent repository-evidence route. A bridge comment is a developer/control report, not proof of a commit, synchronization, review, acceptance, or promotion. The human retains exact-SHA acceptance authority.

## Processes and isolation

OpenCode and the bridge are separate foreground-capable processes. OpenCode binds a unique loopback port with Basic Auth. Each repository instance has a unique config identity, state database, OpenCode port/password, GitHub repository/App installation mapping, and process lock. The ordinary OpenCode TUI attaches to the same server and sessions. No inbound webhook, public OpenCode listener, tunnel, custom ChatGPT MCP, self-hosted runner, or mandatory systemd unit exists.

Operator configuration and secret files are mode `0600` outside Git. SQLite lives outside the tracked tree, normally under the Git directory, with a mode `0700` parent and mode `0600` database. GitHub App installation tokens stay in memory and are automatically refreshed. The App requests only Issues write and Contents read for one repository; Contents write is rejected.

## OpenCode parity

The pinned manifest records OpenCode and SDK `1.18.16`, release commit `a3647eb025c7615159d417dcc49fc39fdaeba65b`, OpenAPI hash `c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1`, and all 188 operation IDs. It classifies 182 HTTP operations, four SSE operations, and two PTY WebSockets. Generic serialization covers all HTTP operations, including the explicit `v2.fs.read` wildcard missing from generated parameters. SSE and PTY use dedicated transport adapters.

Live version/hash/inventory drift blocks consequential OpenCode operations while diagnostic reads remain possible. Capability does not imply GitHub policy: generic reads are available, ordinary mutations and local-secret operations require exact local allowlists, two sharing operations remain web-blocked, and PTY/promotion are independently disabled by default.

## Control and durability

The hidden `agentic-bridge/1` envelope carries a UUID, task ID, monotonic sequence, kind, arguments, and optional expected Git state. The first issue command must start and bind one task. SQLite records accepted/applying/terminal states before and after side effects. Duplicate UUIDs do not reapply. A restart while applying marks the command indeterminate and never guesses or retries the side effect.

The GitHub client serially polls open labeled issues and their comments with persisted ETags, paginates with origin and loop guards, refreshes once after `401`, and follows primary/secondary rate-limit timing. Polling is faster while control issues are open and slower while idle. Only exact configured logins with trusted repository associations can command. Writes use a paced durable outbox. Comment dedupe markers count only when authored by the configured App bot, preventing another commenter from suppressing output. Bridge status labels are removed/replaced without overwriting unrelated labels.

## Recovery and projection

OpenCode events are committed before callbacks. Recovery combines legacy project SSE, per-session durable v2 history/SSE, project sync history, event-ID deduplication, durable aggregate cursors, and canonical session/status/permission/question/message reconciliation. It does not claim standard SSE `Last-Event-ID`; non-durable upstream transient events can be lost across complete outage.

Raw events/results remain local. The public projection maps session/PTY/permission/question/message/workspace/event IDs, including embedded text and object-key occurrences, to globally unique durable aliases; task-bound aliases cannot cross task ownership. It redacts sensitive keys and token-like text, replaces private filesystem paths, neutralizes Markdown mentions/HTML/fences, and bounds depth, fields, strings, arrays, and total output. Generic requests accept only well-shaped path/query/wildcard/body transport fields, cannot override local directory/workspace/location routing, and reject raw private IDs, absolute paths, and literal secret-like values. Local-secret operations use explicit `secret_ref` files and publish only a safe local-operator action; upstream failure detail remains local.

## Mechanical promotion

`promotion.apply` is locally disabled by default. When enabled, it requires one exact lowercase SHA in both arguments and expected Git state. The web orchestrator may issue it only after explicit human exact-SHA approval. The existing promotion script independently fetches and verifies the approved remote developer SHA, ancestry, clean state, exact merge parents/tree, push authorization, and resumable synchronization. The bridge does not acquire acceptance authority.

## Template repair

GitHub all-branch template generation can create unrelated `main` and `developer` roots. `initialize-template-branches.sh` no-ops when ancestry is valid. It repairs only synchronized, clean, one-commit unrelated roots with matching template-generation author/committer/time/subject metadata and no active task record. It creates one developer-tree-preserving commit on top of main and uses an exact guarded `force-with-lease`. The pre-push hook validates old/new/main identities, root shape, parent, and tree. Any established or ambiguous history is refused. `web-orchestration` remains deliberately unrelated.

## Interfaces

- [`../../contracts/opencode-bridge/protocol.md`](../../contracts/opencode-bridge/protocol.md): public issue protocol and policy behavior.
- [`../../contracts/opencode-bridge/operation-manifest.json`](../../contracts/opencode-bridge/operation-manifest.json): complete pinned operation inventory.
- [`../../tools/opencode-bridge/README.md`](../../tools/opencode-bridge/README.md): operator setup and commands.
- [`../../tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md): component implementation facts and checks.
