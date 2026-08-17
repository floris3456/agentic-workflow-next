# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

## Status

Runtime acceptance failed; Scout session durability correction required

## Task-start template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Review-base template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Public-safe task brief

Correct bridge lifecycle defects found during full promotion review: recover missed mapped-developer terminal handoffs canonically, start recovery for newly launched Scout sessions without a bridge restart, preserve recoverability across later same-session review/finalization/route prompts, and preserve the Scout session evidence required for restart recovery across synchronized runtime replacement. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract and recurring developer path-synthesis findings remain outside this source correction.

## Current objective

Correct the newly proven Scout session-durability defect in the same lifecycle task: synchronized bridge runtime replacement must not erase the hardened Scout OpenCode session/message storage that startup recovery needs. Preserve the immutable trusted Scout runtime/config boundary while moving or preserving mutable application/session data across runtime install/rebootstrap. Do not relaunch the three historical Scouts whose original session evidence may already have been erased.

## Current position

Fresh canonical source refs: developer `9ca25b8b6f9036744cb61845039f9185deb9e78f`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, main `6127611113dfdb66f93a0cfd2d355359aa370833`. Template-development was `f1b5a50fe1d426563dec8f4f2fd61c066c7dc54c` immediately before this ledger update.

Canonical source issue #49 remained bound to one mapped developer session throughout prior source work; no replacement start/session occurred. Initial lifecycle implementation landed at `9c1ae8a445cbf53db7af3905aefd471470c6cac6`, evidence metadata correction at `0362e24a363d9f905234283666b3f840983a6ef1`, and the reviewed second-terminal correction at `6527f78ac9735b038f2f3febad025eb626734b6d`, followed by task-record-only handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`. A final live same-session Sol message was structurally terminal and named that handoff; source and handoff CI succeeded. Issue #49 was then closed completed.

The three original read-only promotion-review Scouts remain bound to their original request IDs and have never been relaunched: #46 request `2bab872f-8e36-4ff2-a6cd-5cb8e6c9631d`, #47 request `2d97c6f4-029e-49ed-8d99-61f3ccaacb5d`, and #48 request `b8c8c6eb-c49c-43ac-a29c-09154fc52cc5`. A fresh sequence-free #46 status after the final source handoff still reported `session_state: starting`, no latest event, and no projected Scout response.

Fresh operator read-only evidence then proved the local developer checkout, `origin/developer`, installed bridge SHA, and synchronized runtime all exactly equal `9ca25b8b6f9036744cb61845039f9185deb9e78f`; the sync watcher reported synchronized/current, the bridge heartbeat and poll were advancing, all pending command/request/response/outbox counts were zero, draining was false, `last_error` was null, and the repository-specific sync/bridge/OpenCode services were active. Therefore the stuck historical Scouts are not explained by a stale runtime.

Direct source inspection now proves the missing durability boundary. `scripts/watch-developer-sync.sh` stops an idle bridge, fast-forwards developer, then always invokes `scripts/bootstrap-opencode-bridge.sh` before restart. Apply-mode bootstrap always runs the bridge CLI `install-scout-runtime`. `installScoutRuntime()` creates Scout `home`, `data`, `cache`, `state`, and `tmp` directories inside `scoutRuntimeRoot`, then calls `removeInstalled(root)` before replacing the runtime. The Scout server sets both `HOME` and XDG application-data/state locations inside that same replaceable root. OpenCode's documented session/message application data is stored in its user application-data directory. Thus synchronized runtime replacement deletes the storage namespace that contains Scout session history before startup recovery can query the old mapped session. The immutable Scout snapshot survives separately, but the session/message evidence needed to terminalize the historical mapping does not.

This is within the original lifecycle acceptance requirement that startup recovery remain valid for historical hardened Scout sessions. It is not a new task and does not justify relaunching #46-#48. Issue #49 must be resumed/reopened and the existing mapped developer session continued at the next valid sequence after prior terminal sequence 28.

## Source ranges

The lifecycle task is intentionally split because the separate pagination correction was interleaved in developer history and must not be silently absorbed into a lifecycle package:

- lifecycle range A: `326e9c402f571b82f6497c4da0f9d3722b553dba..5dad89af63057545677e47d546783184b5e8c65d`
- separate pagination task: `5dad89af63057545677e47d546783184b5e8c65d..7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- lifecycle range B: `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98..9ca25b8b6f9036744cb61845039f9185deb9e78f`
- lifecycle range C: `9ca25b8b6f9036744cb61845039f9185deb9e78f..pending-durability-handoff`
- prior second-terminal substantive implementation: `6527f78ac9735b038f2f3febad025eb626734b6d`
- prior lifecycle handoff: `9ca25b8b6f9036744cb61845039f9185deb9e78f`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Strict canonical developer terminal recovery, immediate new-Scout recovery enrollment, and same-session second-terminal recovery are implemented and independently reviewed.
- Runtime acceptance of historical Scout recovery failed despite exact current source/runtime installation and a healthy idle bridge.
- Historical Scouts #46-#48 were launched after the hardened `scout-snapshots` model already existed; they are not legacy weaker-worktree mappings.
- Current startup recovery enrolls historical Scout mappings, but it can only succeed if the mapped OpenCode Scout session/messages still exist.
- The developer synchronization watcher always runs apply bootstrap for a runtime-changing update.
- Apply bootstrap always installs the Scout runtime.
- Scout runtime installation recursively removes the prior `scoutRuntimeRoot` after creating replacement `home`/`data`/`cache`/`state`/`tmp` directories in a temporary replacement root.
- The Scout server places HOME and XDG data/state under that replaceable root, so runtime replacement destroys the storage namespace used by Scout OpenCode application/session data.
- The bridge database retains the Scout mapping, which explains a healthy bridge continuing to report `starting` with no terminal event after the session store has been replaced.
- The original Scout starts must not be replayed. If their session history has already been deleted, their missing responses are unrecoverable historical evidence and must be dispositioned via exact GitHub/source inspection rather than relaunch.
- The recurring wrong sibling-path synthesis and Node runtime-floor mismatch remain separate promotion blockers.

## Interpretation

The previous lifecycle source was review-clean for the code it changed but incomplete against real runtime lifecycle acceptance. Startup recovery cannot protect historical Scout completion if synchronized rebootstrap deletes Scout session persistence first. The smallest safe correction is to separate trusted immutable runtime/config replacement from private persistent Scout OpenCode application/session storage, or otherwise preserve that storage across install, without allowing mutable state to become configuration/plugin/executable authority. A focused regression must simulate install/reinstall/restart and prove a pre-existing hardened Scout session remains discoverable and canonically deliverable exactly once.

The historical #46-#48 sessions are evidence of the defect, not candidates for replay. Runtime acceptance of the correction must use new bounded Scout evidence after the fix; it may not reconstruct or replace those original reports.

Packaging remains non-contiguous because pagination is interleaved between lifecycle ranges A and B; range C will add another lifecycle segment. Do not hand-build or widen a package across unrelated pagination history.

## Attempts

1. Luna implemented canonical developer terminal recovery and immediate Scout enrollment.
2. Independent review corrected recovery evidence metadata.
3. Independent review found the post-terminal same-session continuation gap.
4. After Luna failed to implement that edge, the same mapped session was routed to Sol without restart; Sol implemented and handed off the second-terminal correction.
5. A >100-comment pagination/cache defect was isolated, fixed, reviewed, and accepted without replaying the original route marker.
6. Exact source, tests, CI, handoff separation, and final live terminal message for `9ca25b8b...` were independently reviewed.
7. The synchronized current runtime was proven locally at exact `9ca25b8b...`, yet a fresh original-ID Scout status remained `starting` with no response.
8. Direct source tracing connected developer synchronization -> apply bootstrap -> Scout runtime install -> recursive replacement of the runtime root containing Scout HOME/XDG persistence, identifying the lifecycle durability defect.

## Changed approach

Reopen and resume the same lifecycle source issue instead of proceeding to packaging. Continue the existing mapped developer session at the next contiguous command sequence with a bounded Scout-persistence correction. Do not create a replacement developer session and do not relaunch any historical Scout. After the source fix is reviewed and installed, run a new bounded acceptance Scout specifically to prove session durability across synchronized runtime replacement/restart.

## Checks

- Exact current developer ref independently re-read as `9ca25b8b6f9036744cb61845039f9185deb9e78f`.
- User-supplied read-only runtime observation proves installed SHA/runtime and remote developer are exact and synchronized; bridge queues are clear and repository services active.
- Fresh post-install #46 `scout.status` still reports no terminal event/response and `starting`.
- `scripts/watch-developer-sync.sh` exact current source inspected: runtime-changing synchronization invokes apply bootstrap before bridge restart.
- `scripts/bootstrap-opencode-bridge.sh` exact current source inspected: apply mode invokes `install-scout-runtime` every time.
- `tools/opencode-bridge/src/scout-server.ts` exact current source inspected: install creates persistence directories under the runtime root, removes the old root, and the server sets HOME/XDG paths inside that root.
- OpenCode primary documentation confirms session/message data is stored in its user application-data storage.
- Earlier source/handoff Actions for `6527f78...` and `9ca25b8...` succeeded; those checks do not cover persistence across a runtime reinstall.

## Blockers / required decisions

No human product/design decision is needed. The source task is blocked only until the same mapped developer session implements and hands off the confirmed Scout-persistence correction. Historical #46-#48 results may no longer be recoverable because their underlying Scout session data was deleted; replay remains prohibited.

Packaging also requires a repository-owned representation for the task's multiple disjoint lifecycle ranges; do not hand-build or widen the package.

Promotion remains blocked independently by this lifecycle durability defect, unresolved historical Scout dispositions, recurring wrong-sibling path synthesis, Node runtime-floor mismatch, package/finalization work, and the later full `main -> developer` promotion review.

## Remaining work

1. Reopen canonical issue #49 and remove stale completed disposition while preserving its `agentic-bridge` binding.
2. Continue the same mapped developer session at sequence 29 with the bounded Scout-persistence correction; no replacement start/session.
3. Require focused regressions for persistence across install/reinstall/restart, startup canonical Scout recovery exactly once, and failure/trust-boundary cases; run full bridge/repository checks and push source plus a new task-record-only handoff.
4. Independently review the exact new range and CI.
5. Let the synchronization watcher install the corrected runtime and run a fresh bounded acceptance Scout; prove completion survives a controlled normal runtime synchronization/rebootstrap/restart without replay.
6. Disposition #46-#48 without relaunch; use any recoverable original evidence if it still exists, otherwise mark the historical result unavailable due the confirmed state-loss defect and rely on exact direct source review for their original promotion-review scopes.
7. Resolve the repository-owned multi-range package representation for lifecycle ranges A/B/C without absorbing pagination; package/validate lifecycle and pagination work in maintenance order.
8. Separately resolve wrong-sibling path synthesis and Node runtime-floor mismatch, then reconcile finalization and repeat full `main -> developer` promotion review before any human exact-SHA decision.

## Next action

Reopen issue #49 and steer the existing mapped developer session at sequence 29 to preserve Scout OpenCode session/message persistence across synchronized runtime installation while retaining the hardened immutable runtime/config boundary.

## Relevant durable records

- Canonical lifecycle source issue #49
- Successful same-session Sol route `cdb85fa8-dc36-4e98-b6e7-5f94caf6143e`
- Prior second-terminal source `6527f78ac9735b038f2f3febad025eb626734b6d`
- Prior lifecycle handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`
- Pagination source `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4`
- Pagination handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- Promotion review Scout issues #46, #47, #48 and their original request IDs above
- Current synchronization watcher `scripts/watch-developer-sync.sh`
- Current bootstrap `scripts/bootstrap-opencode-bridge.sh`
- Current Scout runtime installer/server `tools/opencode-bridge/src/scout-server.ts`
- Prior fast-completion package `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`

## Last handoff commit

None
