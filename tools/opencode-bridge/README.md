# OpenCode GitHub bridge

This package is the outbound-only local control plane between GitHub Issues and one authenticated loopback OpenCode server. It pins OpenCode/SDK `1.18.16`, validates the live OpenAPI hash, supports every classified released HTTP/SSE/PTY WebSocket operation, and keeps GitHub capability policy separate from local API capability.

## Requirements

- Node `22.13.0` or newer.
- OpenCode `1.18.16` listening on a project-unique loopback port with Basic Auth.
- A private GitHub App installed only on intended repositories with Metadata read, Issues read/write, and Contents read. Webhooks are disabled.
- A mode `0600` operator config, OpenCode password file, and GitHub App private key under a private directory such as `~/.config/agentic-workflow/<instance>/`.
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

7. Run `./scripts/bootstrap-opencode-bridge.sh --config <file>`. Normal bootstrap verifies the exact OpenCode contract, authenticated repository access, read round-trip, state location, and creates missing bridge labels. `--check` reports missing setup without creating labels or state.

8. Start the bridge as a separate foreground process:

```bash
node tools/opencode-bridge/dist/src/cli.js run --config ~/.config/agentic-workflow/opencode-bridge.json
```

Inspect local status with `./scripts/opencode-bridge-status.sh --config <file>`. Attach the normal TUI to the same server without exposing credentials in process arguments:

```bash
./scripts/opencode-attach.sh --config ~/.config/agentic-workflow/opencode-bridge.json
```

Core operation is portable foreground CLI behavior; no systemd dependency exists. Run one config/state/port/App installation mapping per repository so multiple projects can operate concurrently.

## Durable status and ambiguous commands

Mutating commands are strictly serialized per task: the first sequence is `1`, every later accepted sequence is contiguous, and a second command is rejected while one is `accepted` or `applying`. The public lifecycle is accepted, applying, then one terminal state. A rejected admission does not consume sequence.

Use the sequence-free `command.status` request on the existing task issue for the exact durable state and known public result of one command. Use `task.status` there for the mapped session state and latest projected developer response. These requests have their own UUIDs and never execute or repeat a mutation. See the protocol for exact markers.

For a genuinely stuck `applying` command, wait only for the operation's bounded window, submit one `command.status`, and compare its applying age with the service heartbeat and local `opencode-bridge-status.sh` output. Never retry the uncertain mutation. If local process/upstream inspection cannot resolve it, stop and restart the bridge; startup records the command as `indeterminate`, after which reconcile task and remote Git evidence before issuing any fresh command.

On mapped developer session idle or error, the bridge durably retrieves the latest assistant response, applies the normal public-safety projection, and queues it to the task issue. Retrieval failures retry without re-running the developer task. The bridge transports this response but does not validate its workflow meaning.

## Read-only Scouts

`scout.start` uses the sequence-free request marker and requires a focused
question, exact lowercase 40-character developer SHA, bounded scope, and expected
evidence. The bridge fetches `developer`, verifies the commit in
`origin/developer`, creates/reuses a clean detached worktree under the private
state parent, verifies the live `repository-scout` Luna/high read-only contract,
then creates one request-correlated session. `scout.status` recovers that exact
request's state and latest projected result.

Scout worktree preparation may queue around Git's worktree lock, but independent
sessions execute concurrently with no bridge policy cap and may coexist with one
mutating developer task. A restart never repeats an applying Scout start. Scout
idle/error responses use the normal durable event stream, public projection, and
task/request/ref correlation. The Scout cannot edit, run Bash or Git, delegate,
load skills, use web or MCP tools, answer interactions, or access external
directories; the bridge fails closed if the live agent contract exposes a
forbidden tool or permission, and the prompt request explicitly disables the
three fixed MCP resource tool names that OpenCode maps to native read.

## Policy

High-level workflow commands have bounded handlers. Generic manifest reads are enabled. Generic mutations, local-secret operations, PTY execution, and mechanical promotion are independently default-denied in local config. Enabling promotion does not grant acceptance authority: the command must carry one exact approved SHA, the web orchestrator may emit it only after explicit human approval, and the existing promotion script re-verifies synchronized remote state and a content-identical merge.

See [`../../contracts/opencode-bridge/protocol.md`](../../contracts/opencode-bridge/protocol.md) for envelopes, command arguments, aliases, secret handles, projection, durability, and result semantics.

## Validation

```bash
npm ci
npm test
../../scripts/validate-opencode-bridge.sh
```

Tests use deterministic GitHub/OpenCode doubles. Live App registration, native ChatGPT GitHub write actions, and human acceptance remain operator-owned external checks.
