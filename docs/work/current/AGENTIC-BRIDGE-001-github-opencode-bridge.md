# Task progress

## Task ID

`AGENTIC-BRIDGE-001`

## Status

Implementation complete after human steering; final durable reconciliation and developer handoff are in progress. Finalization now preserves the exact reviewed task-progress record as immutable benchmark history without changing reconciliation, review, acceptance, promotion, or branch-authority boundaries.

## Task-start developer SHA

`2d05204c2e3368ba29cc5fe2ff2ee37097f01fd7`

## Review-base developer SHA

`d4fa1810f04cbc2ee85eac9a0037c2edbd08aa6d`

## Original task brief

Note: You are allowed to do however many tavily searches as you need. Also make sure you keep a progress file beside the deviations file so you will be up to date when compaction happens.

# MASTER PROMPT — AGENTIC-BRIDGE-001

You are performing a one-time, human-authorized agent-system migration for:

`floris3456/agentic-workflow-template`

You will be started from:

`/Projects/Active`

Do not assume the current working directory is the repository. Locate or clone the repository yourself, then explicitly enter the correct checkout.

This task is intentionally launched outside the repository so repository-local agent instructions do not prevent the human-authorized workflow migration. Once inside the repository, preserve all useful repository safety, Git synchronization, validation, record-maintenance, and branch-authority rules except where this prompt explicitly authorizes changing the agent system, transport, Project package, or `web-orchestration` sources.

## Mandatory first action

Before inspecting the repository, before changing directory, and before substantive research or implementation, create:

`/Projects/Active/deviations.md`

It must never be committed to any repository.

Initialize it with a clear heading for `AGENTIC-BRIDGE-001`.

Use it only for observable implementation deviations, changed assumptions, blockers encountered, workarounds selected, and consequences. Do not write private chain-of-thought, credentials, access tokens, private keys, session identifiers, or secrets into it.

For every material departure from the supplied context package, append an entry containing:

- planned behavior or assumption;
- observed reality;
- reason the plan could not or should not be followed exactly;
- workaround or alternative selected;
- evidence used;
- effect on correctness, security, compatibility, or scope;
- any residual limitation.

If no deviations occur, explicitly record that at completion.

## Autonomy requirement

Perform the task autonomously.

Do not stop to ask the human questions about ordinary implementation blockers. Do not wait for confirmation when a safe, reversible, technically sound workaround can be found.

When something does not work:

1. diagnose it;
2. research the actual current behavior from authoritative sources;
3. choose the safest solution that preserves the task's intended outcome;
4. implement it;
5. validate it;
6. record the deviation/workaround in `/Projects/Active/deviations.md`;
7. continue.

Examples include dependency incompatibilities, changed OpenCode APIs, unavailable commands, changed GitHub APIs, CI/environment differences, package-manager differences, missing convenience tools, test-environment limitations, or stale assumptions in this context package.

Do not "work around" a blocker by weakening security, exposing credentials, disabling meaningful validation, rewriting shared Git history unnecessarily, bypassing authentication, breaking human acceptance authority, merging `web-orchestration` with implementation branches, or promoting work to `main` without explicit human approval.

If a genuinely external requirement cannot be completed because a secret, account-level permission, GitHub App registration, browser interaction, or other credentialed human-owned resource is unavailable, do not stop the task. Complete the implementation, provide deterministic setup/dry-run/mock coverage for that external step, validate everything possible, record the exact residual live-validation gap in `/Projects/Active/deviations.md`, and continue through completion.

## Stable task identity

Task ID:

`AGENTIC-BRIDGE-001`

General outcome:

Replace the unreliable ChatGPT→custom-OpenCode-MCP dependency in the reusable workflow template with a GitHub-mediated OpenCode control plane that:

- uses ChatGPT's managed/native GitHub integration as the web-orchestrator transport;
- uses a local GitHub App client/bridge to communicate outbound with GitHub;
- uses OpenCode's HTTP/SSE/WebSocket APIs locally;
- preserves the complete supported OpenCode API semantically;
- preserves subscriptions and durable recovery as far as the actual upstream OpenCode API permits;
- keeps the native local OpenCode TUI usable against the same OpenCode server/sessions;
- preserves Luna/Sol routing, `developer`, human exact-SHA acceptance, guarded promotion, independent remote review, task-progress, AS-BUILT, deviations, and synchronization semantics;
- removes `opencode-mcp` as a required ChatGPT Project dependency once the new transport is proven;
- remains reusable for repositories created from this template.

Implementation strategy may change when technically necessary. The intended outcome may not.

## Remote-state requirement

Remote Git is authoritative.

The last researched state was:

- `developer`: `2d05204c2e3368ba29cc5fe2ff2ee37097f01fd7`
- `main`: `9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`
- `web-orchestration`: `6c7666bfd754704345f60ecace9d085d95ad6b48`

These are context, not immutable assumptions.

Immediately after creating `/Projects/Active/deviations.md`:

- locate or clone `floris3456/agentic-workflow-template`;
- fetch all remote refs;
- establish current exact `origin/developer`, `origin/main`, and `origin/web-orchestration`;
- inspect intervening commits if any ref advanced;
- use the current remote `developer` tip as the implementation task-start SHA;
- record any baseline change in `/Projects/Active/deviations.md`;
- do not rewrite or discard legitimate intervening work.

If another genuinely active repository-mutating task is discovered, do not overwrite it. Find a safe serialized strategy. If necessary, complete this work on a clearly named temporary implementation branch and integrate only when remote state can be reconciled safely. Record that as a deviation. Never force-push ordinary shared history.

## Human-authorized branch exception

For this migration only, the human explicitly authorizes you to modify both:

- the normal implementation tree through `developer`; and
- the independent `web-orchestration` branch's generalized ChatGPT Project installation package.

This overrides local rules that normally reserve `web-orchestration` writes to the web orchestrator.

It does NOT authorize:

- merging `web-orchestration` into `developer` or `main`;
- merging `developer` or `main` into `web-orchestration`;
- promoting to `main`;
- changing human acceptance authority;
- removing independent GitHub review;
- making the bridge an authoritative evidence source.

Work on the two histories sequentially and independently.

## Repository task record

On `developer`, before substantive implementation:

- activate/check the repository's tracked workflow hooks;
- create `docs/work/current/AGENTIC-BRIDGE-001-github-opencode-bridge.md` from the repository template;
- record the actual task-start `developer` SHA;
- preserve this entire MASTER PROMPT and accompanying CONTEXT PACKAGE as the exact public-safe original task brief, unless a portion is demonstrably unsuitable for public Git persistence;
- if a portion is unsuitable for public Git persistence, preserve the minimum public-safe equivalent and record the transformation in `/Projects/Active/deviations.md`;
- keep task-progress current throughout implementation.

AS-BUILT and applicable repository deviation/design records must change atomically with implementation facts they describe.

`/Projects/Active/deviations.md` is a separate operator-side implementation-deviation log and must never be copied wholesale into Git.

## Research requirement

Before relying on the implementation plan, re-verify the current primary sources.

Use authoritative sources first:

OpenCode official documentation and source:

- `https://opencode.ai/docs/server/`
- `https://opencode.ai/docs/cli/`
- `https://opencode.ai/docs/plugins/`
- `https://github.com/anomalyco/opencode`
- current released/generated `@opencode-ai/sdk`
- current OpenCode OpenAPI document exposed by a running server

GitHub official documentation:

- GitHub Apps
- GitHub App permissions
- installation-token authentication
- conditional REST requests / ETags
- issue APIs
- GitHub App registration using URL parameters or current equivalent
- template repository branch behavior
- fork behavior
- self-hosted runner security guidance

Repository evidence:

- current files and history in `floris3456/agentic-workflow-template`

If current authoritative behavior differs from this package, follow the current authoritative behavior while preserving the intended outcome and record the difference in `/Projects/Active/deviations.md`.

Do not silently "correct" the task based on assumptions.

## Implementation phases

Complete the work in this order unless evidence requires a safer sequence.

### Phase 1 — OpenCode bridge core

Implement the complete local bridge core and conformance architecture.

Do not begin by writing a narrow `start/steer/abort` wrapper.

The bridge must derive its supported operation inventory from the pinned/current OpenCode API/SDK contract and support all transport classes actually required by OpenCode.

At minimum support:

- ordinary HTTP/JSON operations;
- OpenCode SSE event subscriptions;
- PTY WebSocket connection and interaction;
- current session operations;
- prompts and asynchronous prompts;
- messages;
- diffs;
- status;
- abort;
- fork/revert/unrevert/summarize where supported;
- permissions;
- questions;
- file/search/LSP/formatter operations;
- OpenCode MCP management/auth operations;
- configuration/providers/auth operations;
- TUI/control operations;
- sync/history/replay operations where supported;
- experimental API operations present in the pinned supported contract.

Capability and policy are separate.

The bridge may implement an operation even when normal web-orchestrator policy does not permit using it automatically.

Use the official generated OpenCode SDK where it improves correctness, but do not assume the SDK alone handles streaming/WebSocket semantics. Implement transport adapters for the actual upstream transports.

### Phase 2 — Version and compatibility gate

The bridge must record and validate:

- running OpenCode version;
- pinned/tested SDK version;
- OpenAPI contract hash;
- bridge protocol version;
- operation manifest.

On unexpected OpenCode/contract drift:

- diagnostic reads may remain available;
- consequential mutation must fail closed until compatibility/conformance succeeds.

Add deterministic tooling that makes newly added/removed upstream operations visible rather than silently unsupported.

### Phase 3 — Subscription and recovery

Maintain a long-lived OpenCode event subscription.

Persist received events locally before projecting derived state.

Support reconnect with bounded backoff and jitter.

Use OpenCode durable sync/history facilities when supported.

Do not claim that standard SSE `Last-Event-ID` replay exists unless the actual current implementation proves it.

After reconnect:

- recover durable event history where the upstream API supports it;
- deduplicate;
- query canonical current state;
- reconcile sessions/messages/status/pending permission/question state and other relevant state;
- continue.

Transient live events that upstream OpenCode itself does not persist may be unrecoverable across a complete outage. Treat that as an upstream transport limitation, not a reason to invent false replay guarantees.

Do not add an invasive OpenCode plugin merely for perfect transient-event capture unless current research proves it is necessary for correct agent orchestration. If you decide it is necessary, record the deviation and justify it.

### Phase 4 — Durable local bridge state

Use a durable local database, preferably SQLite unless current environment evidence supports a better equally simple option.

Store local state outside the tracked working tree, preferably under Git's common directory or another clone-local untracked state location.

Persist:

- command ledger;
- command results;
- task↔OpenCode session mapping;
- GitHub control issue mapping;
- event journal;
- durable event cursors;
- GitHub outbox;
- compatibility state;
- reconciliation state.

Do not persist secrets in Git.

Commands must be idempotent.

Duplicate delivery of the same command UUID must not duplicate OpenCode side effects.

### Phase 5 — GitHub control plane

Use GitHub as the ChatGPT-facing transport.

Do not require:

- a custom ChatGPT MCP;
- a self-hosted GitHub Actions runner;
- an inbound public webhook;
- a reverse tunnel.

Default design:

local bridge → outbound GitHub REST → project repository issues.

Use a GitHub App.

Default minimum GitHub App permissions should remain narrowly scoped, approximately:

- Metadata: read/implicit;
- Issues: read/write;
- Contents: read.

The bridge must not have repository Contents write permission merely to implement this transport.

OpenCode itself remains the implementation writer through the repository's normal Git workflow.

Authenticate the bridge as the GitHub App and refresh installation tokens automatically.

Provide a reproducible GitHub App setup flow. Prefer current official GitHub mechanisms that can preconfigure the registration fields/permissions. Keep the App private key and App configuration under an operator-local configuration directory such as:

`~/.config/agentic-workflow/`

Never commit them.

### Phase 6 — Outbound-only polling

Because the template is public and intended for reuse, do not make a self-hosted Actions runner the default mechanism.

Implement authenticated conditional polling using ETags or the current GitHub-supported equivalent.

Use faster polling while an active bridge task is running and slower polling while idle.

Respect GitHub rate-limit and concurrency guidance.

Support optional future webhook acceleration only if it can be added cleanly without making inbound connectivity required.

### Phase 7 — GitHub issue control protocol

Use a dedicated issue per active implementation task.

Create/use a bridge-control label such as:

`agentic-bridge`

The web orchestrator owns the issue body.

The bridge owns bridge-status labels and bridge result/status comments.

Avoid two writers independently replacing the same issue body.

Include a machine-readable hidden command envelope with:

- protocol version;
- monotonically increasing sequence;
- UUID command ID;
- task ID;
- command kind;
- arguments;
- expected task-start/ref information when relevant.

Provide ergonomic high-level commands including the equivalent of:

- start;
- status;
- steer;
- route/change agent;
- permission reply;
- question reply;
- abort;
- events page;
- PTY input/output paging;
- finalization;
- synchronization recovery;
- approved mechanical promotion.

Also provide an expert generic operation mechanism using OpenCode operation IDs so new upstream API operations do not require inventing a new GitHub protocol verb.

Do not expose raw upstream OpenCode session IDs, PTY IDs, absolute local paths, credentials, tokens, or other machine-private identifiers in public GitHub state.

Map public task/control aliases to internal OpenCode identifiers locally.

### Phase 8 — Public-safety projection

The repository is designed so deliberate GitHub-visible state is safe for public disclosure.

The bridge must not blindly dump raw API responses/events into GitHub.

Implement a projection/redaction boundary.

At minimum:

- secrets never enter GitHub;
- token/key-like values are redacted;
- raw provider credentials never enter GitHub;
- raw upstream session identifiers stay local;
- absolute local paths stay local;
- secret-setting operations use local `secret_ref` indirection;
- OAuth/browser-required operations can produce a safe operator action without persisting sensitive callback data;
- large outputs are paged/bounded;
- complete raw event/result data can remain in local durable storage when unsafe or impractical to publish.

Preserve API capability even where GitHub transport requires a safe indirection rather than literal byte-for-byte mirroring.

### Phase 9 — PTY parity

OpenCode currently includes PTY creation/list/update/remove plus WebSocket connection semantics.

Implement real PTY support, including:

- create;
- connect token/ticket;
- WebSocket connection;
- output capture;
- bounded/paged read;
- input;
- resize/update if supported;
- disconnect/reconnect behavior;
- removal.

GitHub latency does not need to be terminal-interactive.

The local OpenCode TUI remains the proper human real-time interface.

### Phase 10 — Local OpenCode TUI

Keep OpenCode server and bridge as separate processes.

The bridge must use the same OpenCode server that a human can attach to locally.

Provide an ergonomic helper such as:

`scripts/opencode-attach.sh`

It should print or execute the correct local `opencode attach` command for the current repository/server.

A human must still be able to observe the same active sessions through the normal OpenCode TUI without routing through GitHub.

Core bridge functionality must not depend on systemd. Systemd user-service integration may be provided as a Linux convenience, but the bridge must also run portably in foreground/CLI mode.

### Phase 11 — Multi-project operation

This is a reusable template.

Do not assume one project per machine or hard-code `127.0.0.1:4096` for every project.

Each derived repository must have an isolated:

- bridge instance identity;
- OpenCode server port;
- OpenCode Basic Auth secret;
- local state database;
- service/process identity;
- GitHub repository mapping.

Multiple template-derived projects must be able to run concurrently.

### Phase 12 — Template-instantiation branch repair

Research and fix the known GitHub-template branch-history problem.

The researched behavior is:

GitHub "Use this template → Include all branches" creates included branches with unrelated histories, which conflicts with this workflow's requirement that `developer` remain mergeable/promotable into `main`.

The live source template's existing branches are related, but generated repositories may not preserve that ancestry.

Implement and document a safe solution.

The preferred shape is a first-run initializer such as:

`scripts/initialize-template-branches.sh`

It must:

- detect whether `main` and `developer` share valid ancestry;
- do nothing if the branch model is already correct;
- identify a genuinely fresh template-generated repository before performing any history-repair operation;
- preserve the intended `developer` tree/content;
- reconstruct `developer` on top of `main` or otherwise restore compatible ancestry;
- use exact remote-state guards and force-with-lease only when first-run repair genuinely requires replacing generated unrelated history;
- never rewrite an active project's established shared history;
- leave `web-orchestration` deliberately independent;
- be testable against disposable temporary Git repositories.

If current GitHub behavior provides a better supported route, use it and record the deviation.

Update README/setup instructions so users are not told to use a creation path that silently breaks the workflow.

### Phase 13 — Bootstrap/runtime tooling

Do not overload the existing `scripts/bootstrap-agent-workflow.sh`, whose current job is tracked Git-hook activation.

Add explicit bridge tooling, approximately:

- `scripts/bootstrap-opencode-bridge.sh`
- `scripts/opencode-bridge-status.sh`
- `scripts/opencode-attach.sh`
- `scripts/validate-opencode-bridge.sh`
- `scripts/initialize-template-branches.sh`

`bootstrap-opencode-bridge.sh` should support a non-mutating `--check` mode.

Normal setup should verify/configure:

- repository identity;
- OpenCode availability/version;
- bridge dependencies;
- local state directory;
- project-specific port;
- local OpenCode auth;
- GitHub App operator config;
- installation access to the repository;
- bridge labels/control prerequisites;
- OpenCode server health;
- bridge health;
- end-to-end local round-trip.

If live GitHub App credentials are unavailable during development, implement and validate the entire setup workflow with mocks/dry-runs and record only the residual live-account validation gap.

### Phase 14 — Repository placement

Prefer a nested self-contained implementation such as:

`tools/opencode-bridge/`

with its own package/dependencies rather than introducing a root application package merely for bridge tooling.

Expected supporting areas include:

`contracts/opencode-bridge/`

`docs/architecture/opencode-bridge.md`

bridge scripts under `scripts/`

tests under the bridge package and/or repository test structure as appropriate.

Use Node/TypeScript unless current research demonstrates a materially better fit. The repository already uses Node for deterministic validation, and OpenCode publishes a generated JS/TS SDK.

Keep runtime dependencies isolated from unrelated template validation code.

### Phase 15 — Repository records

Continuously keep repository records truthful.

Expected records to inspect/update include at least:

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/branch-workflow.md`
- `docs/architecture/design-record.md`
- `docs/architecture/repository-layout.md`
- `docs/architecture/implementation-records.md` if its responsibilities change
- `docs/architecture/deviations.md` only for genuine accepted-design-versus-implementation deviations
- `scripts/validate-agent-system.mjs`
- `scripts/validate-repository.sh`
- CI workflow(s) as needed

Do not use the repository deviation record as a diary. `/Projects/Active/deviations.md` owns task-plan deviations for this autonomous migration. Repository deviation records only represent durable expected-state-versus-implemented-state differences.

### Phase 16 — Validation/conformance

Build strong automated coverage.

At minimum validate:

OpenCode contract:

- every pinned OpenAPI/SDK operation is classified;
- newly added operations cause an explicit conformance failure;
- request/response serialization;
- version/hash mutation gate.

HTTP features:

- session lifecycle;
- sync and async prompting;
- messages;
- status;
- diff;
- abort;
- fork/revert/unrevert;
- permissions;
- questions;
- file/search/config/provider/MCP/TUI operations as supported.

Events:

- connection;
- server.connected;
- heartbeat;
- ordinary events;
- disconnect/reconnect;
- deduplication;
- durable sync/history recovery;
- canonical-state reconciliation.

PTY:

- create;
- token;
- WebSocket connection;
- output;
- input;
- update/resize;
- reconnect;
- removal.

Bridge durability:

- duplicate commands;
- stale command sequence;
- bridge restart with OpenCode still alive;
- OpenCode restart with bridge alive;
- local database interruption;
- GitHub outage;
- GitHub outbox replay.

GitHub:

- App authentication;
- token rotation;
- conditional polling/304 behavior;
- issue discovery;
- command parsing;
- ACK/result projection;
- labels;
- missing permissions fail closed.

Security:

- no secrets projected to GitHub;
- no raw session IDs projected;
- no absolute local paths projected;
- GitHub App cannot write repository Contents;
- OpenCode API listens only on loopback;
- local secret files have restrictive permissions.

Template:

- fresh related-branch repository is unchanged by initializer;
- simulated "include all branches" unrelated-history repository is repaired safely;
- non-fresh unrelated history is refused rather than rewritten.

Workflow:

- Luna start;
- task-progress creation;
- steering;
- route to Sol;
- permission/question round-trips;
- handoff;
- finalization;
- synchronization recovery;
- exact-SHA mechanical promotion command transport;
- GitHub remote remains independently verifiable.

Use mocks where external accounts are unavailable, but also perform real local OpenCode integration tests wherever possible.

### Phase 17 — Developer branch completion

Implementation commits on `developer` must follow the repository's synchronization rules and be pushed.

Keep AS-BUILT/deviation/design records atomic with implementation facts.

Finish substantive implementation and task-progress.

Create the required handoff state according to the repository workflow.

Do not promote to `main`.

### Phase 18 — web-orchestration migration

After the implementation tree is internally validated, switch separately to `web-orchestration`.

Do not merge histories.

Update the generalized ChatGPT Project installation package so the normal MCP-ON transport no longer requires `opencode-mcp`.

The intended normal capability model becomes approximately:

- connected/native GitHub integration:
  - exact remote evidence;
  - independent review;
  - narrow `web-orchestration-only/**` persistence;
  - bridge-control issue creation/read/update and result retrieval;
- optional symbol-scouter:
  - orientation only;
- local OpenCode implementation:
  - reached indirectly through the GitHub bridge, not a ChatGPT custom MCP.

Update at least the Project files whose procedures currently assume direct `opencode-mcp`, including:

- `web-orchestration-only/chatgpt-project/README.md`
- `developer-instructions.md`
- task delegation
- delegation recovery
- task review/steering
- routing/escalation
- synchronization recovery
- finalization as needed
- main promotion
- package validation

Preserve the high-level trigger structure where possible. Do not add unnecessary new Project skills if the existing skills can be cleanly rewritten around the bridge.

The new delegation/recovery design should use GitHub command UUID/idempotency rather than ambiguous direct-MCP send semantics.

Do not treat bridge-reported repository state as proof. Remote GitHub review remains independent.

Run `web-orchestration-only/validate-package.mjs`.

Commit and push `web-orchestration` separately.

### Phase 19 — migration acceptance gate

Do not remove the old transport assumption from the generalized Project package until the replacement is demonstrated sufficiently.

Where full live ChatGPT-native-GitHub E2E cannot be exercised from your environment, create a deterministic integration harness that proves the protocol and record the residual live-ChatGPT validation step in `/Projects/Active/deviations.md`.

The target demonstration is:

native GitHub control object
→ bridge detects command
→ Luna session starts
→ same session visible locally through OpenCode attach/TUI
→ status is projected
→ steering reaches same session
→ permission/question can round-trip
→ route can change to Sol
→ bridge restart recovers state
→ SSE outage reconciles state
→ agent handoff occurs
→ remote Git is independently inspectable
→ finalization can be delegated
→ approved promotion can be mechanically delegated without changing human acceptance authority.

## Scope-control rules

Do not opportunistically redesign unrelated product/template behavior.

Do not remove the three-branch authority model.

Do not replace Luna/Sol merely because another agent system exists.

Do not make GitHub Issues authoritative implementation evidence.

Do not make the bridge a Git writer.

Do not weaken exact-SHA acceptance/promotion.

Do not merge `web-orchestration` histories.

Do not store private runtime configuration in Git.

Do not add a self-hosted runner requirement.

Do not add a public inbound bridge requirement.

Do not silently pin an unverified OpenCode version.

Do not silently reduce supported OpenCode features to only those currently used by this workflow.

## Completion behavior

Do not stop at a design document.

Implement the system.

Research, code, test, reconcile records, commit, push, and update the generalized Project package.

If a blocker prevents one live external verification, finish everything else and provide deterministic test coverage for the blocked edge.

At the end, ensure `/Projects/Active/deviations.md` accurately reflects every material change from this package.

Do not promote `developer` to `main`.

## Final response

Return only the repository's canonical five fields:

Status:
Files changed:
Checks + perceived results:
Blockers/decisions:
Task record:

In `Blockers/decisions`, mention `/Projects/Active/deviations.md` and whether it contains deviations/residual live-validation gaps.

Do not claim independent correctness or human acceptance.

## Accompanying context package

# CONTEXT PACKAGE — AGENTIC-BRIDGE-001

## Repository

Target:

`https://github.com/floris3456/agentic-workflow-template`

The repository is a reusable GitHub template for human-controlled, web-orchestrated development.

Last researched remote state:

`developer = 2d05204c2e3368ba29cc5fe2ff2ee37097f01fd7`

`main = 9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`

`web-orchestration = 6c7666bfd754704345f60ecace9d085d95ad6b48`

`developer` was eight commits ahead of `main` at research time.

Always re-fetch current remote state before implementation.

## Existing architecture

The reusable workflow intentionally separates:

Human:
consequential decisions and exact-SHA acceptance.

Web orchestrator:
task design, agent routing, steering, independent remote review.

OpenCode:
local implementation runtime.

GitHub remote:
authoritative repository evidence.

Branches:

`developer`
active shared implementation and temporary task-progress.

`main`
only exact implementation explicitly accepted by the human.

`web-orchestration`
independent orphan-style history containing only `web-orchestration-only/**`, including generalized ChatGPT Project installation sources and public-safe orchestration continuity.

`web-orchestration` must never normally merge with `developer` or `main`.

## Existing OpenCode setup

Root `opencode.json` currently sets:

`default_agent = small-developer`

`share = disabled`

`permission.task = deny`

Current approved local agents:

`.opencode/agents/small-developer.md`
GPT 5.6 Luna, maximum reasoning effort.

`.opencode/agents/large-developer.md`
GPT 5.6 Sol, high reasoning effort.

Local agents are implementation workers only.

They do not normally orchestrate, review themselves, accept work, or launch subagents.

## Existing implementation lifecycle

A delegated implementation task normally:

receives stable task ID + public-safe brief
→ starts from exact remote `developer`
→ creates `docs/work/current/<task>.md`
→ preserves exact delegated public-safe brief
→ maintains task-progress + AS-BUILT + deviation records
→ pushes every commit
→ creates handoff snapshot
→ returns five-field response
→ web orchestrator independently reviews remote commit range
→ developer finalizes
→ web orchestrator reviews finalization
→ human may approve exact `developer` SHA
→ Luna performs guarded mechanical `developer → main` promotion.

Promotion is not a normal implementation task and must introduce no content changes.

This architecture must remain intact after the bridge migration.

## Existing web-orchestration package

On `web-orchestration`:

`web-orchestration-only/chatgpt-project/`

contains generalized Project developer instructions and individual Project skill files.

The current package explicitly assumes:

GitHub MCP for repository evidence/orchestration writes.

jCodeMunch or optional symbol scout for orientation.

`opencode-mcp` for implementation delegation, steering, session recovery, and developer responses.

The bridge migration should remove `opencode-mcp` as a required ChatGPT capability and route implementation control through native GitHub instead.

## Why this task exists

Custom/developer MCP availability inside ChatGPT has shown conversation-level instability.

The desired replacement is not another custom MCP.

Instead:

ChatGPT
→ managed/native GitHub connector
→ GitHub control issue
→ local GitHub bridge
→ local OpenCode HTTP/SSE/WebSocket API
→ Luna/Sol.

GitHub remains independently used for exact remote review.

## OpenCode research baseline

At research time, current OpenCode release/SDK was:

`1.18.16`

Do not assume this is still current.

Re-verify.

OpenCode provides:

- HTTP server;
- OpenAPI 3.1 document;
- generated JS/TS SDK;
- multiple-client architecture;
- sessions;
- messages/prompts;
- async prompting;
- status;
- diff;
- abort;
- fork/revert/unrevert;
- permissions;
- questions;
- files/search/LSP/formatters;
- provider/auth/config;
- MCP management;
- TUI controls;
- PTY management;
- event subscriptions;
- experimental sync/history/replay;
- experimental workspace/control-plane APIs.

The generated SDK exposes a wider surface than the short human-facing server documentation. Therefore, API parity must be generated/validated from the actual supported contract rather than maintained manually.

Relevant upstream source areas at research time included:

`packages/sdk/js/src/v2/gen/sdk.gen.ts`

`packages/sdk/js/src/v2/gen/types.gen.ts`

`packages/opencode/src/server/routes/instance/httpapi/handlers/event.ts`

`packages/opencode/src/server/routes/instance/httpapi/groups/sync.ts`

`packages/opencode/src/server/routes/instance/httpapi/handlers/sync.ts`

`packages/opencode/src/server/routes/instance/httpapi/groups/pty.ts`

`packages/opencode/src/server/routes/instance/httpapi/middleware/authorization.ts`

`packages/opencode/src/event-v2-bridge.ts`

Use the current equivalent paths if upstream moved.

## OpenCode event findings

The current researched event endpoint:

- is SSE;
- registers its listener before emitting `server.connected`;
- emits heartbeat events;
- carries an internal OpenCode event ID inside event payload data;
- does not expose that value as the SSE protocol `id:` field;
- therefore does not currently provide a documented standard `Last-Event-ID` resume mechanism.

OpenCode also has durable sync events.

Durable events have:

- event ID;
- aggregate ID;
- sequence number;
- type;
- data.

`/sync/history` can return events newer than known aggregate sequence positions.

However, not every live event is necessarily durable.

The bridge should therefore combine:

live SSE
+ durable sync history
+ canonical state reconciliation.

Do not promise impossible replay of transient upstream events.

## OpenCode PTY finding

Current OpenCode PTY support includes:

- shell listing;
- PTY list;
- create;
- get;
- update;
- remove;
- short-lived connect token;
- WebSocket connect.

Therefore HTTP-only proxying is insufficient for feature parity.

## OpenCode local security

OpenCode server can run on loopback and supports authentication.

Final architecture should keep it local-only.

The bridge talks to OpenCode locally.

GitHub never directly reaches OpenCode.

The human can attach a normal local OpenCode TUI to the same server.

## GitHub transport research

The ChatGPT-facing transport should be the native/managed GitHub connector.

The local bridge should authenticate separately as a GitHub App.

Default GitHub bridge communication should be outbound polling, not inbound webhooks.

Reasons:

- no publicly reachable bridge is required;
- no tunnel is required;
- no self-hosted runner is required;
- the template is public;
- GitHub warns against unsafe use of self-hosted runners with public repositories;
- authenticated conditional REST requests can use ETag/`If-None-Match`;
- successful unchanged `304` responses are suitable for efficient polling under GitHub's documented rate behavior.

Use narrower/faster polling only while tasks are active.

## GitHub App design

One operator/organization can register the bridge GitHub App and install it on repositories created from this template.

Recommended initial permissions:

Metadata: read.

Issues: read/write.

Contents: read.

Do not grant Contents write merely for bridge control.

Bridge secrets such as:

GitHub App ID.

GitHub App private key.

OpenCode Basic Auth secret.

must stay outside Git, under operator-local configuration/secret storage.

The bridge should automatically mint/refresh short-lived installation access tokens.

GitHub supports preconfiguring App-registration values through official mechanisms; use the current simplest supported mechanism to reduce manual setup.

## GitHub control issue model

Each active implementation task gets a bridge-control issue.

The issue is public-safe.

The exact delegated task brief is already required by the workflow to be public-safe enough to preserve in Git task-progress, so it can be used in the issue.

Ownership:

Web orchestrator owns issue body.

Bridge owns bridge-status labels and bridge-produced comments.

Command envelope should contain:

protocol.

sequence.

UUID.

task ID.

kind.

arguments.

expected baseline where applicable.

Never write raw OpenCode session IDs or local private identifiers into GitHub.

The bridge maintains internal mappings locally.

## GitHub bridge command semantics

The web-orchestrator UX should support high-level operations for normal use.

Examples:

start task.

steer task.

route task to Luna/Sol.

request status.

reply to permission.

reply to question.

abort task.

request bounded event/message output.

PTY input/read.

finalize.

recover synchronization.

run approved promotion.

A generic expert `opencode.request` operation should exist for full API coverage.

That generic mechanism should use OpenCode operation IDs/validated arguments rather than arbitrary unsafe shell execution.

## Public-safe boundary

GitHub-visible output must be treated as public disclosure.

Never publish:

credentials.

private keys.

tokens.

raw connection strings.

local session identifiers.

absolute private filesystem paths.

browser profiles.

secret callback state.

sensitive environment values.

Potentially unsafe API results remain local or are safely redacted/projected.

Secret-setting operations use operator-local `secret_ref` handles.

## Bridge reliability model

GitHub commands are durable.

Every command has a UUID.

The bridge maintains a command ledger.

Duplicate commands return the existing result.

Bridge-to-GitHub writes use a durable outbox.

If GitHub is unavailable:

queue results locally
→ retry later
→ do not lose state.

If bridge restarts:

reopen local database
→ recover OpenCode session mapping
→ reconnect events
→ reconcile canonical state
→ resume polling.

If OpenCode restarts:

bridge detects it
→ re-establish API/event connection
→ reconcile actual available sessions/state
→ fail closed on unrecoverable ambiguity.

## Template bootstrap finding

Current:

`scripts/bootstrap-agent-workflow.sh`

only activates/verifies tracked Git hooks.

Do not turn it into a large daemon/provisioning script.

Bridge bootstrap should be separate.

## Template branch-history defect

The source repository currently has valid related `main` and `developer` histories.

However, GitHub documents that repositories generated with:

Use this template
→ Include all branches

create included branches with unrelated histories.

That breaks this workflow's future `developer → main` promotion semantics.

Fix the template onboarding process.

A safe initializer should be idempotent and distinguish:

already-correct branch model.

fresh broken template-generated branch model.

established active project with dangerous unrelated history.

It may perform narrowly guarded first-run history replacement only when freshness can be proven.

It must never rewrite established project history merely to "make validation pass."

`web-orchestration` remains intentionally unrelated to implementation branches.

## Recommended code layout

Preferred implementation area:

`tools/opencode-bridge/`

Potential structure:

`package.json`

`package-lock.json`

`tsconfig.json`

`README.md`

`AS-BUILT.md`

`src/cli.ts`

`src/config.ts`

`src/service.ts`

`src/opencode/**`

`src/github/**`

`src/protocol/**`

`src/policy/**`

`src/state/**`

`tests/unit/**`

`tests/integration/**`

`tests/conformance/**`

Supporting tracked contracts:

`contracts/opencode-bridge/protocol.md`

`contracts/opencode-bridge/command.schema.json`

`contracts/opencode-bridge/result.schema.json`

`contracts/opencode-bridge/compatibility.json`

`contracts/opencode-bridge/operation-manifest.json`

Architecture:

`docs/architecture/opencode-bridge.md`

Scripts:

`scripts/bootstrap-opencode-bridge.sh`

`scripts/opencode-bridge-status.sh`

`scripts/opencode-attach.sh`

`scripts/validate-opencode-bridge.sh`

`scripts/initialize-template-branches.sh`

Exact naming may change when a demonstrably cleaner repository-consistent structure exists. Record such a change in `/Projects/Active/deviations.md`.

## Service/process design

OpenCode server and bridge should be separate processes.

Core operation must support foreground execution.

Optional OS-specific service integration can be layered on.

Do not make systemd mandatory for Windows/macOS compatibility.

Each repository gets unique runtime identity/port/state.

## Validation philosophy

Mechanical validators prove:

structure.

config references.

operation-manifest parity.

schema validity.

transport support.

security invariants.

test behavior.

They do not claim:

semantic implementation correctness.

human acceptance.

independent review.

The developer must not claim its own work is accepted.

## Expected repository-record impact

Inspect and update as justified:

`README.md`

`AGENTS.md` only if local always-active rules genuinely change.

`CONTRIBUTING.md`

`SECURITY.md`

`opencode.json` only when necessary.

`docs/architecture/AS-BUILT.md`

`docs/architecture/agent-system.md`

`docs/architecture/branch-workflow.md`

`docs/architecture/design-record.md`

`docs/architecture/repository-layout.md`

`docs/architecture/implementation-records.md`

`docs/architecture/deviations.md` only for real persistent design deviations.

`.opencode/skills/**` where local developer procedure genuinely changes.

`scripts/validate-agent-system.mjs`

`scripts/validate-repository.sh`

`.github/workflows/**` for safe GitHub-hosted validation only.

Do not add self-hosted runner execution.

## web-orchestration package impact

Current package requires direct `opencode-mcp`.

That must eventually be replaced.

The package should describe MCP-ON in terms of actual capabilities, with GitHub providing both:

authoritative remote repository interaction;

bridge command transport.

Keep the conceptual distinction:

bridge reports are developer/control reports.

direct GitHub remote inspection is repository proof.

Delegation recovery should rely on durable bridge command IDs and command ledger semantics.

The old problem:

"did the MCP prompt arrive before timeout?"

becomes:

"was command UUID X accepted/applied?"

Routing remains a web-orchestrator decision.

Luna remains normal.

Sol remains exceptional.

Promotion remains human-approved exact-SHA only.

## Final branch state expected

At completion:

`developer`
contains implemented bridge/runtime/template integration and its truthful records.

`web-orchestration`
contains the updated generalized ChatGPT Project installation package.

`main`
is unchanged.

No normal merge crosses between those branches.

The human will independently review and decide later whether any exact state should be promoted.

## Non-goals

This task is not:

a product-feature implementation.

a new application architecture.

a replacement of GitHub as remote evidence.

a replacement of Luna/Sol.

a migration to GitHub Copilot/Codex/Claude agents.

a requirement for Cloudflare.

a requirement for Vercel.

a new custom ChatGPT MCP.

a public OpenCode server.

a self-hosted GitHub Actions runner.

an excuse to weaken existing branch/synchronization enforcement.

## Success condition

A competent operator using a repository created from this template should be able to:

configure the bridge.

configure/install the GitHub App.

start the local OpenCode server and bridge.

connect the normal OpenCode TUI locally.

use ChatGPT's native GitHub integration to create/control an implementation task.

have that control reach the correct OpenCode Luna/Sol session.

observe safe status/results through GitHub.

steer or answer agent prompts.

recover after bridge/GitHub/OpenCode transport interruptions.

retain normal OpenCode Git commits/pushes.

independently review the actual GitHub remote state.

finalize.

request human exact-SHA acceptance.

mechanically promote only after explicit human approval.

all without requiring `opencode-mcp` as the ChatGPT implementation transport.

## Current objective

Change finalization across `developer` and the unrelated `web-orchestration` package so the exact substantively approved task-progress blob moves from `docs/work/current/` to the same basename under `docs/work/archive/` as public-safe benchmark history, while durable reconciliation, independent review, exact-SHA human authority, branch isolation, and the operator-owned live-E2E boundary remain unchanged.

## Current position

The developer archive contract is pushed at `b1ff922bc5e5020f7af10f0389510ea3065f76d0`, and the unrelated web finalization-review contract is pushed at `36adae35552c8e32ce8ee8f446aa586eec20b969`. Developer procedure preserves the exact substantive-approval blob through a collision-free same-basename move; web review proves that preservation through exact remote tree/blob evidence. Both branch pairs are verified `0 0`, all targeted and full checks pass, `main` remains `9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`, and final developer record reconciliation plus the task-progress-only handoff remain.

## Observed

- The complete bridge implementation commit is on `origin/developer` at `6e1d2f8a205b5b68ae2ae327a101f19f1e38d730`; local `developer` matched it `0 0` before final record reconciliation.
- Steering-round start refs are `origin/developer=0d515b6cb89366c5913c4864a177ca852c561e9c`, `origin/web-orchestration=f1f7f98372f5bd28073b02fca3e9d5d925ccd2ab`, and unchanged `origin/main=9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`; local `developer` was clean and `0 0` synchronized.
- Final durable-record reconciliation is pushed on `origin/developer` at `cdd492bd59163400cc4121917dbfb4a5855cdd16`; local `developer` matched it `0 0` and clean before this handoff snapshot.
- `origin/main` is `9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`.
- The independent migrated package is on `origin/web-orchestration` at `f1f7f98372f5bd28073b02fca3e9d5d925ccd2ab`; local `web-orchestration` matched it `0 0` and clean after push.
- The developer independent-review correction is pushed at `3df6922f1553f82947c2c3835cd3f916e108c1f2`; a fresh fetch confirmed local and `origin/developer` at `0 0` with unchanged `main`.
- The independent web-package correction is pushed at `9cfd77169ce65a6648de3a1241b9a6f9e0856214`; a fresh fetch confirmed local and `origin/web-orchestration` at `0 0` with only `web-orchestration-only/**` changed.
- Final developer contract/record reconciliation is pushed at `114294ebde25b248398fa62a0df69b8e25c8e75e`; a fresh fetch confirmed local and `origin/developer` at `0 0`, with `origin/web-orchestration=9cfd77169ce65a6648de3a1241b9a6f9e0856214` and unchanged `origin/main`.
- `./scripts/bootstrap-agent-workflow.sh --check` reports that tracked hooks are active.
- No other worktree or active task record was present.
- npm and upstream tag evidence identify OpenCode and `@opencode-ai/sdk` `1.18.16` as current; the release tag is `a3647eb025c7615159d417dcc49fc39fdaeba65b`.
- The authenticated loopback `1.18.16` server reports 188 OpenAPI operation IDs and a stable `/doc` SHA-256 of `c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1` across server restarts/directories.
- The generated manifest classifies 182 ordinary HTTP operations, four SSE operations, and two PTY WebSocket operations. The earlier three-SSE count omitted one released stream. The generated SDK models PTY connect as ordinary GET, so a dedicated WebSocket adapter is required.
- `v2.fs.read` is the only released wildcard route. Its `*` suffix is not an OpenAPI path parameter and the generated SDK exposes no file-path argument, so complete generic parity requires an explicit bridge wildcard argument.
- The core package uses Node `22.13.0` or newer, strict TypeScript, the exact `@opencode-ai/sdk` release, and built-in `node:sqlite`; package-local ignores keep dependencies and compiled output out of Git.
- Legacy `/event` payloads deliberately omit SSE `id:` fields. Release `1.18.16` also provides direct durable per-session history/SSE and retains project-wide `/sync/history`.
- GitHub's current REST version is `2026-03-10`; App installation tokens expire after one hour, can be down-scoped, and Issues write plus Contents read supports the intended transport/evidence guards.
- Correctly authorized conditional GETs returning `304` do not consume primary rate limit, though GitHub still recommends webhooks over polling generally.
- GitHub continues to document that all-branch template generation creates unrelated branch histories.
- Current OpenAI documentation confirms connected apps can have write actions when enabled, but available GitHub action details and a live ChatGPT account cannot be exercised from this environment.
- GitHub control uses a strict hidden `agentic-bridge/1` envelope, exact configured author allowlist plus trusted repository association, one open serialized task issue, and durable UUID/sequence handling.
- The App token provider signs short-lived JWTs, requests a one-repository token downscoped to Issues write and Contents read, rejects broader/insufficient returned permissions, and refreshes automatically.
- Conditional issue/comment polling persists ETags, validates pagination origin/loops, adapts between active and idle intervals, and honors primary/secondary retry timing. GitHub writes are paced in strict durable FIFO order so a retry cannot be overtaken by newer status labels.
- Public projection assigns globally unique task-owned aliases to private session/PTY/permission/question/message/workspace/event IDs including embedded text and object keys, rejects cross-task alias resolution plus raw IDs/absolute paths/literal secrets/unknown or malformed transport fields, prevents generic directory/workspace/location rerouting, resolves local `secret_ref` files only for explicit local-secret operations, redacts/bounds output, and retains raw results and sensitive failure detail locally.
- High-level commands cover start/status/steer/route, permission/question replies, abort, event pages, PTY lifecycle/I/O, finalization, recovery, guarded promotion, and generic operation-ID requests. Generic mutations, local-secret operations, state-changing PTY operations, and promotion are default-denied independently; bounded `pty.read` remains diagnostic.
- The foreground service uses strict mode-restricted operator config, unique per-project identity/port/state/App mapping, a single-process lock, heartbeat/status metadata, graceful signals, loopback OpenCode, and separate normal-TUI attach.
- The template initializer uses a hook-authorized exact `force-with-lease` only for complete-history, clean synchronized one-commit unrelated roots with matching generated metadata/tree shape and no active task; it creates a local old-root backup first, while correct ancestry no-ops and shallow, established, or ambiguous history is refused.
- The migrated Project package keeps its existing MCP-ON/MCP-OFF/shared trigger structure, removes the direct Project OpenCode transport, and uses connected/native GitHub for exact evidence, narrow runtime-continuity writes, and serialized issue commands to the outbound bridge.
- Bridge command continuity is written before issue publication: exact envelopes remain pending through ambiguous/pre-ledger/indeterminate paths, resolved commands retain command/result refs, human promotion approval has a distinct exact-SHA record, and bridge reports remain non-authoritative.
- The web-package validator now pins/prints protocol `agentic-bridge/1` and enforces exact source shape, grouped trigger/reference structure, placeholder counts, a parsed strict command example, continuity fields, regular files, valid UTF-8, formatting-tolerant stale direct-transport/source-project residue, and selected high-risk policy inversions.
- Independent re-review of `developer` through `d4fa1810f04cbc2ee85eac9a0037c2edbd08aa6d` and `web-orchestration` through `9cfd77169ce65a6648de3a1241b9a6f9e0856214` reported no actionable findings and judged the correction ready for substantive approval; no human acceptance or promotion followed.
- Human steering requires finalization to preserve the exact substantively approved task-progress blob under `docs/work/archive/` for benchmarking rather than delete it. Archived task-progress remains public-safe, closed, non-authoritative, excluded from active-task discovery and scouting, and subordinate to reconciled durable records.
- A fresh fetch confirmed `developer=d4fa1810f04cbc2ee85eac9a0037c2edbd08aa6d`, `web-orchestration=9cfd77169ce65a6648de3a1241b9a6f9e0856214`, unchanged `main=9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`, clean local `developer`, and `0 0` local/remote synchronization.
- Developer finalization now verifies the task path against the substantive-approval Git blob, refuses an existing same-name archive target, uses `git mv`, verifies the resulting archive hash, and reports the archived path without creating another handoff snapshot.
- Archived task snapshots are immutable/non-authoritative and excluded from active-task discovery, symbol scouting, broad current source-residue checks, and generic link-health checks; the mutable archive policy README remains a required validated file.
- The agent-system validator rejects task-record removal wording across normative lifecycle files, requires the guarded archive procedure/response/policy, and requires both jCodeMunch archive exclusions.
- The developer archive-contract commit is pushed at `b1ff922bc5e5020f7af10f0389510ea3065f76d0`; a post-push check confirmed local and `origin/developer` at `0 0`.
- The unrelated web finalization-review commit is pushed at `36adae35552c8e32ce8ee8f446aa586eec20b969` and changes only `web-orchestration-only/chatgpt-project/skill-mcp-on-finalization-review.md` plus `web-orchestration-only/validate-package.mjs`.
- Web review now proves that the current path existed and its same-name archive target did not at substantive approval, then verifies the current path is absent and the archive holds the identical Git blob OID at finalization. A mismatch, collision, or substantive change reopens normal review and blocks acceptance.
- A fresh post-push fetch confirmed `developer=b1ff922bc5e5020f7af10f0389510ea3065f76d0`, `web-orchestration=36adae35552c8e32ce8ee8f446aa586eec20b969`, unchanged `main=9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`, and `0 0` synchronization for both implementation branch pairs.

## Interpretation

The pinned manifest plus wildcard extension prepares every classified HTTP operation while explicit adapters handle all released SSE and PTY WebSocket transports. Recovery now combines legacy live events, direct durable session replay, sync history, deduplication, and canonical reconciliation without a capture plugin. Commands with the same task sequence but a different UUID conflict without another side effect; a command interrupted while applying becomes terminally indeterminate rather than being guessed or reissued. The bridge reports control/developer state only; remote GitHub inspection remains independent evidence. Exact-SHA promotion remains human-authorized because web policy defaults it off, the envelope must bind one exact synchronized SHA, and the existing guarded script independently verifies the operation.

## Attempts

- The mandatory first creation attempt at `/Projects/Active/deviations.md` failed because that absolute parent is unavailable in this runtime; the operator-side record was created beside the active workspace, outside every repository. Full details remain outside Git in that log.
- The installed OpenCode CLI was `1.18.15`; direct `npx` reused an incomplete package without its postinstall binary. An isolated temporary `1.18.16` package was installed outside the repository, its documented postinstall was run explicitly, and that binary supplied live contract evidence.
- Initial strict compilation exposed missing Node type activation and WebSocket structural typing defects; both were corrected without weakening compiler options.
- The first test command compiled but Node treated `dist/tests` as a module path. Restricting discovery to emitted `dist/tests/*.test.js` files made execution deterministic.
- Two early real-server harness wrappers timed out during unbounded readiness/cleanup handling. A bounded probe and forced temporary-process cleanup isolated the harness issue; the same compiled client then passed the live compatibility gate.
- A first retry-after outbox test mixed a synthetic outbox clock with the GitHub client's real clock, producing a one-second assertion skew. Injecting the same clock into both components made the deterministic test model the production default correctly.
- Security review found that an untrusted commenter could pre-post a predictable plain dedupe marker. Marker detection now requires the configured GitHub App bot author, and an adversarial test proves another author cannot suppress delivery.
- Status-label retries could otherwise be overtaken by newer outbox items and later regress the visible state. The outbox now preserves strict FIFO ordering across retry delays.
- Final multi-task review found that aliases were globally keyed but numbered per task, creating a second-task collision and allowing generic cross-task resolution. Alias numbering is now global and task-bound alias resolution fails closed; inline private IDs are also aliased before publication.
- Final secret-path review found that an upstream local-secret failure could echo a resolved value in public error detail. The detailed failure is now retained only in local durable state while GitHub receives fixed non-sensitive text.
- Final transport review found that independently normalizing stream chunks could misread a CRLF split at the network boundary as an SSE event separator. The parser now carries trailing carriage-return state across chunks and the stream test exercises split multiline framing.
- Final routing review found that OpenCode accepts relative caller-supplied directory/location query routing, so an input such as `..` could leave the configured project without triggering the absolute-path guard. Generic transport arguments are now shape-checked and directory/workspace/location routing is exclusively injected by the local bridge.
- Web-package review found that direct-session retry wording could not safely express issue-command ambiguity. The migrated procedures persist each exact UUID/sequence envelope before publication, distinguish pre-ledger rejection from accepted terminal states, and never automatically retry an indeterminate side effect.
- Web-package review also found that substantive orchestrator approval was insufficient continuity for guarded promotion. The task-context template now records finalization, explicit human-approved promotion, and verified post-promotion SHAs separately.
- The active API skill registry did not expose the checkout's three required repository-local skills. Their exact tracked `SKILL.md` files were read and followed directly; the operator-only deviation log records the unavailable native-discovery path.
- Final record validation initially stopped at `tsc: command not found` because cross-branch generated-artifact cleanup had also removed ignored package dependencies. `npm ci` restored the exact lockfile set with zero reported vulnerabilities, and the full rerun passed.
- The first new local-HEAD refusal fixture unexpectedly reached the established-history guard because the tracked post-commit hook correctly pushed the fixture commit. Disabling hooks only for that disposable fixture's intentionally local-only setup commit exercised the intended HEAD mismatch; the production hook and initializer were not weakened.

## Changed approach

- Operator-side references to `/Projects/Active/deviations.md` and the adjacent progress file map to the active workspace outside the repository in this runtime. Repository paths and intended implementation scope are unchanged.
- Durable recovery will additionally use the current per-session v2 stream/history APIs rather than relying only on the context package's legacy SSE plus project-wide sync-history route.
- The operation inventory is corrected from three to four SSE operations, and `v2.fs.read` receives an explicit wildcard argument because upstream OpenAPI/SDK generation does not model that route suffix.
- Template ancestry repair uses a tree-preserving `commit-tree` child plus a narrowly recognized pre-push authorization marker rather than merging unrelated generated roots; this leaves the intended developer tree exact and keeps `web-orchestration` unrelated.
- Core bridge operation remains a portable foreground CLI. OS-specific service files were not added because they are optional convenience rather than a cross-platform correctness requirement.
- The Project migration preserves the established mode/skill trigger layout rather than adding a parallel bridge skill set; MCP-ON is redefined around connected/native GitHub plus the outbound issue bridge, while the symbol scout remains optional.
- Package validation was expanded in place and exercised by an external mutation-fixture matrix rather than adding test-only artifacts to the independent branch.
- Independent-review steering keeps the existing bridge behavior and narrows its documented contract: issue bodies and comments are intentionally scanned, the generalized package publishes every command including `start` as a fresh comment, and bounded `pty.read` remains diagnostic while state-changing PTY commands require local enablement.
- Fresh-template provenance now includes author time and path/mode/type tree shape while intentionally allowing branch-specific blob differences. A local old-root backup is created before the exact leased replacement.
- F18 is deferred rather than treated as a message-only edit because an approval URL would need to remain bound through the command contract, merge creation, pending tuple, and resumed-promotion proof. The existing one-SHA promotion interface remains unchanged and the operator-only deviation log records the judgment.
- Human post-review steering changes finalization from deletion to a same-basename, content-preserving move into `docs/work/archive/`. The archive is retained only as immutable benchmark history: it does not become an implementation record, substitute for durable reconciliation, or participate in active-task discovery.

## Independent review dispositions

- F1 implemented: local hooks are explicitly advisory, and operators are told to add a server-side `main` ruleset; hook enforcement is unchanged.
- F2 implemented: all five PTY rows and architecture records now distinguish diagnostic `pty.read` from locally gated create/input/resize/remove.
- F3 implemented: AS-BUILT records the actual owner-only permission check and recommends `0600` rather than claiming exact-mode enforcement.
- F4 implemented: AS-BUILT precisely limits symlink rejection to an existing final state path and does not claim all ancestor components are checked.
- F5 implemented: both research validators are mandatory repository checks.
- F6 implemented: generated-root fingerprinting includes author date and matching path/mode/type tree shape, and a local backup ref precedes force-with-lease.
- F7 implemented on `web-orchestration`: stale direct-transport matching tolerates whitespace and common Markdown separators.
- F8 implemented on `web-orchestration`: the validator pins, uses, and prints bridge protocol/schema revision `agentic-bridge/1`.
- F9 implemented across both histories: `applying` means wait, is pre-indeterminate, may still complete, and must not be reissued.
- F10 implemented across both histories and developer tests: status marker fields and the exact command `marker_hash` byte range, including the canonical trailing newline, are explicit.
- F11 implemented by documenting body/comment scanning as intentional compatibility behavior while retaining package policy that every command, including `start`, is a fresh comment.
- F12 implemented on `web-orchestration`: selected authority, acceptance, indeterminate-retry, secret, promotion, and issue-body inversions fail validation; external matrix cases cover the highest-risk guards.
- F13 implemented on `web-orchestration`: `abort` authority, persistence, terminal handling, and non-rollback semantics are explicit.
- F14 implemented: five new refusal tests cover local HEAD mismatch, shared ancestry, dirty state, active task state, and synchronization-failure marker state.
- F15 implemented: supported runtime and exact-minimum versus newer-host validation evidence are separated.
- F16 implemented: both research scripts use `fileURLToPath`, and the example private-key check uses a direct PEM-header absence pattern.
- F17 no action: steering explicitly requested no implementation change.
- F18 deferred as non-trivial; rationale is in the operator-only deviation log and no promotion behavior changed.
- F19 no action: steering explicitly requested no implementation change.

## Checks

- `git fetch --all --prune` completed successfully.
- `git rev-parse origin/developer origin/main origin/web-orchestration` matched all supplied baseline SHAs.
- `git rev-list --left-right --count developer...origin/developer` returned `0 0`.
- `git status --porcelain=v1` returned no entries.
- `./scripts/bootstrap-agent-workflow.sh --check` passed.
- `npm view`, upstream tag/source inspection, official OpenCode docs, and live `/global/health` all established release `1.18.16`.
- Two authenticated live `/doc` captures from separate server working directories produced the same SHA-256 and 188-operation inventory.
- OpenCode source inspection confirmed legacy SSE emits payload IDs only inside JSON, PTY uses short-lived single-use tickets plus a cursor control frame, and session v2 offers durable sequence-based replay.
- Current official GitHub documentation confirmed App permission/token behavior, ETags/304s, REST API versioning, template branch ancestry, and public self-hosted-runner risk.
- `node scripts/generate-manifest.mjs --openapi <temporary-openapi.json> --output ../../contracts/opencode-bridge/operation-manifest.json` wrote 188 operations with the expected hash.
- `npm install` installed the exact lockfile dependency set with zero reported vulnerabilities.
- `npm test` compiles under strict TypeScript and passes 42/42 deterministic contract, HTTP, SSE, PTY, recovery, durability, App auth, polling, protocol, projection, policy, outbox, workflow, promotion-transport, restart, and security tests.
- The emitted 42-test suite also passes under the exact declared minimum Node `22.13.0`; that release prints its expected upstream `node:sqlite` experimental warning.
- A bounded authenticated loopback integration run against the isolated OpenCode `1.18.16` binary returned healthy version `1.18.16`, the expected OpenAPI hash, 188 operations, and `compatible: true`.
- The final real loopback run also completed an authenticated `project.current` read through the compiled client.
- Eight disposable-Git tests pass for fresh unrelated-root repair/tree identity/backup, repeat no-op, and refusal of shallow, established, generated-fingerprint-mismatched, local-HEAD-mismatched, shared-ancestry, dirty, active-task, and synchronization-failed-marker states.
- `node scripts/validate-opencode-bridge.mjs`, the credential-free App registration URL command, `git diff --check`, and full `./scripts/validate-repository.sh` pass.
- CI now pins exact Node `22.13.0`, installs the nested lockfile, and runs the same repository validation without a self-hosted runner.
- `node web-orchestration-only/validate-package.mjs` passed on the migrated `web-orchestration` tree with 19 Project Sources, package instructions, and five continuity files.
- The external `/tmp/opencode/test-web-validator.mjs` matrix passed 23/23 valid and malformed-package cases, including missing/blank/wrong-type files, symlinks, extra or misplaced Sources, broken references/placeholders/triggers, invalid command markers, invalid UTF-8, stale static transport text, and allowed runtime history.
- `git diff --check` and repeated independent protocol, package-coherence, and validator reviews found no remaining material tracked-package issue before `f1f7f98372f5bd28073b02fca3e9d5d925ccd2ab` was pushed.
- Final remote verification returned `0 0` for both local/remote branch pairs and exact refs `developer=6e1d2f8a205b5b68ae2ae327a101f19f1e38d730`, `web-orchestration=f1f7f98372f5bd28073b02fca3e9d5d925ccd2ab`, and unchanged `main=9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e` before this record reconciliation.
- After restoring ignored dependencies, the original developer-side `./scripts/validate-repository.sh` rerun passed structure, links, agent system, research, bridge contracts, 42/42 bridge tests, three disposable-Git tests, and hook checks.
- The record-reconciliation commit `cdd492bd59163400cc4121917dbfb4a5855cdd16` pushed successfully through the tracked post-commit synchronization hook; a fresh fetch confirmed local and `origin/developer` at `0 0` before the snapshot.
- Steering validation used exact Node `22.13.0`; `npm test` passed 42/42 after the protocol marker assertions, and `node --test tests/template-branches.test.mjs` passed 8/8 after the five new refusal cases.
- The steering-round full `./scripts/validate-repository.sh` passed under exact Node `22.13.0`: structure/links, agent system, mandatory research checks, current evidence manifest, active hooks, bridge contracts, 42/42 bridge tests, and 8/8 disposable-Git tests all passed. The host npm CLI emitted its compatibility warning while invoking exact Node, but compilation and all tests completed successfully.
- On corrected `web-orchestration`, exact Node `22.13.0` ran `node web-orchestration-only/validate-package.mjs` successfully and printed 19 Project Sources, five continuity files, and bridge protocol `agentic-bridge/1`.
- The extended external `/tmp/opencode/test-web-validator.mjs` matrix passed 26/26 cases, adding formatted stale-transport, authoritative-bridge-report, and automatic-indeterminate-retry mutations.
- Post-push fetches verified `developer=3df6922f1553f82947c2c3835cd3f916e108c1f2`, `web-orchestration=9cfd77169ce65a6648de3a1241b9a6f9e0856214`, and unchanged `main=9d9b5d8f54dfa052b7c745e9644ae1c3ddc40c0e`; each checked-out implementation branch matched its origin at `0 0`.
- After aligning F11's scanner capability with the package's comment-only publication policy and reconciling durable records, full developer `./scripts/validate-repository.sh` again passed under exact Node `22.13.0`, including 42/42 bridge tests and 8/8 disposable-Git tests.
- Reconciliation commit `114294ebde25b248398fa62a0df69b8e25c8e75e` pushed successfully through the tracked post-commit synchronization hook; a fresh fetch confirmed exact local/remote `0 0` synchronization before this task-progress-only snapshot.
- The handoff-boundary full repository validation passes under exact Node `22.13.0`, including mandatory research validation, 42/42 bridge tests, 8/8 disposable-Git tests, and active-hook checks.
- Post-review resumption fetch and status checks confirmed the three exact remote refs, a clean synchronized `developer`, and no promotion to `main`.
- Exact Node `22.13.0` targeted agent-system and preimplementation checks pass, and `git diff --check` reports no errors.
- An external archive-policy mutation matrix passes 3/3 cases: obsolete task-record removal and a missing scouting exclusion fail closed, while immutable history containing a stale link and historical source identifier is ignored by current-state checks.
- Full exact-Node `./scripts/validate-repository.sh` passes preimplementation links/structure, agent-system and research validation, bridge contracts, 42/42 bridge tests, 8/8 disposable-Git tests, and active-hook checks.
- On `web-orchestration`, exact Node `22.13.0` package validation passes with 19 Project Sources, five continuity files, and bridge protocol `agentic-bridge/1`.
- The external web validator mutation matrix passes 27/27 cases, including a new task-progress-removal regression fixture.
- `git diff --check -- web-orchestration-only` reported no errors before web commit `36adae35552c8e32ce8ee8f446aa586eec20b969` was pushed.

## Blockers / required decisions

No implementation blocker remains for the benchmark-archive steering. Live GitHub App registration/installation-token access and native ChatGPT GitHub write-action validation require human-owned credentials/account interaction unavailable here. Deterministic App/REST/control/workflow doubles cover the local path, and the operator-only `/Projects/Active/deviations.md` record captures the residual live exercise without claiming it passed. Independent remote review and any exact-SHA acceptance decision remain outside developer authority.

## Remaining work

- Complete and push developer durable-record reconciliation for the now-pushed web package behavior.
- Run final full developer validation, then create and push the dedicated task-progress-only handoff for independent review.
- The credentialed live GitHub App/native ChatGPT exercise remains an operator-owned acceptance step and is not claimed complete.

## Next action

Validate and push the final developer record reconciliation, then create the dedicated task-progress-only handoff.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/branch-workflow.md`
- `docs/architecture/design-record.md`
- `docs/architecture/deviations.md`
- `docs/architecture/repository-layout.md`

## Last handoff commit

`d4fa1810f04cbc2ee85eac9a0037c2edbd08aa6d`
