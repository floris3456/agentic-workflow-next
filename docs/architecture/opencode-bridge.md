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

Live version/hash/inventory drift blocks consequential OpenCode operations while diagnostic reads remain possible. Capability does not imply GitHub policy: generic reads and bounded `pty.read` are available, ordinary mutations and local-secret operations require exact local allowlists, two sharing operations remain web-blocked, state-changing PTY create/input/resize/remove commands require `policy.pty_enabled`, and promotion is independently disabled by default.

## Control and durability

The hidden `agentic-bridge/1` command envelope carries a UUID, task ID, monotonic sequence, kind, arguments, and optional expected Git state. The first issue command must be `start` at sequence `1`; later accepted sequences are exactly contiguous. SQLite records accepted/applying/terminal states before and after side effects, and a task cannot admit another command while one is accepted or applying. Every authenticated parse-valid rejection is durable by UUID without consuming sequence, including issue/task/first-command gates, the one-open-mutating-issue gate, sequence/nonterminal checks, and a `start` or `promotion.apply` whose required Git guard is missing, misplaced under `arguments`, or does not name `developer`. A stale rejected marker can never become executable on a later scan. Duplicate UUIDs do not reapply. The bridge queues and attempts public `applying` publication before the handler starts. A restart while applying marks the command indeterminate and never guesses or retries the side effect.

Sequence-free `agentic-bridge-request` envelopes provide task-bound durable recovery views and lightweight Scout launch. `command.status` reads exact command or pre-ledger-rejection state, known projected result, timing, applying age, and service heartbeat. `task.status` reads mapped developer-session state and latest projected response. `scout.status` reads one matching task/request/ref/session/result. These reads never repeat work. `scout.start` is UUID-idempotent and creates at most one request-correlated read-only session; restart while applying makes it indeterminate without repeating creation or prompt delivery. Recovery monitoring starts from the durable Scout mapping before prompt delivery. It combines v2 session recovery, exact-workspace legacy events, and a canonical status/message fallback that requires terminal assistant lifecycle metadata without inspecting response text. An ambiguously acknowledged prompt or empty v2 history can therefore surface a result without replay or another service restart. None consumes command sequence or calls a mutating command handler. A genuinely stuck applying mutation receives one bounded reconciliation; uncertain mutation is never retried, and operator restart converts it to indeterminate before evidence-based recovery.

The bridge fetches and verifies each Scout's exact SHA in `origin/developer`, binds it to a clean detached private worktree, and checks the live OpenCode agent contract before creation. `repository-scout` is Luna/high with only repository read/search tools enabled and explicit denial of file/shell/Git mutation, delegation, skills, web, questions, todo, and external-directory access. Multiple Scout requests execute concurrently without a policy cap and may coexist with one mutating developer task; their session, request, alias, workspace, and result mappings remain distinct.

Pinned `app.agents` omits its tool map and `tool.ids` omits dynamic MCP tools.
The bridge therefore verifies the resolved last-match permission rules and live
built-in inventory, requires the wildcard deny for unlisted/dynamic tools, and
sets all three fixed MCP resource tool flags false on the Scout prompt because
OpenCode maps those fixed names to the native-read permission.

The GitHub client serially polls open labeled issues and their comments with persisted ETags, paginates with origin and loop guards, refreshes once after `401`, and follows primary/secondary rate-limit timing. Polling is faster while control issues are open and slower while idle. Only exact configured logins with trusted repository associations can command. Writes use a paced durable outbox. Comment dedupe markers count only when authored by the configured App bot, preventing another commenter from suppressing output. Bridge status labels are removed/replaced without overwriting unrelated labels.

## Recovery and projection

OpenCode events are committed before callbacks. Recovery combines legacy repository/workspace SSE, per-session durable v2 history/SSE, project sync history, event-ID deduplication, durable aggregate cursors, and canonical session/status/permission/question/message reconciliation. A stable synthetic event closes the terminal Scout gap when the pinned runtime exposes completed legacy-session messages but no v2 event. It does not claim standard SSE `Last-Event-ID`; other non-durable upstream transient events can be lost across complete outage.

Raw events/results remain local. The public projection maps session/PTY/permission/question/message/workspace/event IDs, including embedded text and object-key occurrences, plus opaque semantic project IDs to globally unique durable aliases; every task-bound kind, including workspace, has per-task storage and cannot cross task ownership. For recognized OpenCode message parts it publishes only text parts and omits reasoning, tool, step, and unknown part classes. Provider metadata and reasoning/encrypted-content fields remain local. Projection also redacts sensitive keys and token-like text, replaces private filesystem paths, neutralizes Markdown mentions/HTML/fences, and bounds depth, fields, strings, arrays, and total output. Generic requests accept only well-shaped path/query/wildcard/body transport fields, cannot override local directory/workspace/location routing, and reject raw private IDs, absolute paths, and literal secret-like values. Local-secret operations use explicit `secret_ref` files and publish only a safe local-operator action; upstream failure detail remains local.

Mapped developer `session.idle` and `session.error` events atomically commit the event, durable cursor, session state, and pending delivery before any callback. The bridge applies the existing public projection to the latest assistant message, stores the task-correlated projected response, and queues it to the bound issue; failures remain retryable. It performs only structural latest-message selection and transport. The web orchestrator, not the bridge, interprets response status and decides whether direct remote review can begin.

Mapped Scout idle/error events use the same durable projection path with task,
request, and exact-ref correlation. The bridge returns Scout facts without
synthesis; the web orchestrator compares evidence and decides what it means.

## Mechanical promotion

`promotion.apply` is locally disabled by default. When enabled, it requires one exact lowercase SHA in both arguments and expected Git state. The web orchestrator may issue it only after explicit human exact-SHA approval. The existing promotion script independently fetches and verifies the approved remote developer SHA, ancestry, clean state, exact merge parents/tree, push authorization, and resumable synchronization. The bridge does not acquire acceptance authority.

## Template repair

GitHub all-branch template generation can create unrelated `main` and `developer` roots. `initialize-template-branches.sh` no-ops when ancestry is valid. It repairs only synchronized, clean, one-commit unrelated roots with matching template-generation author/committer identities, both timestamps, subject, and path/mode/type tree shape, plus no active task record. Branch-specific blob identities may differ; the exact developer tree is preserved. The initializer records the old root under a local backup ref before an exact guarded `force-with-lease`. The pre-push hook validates old/new/main identities, root shape, parent, and tree. Any established or ambiguous history is refused. `web-orchestration` remains deliberately unrelated.

## Interfaces

- [`../../contracts/opencode-bridge/protocol.md`](../../contracts/opencode-bridge/protocol.md): public issue protocol and policy behavior.
- [`../../contracts/opencode-bridge/operation-manifest.json`](../../contracts/opencode-bridge/operation-manifest.json): complete pinned operation inventory.
- [`../../tools/opencode-bridge/README.md`](../../tools/opencode-bridge/README.md): operator setup and commands.
- [`../../tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md): component implementation facts and checks.
