# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

## Status

Source correction complete and independently reviewed; runtime-install acceptance pending

## Task-start template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Review-base template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Public-safe task brief

Correct bridge lifecycle defects found during full promotion review: recover missed mapped-developer terminal handoffs canonically, start recovery for newly launched Scout sessions without a bridge restart, preserve recoverability across later same-session review/finalization/route prompts, and preserve the Scout session evidence required for restart recovery across synchronized runtime replacement. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract and recurring developer path-synthesis findings remain outside this source correction.

## Current objective

Prove the final reviewed Scout-persistence correction is installed by the normal developer synchronization watcher, then run one fresh bounded Scout acceptance against that installed runtime. The fresh Scout is acceptance evidence for the corrected runtime and must not relaunch, reconstruct, or replace historical promotion-review Scouts #46-#48.

## Current position

Fresh canonical refs are developer `ba73b3b54febfdeadbff66262acaa7be12e5760e`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and main `6127611113dfdb66f93a0cfd2d355359aa370833`. Template-development was `a858b0b993d41d2e0d88393773c44015f06a1372` immediately before this disposition ledger update.

Canonical source issue #49 remains the one lifecycle control issue and stays bound to the original mapped developer session `session-81`; no replacement start/session occurred. Initial canonical developer-terminal/new-Scout recovery landed at `9c1ae8a445cbf53db7af3905aefd471470c6cac6`, evidence-method metadata correction at `0362e24a363d9f905234283666b3f840983a6ef1`, second-terminal substantive correction at `6527f78ac9735b038f2f3febad025eb626734b6d`, and its task-record-only handoff at `9ca25b8b6f9036744cb61845039f9185deb9e78f`.

A read-only operator snapshot at exact `9ca25b8b6f9036744cb61845039f9185deb9e78f` proved local HEAD, origin/developer, installed runtime SHA, and synchronization state all matched; bridge heartbeat/poll were advancing, queues were clear, draining false, last_error null, and repository-specific sync/bridge/OpenCode services active. A fresh original-ID #46 Scout status still remained `starting` with no terminal event/response. That converted the historical Scout symptom from deployment uncertainty into a real lifecycle durability failure.

Direct source tracing proved the cause: normal developer synchronization invokes apply bootstrap; apply bootstrap reinstalls the Scout runtime; the old installer stored Scout HOME/XDG data/state inside the replaceable runtime root and recursively replaced that root. The bridge mapping and immutable Scout snapshot survived, but the OpenCode Scout session/message store required for startup recovery could be erased before restart recovery queried it.

Issue #49 was reopened and the same mapped Sol/large-developer session continued at sequence 29. The substantive persistence correction landed at `14b1bc2a6ec95dac3e932881c2ca6a649a199064`, followed by task-record-only handoff `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b`. Independent review confirmed the implementation separates private persistent Scout OpenCode data/state into a derived sibling persistence root while HOME/config/cache/tmp/PATH and trusted config/binaries remain in the replaceable runtime. Persistence is private, outside repository authority, recursively rejects symlinks/unsupported entries, preserves the credential boundary, and supports legacy isolated OAuth migration into the persistent auth location. Focused/full tests and repository Actions passed.

Independent review then found one bounded evidence gap: the first real Scout runtime smoke reinstalled and reprobed the real server but did not prove pinned OpenCode itself reloaded the same session store after reinstall. Same-session sequence 49 requested only that proof correction. Test-only source commit `1a7794342b56e8fcafbf6cb0eb1246ee4722017d` changed only the lifecycle task record, component AS-BUILT, and `tools/opencode-bridge/scripts/smoke-scout-runtime.mjs`; no persistence implementation code changed. The corrected real smoke creates a harmless real OpenCode session without a model prompt, reads its exact ID and empty messages, stops the Scout server, proves trusted runtime replacement via a removed runtime marker, reinstalls/restarts/reprobes pinned OpenCode `1.18.16`, then reads the exact same session ID and empty messages. Repository Actions passed. Task-record-only handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e` followed and its Actions run passed.

The bridge independently published terminal developer response `message-359` with `finish: stop`, a completion timestamp, exact handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e`, and no blockers. Final read-only sequence 54 succeeded with inactive `{}`; a sequence-free `command.status` read independently found sequence 54 durable and succeeded. The developer source route is therefore terminal and absorbed.

The three historical promotion-review Scouts were never replayed: #46 request `2bab872f-8e36-4ff2-a6cd-5cb8e6c9631d`, #47 request `2d97c6f4-029e-49ed-8d99-61f3ccaacb5d`, #48 request `b8c8c6eb-c49c-43ac-a29c-09154fc52cc5`. Fresh issue reconciliation found no late original terminal result. Each issue now records that the original result is unavailable because of the confirmed pre-fix Scout session-store loss; each bridge-control label was removed and each issue was closed `not_planned`. No request/session was replayed or reconstructed and no terminal Scout result was inferred.

## Source ranges

The lifecycle task remains intentionally split because the separate pagination correction is interleaved in developer history and must not be silently absorbed into a lifecycle package:

- lifecycle range A: `326e9c402f571b82f6497c4da0f9d3722b553dba..5dad89af63057545677e47d546783184b5e8c65d`
- separate pagination task: `5dad89af63057545677e47d546783184b5e8c65d..7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- lifecycle range B: `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98..9ca25b8b6f9036744cb61845039f9185deb9e78f`
- lifecycle range C: `9ca25b8b6f9036744cb61845039f9185deb9e78f..ba73b3b54febfdeadbff66262acaa7be12e5760e`
- range C persistence implementation: `14b1bc2a6ec95dac3e932881c2ca6a649a199064`
- range C first task-record-only handoff: `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b`
- range C real-runtime proof correction: `1a7794342b56e8fcafbf6cb0eb1246ee4722017d`
- range C final task-record-only handoff: `ba73b3b54febfdeadbff66262acaa7be12e5760e`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Strict canonical developer terminal recovery, immediate new-Scout recovery enrollment, same-session second-terminal recovery, and Scout session-store durability across trusted runtime replacement are now implemented and independently reviewed.
- Historical #46-#48 were hardened `scout-snapshots`, not legacy weaker worktree mappings; their stuck state was caused by session-store durability loss, not an intentional trust-boundary refusal.
- The corrected installer preserves only private OpenCode data/state outside the replaceable runtime; mutable persistence does not become config/plugin/instruction/executable authority.
- Runtime and persistence roots are derived and non-overlapping; persistence is private and recursively fails closed on symlinks/unsupported filesystem entries.
- OAuth credentials move to the persistent OpenCode data location with bounded legacy migration; API-key mode rejects a persistent OAuth credential file.
- Unit coverage proves persisted terminal-message evidence can produce one canonical Scout response after reinstall/reopen and does not duplicate across repeated recovery/restart.
- The corrected real pinned-runtime smoke proves OpenCode `1.18.16` itself preserves and reloads the exact same API-created session and readable messages across proven trusted runtime replacement/restart without a model call.
- Source commit `1a779434...` is proof-only: three paths changed and no runtime implementation code changed.
- GitHub repository validation succeeded for persistence source `14b1bc2...`, handoff `fc2cdb9...`, real-smoke correction `1a779434...`, and final handoff `ba73b3b...`.
- Final same-session developer response is terminal and final sequence 54 is durably succeeded.
- Historical Scout starts were never replayed; #46-#48 are now explicitly dispositioned as unavailable original results and closed without inferring terminal responses.
- Recurring wrong sibling-path synthesis and the Node runtime-floor mismatch remain separate promotion blockers.

## Interpretation

The source defect is now corrected with both unit-level canonical recovery evidence and a real pinned-OpenCode persistence proof. The remaining lifecycle acceptance boundary is deployment: connected GitHub cannot prove the host-local synchronization watcher has installed final handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e`. Once installed-sha/HEAD/origin-developer are proven equal to that handoff and the bridge is healthy, one fresh bounded Scout may be started specifically to prove current adapter/runtime completion. That acceptance Scout must use a new task/request identity and is not a replay of #46-#48.

Historical #46-#48 are now dispositioned as unavailable original results caused by the confirmed pre-fix state-loss defect. Their original promotion-review scopes remain uncovered by those Scout executions and can later be covered by exact direct GitHub review or separately scoped fresh review, never by pretending the original Scout executions were recovered.

Packaging remains non-contiguous because pagination is interleaved between lifecycle ranges A and B. The current one-range package generator/validator cannot represent these lifecycle segments without either absorbing unrelated pagination history or a repository-owned multi-range representation. Do not hand-build or widen a package.

## Attempts

1. Luna implemented canonical developer terminal recovery and immediate Scout enrollment.
2. Independent review corrected recovery evidence metadata.
3. Independent review found the post-terminal same-session continuation gap.
4. The same mapped session was routed to Sol without replacement; Sol implemented second-terminal recovery.
5. A >100-comment pagination/cache defect was isolated, fixed, reviewed, and accepted without replaying the original route marker.
6. Exact source, CI, handoff separation, and terminal responses through `9ca25b8b...` were independently reviewed.
7. Fresh synchronized-runtime observation at `9ca25b8...` plus original #46 status reproduced the historical Scout durability failure.
8. Source tracing identified runtime-root replacement deleting Scout OpenCode data/state.
9. Same-session Sol sequence 29 implemented derived private persistence at `14b1bc2...`; source and handoff were independently reviewed.
10. Independent review found the real-runtime smoke proof gap and same-session sequence 49 narrowed correction to that evidence only.
11. `1a779434...` added real no-model OpenCode session persistence proof; CI passed; `ba73b3b...` provided the task-record-only handoff; terminal `message-359` and sequence 54 were reconciled.
12. #46-#48 were reconciled against their original request/session evidence, explicitly marked unavailable without replay, had `agentic-bridge` removed, and were closed `not_planned`.

## Changed approach

Source implementation is complete. Keep issue #49 open only through runtime-install/fresh acceptance. Obtain one read-only installed-runtime snapshot for `ba73b3b...`; after exact installation is proven, launch one new bounded Scout acceptance and absorb it without touching historical #46-#48. Do not create another developer route unless fresh acceptance exposes a concrete source defect.

## Checks

- Current developer, main, web-orchestration, and template-development refs independently reread during this cycle.
- `9ca25b8... -> 14b1bc2...` persistence source range directly reviewed, including persistence derivation, filesystem/trust checks, credential migration, installer behavior, environment wiring, and unit regressions.
- `14b1bc2... -> fc2cdb9...` verified task-record-only handoff.
- Repository Actions for `14b1bc2...` and `fc2cdb9...` concluded success.
- `fc2cdb9... -> 1a779434...` independently verified one commit and only three expected proof/documentation paths.
- Corrected smoke directly inspected: real `session.create`, `session.get`, `session.messages` before reinstall; no model prompt; stop/reinstall/runtime-marker removal/restart/reprobe; same exact `session.get` and `session.messages` after reinstall.
- Repository Actions for `1a779434...` and `ba73b3b...` concluded success.
- `1a779434... -> ba73b3b...` verified task-record-only handoff.
- Bridge-published `message-359` is terminal `finish: stop` and names exact handoff `ba73b3b...`.
- Sequence 54 succeeded with `{}` and sequence-free `command.status` independently returned `found: true`, `state: succeeded`, and the same known result.
- #46, #47, and #48 each received a public-safe unavailable-result disposition, had the bridge-control label removed, and were independently read back closed `not_planned` without any replayed Scout start.
- Main remains unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; web-orchestration remains unchanged at `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`.

## Blockers / required decisions

No human product/design decision is needed. The current lifecycle blocker is only host-local runtime-install proof followed by one fresh bounded Scout acceptance.

Historical #46-#48 original results are unavailable and their original review scopes remain uncovered by those executions; replay is prohibited.

Packaging still requires a repository-owned representation for multiple disjoint lifecycle ranges; no package has been hand-built or widened.

Promotion remains blocked independently by runtime acceptance, uncovered review scope from the lost historical Scouts, recurring wrong-sibling path synthesis, Node runtime-floor mismatch, package/finalization work, and a later full `main -> developer` promotion review.

## Remaining work

1. Obtain a read-only host snapshot proving local HEAD, origin/developer, installed-sha, and synchronization state are exactly `ba73b3b54febfdeadbff66262acaa7be12e5760e`, with healthy bridge queues/services.
2. After installation is proven, launch one fresh bounded Scout acceptance under a new task/request identity; verify start admission, meaningful lifecycle progress, terminal response/publication, exact session continuity, and no new recovery/permission regression. Do not relaunch #46-#48.
3. Close #49 only after the fresh acceptance is terminal/absorbed and no source defect remains.
4. Resolve repository-owned multi-range package representation and generate/validate lifecycle and pagination packages in maintenance order without absorbing unrelated source.
5. Separately resolve wrong-sibling path synthesis and Node runtime-floor mismatch.
6. Reconcile source-lock/template finalization and repeat full `main -> developer` promotion review before any human exact-SHA acceptance request.

## Next action

Prove host-local installation of exact final developer handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e` using read-only sync/runtime status. Do not restart or mutate services before that observation.

## Relevant durable records

- Lifecycle source issue #49
- Historical promotion-review Scout issues #46, #47, #48 and original request IDs above
- Initial lifecycle implementation `9c1ae8a445cbf53db7af3905aefd471470c6cac6`
- Evidence metadata correction `0362e24a363d9f905234283666b3f840983a6ef1`
- Second-terminal implementation `6527f78ac9735b038f2f3febad025eb626734b6d`
- Prior lifecycle handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`
- Scout persistence implementation `14b1bc2a6ec95dac3e932881c2ca6a649a199064`
- Persistence handoff `fc2cdb9567ade7ec24dc5e82c0ba27869caea59b`
- Real-runtime smoke proof `1a7794342b56e8fcafbf6cb0eb1246ee4722017d`
- Final persistence handoff `ba73b3b54febfdeadbff66262acaa7be12e5760e`
- Same-session persistence steer `9631f944-7822-4cc6-bdd1-16ae100867fd`
- Same-session real-smoke review steer `f0811242-7366-4865-bbd3-77f303352a32`
- Final bridge developer response `message-359`
- Final read command `a7945610-0f7e-4323-afc2-7c2ad313e6a2`
- Separate pagination source `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4`
- Separate pagination handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- Current synchronization watcher `scripts/watch-developer-sync.sh`
- Current bootstrap `scripts/bootstrap-opencode-bridge.sh`
- Scout runtime installer/server `tools/opencode-bridge/src/scout-server.ts`

## Last handoff commit

None
