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

The bridge, normal developer OpenCode, and dedicated Scout OpenCode are separate
foreground-capable processes. Developer and Scout servers bind distinct
authenticated loopback ports; the ordinary TUI attaches only to the developer
server. A workspace-maintenance task uses a separate client on the normal
developer endpoint whose directory is fixed to a lazily discovered and verified
template-development worktree. It never changes the bridge process checkout or
the normal developer client. The bridge installs, launches, and probes Scout
independently, and Scout failure does not stop developer operation. Each
repository instance has unique config, state, ports/passwords, external Scout
runtime and derived persistence roots, GitHub mapping, and process lock. No
inbound webhook, public listener, tunnel, custom ChatGPT MCP, self-hosted runner,
or mandatory systemd unit exists.

Operator configuration and secret files are mode `0600` outside Git. SQLite lives outside the tracked tree, normally under the Git directory, with a mode `0700` parent and mode `0600` database. GitHub App installation tokens stay in memory and are automatically refreshed. The App requests only Issues write and Contents read for one repository; Contents write is rejected.

## OpenCode parity

The pinned manifest records OpenCode and SDK `1.18.16`, release commit `a3647eb025c7615159d417dcc49fc39fdaeba65b`, OpenAPI hash `c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1`, and all 188 operation IDs. It classifies 182 HTTP operations, four SSE operations, and two PTY WebSockets. Generic serialization covers all HTTP operations, including the explicit `v2.fs.read` wildcard missing from generated parameters. SSE and PTY use dedicated transport adapters.

Live version or exact raw OpenAPI-hash drift blocks consequential normal-endpoint OpenCode operations while diagnostic reads remain possible. Manifest-to-manifest additions, removals, and routing changes are an offline upgrade diagnostic, not a runtime self-comparison. Capability does not imply GitHub policy: generic reads and bounded `pty.read` are available for the normal developer server, ordinary mutations and local-secret operations require exact local allowlists, two sharing operations remain web-blocked, state-changing PTY create/input/resize/remove commands require `policy.pty_enabled`, and promotion is independently disabled by default.

## Control and durability

The hidden `agentic-bridge/1` command envelope carries a UUID, task ID, monotonic sequence, kind, arguments, and optional expected Git state. One task ID binds to one issue. A marker on a second issue that repeats an existing task binding receives a bounded rejection and cannot replace the binding, abort the poll cycle, or starve already accepted work. The first issue command must be either `start` or `workspace.start` at sequence `1`; later accepted sequences are exactly contiguous, derived from the accepted command ledger inside the admission transaction. SQLite records accepted/applying/terminal states before and after side effects, and a task cannot admit another command while one is accepted or applying. Every authenticated parse-valid rejection is durable by UUID without consuming sequence, including issue/task/first-command gates, the one-open-mutating-issue gate, sequence/nonterminal checks, a `start` or `promotion.apply` whose required developer guard is missing or misplaced, and a `workspace.start` whose required template-development guard is missing or misplaced. A stale rejected marker can never become executable on a later scan. Duplicate UUIDs do not reapply. The bridge queues and attempts public `applying` publication before the handler starts. A restart while applying marks the command indeterminate and never guesses or retries the side effect. If more than one persisted mutating issue is open, command dispatch freezes—including a restart-recovered accepted command—while sequence-free local recovery reads continue.

Sequence-free `agentic-bridge-request` envelopes provide task-bound durable recovery views and a Scout request lane. `command.status` reads exact command or pre-ledger-rejection state, known projected result, timing, applying age, and service heartbeat. `task.status` reads mapped session kind/state and the latest projected task response. `scout.status` remains a local read of one matching task/request/ref/session/result. These local reads never repeat work and, if interrupted in `applying`, are recomputed under the same UUID after restart. `scout.start` retains UUID-idempotent admission and no-replay semantics, uses only the separately probed endpoint, and fails closed without normal-server fallback; after its session is mapped and prompted, it enrolls one idempotent recovery observer immediately. A genuinely stuck task mutation receives one bounded reconciliation; uncertain mutation is never retried, and operator restart converts it to indeterminate before evidence-based recovery.

The tracked ref-owned `repository-scout` remains removed. The bridge copies a
locked trusted runtime package outside `repository_root`, installs exact OpenCode/
plugin `1.18.16`, and makes config/dependencies read-only. Reinstallation replaces
that runtime tree while preserving a separate private non-symlink persistence
tree for OpenCode data/state, including mapped Scout sessions and filtered OAuth
refresh state. Persistent files are not HOME, config, cache, temp, PATH, plugin,
or instruction authority. Launch uses an allowlist environment with sterile
runtime-owned HOME/config/cache/temp, persistent data/state, one explicit provider key, project config/
default plugin/external skill/watcher disablement, managed-config redirection to a
nonexistent immutable-runtime path, and LSP/formatter false. A
read-only config directory makes OpenCode's dependency-install check return before
invoking the package manager. Bootstrap verifies source hashes, package versions,
executable version/OpenAPI, and the exact agent/tool contract.

The snapshot manager fetches canonical `origin/developer`, proves requested-SHA
ancestry, parses NUL-delimited `git ls-tree`, and reads verified blobs with
`git cat-file`; checkout, worktree, hooks, filters, and `.git` are absent. Gitlinks
and unsafe tree modes fail closed. Regular files are `0444`, directories `0555`,
and symlinks preserve target text without being followed. Full path/type/mode/blob
hashes are checked on every reuse and rebuilt after tampering.

The Luna/high agent's bridge-owned prompt treats all repository instructions as
untrusted evidence. Wildcard deny leaves only custom `scout_read`, `scout_glob`,
and `scout_grep`; built-ins/dynamic tools and interaction paths remain denied.
Trusted tools import filesystem/path APIs only, enforce relative-path and realpath
containment, do not follow symlinks, and bound UTF-8 files/traversal/results. They
cannot launch processes, package managers, LSP, or network/download operations.

The GitHub client serially polls open labeled issues and their comments with persisted ETags, paginates with origin and loop guards, refreshes once after `401`, and follows primary/secondary rate-limit timing. Polling is faster while control issues are open and slower while idle. Only exact configured logins with trusted repository associations can command. Writes use a paced durable outbox. Comment dedupe markers count only when authored by the configured App bot, preventing another commenter from suppressing output. Bridge status labels are removed/replaced without overwriting unrelated labels.

## Recovery and projection

Developer and workspace-task OpenCode events are committed before callbacks. Recovery combines legacy repository SSE, per-session durable v2 history/SSE, project sync history, event-ID deduplication, durable aggregate cursors, canonical pending permission/question lists, and a strict canonical terminal proof for each mapped task session on its persisted runtime. The proof requires no pending interaction for that exact session, an inactive or idle mapped status, and a structurally terminal latest assistant completion; busy, retry, tool-calls, nonterminal, malformed, or unavailable evidence fails closed. A stable canonical terminal event is synthesized at most once and uses the same atomic event, mapped-state, response-delivery, projection, and publication path as an observed terminal event; it never prompts, restarts, routes, or creates a session. Pending mapped interactions receive stable synthetic events and are re-presented to the idempotent publication path until their outbox entry exists. Before a reply, each mapped interaction captures the exact mapped task session's activity timestamp and latest assistant-message completion evidence. After the reply, the interaction is durably resolved and the bridge proves both pending lists plus the mapped session's live status/activity; changed post-reply activity or a changed terminal assistant message is clean continuation even if the completed session is absent from `session.status`. Otherwise it waits a bounded one second and repeats that proof. Only unchanged live non-progress with no interactions can reach the at-most-one same-session continuation claim; malformed or unavailable baseline/post-reply evidence fails closed. The claim precedes delivery, so uncertain delivery is blocked and never replayed. Scout recovery gets a per-snapshot client for the dedicated endpoint only after full snapshot revalidation. Historical `scout-worktrees` mappings remain visible to status but are rejected and never contacted. It does not claim standard SSE `Last-Event-ID`; the canonical task-session proof and the Scout canonical recovery lane cover terminal completions absent from the durable or legacy event streams.

Raw events/results remain local. The public projection maps session/PTY/permission/question/message/workspace/event IDs, including embedded text and object-key occurrences, plus opaque semantic project IDs to globally unique durable aliases; every task-bound kind, including workspace, has per-task storage and cannot cross task ownership. For recognized OpenCode message parts it publishes only text parts and omits reasoning, tool, step, and unknown part classes. Provider metadata and reasoning/encrypted-content fields remain local. Projection also redacts sensitive keys and token-like text, replaces private filesystem paths, neutralizes Markdown mentions/HTML/fences, and bounds depth, fields, strings, arrays, and total output. Generic requests accept only well-shaped path/query/wildcard/body transport fields, cannot override local directory/workspace/location routing, and reject raw private IDs, absolute paths, and literal secret-like values. Local-secret operations use explicit `secret_ref` files and publish only a safe local-operator action; upstream failure detail remains local. Configured repository identity separately authenticates the exact Git host and owner/repository: public GitHub and Enterprise `/api/v3` derive unambiguous hosts, custom API layouts require explicit `github.git_host`, and HTTPS/SSH origin parsing rejects userinfo, suffix hosts, encoded or extra path segments, and unsupported syntax.

Mapped developer and workspace `session.idle` and `session.error` events,
including strict canonical terminal proofs, atomically commit the event, durable
cursor when present, session kind/state, and pending delivery before any callback.
The runtime-selected transport applies the existing public projection to the
latest assistant message, stores the task-correlated projected response, and
queues it to the bound issue; failures remain retryable. It performs only
structural latest-message selection and transport. Reply commands publish a
public-safe continuation outcome so clean and recovered interaction completion
remain distinguishable. The web orchestrator, not the bridge, interprets
response status and decides whether direct remote review can begin.

`workspace.start` carries an exact lowercase template-development SHA/ref guard.
The resolver fetches only that explicit remote ref, parses NUL-delimited Git
worktree inventory, requires exactly one real registered branch worktree, and
proves canonical path, shared common Git directory, exact repository identity,
branch, HEAD, upstream when present, clean status, and remote equality before
start. The private directory is registered dynamically with public projection.
SQLite schema version 5 persists `developer` or `workspace` session kind;
legacy rows migrate to developer and unknown values fail closed. Every later
status, prompt, generic request, structured reply, continuation check/nudge,
abort, durable/canonical recovery, and terminal delivery selects the same client
from that kind. Restart re-proves the registered worktree without requiring the
post-start worktree to remain clean or at the original SHA. The agent remains
fixed to `workspace-maintainer`; route changes, bridge PTYs, and main promotion
are denied for workspace tasks.

The normal developer OpenCode configuration relies on the pinned server's
current-working-directory defaults for contained work and sets
`external_directory` to `ask`, without a broad allow rule. Small-developer
guidance requires repository-relative paths and forbids parent/sibling walks or
scope widening when a path is absent.

Mapped Scout state and projected responses retain task, request, and exact-ref
correlation. Terminal recovery and response retrieval use only the dedicated
endpoint and exact snapshot; incompatible historical mappings stay fail closed.

## Mechanical promotion

`promotion.apply` is locally disabled by default. When enabled, it requires one exact lowercase SHA in both arguments and expected Git state. The web orchestrator may issue it only after explicit human exact-SHA approval. The existing promotion script independently fetches and verifies the approved remote developer SHA, ancestry, clean state, exact merge parents/tree, push authorization, and resumable synchronization. Workspace tasks cannot invoke promotion, and the bridge does not acquire acceptance authority.

## Template repair

GitHub all-branch template generation can create unrelated `main` and `developer` roots. `initialize-template-branches.sh` no-ops when ancestry is valid. It repairs only synchronized, clean, one-commit unrelated roots with matching template-generation author/committer identities, both timestamps, subject, and path/mode/type tree shape, plus no active task record. Branch-specific blob identities may differ; the exact developer tree is preserved. The initializer records the old root under a local backup ref before an exact guarded `force-with-lease`. The pre-push hook validates old/new/main identities, root shape, parent, and tree. Any established or ambiguous history is refused. `web-orchestration` remains deliberately unrelated.

## Interfaces

- [`../../contracts/opencode-bridge/protocol.md`](../../contracts/opencode-bridge/protocol.md): public issue protocol and policy behavior.
- [`../../contracts/opencode-bridge/operation-manifest.json`](../../contracts/opencode-bridge/operation-manifest.json): complete pinned operation inventory.
- [`../../tools/opencode-bridge/README.md`](../../tools/opencode-bridge/README.md): operator setup and commands.
- [`../../tools/opencode-bridge/AS-BUILT.md`](../../tools/opencode-bridge/AS-BUILT.md): component implementation facts and checks.
