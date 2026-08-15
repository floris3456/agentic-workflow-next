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

8. Bootstrap currently reports `scoutRuntimeReady: false` and exits nonzero even
   when developer operation is configured. This is intentional fail-closed
   behavior pending the Scout runtime architecture decision below; do not bypass
   or describe it as a working Scout check. The normal developer bridge may still
   be started as a separate foreground process:

```bash
node tools/opencode-bridge/dist/src/cli.js run --config ~/.config/agentic-workflow/opencode-bridge.json
```

Inspect local status with `./scripts/opencode-bridge-status.sh --config <file>`. Attach the normal TUI to the same server without exposing credentials in process arguments:

```bash
./scripts/opencode-attach.sh --config ~/.config/agentic-workflow/opencode-bridge.json
```

Core operation is portable foreground CLI behavior; no systemd dependency exists. Run one config/state/port/App installation mapping per repository so multiple projects can operate concurrently.

## Durable status and ambiguous commands

Mutating commands are strictly serialized per task: the first sequence is `1`, every later accepted sequence is contiguous, and a second command is rejected while one is `accepted` or `applying`. The public lifecycle is accepted, applying, then one terminal state. Every parse-valid pre-ledger rejection is durable by command UUID, including the one-open-mutating-issue gate; it cannot become executable after a later rescan and does not consume sequence.

Use the sequence-free `command.status` request on the existing task issue for the exact durable state and known public result of one command. Use `task.status` there for the mapped session state and latest projected developer response. These requests have their own UUIDs and never execute or repeat a mutation. See the protocol for exact markers.

For a genuinely stuck `applying` command, wait only for the operation's bounded window, submit one `command.status`, and compare its applying age with the service heartbeat and local `opencode-bridge-status.sh` output. Never retry the uncertain mutation. If local process/upstream inspection cannot resolve it, stop and restart the bridge; startup records the command as `indeterminate`, after which reconcile task and remote Git evidence before issuing any fresh command.

On mapped developer session idle or error, the event, durable cursor, session state, and pending response delivery commit atomically. The bridge then retrieves the latest assistant response, applies the normal public-safety projection, and queues it to the task issue. Retrieval failures retry without re-running the developer task. The bridge transports this response but does not validate its workflow meaning.

## Read-only Scouts

`scout.start` retains the sequence-free marker, focused question, exact lowercase
40-character developer SHA, scope, expected evidence, concurrent admission, and
durable status/no-replay semantics. It currently fails before workspace
preparation or any OpenCode request with an explicit hardened-runtime diagnostic.
`scout.status` remains a local read of historical correlated state.

This fail-closed state is required because pinned OpenCode `1.18.16` built-in
`read` attaches nearby repository instructions and unconditionally starts LSP
warm-up, while configuration initialization may install packages in scanned
config directories. A tracked agent, project-config disablement, `--pure`,
permissions, or an isolated HOME cannot prove the required independent boundary.
The tracked ref-owned Scout agent has therefore been removed and LSP is absent
from every Scout contract.

The retained future-runtime workspace primitive fetches the exact SHA from
`origin/developer` and creates/reuses a clean detached private worktree with Git
hooks, inherited/global/system Git config, file transport, and credential prompts
disabled. It checks private-root realpaths and every symlink target and disposes
any invalid workspace without hooks. Enabling Scout execution requires a
bridge-owned in-process, realpath-contained read/glob/grep runtime (or a separately
audited sandbox/runtime) that cannot load ref/global extensions or run package,
LSP, ref-controlled process, or download side effects.

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
../../scripts/validate-opencode-bridge.sh
```

Tests use deterministic GitHub/OpenCode doubles. Live App registration, native ChatGPT GitHub write actions, and human acceptance remain operator-owned external checks.
