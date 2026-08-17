# Template-maintenance task progress

## Task ID

TEMPLATE-BRIDGE-LIFECYCLE-RECOVERY-002

## Status

Source correction complete and independently reviewed; runtime Scout recovery proof pending

## Task-start template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Review-base template-development SHA

eb014186275a2cb09c7e4ae69ca6b968082c08d1

## Public-safe task brief

Correct bridge lifecycle defects found during full promotion review: recover missed mapped-developer terminal handoffs canonically, start recovery for newly launched Scout sessions without a bridge restart, and preserve recoverability across later same-session review/finalization/route prompts. Keep recovery strict, idempotent, same-session, and fail closed. Do not modify or promote main or change web-orchestration. The separate Node minimum-version contract and recurring developer path-synthesis findings are outside this source correction.

## Current objective

Prove the synchronized bridge runtime has loaded the reviewed lifecycle correction and reconcile the three original Scout sessions without replay. The developer source range itself is complete, terminal, and independently reviewed.

## Current position

Fresh canonical refs at this checkpoint: developer `9ca25b8b6f9036744cb61845039f9185deb9e78f`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, main `6127611113dfdb66f93a0cfd2d355359aa370833`. Template-development was `c4661a356d12bf6c329d3a5966942f847b16342d` immediately before this ledger update.

Canonical source issue #49 remained bound to one mapped developer session throughout; no replacement start/session occurred. Initial lifecycle implementation landed at `9c1ae8a445cbf53db7af3905aefd471470c6cac6`, with handoff `305c72cd87bff6d9cccf91b97f78e87af241efd3`. Evidence-method metadata was corrected at `0362e24a363d9f905234283666b3f840983a6ef1`, with handoff `a12855280dc35a10aded89cd3db2989fad84bcc4`. Luna later produced task-record-only handoff `5dad89af63057545677e47d546783184b5e8c65d` without implementing the confirmed second-terminal edge.

While recovering the Sol route, issue #49 crossed the GitHub 100-comment boundary and exposed a separate cached-pagination defect. That task was isolated as `TEMPLATE-BRIDGE-GITHUB-PAGINATION-CACHE-001`; its reviewed implementation is `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4` and handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`. Its fixed runtime proved it could discover the original page-2 route marker. The original route UUID `e9a777cb-8e35-4a33-985a-52e553bc05e2` was durably `pre-ledger-rejected` because the temporary pagination source issue was still open; command-status proof established its handler never ran. A fresh UUID at the still-next sequence 22, `cdb85fa8-dc36-4e98-b6e7-5f94caf6143e`, then routed the same mapped session to Sol and succeeded as `route-changed`.

Sol implemented the remaining second-terminal correction at `6527f78ac9735b038f2f3febad025eb626734b6d`, followed by task-record-only handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`. Independent review found no blocking defect. The implementation reactivates an exact mapped task session only after successful same-session prompt delivery, re-enrolls developer recovery through a coalescing recovery-observer registry even when the prior observer is still finishing, and prevents a stale duplicate first-terminal response-delivery row from re-terminalizing the reactivated session. Canonical terminal event identity already includes exact session, terminal message ID, completion timestamp, and event type, so a genuinely distinct second completion remains distinct while retry of the same completion dedupes.

The new regressions cover: first terminal -> successful same-session follow-up -> second canonical terminal exactly once; duplicate/restart no duplicate; old observer still finishing during re-enrollment; and failed follow-up prompt leaves the terminal session unchanged with zero re-enrollment. Source CI and handoff CI both succeeded. A final live `session.messages` read on the same mapped Sol session returned structurally terminal assistant message `message-348` with `finish: stop`, a completion timestamp, and the exact six-field completed handoff naming `9ca25b8b6f9036744cb61845039f9185deb9e78f`. The developer route is therefore terminal and absorbed.

Three original read-only promotion-review Scouts remain bound to their original request IDs and have not been relaunched: #46 request `2bab872f-8e36-4ff2-a6cd-5cb8e6c9631d`, #47 `2d97c6f4-029e-49ed-8d99-61f3ccaacb5d`, and #48 `b8c8c6eb-c49c-43ac-a29c-09154fc52cc5`. A fresh sequence-free status read on #46 after the source handoff still returned `session_state: starting` with no projected Scout response, so runtime installation/restart of the new lifecycle code is not yet proven from remote GitHub alone.

## Source ranges

The lifecycle task is intentionally split because the separate pagination correction was interleaved in developer history and must not be silently absorbed into a lifecycle package:

- lifecycle range A: `326e9c402f571b82f6497c4da0f9d3722b553dba..5dad89af63057545677e47d546783184b5e8c65d`
- separate pagination task: `5dad89af63057545677e47d546783184b5e8c65d..7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- lifecycle range B: `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98..9ca25b8b6f9036744cb61845039f9185deb9e78f`
- final lifecycle substantive implementation: `6527f78ac9735b038f2f3febad025eb626734b6d`
- final lifecycle handoff: `9ca25b8b6f9036744cb61845039f9185deb9e78f`
- web-orchestration: no source change
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Prior developer-terminal recovery could permanently miss a terminal response; real task #45 reproduced it.
- Initial source correction added strict canonical developer terminal proof and immediate new-Scout recovery enrollment.
- Independent review found same-session post-terminal prompts could leave durable state terminal and recovery unenrolled.
- Sol's reviewed correction closes that edge only after prompt delivery is proven and preserves exact same-session/no-replay semantics.
- The pagination task proved the bridge can now discover control comments beyond the cached 100-comment boundary.
- The original sequence-22 route handler never ran; its durable pre-ledger rejection made a fresh same-sequence UUID safe under the recovery contract.
- Final Sol handoff is structurally terminal and remote at `9ca25b8b...`.
- Source CI for `6527f78...` and handoff CI for `9ca25b8...` succeeded.
- A fresh #46 Scout status still reports the historical Scout as `starting`; runtime synchronization/restart remains to be proven.
- The recurring wrong sibling-path synthesis and Node runtime-floor mismatch remain separate promotion blockers.

## Interpretation

The lifecycle source implementation is complete and review-clean, but the maintenance task should not be called runtime-accepted until the watcher installs the runtime-changing source and the original Scout sessions are reconciled without relaunch. The interleaved pagination task means lifecycle packaging must preserve two exact developer ranges or use another repository-owned mechanism that does not widen either task; do not create one broad `326e9c..9ca25b8` package because it would silently absorb unrelated pagination work.

## Attempts

1. Luna implemented canonical developer terminal recovery and immediate Scout enrollment.
2. Independent review corrected recovery evidence metadata.
3. Independent review found the second-terminal-after-follow-up gap.
4. Luna did not implement that edge; the same session was later routed to Sol after exact inactive proof.
5. A >100-comment pagination/cache defect temporarily blocked route admission; it was isolated, fixed, reviewed, and accepted against the original page-2 marker.
6. The first sequence-22 UUID was pre-ledger rejected under the one-mutating-issue gate; a fresh UUID at sequence 22 then safely routed the same session to Sol.
7. Sol implemented and handed off the second-terminal correction; exact source, tests, CI, handoff separation, and final live terminal message were independently reviewed.
8. A fresh Scout status read on the original #46 request remains `starting`, so runtime installation/restart proof is still pending.

## Changed approach

Source correction is finished. Do not mutate lifecycle source again unless runtime acceptance or later exact review exposes a new defect. Next recover the deployed bridge/runtime and historical Scout projections, then package the two non-contiguous lifecycle ranges without absorbing the interleaved pagination task.

## Checks

- Exact remote source refs re-read throughout recovery and review.
- Final source commit `6527f78...` inspected directly: post-delivery reactivation, observer registry/re-enrollment, state/delivery idempotency, service wiring, and regressions.
- Focused developer report: 24/24 recovery/workflow tests passed.
- Full developer report: 102/102 bridge tests passed; agent-system, bridge, repository, hooks, and diff checks passed.
- GitHub Actions source run `31982708745` succeeded.
- GitHub Actions handoff run `31982731233` succeeded.
- Handoff commit `9ca25b8...` is task-record-only.
- Live sequence-27 status after handoff returned inactive `{}`.
- Live sequence-28 latest-message read returned terminal `finish: stop` and the exact completed handoff.

## Blockers / required decisions

No human product/design decision is needed. Runtime acceptance is blocked only on proving the local sync watcher installed the new runtime and reconciling the three historical Scout sessions. Packaging also requires a repository-owned solution for the task's two disjoint lifecycle ranges; do not hand-build or widen the package.

Promotion remains blocked independently by unresolved Scout reports, recurring wrong-sibling path synthesis, Node runtime-floor mismatch, package/finalization work, and the later full `main -> developer` promotion review.

## Remaining work

1. Prove synchronized bridge runtime installation of the new lifecycle source.
2. Reconcile #46-#48 original Scout request IDs without relaunch and absorb/close those Scout-only review issues.
3. Close #49 after runtime lifecycle acceptance is clean.
4. Determine the repository-owned package route for lifecycle ranges A and B without absorbing the pagination range; package/validate both lifecycle and pagination work in maintenance order.
5. Separately resolve wrong-sibling path synthesis and Node runtime-floor mismatch.
6. Reconcile required developer/template finalization and repeat full `main -> developer` review before any human exact-SHA promotion decision.

## Next action

Inspect the local developer-sync installed SHA/status after the final lifecycle source handoff. If the new runtime is installed, reconcile original Scout statuses; if not, diagnose the watcher state without replaying any Scout or developer work.

## Relevant durable records

- Source issue #49
- Original pre-ledger-rejected route UUID `e9a777cb-8e35-4a33-985a-52e553bc05e2`
- Successful same-session Sol route `cdb85fa8-dc36-4e98-b6e7-5f94caf6143e`
- Final source `6527f78ac9735b038f2f3febad025eb626734b6d`
- Final handoff `9ca25b8b6f9036744cb61845039f9185deb9e78f`
- Pagination source `3f6eae08bbbe34a966f0d074e0a43771ddbeb2c4`
- Pagination handoff `7bc274c4e54dbe0fda2f0cfdd397bb7b78f41e98`
- Promotion review Scout issues #46, #47, #48 and original request IDs above
- Prior fast-completion package `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`

## Last handoff commit

None
