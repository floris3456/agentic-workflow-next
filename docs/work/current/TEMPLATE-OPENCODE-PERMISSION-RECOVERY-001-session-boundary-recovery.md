# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001

## Status

Change package complete; closure reconciliation pending

## Task-start template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Review-base template-development SHA

d5a8806c9113d27511d956a956fb5d2078e439ec

## Public-safe task brief

Harden delegated developer sessions so normal work inside the exact configured developer repository root avoids unnecessary external-directory approval, genuine outside-worktree access remains orchestrator-gated, repository tasks do not wander through parent/sibling directories, and resolved interactions can recover a genuinely non-progressing same session without replay or scope expansion.

## Current objective

Finish and independently review the developer-side permission boundary and bounded post-interaction continuation recovery.

## Current position

The existing mapped developer route was reconciled, preserved, and absorbed without a replacement session or start replay. Its correction is pushed at `c857762c327ff9f86bd0f3afd055116ba650f23b` with handoff `80ad63319cd746d6205d67781b25e3c327b230bc`. The clean synchronized runtime passed focused real same-session and control-loop acceptance. The separate minimal web-orchestration final-response gate is pushed at `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17` and passes its exact package validation. The exact reviewed ranges are captured in the provenance-verified change package; final issue closure, runtime readback, and ledger handoff remain.

## Source ranges

- developer maintenance start: `ceb9e053c40bc586551069bff1fbfe8c051dcb55`
- developer delegated implementation base after repaired bookkeeping mistake: `29d59fb15bbdd31b59205c691deb4ddd167ade78`
- first handoff candidate: `af19f527390972c5f84dd2d82c40249feb2b3231`
- corrected developer implementation: `c857762c327ff9f86bd0f3afd055116ba650f23b`
- corrected developer handoff: `80ad63319cd746d6205d67781b25e3c327b230bc`
- web-orchestration base: `1f53ce62fba87ba9677b86d3837a008717aa4c24`
- web-orchestration final-response gate: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`

## Observed

- Repeat adapter series produced 9/10 clean passes; run 03 required same-session steering after resolved external-directory interactions.
- Pinned OpenCode behavior keeps ordinary in-working-directory operations normal while `external_directory` represents an outside-worktree boundary; the implementation keeps it at `ask` rather than broadly allowing it.
- The first implementation added repository-relative guidance, durable one-shot interaction recovery state, focused tests, and architecture/protocol records; its reported repository validation passed 92 bridge tests and 8 branch tests.
- Independent source review found `continueAfterInteraction` would nudge on the first `idle` status after a reply, without a grace/recheck proving continued non-progress.
- Live OpenCode status can show fresh tool activity even when durable projected task state remains `starting`; stale projected state alone is not stall evidence.
- The correction session later waited on three `external_directory` requests whose targets used the misspelled sibling worktree basename rather than the configured current worktree. The request queue was reconciled to empty without replay.
- Sequence 20 permission reply ended `indeterminate` because the referenced request had already disappeared; it was not retried.
- Sequence 21 `permission.list` succeeded with `[]`.
- Sequence 22 and both pre-existing status requests were consumed without replay;
  `question.list` returned empty and durable/GitHub state agree.
- Live message/tool evidence proved the configured cwd/root were correct. The
  unnecessary approvals came from three consecutive `read` inputs that manually
  retyped the checkout basename without `workflow`; the immediately preceding
  shell tool used the exact configured root. The cause was agent path synthesis,
  not configuration, cwd, or OpenCode path classification.
- Recovery now waits one second after initial non-progress, rechecks both live
  interaction lists, exact session status, and live activity timestamp, and
  returns clean on `busy`/`retry` or any changed activity. Only stable live non-
  progress reaches the pre-delivery durable one-shot same-session claim.
- The issue-44 delay exceeded the configured 5-second active cadence, but the
  paginated ETag path later consumed page-2 comments correctly after a fail-
  closed GitHub retry window. The cleared transient error did not recur, durable
  admission and GitHub projection agree, and no polling source defect was proven;
  poller source therefore remains unchanged.
- A real in-worktree read produced zero permission requests. One controlled
  structured question was replied through fresh sequence 23; the same session
  resumed naturally with `continuation_recovery.outcome: clean`, without a nudge,
  replay, replacement, or manual post-reply steer.
- A fresh sequence-free `task.status` request reached durable success about 2.7
  seconds after publication, within the configured active cadence, and its bot
  acknowledgement/success agree with local state.
- Web permanent instructions now require all launched routes to be terminal and
  absorbed before final response, explicitly continue reconciliation for active,
  unknown, indeterminate, or unresolved routes, and reject time/length/usage as
  blockers or completion conditions. Existing package validation pins the rule.

## Interpretation

The source work satisfies the bounded recovery, permission, control, and final-response boundaries without broad external access or new state-machine machinery. The prior polling symptom remains an unreproduced external retry episode, not evidence for a speculative poller change.

## Attempts

- Created an empty `__noop__` file accidentally on `developer`; the exact known effect was immediately removed by a normal follow-up commit, with no force/reset/history rewrite. The repaired SHA `29d59fb15bbdd31b59205c691deb4ddd167ade78` became the guarded developer base.
- Initial Luna implementation reached `af19f527390972c5f84dd2d82c40249feb2b3231`.
- Review correction was sent to the same mapped Luna session; no duplicate execution occurred.
- Reconciled live status/messages and interactions without replay. Permission 24 was rejected; permission 23 disappeared before its reply and therefore produced an `indeterminate` 404; the next permission-list read proved the queue empty.
- Waited a bounded interval and posted one sequence-free command-status request for the unacknowledged sequence-22 read; the bridge did not answer either marker.
- Reconciled the running bridge, durable state, paginated issue state, and live
  session directly; preserved and absorbed the dirty correction after proving
  the original route terminal.
- Corrected the recovery design to use a one-second grace plus live activity,
  strengthened exact-cwd/root path guidance, pushed and tested the result, then
  ran the smallest real same-session acceptance on the existing mapped session.
- Added one concise permanent web Project rule and one validator assertion rather
  than duplicating procedure text across routed Sources.

## Changed approach

The initial immediate-idle recovery design was rejected during independent review. The absorbed correction now uses bounded live-activity evidence. The web safeguard was handled only after the developer route was terminal, pushed, loaded, and independently accepted.

## Checks

- Exact live refs and issue lifecycle independently read from remote GitHub.
- First implementation range `29d59fb15bbdd31b59205c691deb4ddd167ade78..af19f527390972c5f84dd2d82c40249feb2b3231` inspected; changed paths match the requested bridge/config/guidance/tests/docs scope.
- First handoff commit exists remotely and is task-record-only.
- Developer focused recovery tests: 7/7 passed; full bridge suite: 95/95.
- `node scripts/validate-agent-system.mjs`, bridge validation, repository
  validation, and `git diff --check`: passed; repository validation included
  95/95 bridge and 8/8 branch-initializer tests.
- Clean runtime: OpenCode `1.18.16` compatible, real bridge process, advancing
  heartbeat/poll time, clear error, empty command/request/delivery/outbox queues,
  and healthy Scout.
- Real adapter: zero in-worktree permission requests; same-session question reply
  continued cleanly; fresh sequence-free read consumed in about 2.7 seconds.
- Web exact revision `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`:
  package validator passed and 16/16 Node tests passed.
- Exact remote refs independently read back for developer, web-orchestration, and
  unchanged main.
- Provenance schema-2 package validation passed for developer range
  `29d59fb15bbdd31b59205c691deb4ddd167ade78..80ad63319cd746d6205d67781b25e3c327b230bc`
  (18 paths) and web range
  `1f53ce62fba87ba9677b86d3837a008717aa4c24..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
  (2 paths), with package digest
  `2a5cb0ef45c7af4658bb1c62817e1fa8589625299c533213cda44cf41f51c3a9`.
- Full template-development validation and `git diff --check`: passed after
  package generation.

## Blockers / required decisions

None.

## Remaining work

- Close issue #44 after this package checkpoint is pushed.
- Recheck exact remote refs and clean local runtime after closure.
- Push the dedicated template-development handoff snapshot.

## Next action

Push the exact-range package checkpoint, then close and independently reconcile
issue #44.

## Relevant durable records

- Issue #44
- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/README.md`
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/deviations.md`
- `changes/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001/manifest.json`

## Last handoff commit

None
