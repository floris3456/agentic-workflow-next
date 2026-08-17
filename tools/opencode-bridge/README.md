# OpenCode GitHub bridge

This package is the outbound-only local control plane between GitHub Issues and one authenticated loopback OpenCode server. It pins OpenCode/SDK `1.18.16`, validates the live OpenAPI hash, supports every classified released HTTP/SSE/PTY WebSocket operation, and keeps GitHub capability policy separate from local API capability.

## Requirements

- Node `22.13.0` or newer.
- OpenCode `1.18.16` listening on a project-unique developer loopback port with
  Basic Auth. Bootstrap installs a second exact-version Scout runtime outside the
  repository and the bridge launches it on a distinct configured loopback port.
- A private GitHub App installed only on intended repositories with Metadata read, Issues read/write, and Contents read. Webhooks are disabled.
- A mode `0600` operator config, developer and Scout OpenCode password files,
  one Scout OpenAI credential file, and GitHub App private key under a private directory
  such as `~/.config/agentic-workflow/<instance>/`.
- A non-root Linux operator. Unsupported platforms and root execution fail closed
  rather than weakening read-only runtime/config semantics.
- A synchronized local `developer` checkout. The bridge never serves OpenCode publicly and requires no tunnel, webhook, custom ChatGPT MCP, or self-hosted runner.

## Setup

1. For a repository generated with all template branches, run `./scripts/initialize-template-branches.sh` once from `developer`. It no-ops for correct ancestry and only repairs provably fresh one-commit unrelated `main`/`developer` roots.
2. Install/build dependencies and print a preconfigured private-App registration URL; this does not require credentials or an existing config:

```bash
npm ci --prefix tools/opencode-bridge
npm --prefix tools/opencode-bridge run build
node tools/opencode-bridge/dist/src/cli.js app-registration-url --repository owner/repository
```

3. Register and install the App on the selected repository, download its private key, and record the App and installation IDs.
4. Start from [`config.example.json`](config.example.json), select a unique instance ID and port, and place the resulting config at `~/.config/agentic-workflow/opencode-bridge.json` or pass `--config`.
5. Set config and secret files to mode `0600`; keep them outside Git. The state path may be under this checkout's Git directory.
6. Start OpenCode on the configured loopback port. The environment variable names shown here are consumed by OpenCode; the bridge reads the same values from private files rather than command-line arguments.

```bash
OPENCODE_SERVER_USERNAME=opencode \
OPENCODE_SERVER_PASSWORD="$(<~/.config/agentic-workflow/owner-repository/opencode-password)" \
opencode serve --hostname 127.0.0.1 --port 44123
```

7. Add the mandatory `opencode.scout_base_url`, `scout_password_file`, and
   `scout_runtime_root` settings plus exactly one Scout provider credential. The
   example uses `scout_provider_api_key_file`. For ChatGPT subscription auth,
   use `scout_provider_oauth_file` pointing exactly to
   `<scout_runtime_root>-persistence/data/opencode/auth.json`; that owner-only
   JSON may contain only one `openai`
   OAuth entry with `type`, `access`, `refresh`, `expires`, and `accountId`. The
   trusted operator setup must filter that entry from normal OpenCode auth rather
   than expose the multi-provider auth file to Scout. A legacy setting that
   points to the runtime root's former `data/opencode/auth.json` is accepted for
   one safe migration when the persistent file is absent; later loads prefer the
   persistent refreshed credential. Apply bootstrap preserves that credential
   and OpenCode session/application data while replacing the runtime. The
   persistence root is derived rather than caller-configurable. The runtime root must be
   absolute and outside `repository_root`; its port must differ from the normal
   developer port.
8. Run `./scripts/bootstrap-opencode-bridge.sh --config <file>`. Apply mode installs
   exact locked `opencode-ai` and plugin `1.18.16` packages outside the repository,
    makes the trusted config/package/tool tree read-only, verifies the separate
    owner-private non-symlink persistence tree, then launches a temporary
   sterile Scout endpoint and actively verifies its version, OpenAPI hash, Luna/
   high agent, bridge-owned prompt, wildcard-deny permissions, and trusted tool
   inventory. It also verifies the normal endpoint, repository access, state, and
   labels. `--check` does not install or create labels/state, but it does launch
   the already-installed runtime temporarily to perform the same active probe.
9. Start the bridge. It independently starts/probes the Scout endpoint; a missing
   or invalid Scout installation leaves Scout requests fail closed without
   stopping normal developer operation:

```bash
node tools/opencode-bridge/dist/src/cli.js run --config ~/.config/agentic-workflow/opencode-bridge.json
```

Inspect local status with `./scripts/opencode-bridge-status.sh --config <file>`. Attach the normal TUI to the same server without exposing credentials in process arguments:

```bash
./scripts/opencode-attach.sh --config ~/.config/agentic-workflow/opencode-bridge.json
```

Core operation remains portable foreground CLI behavior; no systemd dependency
is required. On a Linux workstation, a systemd user unit may supervise the bridge
and a second unit may run `scripts/watch-developer-sync.sh` with the private
config path and bridge unit name. The outbound-only watcher polls every 5-10
seconds, advances only a clean, behind-only `developer` checkout with
`merge --ff-only`, runs apply and check bootstrap, and restarts the bridge only
after its control loop drains when the bridge contracts, package, bootstrap, or
watcher fingerprint changed. Task/document-only SHAs advance without an
unnecessary runtime restart. Dirty, ahead, diverged, uninspectable, or invalid
states are left unchanged and reported under the Git-private bridge state
directory. Run one config/state/port/App installation mapping per repository so
multiple projects can operate concurrently.

## Durable status and ambiguous commands

Mutating commands are strictly serialized per task: the first sequence is `1`, every later accepted sequence is contiguous, and a second command is rejected while one is `accepted` or `applying`. The public lifecycle is accepted, applying, then one terminal state. Every parse-valid pre-ledger rejection is durable by command UUID, including the one-open-mutating-issue gate; it cannot become executable after a later rescan and does not consume sequence.

Use the sequence-free `command.status` request on the existing task issue for the exact durable state and known public result of one command. Use `task.status` there for the mapped session state and latest projected developer response. These requests have their own UUIDs and never execute or repeat a mutation. See the protocol for exact markers.

For a genuinely stuck `applying` command, wait only for the operation's bounded window, submit one `command.status`, and compare its applying age with the service heartbeat and local `opencode-bridge-status.sh` output. Never retry the uncertain mutation. If local process/upstream inspection cannot resolve it, stop and restart the bridge; startup records the command as `indeterminate`, after which reconcile task and remote Git evidence before issuing any fresh command.

On mapped developer session idle or error, the event, durable cursor, session state, and pending response delivery commit atomically. The bridge then retrieves the latest assistant response, applies the normal public-safety projection, and queues it to the task issue. Retrieval failures retry without re-running the developer task. The bridge transports this response but does not validate its workflow meaning.

Before a successful `permission.reply` or `question.reply`, the bridge captures
the exact mapped session's activity timestamp and latest assistant-message
completion evidence. After the reply it persists the resolved interaction and
proves both canonical interaction lists plus the mapped session's live status and
activity. A changed post-reply activity timestamp or a changed terminal assistant
message is clean continuation, including when OpenCode has already removed the
completed session from `session.status`. If the first proof is otherwise
non-progressing, it waits a bounded one-second grace period and repeats that
proof; only unchanged live non-progress with no interaction can claim and send
one fixed same-session continuation nudge. A `busy`/`retry` status or changed
activity timestamp returns clean without a nudge. Missing or malformed baseline
or post-reply evidence blocks recovery rather than nudging.
The claim is durable before delivery, so a retry or restart cannot send a second
nudge; an unproven delivery remains blocked rather than replayed. A progressing
session is reported as clean, while a sent nudge is reported as recovered in the
public command result. The nudge never starts a session, creates a replacement,
changes the agent route, or widens the configured project scope.

Normal developer filesystem and shell work uses OpenCode's existing
current-working-directory defaults. The tracked root config explicitly keeps
`external_directory` at `ask`; it does not broadly allow outside paths. The
small developer uses repository-relative paths and does not walk parent/sibling
directories to rediscover the checkout or widen scope after a missing path.

## Read-only Scouts

`scout.start` retains the sequence-free marker, focused question, exact lowercase
40-character canonical `origin/developer` SHA, scope, expected evidence,
concurrent admission, and durable status/no-replay semantics. It creates/reuses a
private exact Git-object snapshot with `git ls-tree`/`cat-file`, never checkout or
worktree. Gitlinks and `.git` entries are rejected; regular files lose executable
and write bits; directories are read-only; symlinks are preserved as inert
evidence. Every reuse re-hashes the full tree. Historical `scout-worktrees`
mappings are rejected rather than contacted.

The separate server executes only from the installed runtime root. Its HOME/XDG/
temp/config paths and environment are sterile, provider auth is one explicit
file, project configuration/default plugins/external skills/watchers/LSP/
formatters are disabled, managed configuration is redirected to a nonexistent
path under the immutable runtime, and its config directory is read-only so OpenCode's
config dependency check cannot invoke a package installer. The ref-owned Scout
agent remains absent. The bridge-owned Luna/high prompt treats every repository
instruction as untrusted evidence and permits only `scout_read`, `scout_glob`,
and `scout_grep`; all built-in/dynamic tools and interactions are denied.

The trusted tools import only filesystem/path APIs, never follow repository
symlinks, enforce lexical plus realpath containment, accept bounded relative
paths, process bounded UTF-8 files/results, and expose no process, package-manager,
network, LSP, mutation, delegation, or download primitive. The model provider's
own API traffic is the only intentional outbound runtime network use.

## Repository identity

Bootstrap accepts only exact credential-free HTTPS, `ssh://git@`, and scp-style
`git@host:` origins with exactly `owner/repository[.git]`. Public
`https://api.github.com` derives `github.com`; an Enterprise `/api/v3` API base
derives the same host. For another supported custom API layout, set
`github.git_host` to the exact lowercase Git host (and optional port). Omission,
conflict, userinfo, deceptive suffix hosts, encoded/malformed paths, or extra path
segments fail closed.

## Policy

High-level workflow commands have bounded handlers. Generic manifest reads are enabled. Generic mutations, local-secret operations, PTY execution, and mechanical promotion are independently default-denied in local config. Enabling promotion does not grant acceptance authority: the command must carry one exact approved SHA, the web orchestrator may emit it only after explicit human approval, and the existing promotion script re-verifies synchronized remote state and a content-identical merge.

See [`../../contracts/opencode-bridge/protocol.md`](../../contracts/opencode-bridge/protocol.md) for envelopes, command arguments, aliases, secret handles, projection, durability, and result semantics.

## Validation

```bash
npm ci
npm test
npm run test:scout-runtime-smoke
../../scripts/validate-opencode-bridge.sh
```

The ordinary suite uses deterministic GitHub/OpenCode doubles. The Scout runtime
smoke performs a temporary locked install outside the repository and starts/probes
real OpenCode `1.18.16` without sending a model request. Live App registration,
native ChatGPT GitHub write actions, and human acceptance remain operator-owned
external checks.
