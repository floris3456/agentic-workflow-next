# Task progress

## Task ID

BRIDGE-OPERATOR-REPAIR-20260816

## Status

In progress

## Task-start developer SHA

4df1adaf4fda2201daa4c4ec6c77c5647cdb2800

## Review-base developer SHA

4df1adaf4fda2201daa4c4ec6c77c5647cdb2800

## Original task brief

Work directly in the current local `floris3456/agentic-workflow-template` developer worktree.

Follow the repository's root `AGENTS.md` and load every repository skill triggered by this task through OpenCode's native skill mechanism.

This task is primarily local operator/runtime repair. Modify tracked repository files only if a tracked helper, service template, documentation, or implementation change is genuinely required to make the requested behavior reliable. If tracked repository files are changed, follow the normal `developer` task-record, commit, push, validation, and handoff requirements. Do not modify or promote `main` or modify `web-orchestration`.

### Observed starting state

A failed adapter canary used GitHub issue #28 and command ID:

`9fd2eabe-5dc6-4475-ad49-53e1acf6eee6`

Direct inspection of the bridge's durable SQLite state established:

* no row for that command in `commands`;
* no row in `command_rejections`;
* no issue/task binding for issue #28;
* no OpenCode task session for the canary.

Therefore the command was never admitted or executed.

Issue #28 has since been closed and its `agentic-bridge` label removed. Treat that as the expected state and verify it if local GitHub access is available. Never reopen it, restore its control label, replay its command, or reuse that command UUID.

The previous bridge process is no longer running. Its last recorded local error was `fetch failed`.

The current bridge status command also fails while loading the private operator configuration because the existing configuration predates the current hardened Scout-runtime schema and is missing at least:

`opencode.scout_password_file`

### Requested outcome

Repair the local bridge installation completely and leave it running, supervised, synchronized, and boot-persistent.

#### 1. Neutralize the old canary

Verify that GitHub issue #28 is closed and has no `agentic-bridge` control label.

If it is unexpectedly still open or labeled and you have suitable GitHub access, close it and remove the control label before starting the bridge.

Do not execute, replay, copy into a new issue, or otherwise reactivate its old command.

#### 2. Keep the local `developer` worktree synchronized with remote

First independently fetch and establish the current exact `origin/developer` SHA and inspect the local `developer` worktree.

Reconcile the local worktree to remote using only safe Git synchronization.

Then implement a persistent automatic synchronization mechanism for this dedicated `developer` worktree with these properties:

* continuously detects changes to `origin/developer` with near-immediate latency rather than relying on occasional manual synchronization;
* target detection latency should be roughly 5–10 seconds when the machine/network is available;
* use outbound polling or another local-safe mechanism; do not introduce an inbound webhook, public listener, tunnel, or exposed service merely for synchronization;
* automatically fast-forward the local `developer` branch when local state is clean, behind remote, and safe to advance;
* never `reset --hard`, force-update, discard local modifications, force-push, rewrite shared history, or silently resolve divergence;
* if the worktree is dirty, locally ahead, diverged, or otherwise unsafe to advance, defer synchronization and expose a clear local failure/status rather than overwriting anything;
* coordinate with the bridge so an active `accepted`/`applying` mutation is never interrupted by an automatic synchronization/restart;
* after a remote-only fast-forward changes bridge/runtime source, ensure the running bridge does not indefinitely continue using stale built/runtime code. Safely rebuild/recheck/restart it when required and only when doing so cannot interrupt an active mutation.

Prefer the smallest robust implementation appropriate to the current Linux environment.

#### 3. Migrate the private bridge configuration

Update the existing private bridge operator configuration outside Git so it matches the current repository schema.

At minimum reconcile the current required hardened Scout settings, including:

* `opencode.scout_base_url`
* `opencode.scout_password_file`
* `opencode.scout_runtime_root`
* `opencode.scout_provider_api_key_file`

Use the current tracked `tools/opencode-bridge/config.example.json`, bridge README, validators, and implementation as the source of truth rather than guessing the schema.

Requirements:

* preserve the existing repository identity, GitHub App settings, developer OpenCode endpoint, and existing valid secret material;
* developer and Scout loopback ports must remain distinct;
* Scout runtime root must satisfy the repository's current trust-boundary requirements and remain outside the repository;
* private config and secret files must retain appropriately restrictive permissions;
* never print secret contents into the conversation, logs intended for publication, Git history, task records, or shell command arguments;
* do not read unrelated operator-global `.opencode` customization;
* if a genuinely required secret does not exist, do not invent one. Complete every independent setup step possible and identify exactly which secret/input the operator must provide.

You are authorized for this task to read and update the existing bridge-specific private configuration and bridge-specific secret/runtime files needed by this repository instance. Do not expand that access to unrelated private files.

#### 4. Bootstrap and validate the current bridge

Once local `developer` and the private configuration are correct:

* build/install whatever the current tracked bootstrap requires;
* run the current bridge bootstrap in apply mode as appropriate;
* run its check mode afterward;
* verify the normal developer OpenCode endpoint;
* verify current OpenCode compatibility/version requirements;
* verify the hardened Scout runtime installation and active contract probes;
* verify GitHub repository/App access and required labels;
* verify state/database access;
* resolve any stale build output rather than running an old compiled bridge against newer source.

Do not weaken validation merely to get the bridge running.

#### 5. Make the bridge persistent across boot

Replace the fragile manual foreground-only operation with a supervised local service appropriate for this Linux system.

Prefer a systemd user service when systemd user services are available.

The resulting setup must:

* start the bridge automatically after machine boot, not depend on manually reopening a terminal;
* restart it after unexpected process failure;
* use the private config without placing credentials directly in process arguments;
* wait for appropriate network availability;
* run as the normal operator account, not as root;
* execute the bridge from the intended synchronized `developer` installation;
* fail visibly rather than silently running against an unsafe/diverged worktree or invalid configuration.

If user lingering is required so the user service genuinely starts at boot before interactive login, enable lingering for the current operator account if permitted. This task explicitly authorizes that narrowly scoped boot-persistence change. Do not make unrelated privileged/system changes.

If system policy requires an unavailable elevated authorization for that one step, configure everything else and report the exact remaining operator command/action instead of claiming boot persistence is complete.

Also supervise the automatic remote synchronization mechanism so it starts automatically and recovers after failure.

#### 6. Prove the repaired runtime

Do not stop after writing service files.

Actually start the resulting services and verify them.

At minimum prove:

* issue #28 remains closed and unlabelled;
* local `developer` HEAD equals the freshly fetched `origin/developer`;
* the developer worktree is clean;
* the synchronization service is enabled and active;
* the bridge service is enabled and active;
* boot persistence/lingering state is correct;
* the bridge status command succeeds against the migrated current configuration;
* current bridge/OpenCode compatibility is healthy;
* the hardened Scout-runtime status is healthy;
* the bridge has a real live PID;
* the PID actually exists in the process table;
* `service.heartbeat_at` is fresh and advances across at least two observations;
* restart the supervised bridge service once in a controlled manner and verify that it comes back with a live process and a fresh advancing heartbeat;
* no pending command corresponding to the old issue #28 can execute;
* the bridge can reach GitHub sufficiently for its control loop rather than immediately returning the previous `fetch failed` condition.

Do not create a new adapter canary as part of this repair task. The next adapter canary will be run separately after this environment is proven healthy.

### Safety and persistence boundaries

Never publish:

* credentials or API keys;
* private config contents containing secrets;
* raw private OpenCode/session identifiers unnecessarily;
* host-local absolute paths in Git-tracked task records or documentation.

Do not delete existing operator data merely to get a clean setup.

Do not bypass validation, disable trust-boundary checks, weaken Git synchronization guards, or make the service tolerant of unsafe divergence.

If automatic synchronization encounters dirty/diverged/local-ahead state, fail closed and surface it.

If you discover an active or ambiguous bridge mutation contrary to the observed starting state, stop before restarting/replaying anything and report the exact evidence.

### Completion evidence

At the end, give me a concise operational report containing:

* exact current remote `developer` SHA;
* exact final local `developer` SHA and whether it equals remote;
* issue #28 closed/unlabelled verification;
* private-config migration summary by field name only, with no secret values;
* bootstrap result;
* bootstrap/check result;
* OpenCode compatibility result;
* hardened Scout-runtime result;
* automatic synchronization design and its safe dirty/diverged/active-task behavior;
* synchronization service enabled/active state;
* bridge service enabled/active state;
* boot/linger state;
* live bridge PID;
* heartbeat observations demonstrating that it advances;
* controlled service-restart result and post-restart PID/heartbeat;
* whether the previous `fetch failed` condition is still reproducible;
* any tracked repository files changed and their pushed handoff SHA if applicable;
* any single remaining operator action that could not be completed automatically.

Do not claim success unless local synchronization, current configuration, bootstrap/check, supervised startup, boot persistence, live process, and fresh advancing heartbeat are all actually established.

## Current objective

Repair and prove the private local bridge runtime and add a fail-closed supervised developer synchronization path that drains bridge control work before source replacement or restart.

## Current position

The first tracked implementation commit is pushed. Private systemd bridge and synchronization units are enabled, and the synchronization watcher successfully exercised its drain/bootstrap/check/start path at that commit. A small follow-up now records successful control-poll time and clears stale transient poll errors so current GitHub-loop reachability can be proved directly rather than inferred from bootstrap.

## Observed

- GitHub issue #28 is closed and has no labels.
- `origin/developer` and local `developer` both resolved to the task-start SHA after a clean fast-forward.
- The operator config is mode `0600`; existing developer password and GitHub App private-key files exist with mode `0600`.
- The operator config lacks `opencode.scout_base_url`, `opencode.scout_password_file`, `opencode.scout_runtime_root`, and `opencode.scout_provider_api_key_file`.
- The systemd user manager is running, the existing bridge and developer OpenCode units are enabled, and login lingering is enabled.
- The existing bridge unit cannot remain running while the old private configuration is invalid.
- Durable state still contains no old canary command/rejection, issue #28 binding, or task session, and contains no accepted/applying command or request.
- The existing normal OpenCode auth store contains multiple providers; the private Scout copy contains only the strict OpenAI OAuth fields and is mode `0600`.
- Apply and check bootstrap report compatible OpenCode `1.18.16`, GitHub/App access, all required labels, state readiness, and the hardened Scout contract ready.
- The Scout runtime's own `auth list` recognizes OpenAI OAuth and does not list the unrelated providers from normal OpenCode auth.
- The synchronization watcher is active and reports `synchronized` with matching local and remote SHAs after draining the bridge, applying/checking bootstrap, and starting it again.

## Interpretation

The operator's existing ChatGPT subscription can be reused without exposing the normal multi-provider auth store by filtering only the OpenAI OAuth entry into Scout's isolated writable runtime data. That requires a tracked alternative to the original API-key-only provider setting; the immutable Scout config/tool/dependency tree remains read-only.

## Attempts

The initial apply bootstrap failed because the existing instance-specific runtime parent was mode `0755`; normalizing that bridge-specific parent to `0700` satisfied the existing trust-boundary check. No validation was bypassed.

## Changed approach

After structured clarification, the operator selected filtered reuse of the existing OpenAI OAuth credential instead of supplying the API key named in the original brief. The implementation now accepts exactly one API-key file or one strictly filtered OAuth file at Scout's isolated auth path; `docs/architecture/deviations.md` records this plan-versus-reality change.

## Checks

- Independent `git fetch`, exact ref inspection, and clean `--ff-only` synchronization completed.
- `gh issue view 28` reported `CLOSED` with an empty label list.
- `./scripts/bootstrap-agent-workflow.sh --check` reported tracked hooks active.
- systemd user-manager and linger inspection completed.
- `npm --prefix tools/opencode-bridge test` passed 85 tests after the tracked changes.
- `node scripts/validate-agent-system.mjs` passed.
- `./scripts/validate-repository.sh` passed, including 85 bridge tests and eight branch-initialization tests.
- Private apply bootstrap and subsequent check bootstrap both passed, including active developer and Scout compatibility probes.
- Scoped private config, password, OAuth, and runtime-parent permissions were checked and normalized to owner-only access.
- The first tracked implementation commit was pushed successfully.

## Blockers / required decisions

None currently known.

## Remaining work

- Validate, commit, and push the control-poll observability follow-up.
- Install/update supervised services, start them, and prove synchronization, bridge runtime, heartbeat, restart, GitHub reachability, and canary neutrality.
- Update durable/task records and create/push the terminal handoff snapshot.

## Next action

Validate and push the small control-poll observability follow-up, then let the synchronization service rebuild/restart at that pushed SHA.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `tools/opencode-bridge/README.md`
- `docs/architecture/deviations.md`

## Last handoff commit

None
