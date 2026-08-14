# Task context: WEB-ORCHESTRATOR-REDESIGN-001

- Continuity schema: agentic-bridge/1
- Task ID: WEB-ORCHESTRATOR-REDESIGN-001
- Status: Completed; issue-#10 interaction handling and the verified simplicity-audit corrections are implemented, validated, deployed where applicable, and synchronized
- Design approval: Human confirmed the corrected design in chat on 2026-08-13
- Human goal: Make the web orchestrator extremely fast and efficient while still completing the human's task, applying safety and thoroughness in proportion to the task, and preserving the genuinely different MCP-ON and MCP-OFF operating modes.
- Current orchestration objective: Completed the bounded post-smoke correction and package simplification while preserving exact-SHA human review/promotion authority and leaving `main` unchanged.
- Task-start developer SHA: `6127611113dfdb66f93a0cfd2d355359aa370833`
- Last reviewed developer SHA: `b100942ecfc8049c5583276180043a99033bcc7b` (sole external reviewer range; later fixes were verified by the sole implementer as required)
- Current handoff developer SHA: `6ff397fdb8aedf196401fff6cbe0497c47befa6c` (implementation/documentation head; a later completed task-progress-only snapshot is reported in the final handoff)
- Substantive implementation approval SHA: none
- Finalization handoff developer SHA: none
- Human-approved promotion SHA: none
- Human approval date/reference: none
- Verified post-promotion main SHA: none
- Verified post-promotion developer SHA: none
- Relevant repository refs: `developer` post-smoke implementation/documentation `6ff397fdb8aedf196401fff6cbe0497c47befa6c`; `main` unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; `web-orchestration` package simplification `48ca0f2f5f2c39574a9fabd66c470ec2832be700` (this completed metadata snapshot follows it and its exact SHA is recorded at handoff)
- Last orchestration mode: not established; this is design capture, not a bridge operation
- Bridge control issue: none
- Related control issues: none
- Bridge control issue state: none
- Highest accepted bridge sequence: none
- Last bridge command: none

## Routing

- Selected developer: none
- Luna substantive-attempt count: 0
- Selection route: none
- Reason: the human commissioned a sole-agent local migration; no bridge developer route applies
- Attempt classifications: none
- Route changes: none
- Result: local implementation completed
- Retrospective: routing is not applicable to this sole-agent migration

## Pending bridge command

- State: none
- Prepared at: none
- Command-comment ref: none
- Result-comment ref: none
- Exact one-line JSON envelope: none

## Bridge command journal

- None.

## Scout request journal

- None.

## Delegations issued

- None. The human explicitly commissioned this migration as a sole-agent local
  implementation; no bridge delegation or Scout was used to implement it.

## Design summary

The current package is deliberately safe, but routine work carries too much repeated procedure. The redesign must remove accidental ceremony without weakening task completion, evidence quality, public safety, mutation safeguards, or human authority.

The governing rule is:

> Use the fastest route that still proves the human's requested outcome is complete. Increase scouting, review, and verification only when size, complexity, uncertainty, blast radius, reversibility, or stakes justify it.

## Confirmed decisions

### 1. MCP-ON and MCP-OFF remain genuinely distinct workflows

MCP-ON and MCP-OFF must not be presented as one orchestration workflow with interchangeable access adapters. Their available actions and useful procedures are materially different.

MCP-ON currently means the Sol-based Project mode with working connected GitHub capabilities. It can inspect exact GitHub state, persist orchestration state, operate bridge-control issues, delegate to OpenCode, use read-only OpenCode Scouts, review exact remote changes, steer implementation, and perform an explicitly approved promotion through the guarded path.

MCP-OFF currently means the Pro-based Project mode without GitHub MCP or another MCP capability. It can inspect public GitHub through the web, reason about visible evidence, review what it can establish, and prepare a bounded future task. It cannot use OpenCode Scouts, control the bridge, delegate implementation, write orchestration state, or claim those actions occurred.

The two modes therefore need separate operational workflows and separate scouting procedures. A common filename or conceptual stage is not enough reason to merge them.

Only rules whose meaning and required action are truly identical in both modes should remain shared. Likely shared policy includes public safety, evidence honesty, proportional effort, and human decision boundaries. Shared policy must not hide mode-specific mechanics.

### 2. Reduce skills by merging real co-trigger groups, not by forcing mode symmetry

The Project should use fewer Sources, but there is no arbitrary target count.

Skills that are always needed together for the same operation in the same mode should normally become one skill. Repeated generic procedure should have one canonical owner. Exceptional recovery and promotion rules should stay separate so routine work does not load them.

The permanent developer instructions should become a short router containing the role, mode determination, authority boundaries, proportional-effort rule, and skill triggers. Detailed bridge protocol and exceptional procedures should not occupy permanent context when they are not being used.

Do not merge MCP-ON and MCP-OFF workflows or scouting merely to reduce the file count. Determine the final grouping from actual trigger co-occurrence and procedure dependencies.

### 3. MCP-ON uses a fast end-to-end completion loop

The normal MCP-ON lifecycle should be:

1. Understand the human's requested outcome and define what completion means.
2. Inspect GitHub directly when the needed evidence is quick or narrow.
3. Launch targeted read-only Scouts concurrently only when they will save time or cover independent areas.
4. Synthesize the evidence in the web orchestrator; Scouts do not make the orchestration decision.
5. Give one bounded implementation task to the selected OpenCode developer.
6. Receive a durable structured developer handoff through the existing event-stream path.
7. Review the exact remote change with verification proportional to the task and its stakes.
8. Send focused steering or a correction when necessary, then repeat only as needed to reach completion or a real blocker.
9. Perform finalization only when the repository's durable-record policy requires it.
10. Ask the human only at a real human decision boundary, including exact-SHA promotion approval.

Routine work must not be expanded into recovery, full-repository review, routing retrospectives, or broad validation unless those procedures are triggered.

There is no fixed one-correction limit if the requested outcome is not complete. The orchestrator should avoid wasteful loops, but must not declare completion merely to stay within an arbitrary pass count. Repeated substantive failure should trigger the existing escalation policy or a human blocker rather than endless retries.

### 4. MCP-OFF keeps its own web-only workflow

The normal MCP-OFF lifecycle should be:

1. Understand the human's requested outcome and the evidence needed.
2. Navigate public GitHub through the web for repository facts.
3. Reason about and review only evidence that is actually visible and exact enough.
4. Prepare a bounded task or concrete next action when implementation is needed.
5. State the capability boundary and move to MCP-ON before delegation, OpenCode scouting, state writes, or bridge control.

MCP-OFF must not simulate an MCP-ON action, treat a prepared command as executed, or use an OpenCode Scout through an unavailable transport.

### 5. Reuse the OpenCode event stream for task completion handoffs

The bridge already subscribes to OpenCode's general and per-session event streams, persists events, recovers history, and makes `session.idle` and `session.error` visible. The redesign should build on that instead of inventing a separate waiting system.

`session.idle` alone is not proof that a task is complete. A developer can become idle because it is blocked, needs a decision, encountered an error, or simply stopped without a valid handoff.

The OpenCode developer agent instructions should require a short structured handoff whenever it returns control. At minimum the handoff must contain:

- Status: completed, blocked, failed, or needs decision.
- Handoff developer SHA: the exact pushed commit ready for review, or `none` when no valid remote handoff exists.
- Files changed: concise paths or areas.
- Checks and perceived results: what the developer actually ran and observed.
- Blockers or decisions: anything preventing completion.
- Task record: exact repository path when applicable.

Before reporting `completed`, the developer must create and push the required handoff commit. A failed push must produce a blocked handoff and must not claim a reviewable remote SHA.

When the mapped session becomes idle, the bridge should retrieve the latest developer response, apply only the existing public-safety projection and task correlation needed for transport, and publish it durably to the bound GitHub issue. The bridge must not interpret or validate the developer's semantic handoff fields. The web orchestrator is capable of reading the response and deciding whether it is complete, blocked, malformed, or not ready for review. This keeps workflow reasoning out of the transport layer.

The web orchestrator must verify the reported SHA and changes against remote GitHub. The developer handoff is navigation and status, not proof that the implementation is correct.

The GitHub issue remains the durable mailbox between the local stream and the web orchestrator. Whether a ChatGPT Project can stay active or wake autonomously after the issue update must be tested. If it cannot, the next Project turn must begin by reconciling the active issue and continuing from the durable handoff.

### 6. Add a dedicated concurrent read-only Scout agent for MCP-ON

Add an OpenCode Scout agent using Luna at high reasoning effort. The Scout exists for targeted repository fact-finding, not implementation or orchestration reasoning.

The orchestrator may launch as many useful Scouts concurrently as the investigation warrants. There should be no orchestration-policy cap and the one-mutating-task restriction must not apply to Scouts. Runtime backpressure may queue work when local resources require it, but must not turn Scouts into serialized mutating tasks.

Every Scout request must include one focused question, an exact repository ref, a bounded search area when known, and the evidence expected in the response. Avoid vague requests such as "analyze the repository."

The Scout may perform enough local code interpretation to locate and explain relevant facts. It must not choose the implementation strategy, synthesize the overall answer, accept work, steer developers, or make human decisions.

Every Scout response should contain exact paths, symbols or line references where useful, concise factual findings, and explicit unknowns. It must not edit files, mutate OpenCode or Git state, commit, push, or launch other agents.

Scout transport must be lightweight. A Scout should not require the full mutating-task lifecycle, task-progress file, routing record, finalization, or promotion procedure. Scout sessions and results still need task/request correlation and public-safe projection.

The web orchestrator remains responsible for comparing Scout results, resolving disagreement, deciding whether evidence is sufficient, designing the implementation task, and reviewing the result.

### 7. Prefer direct GitHub inspection when it is faster or more authoritative

Use connected GitHub directly in MCP-ON for exact files, commits, diffs, checks, and other quick lookups. Do not launch a Scout when direct inspection answers the question faster.

Use Scouts when repository orientation is broad, several independent areas can be searched in parallel, symbol relationships need local exploration, or the Scout work materially reduces web-orchestrator time.

For high-stakes work with a manageable number of relevant files, the web orchestrator should inspect the relevant GitHub files and diff directly even when Scouts were used. High stakes can justify direct inspection regardless of task size because the orchestrator owns the final reasoning and review.

For high-stakes work with a large file volume, Scouts may partition the search, but the orchestrator must directly inspect the highest-risk boundaries and enough exact remote evidence to make its own decision.

MCP-OFF cannot use the OpenCode Scout. It uses public web navigation and its separate MCP-OFF scouting procedure.

### 8. Make scouting and verification proportional

The amount of work should depend on change size, complexity, uncertainty, stakes, blast radius, reversibility, novelty, and available test coverage.

For a small low-risk change, review the focused diff and run or verify the focused check needed to prove the outcome. Do not require broad scouting or a full repository validation by default.

For a medium change, inspect the affected boundaries and run the relevant tests, type checks, lint, or integration checks.

For a large or cross-cutting change, use parallel targeted scouting where useful, review the exact commit range, and require broader checks appropriate to the affected system.

For a high-stakes change, increase independence and depth even when the diff is small. When the relevant file count is manageable, directly inspect all relevant GitHub evidence. Security, destructive operations, migrations, permissions, secrets, and promotion are examples that normally justify stronger review.

Verification must prove the human's requested outcome and material safety conditions. It must not become a ritual checklist unrelated to the actual change. Developer-reported checks guide the review but do not replace exact remote evidence or independent inspection when those are warranted.

### 9. Separate command delivery status from task completion status

A successful bridge `start`, `steer`, or other prompt command proves command handling or prompt delivery. It does not prove that the implementation task is finished.

Add or expose two read-only recovery views:

- `command.status(command_id)`: the durable ledger state and known result for one exact bridge command.
- `task.status(task_id)`: the mapped OpenCode session state and latest projected developer response for one task; the web orchestrator decides whether that response is a usable handoff.

The event stream should remain the normal completion path. Status lookup exists for reconciliation after a lost, delayed, ambiguous, or missed result, not as mandatory busy polling.

These lookups must never re-execute the underlying command. Existing safeguards against automatically retrying an `applying` or `indeterminate` mutation remain in force. A stuck state needs bounded diagnosis and an explicit operator or human escalation path rather than indefinite silent waiting or unsafe replay.

The exact transport and whether read-only status queries participate in command sequencing remain implementation decisions. The result must be durable, task-correlated, and safe for public projection.

### 10. Keep human authority while removing routine interruptions

The human's bounded task instruction authorizes normal orchestration needed to complete it. The web orchestrator should normally act without repeated approval for repository inspection, Scout launches, task design, implementation delegation, waiting, status checks, exact review, ordinary corrections, and checks within the agreed scope.

The orchestrator may answer an OpenCode permission or question itself when the answer is clearly within the human's brief, safe, reversible, and within existing policy. It must involve the human when the answer changes intended outcome or scope, grants sensitive access, creates material privacy or security risk, accepts a known unresolved risk, or is otherwise consequential and ambiguous.

Human approval remains required for destructive or irreversible decisions not already clearly authorized, material scope changes, sensitive permission decisions, acceptance of named unresolved risk, and promotion to `main` under the repository's policy.

Promotion approval remains bound to one exact reviewed `developer` SHA. A later developer change invalidates that approval. Reducing interruptions must not weaken this boundary.

### 11. Preserve the safety rules that carry real value

The redesign must retain these safeguards:

- Remote GitHub evidence is authoritative for implementation facts.
- Developer, Scout, and bridge reports are navigation and claims, not independent proof.
- One repository-mutating developer task runs at a time on the shared `developer` branch.
- Read-only Scout concurrency is separate from the mutating-task restriction.
- Every persisted issue, marker, handoff, routing note, and orchestration record is treated as public.
- Secrets, private chat, credentials, personal data, and raw local identifiers are not published.
- Exact SHAs and exact commit ranges anchor review and human approval.
- Ambiguous mutations fail closed and are not automatically repeated.
- MCP-OFF never claims unavailable MCP, bridge, state-write, or OpenCode actions.
- The developer cannot approve its own implementation or substitute its self-report for web review.

Proportional effort means removing work that does not improve confidence. It does not mean skipping evidence needed to establish completion or safety.

### 12. Redesign implementation completion is all-or-nothing

The redesign implementation is not complete until every confirmed requirement and acceptance example in this record has functioning, tested, documented behavior on the correct branch. Every open implementation question must be resolved into one implemented answer.

Implementation tasks may take a different route when the planned route is unsuitable, but the alternative must be the simplest viable route that achieves the same required outcome without material loss of correctness or safety. The deviations record explains that changed route and its evidence; it cannot waive, defer, weaken, or replace a required outcome.

Temporary blockers require diagnosis and a viable alternative, not a blocked final handoff. Final task-progress must contain no stale status, obsolete next action, unresolved required work, required TODO, placeholder, stub, knowingly failing path, or deferred implementation. Every bounded implementation task must be completed before final review.

An unavailable credentialed live observation may remain explicitly unverified only after the complete implementation and a conservative deterministic fallback are in place and tested. It must not hide missing behavior or an unresolved design choice. For example, if autonomous Project wake-up cannot be proven, next-turn durable issue reconciliation must be fully implemented rather than deferred.

## Supporting implementation changes

The redesign is expected to require coordinated changes in the Project package, OpenCode agent definitions, bridge protocol, bridge service, tests, and validation. At minimum implementation should cover:

1. Restructure the Project instructions and Sources around distinct MCP-ON and MCP-OFF workflows with measured co-trigger consolidation.
2. Add the read-only Luna High Scout agent and a lightweight concurrent Scout transport.
3. Extend the developer return contract with explicit status and exact handoff SHA.
4. Use durable stream idle/error events to transport the latest projected developer response to the bound issue without adding semantic handoff validation to the bridge.
5. Add exact command-ledger and task-session status lookup for recovery.
6. Add tests proving Scouts cannot mutate, are task/request correlated, and can run concurrently with each other and with one mutating task.
7. Add lifecycle tests proving delivery, completion handoff, blocked handoff, missed-event recovery, review, steering, and finalization remain distinguishable.
8. Update package validation so merged skills, mode-specific triggers, and the handoff/status contracts cannot drift silently.

Known bridge compatibility issues discovered during the audit should be fixed or explicitly reconciled during this work rather than hidden by instruction changes:

- Enforce first sequence `1`, contiguous later sequences, and one nonterminal command per mutating task.
- Make workspace aliases task-bound so one task cannot resolve another task's alias.
- Either publish the documented `applying` state durably or simplify the documentation and recovery contract to match the observable lifecycle.

## Acceptance examples

The redesign is not complete unless these examples work with little unnecessary ceremony:

### Quick lookup

The human asks where one behavior is implemented. MCP-ON reads the exact GitHub file or symbol directly and answers. It does not create a Scout, bridge issue, task record, or implementation task.

### Small implementation

The orchestrator inspects the narrow area, delegates one bounded task, receives a structured pushed handoff from the stream, reviews the focused diff and focused check, and reports completion or requests one focused correction. It does not run broad scouting or unrelated full validation.

### Large cross-cutting implementation

The orchestrator launches several focused read-only Scouts concurrently, synthesizes their evidence, delegates one mutating implementation task, receives a structured handoff, reviews the exact range, and scales checks to the affected system.

### High-stakes compact change

Scouts may help, but the orchestrator directly inspects every relevant GitHub file and diff because the relevant volume is manageable. It independently verifies the material security or safety condition before recommending acceptance.

### MCP-OFF analysis

Pro uses the public web to inspect available GitHub evidence, explains uncertainty honestly, and prepares a bounded next task. It does not invoke or imply an OpenCode Scout or bridge action.

### Lost command result

The orchestrator asks for the exact command's durable status and the task's current status. The lookup does not repeat the mutation. It resumes from a valid handoff or escalates a genuinely unresolved state.

### Fresh-turn continuity

A fresh MCP-ON turn groups every open control issue by authenticated task ID
before creating another. It reuses the canonical issue, reconstructs the full
task journal, resumes active work, reviews a delivered response, or records and
closes a verifiably terminal or superseded task. The mere presence of an open
issue or completion label does not block forever or prove completion; only
ambiguity remaining after bounded read-only reconciliation blocks a new
mutation.

### Duplicate-task issue recovery

If two issues claim one task ID, the orchestrator posts nothing on the later
issue. Trusted lifecycle or an explicit duplicate-binding rejection identifies
the canonical bound issue. The orchestrator reconstructs the highest accepted
sequence and every launched-agent disposition across the related issues, then
closes only a duplicate proven to have launched no unresolved work. The bridge
rejects each duplicate marker locally without changing the binding or starving
already accepted work.

### Connector-gated recovery

If ChatGPT refuses a prepared GitHub comment before remote confirmation, the
orchestrator does not call that a bridge rejection. It reads the issue for the
exact UUID, makes at most three total attempts with the unchanged idempotent
envelope when absent, and accepts later equivalent trusted terminal evidence as
superseding a redundant status request. Three attempts end one delivery window,
not the required operation: it pauses only dependent work, continues meaningful
independent work, and opens another bounded window at a later natural checkpoint.
Connector delivery alone never causes `RESUME REQUIRED`; it never retries an
accepted or ambiguous underlying mutation.

### Human decision

Routine scouting, delegation, review, and correction proceed without repeated human prompts. The human is asked when intent or risk truly requires a decision and must approve the exact final SHA before promotion.

## Explicitly rejected directions

- Do not replace MCP-ON and MCP-OFF with one shared operational workflow.
- Do not give MCP-OFF an OpenCode scouting procedure it cannot execute.
- Do not merge skills solely because their names describe similar stages in different modes.
- Do not launch Scouts for quick GitHub lookups.
- Do not let Scouts perform orchestration synthesis or acceptance reasoning.
- Do not make the bridge semantically validate or interpret the developer handoff; it transports projected task-correlated output and the web orchestrator judges it.
- Do not equate command success, `session.idle`, or a developer claim with verified task completion.
- Do not impose heavyweight verification on every small change.
- Do not use proportionality as a reason to under-review high-stakes work.
- Do not solve missed results by automatically replaying an uncertain mutation.
- Do not reduce human interruptions by weakening exact-SHA promotion approval.
- Do not use blockers, stale progress, deviations, residual live validation, or future-work notes to report an incomplete redesign as complete.

## Resolved implementation questions

- The concrete trigger/dependency audit now consolidates 19 Sources to seven:
  separate MCP-ON normal workflow, scouting, recovery, finalization, and
  promotion Sources; and separate MCP-OFF web-only workflow and scouting
  Sources. Shared safety/authority is always needed and small enough to remain
  permanently visible instead of requiring a separate trigger. Review/task-
  design detail moves into each mode because its mechanics differ. Recovery,
  finalization, and promotion remain exceptional rather than loading during
  routine work.
- Concurrent Scouts use UUID-idempotent `scout.start`/`scout.status` requests on
  the sequence-free issue lane, with independent session/request/worktree state
  and no mutating-task progress/finalization lifecycle.
- Pinned OpenCode uses `model: openai/gpt-5.6-luna` and
  `reasoningEffort: high`; resolved last-match permissions, a wildcard deny,
  live built-in inventory, and exact MCP-resource tool flags enforce read-only
  operation.
- Developer handoff is exactly six fields: `Status`, `Handoff developer SHA`,
  `Files changed`, `Checks + perceived results`, `Blockers/decisions`, and `Task
  record`. The bridge transports the latest projected response without parsing
  those fields.
- Autonomous Project wake-up is not assumed. Every new MCP-ON turn reconciles
  the durable bound issue before further consequential action, so delayed or
  missed UI wake behavior cannot lose the handoff.
- `command.status`, `task.status`, and `scout.status` are UUID-idempotent,
  sequence-free public issue requests. They do not consume command progress or
  execute an underlying mutation.
- A stuck `applying` state gets one bounded status/task reconciliation against
  the service heartbeat and exact remote evidence. It is never reissued;
  unresolved state goes to operator stop/restart, which durably converts an
  interrupted operation to `indeterminate` before further action.
- Mapped terminal event insertion, durable cursor advancement, session-state
  update, and response-delivery creation share one SQLite transaction. Startup
  idempotently repairs a terminal event left without delivery by an older bridge.
- Scout per-session recovery starts immediately after its durable mapping and
  before prompt delivery, so an accepted prompt with an ambiguous HTTP result
  can still surface without replay or a service restart.
- Routing is one compact section in task context. The validator admits only
  task-ID-named regular Markdown context records with matching identity and a
  concrete `none`/Luna/Sol route; a second routing file and its duplicated refs
  are no longer created.
- Every MCP-ON turn groups all open control issues by authenticated task ID
  before creating one. One task ID has one canonical issue; recovery records
  related duplicates, identifies the durable binding from trusted lifecycle,
  reconstructs the highest accepted sequence, and posts nothing on later
  duplicates. Issue closure is a web-orchestrator decision; no bridge label gains
  semantic authority.
- A connector refusal before GitHub is not a bridge disposition. Recovery reads
  back the exact UUID, permits at most three total unchanged-envelope publication
  attempts, cancels a redundant unpublished status request when equivalent
  trusted evidence arrives, and refreshes once before a blocked/resume report.
- OpenCode `1.18.16` returns empty v2 history for legacy-created Scout sessions.
  Scout recovery therefore combines exact-workspace legacy SSE with a canonical
  status/message fallback that requires terminal lifecycle metadata, creates one
  stable event, never interprets Scout text, and never replays the prompt.
- Every authenticated parse-valid command rejected before ledger admission is
  durable by UUID, including the one-open-mutating-issue gate. Closing the active
  issue cannot make a previously rejected stale marker executable; a corrected
  command requires a fresh UUID at the still-expected sequence.

### Source trigger and dependency audit

| Existing group | Implemented Source | Co-trigger/dependency evidence |
| --- | --- | --- |
| shared evidence/authority + human boundaries + public-safe persistence | permanent router (not a Source) | These short rules apply in every mode and before every persistent or consequential action, so a separately triggered Source only duplicated always-visible policy. |
| shared task design/review reasoning + MCP-ON routing, orchestration state, task delegation, remote review, task review/steering | MCP-ON workflow | A normal implementation always designs one task, selects a route, persists state, delegates, interprets a handoff, reviews remotely, and either completes or steers; splitting these caused repeated loading. |
| MCP-ON repository scouting | MCP-ON scouting | Triggered only when broad/local exploration saves time; quick direct GitHub lookup and routine delegation do not require it. |
| MCP-ON delegation recovery + synchronization recovery | MCP-ON recovery | Both trigger on missing, ambiguous, failed, indeterminate, or unsynchronized state and share the stop/reconcile/no-replay boundary. |
| MCP-ON finalization review | MCP-ON finalization | Triggered only when repository durable-record policy requires post-substantive finalization. |
| MCP-ON main promotion | MCP-ON promotion | Triggered only by explicit human approval of one exact reviewed SHA and stays isolated from routine work. |
| MCP-OFF public navigation + remote review + task design without delegation | MCP-OFF workflow | All use the same public-web-only evidence path; review and bounded task preparation are normal outcomes of that mode and cannot perform delegation/state writes. |
| MCP-OFF repository scouting | MCP-OFF scouting | Triggered only when likely areas are unknown and must remain distinct from OpenCode Scout mechanics. |

### Post-smoke simplicity resolution

- A trusted unmatched permission/question is resolved before another progress,
  status, steer, or route command. An unexpected request is rejected by default;
  a consequential answer goes to the human. This prevents a visible developer
  wait from being misclassified as unexplained busy state.
- Routing state now lives in the task context that already owns task/ref/issue
  continuity. Existing Git history preserves legacy routing files; upgrades copy
  active route facts into `## Routing` and retire the duplicate file.
- Shared authority, public-persistence, `UNKNOWN`, and exact-SHA human boundaries
  are short and universally applicable, so they moved into permanent
  instructions and the separately triggered shared Source was removed.
- Package validation retains exact inventory/references, mode separation,
  executable command/request envelope shape, six-field response shape,
  continuity structure, and a small canonical safety core. It no longer treats
  dozens of editorial sentence fragments, an arbitrary router line limit, or a
  scenario-count string as protocol.
- SHA-256 identities remain where they authenticate, bind Git/OpenAPI integrity,
  or provide restart-stable deduplication. Generic OpenCode parity/PTY,
  sequenced-status compatibility, public projection, ledgers, exact-SHA guards,
  Scout isolation, and durable outbox ordering remain because the audit supplied
  no safe product/migration basis for their removal.

## Review findings

### Post-smoke completion and delivery resolution (2026-08-14)

- A self-contained credentialed smoke procedure exposed two Project-policy
  gaps: a turn could end while launched work was not yet absorbed, and three
  connector refusals could be mistaken for permission to abandon a required
  publication.
- The installed package now has one permanent completion barrier, one compact
  active-work ledger, and one pending-publication/refusal record. Three attempts
  bound a delivery window rather than the logical operation. A pending operation
  pauses only dependent work; the orchestrator continues meaningful independent
  work and retries another one-to-three times at later natural checkpoints. It
  never emits `RESUME REQUIRED` for connector delivery alone.
- Protocol payloads remain byte-identical for a UUID and uncertain mutations are
  never replayed. Only definitely unpublished ordinary issue prose may be
  shortened once without changing authorization, identity, scope, refs, or
  effect. Smoke-only parser, guard, PTY, routing, and cleanup probes remain
  outside normal Project instructions.

- The present package is safety-oriented but repeats procedure across permanent instructions and 19 Sources.
- The current bridge already persists and recovers OpenCode streams, so task handoff should reuse that path.
- The current developer five-field response omits an explicit handoff SHA and does not by itself distinguish a valid reviewable completion from every idle state.
- The current task `status` command reports session state, while recovery still lacks exact command-ledger lookup.
- The current single mutating-task model is compatible with unlimited read-only Scouts only if Scout sessions receive a separate non-mutating concurrency path.
- The sole GPT-5.6 Sol/max final review inspected developer
  `6127611113dfdb66f93a0cfd2d355359aa370833..b100942ecfc8049c5583276180043a99033bcc7b`
  and web
  `36adae35552c8e32ce8ee8f446aa586eec20b969..3cbab19abe96a937c0b95c890a714fa7a3681051`.
  It reported four blocking paths: non-atomic terminal delivery persistence,
  post-prompt Scout monitoring, task-routing files rejected by the validator,
  and a skill sentence assigning the SHA to `Status`. Independent inspection
  reproduced all four; focused regression checks now pass for their fixes. No
  second reviewer will be run.

### Sole reviewer finding dispositions

1. Terminal event/cursor/delivery gap — confirmed and fixed on `developer` by
   one atomic transaction plus idempotent startup repair for older persisted
   events; simulated callback-stop and older-state tests pass.
2. Ambiguous Scout prompt monitoring — confirmed and fixed on `developer` by
   registering recovery immediately after durable session mapping and before
   prompt delivery; the prompt is never replayed and the timeout regression
   passes.
3. Routing-record validator conflict — originally fixed by admitting task routing
   Markdown; the post-smoke simplification folds those fields into task context,
   eliminating the second per-task file while preserving route history.
4. Handoff-field contradiction — confirmed and fixed on `developer`: the skill
   assigns the commit to `Handoff developer SHA`, and agent-system validation
   rejects the obsolete `Status` wording.

## Implementation validation

- The post-smoke completion/delivery refinement passes the Project validator and
  all 20 focused tests on exact Node 22.13.0. Developer-owned cross-branch
  integration also passes against unchanged developer
  `be315eec10030b3d4499a05b823739a2631cb897`; the Project implementation is
  pushed at `623d274af172f012796b18dfc6dbf212e8b7a360`.

- Exact Node 22.13.0 final integrated validation at developer
  `6ff397fdb8aedf196401fff6cbe0497c47befa6c` and Project package
  `48ca0f2f5f2c39574a9fabd66c470ec2832be700` passed: bridge 71/71,
  branch initializer 8/8, Project 17/17, repository structure/agent/research,
  standalone package, and cross-branch schema/agent/transport/lifecycle checks.
- The deployed bridge restarted cleanly with exact runtime `1.18.16` and pinned
  OpenAPI compatibility. Bridge and OpenCode services are active and enabled;
  pending commands, requests, response deliveries, and outbox rows are all zero.
- Developer bridge/Scout behavior has 71 deterministic tests at the current
  candidate, including ledger-derived sequence, mutation freeze with recovery
  reads, restart-recomputed status requests, canonical pending-interaction
  repair, exact live version/hash compatibility, existing no-replay/delivery/
  projection/alias boundaries, and Scout isolation/concurrency.
- The Project package has 17 focused positive/negative tests and validates
  exactly seven Sources, separate MCP-ON/MCP-OFF workflows and scouting,
  five parsed command/request examples, installation/upgrade consistency,
  integrated routing continuity, pending-interaction priority, proportional and
  high-stakes evidence, and permanent human exact-SHA authority.
- A developer-owned cross-branch validator compares the supplied independent
  Project candidate to the developer command/request schemas, exact six-field
  response, developer/Scout agents, non-semantic response transport, and public
  lifecycle. It passes against Project-package handoff
  `d89b22a439047558ffccbda32a04b14a376b170a` and developer candidate
  `b100942ecfc8049c5583276180043a99033bcc7b`.
- Full repository validation plus cross-branch validation passed on exact Node
  22.13.0 before final review: bridge 56/56 and branch initializer 8/8. After
  all four fixes were pushed, exact Node 22.13.0 full integration passed at
  developer `bbb35d0c2b52a63e68bfe0df85df820b98ed416c` and web
  `bbd636d6591d556e3ab15a374b3c31e8d319b93a`: bridge 59/59, branch initializer
  8/8, Project 11/11, standalone package validation, and cross-branch contract
  validation. Developer `daf9b226a4dd87b4fc6741713fcd8a065e08bccf`
  adds only the completed tracked task-progress snapshot.
- No GitHub App private key/native ChatGPT account was available for a live issue
  round trip, and this migration forbids exercising its new Scout on itself.
  Deterministic doubles plus durable event/status recovery cover the complete
  conservative path; every new MCP-ON turn reconciles the bound issue, so
  correctness does not assume autonomous Project wake-up.
- A later credentialed smoke exposed one gap in that fallback: a fresh chat knew
  only that an issue was open and stopped before reconstructing its already
  terminal task. The Project now makes discovery universal, classifies the issue
  in recovery, resumes or safely retires it, and blocks only on unresolved
  ambiguity. This changes no bridge transport semantics or human authority.
- Credentialed issue #6 then exposed malformed input in the standalone smoke
  prompt, not a permissive bridge defect. Its Scout requests added `sha`, used a
  branch name for `ref`, and made `scope` an array; its start nested `expected`
  under `arguments`. The closed Project examples now state those placement/type
  rules explicitly. The bridge retains strict schemas, identifies unknown fields,
  and durably rejects a missing/misplaced mandatory top-level Git guard before it
  consumes sequence, so a corrected fresh UUID can still use sequence 1.
- Native GitHub connector policy rejected duplicate hidden markers and a
  multi-marker comment. UUID replay and same-source nonterminal serialization
  remain deterministically covered rather than being treated as mandatory live
  connector actions; this does not change their runtime contract.
- Credentialed issues #8/#9 then exposed two runtime gaps and one test-procedure
  gap. Legacy-created Scouts completed but v2 history remained empty; the bridge
  now recovered five historical sessions on controlled boot through exact-workspace
  and canonical lifecycle reads, with one user prompt per session. A guard start
  rejected only by the open-task gate later became eligible after issue closure;
  all parse-valid poller-gate rejections are now durable. Finally, a ChatGPT
  connector refusal of `task.status` was incorrectly treated as terminal test
  blockage even though no marker reached GitHub and equivalent developer evidence
  arrived later; the bounded readback/retry/supersession procedure above corrects
  that classification.
- Exact-minimum validation at that issue-#6 correction boundary passed bridge 62/62,
  branch initializer 8/8, Project 14/14, standalone package validation, full
  repository validation, and cross-branch compatibility at exact Project
  correction `ea61410057655d1ef916d3b895d7c0fe5bfbd715` and developer handoff
  `0352d354acb6a0430d585eaf25649b4fd808f59e`.
- The issue-#8/#9 correction passes the bridge's 65/65 deterministic tests and
  controlled boot recovery at pushed developer
  `d19fefae529ad411b6e32bd85e4165038903c980`. The Project validator now proves
  nine acceptance scenarios, and its 15/15 positive/negative tests pass on exact
  Node 22.13.0, including connector-gate recovery drift detection.
- Exact Node 22.13.0 full repository validation passes at developer evidence head
  `cb96f4dc094d1b6651bcdcac9b9def84f1e24788` against Project package correction
  `c241c8da8ffba1e50e2fafa4807621ae9d92babd`: bridge 65/65, branch initializer
  8/8, Project 15/15, static structure/agent/research checks, and cross-branch
  command/request/handoff/Scout/lifecycle compatibility all pass.
- Credentialed smoke issues #14/#15/#16 exposed a resume-identity defect: issue
  #15 already contained terminal evidence for the guard task, but the web chat
  created issue #16 with the same task ID, omitted #15 from its checkpoint, and
  reported a stale sequence. The Project now maps all open issues by exact task
  ID, reuses one canonical issue, posts nothing on a later duplicate, rebuilds
  the full journal and highest accepted sequence, and records related-issue
  dispositions. The bridge independently rejects duplicate-binding markers per
  issue without aborting its poll cycle or starving accepted work. Exact Node
  22.13.0 integrated validation passes at developer implementation candidate
  `2a4a6ce7c3e1587fc80bb8553fd85d6c67d1b147` against this correction's
  Project candidate `52ddf36e9bb08006db3a1fc35128f2ee3bdefc13`: bridge
  72/72, branch initializer 8/8, Project 18/18, and all cross-branch checks.
  Developer handoff `be315eec10030b3d4499a05b823739a2631cb897`
  adds only the completed task-progress snapshot.

## Steering issued

- The earlier idea of one shared orchestration workflow and one shared scouting workflow was rejected. Preserve distinct MCP-ON and MCP-OFF operating procedures while consolidating only genuine shared policy and same-mode co-trigger groups.
- Verification was clarified as proportional to size, complexity, and stakes. High-stakes work with manageable file volume requires direct GitHub inspection by the web orchestrator.
- Completion handling was clarified to reuse the bridge's event subscription plus a stronger OpenCode developer handoff contract; the bridge transports and projects the response while the web orchestrator interprets it.

## Unresolved questions

- None. All approved open implementation questions have one implemented,
  documented, and validated resolution.

## Human decisions required

- None before implementation; the corrected redesign is approved for implementation.
- Later review and explicitly approve the final exact pushed developer SHA from
  this correction before any promotion to `main`; this task does not promote.

## Migration notes

- The approved design baseline is `web-orchestration` SHA
  `36adae35552c8e32ce8ee8f446aa586eec20b969`. Developer bridge/Scout runtime
  and cross-branch integration Tasks 1, 2, and 4 are pushed through final
  developer candidate `daf9b226a4dd87b4fc6741713fcd8a065e08bccf`; the historical audited eight-Source Project
  package implementation was pushed at
  `b5504d37d5474e18ff36399f73abbfe08d20eb80` with its prior record snapshot at
  `d89b22a439047558ffccbda32a04b14a376b170a`; final integration reconciliation
  was reconciled at `141b2f49ceb483c68154f6b5e3685711d9bcd453`, the final-review
  validator fix is pushed at `bbd636d6591d556e3ab15a374b3c31e8d319b93a`,
  and the later live-smoke contract correction is pushed on `developer` through
  `0352d354acb6a0430d585eaf25649b4fd808f59e` and on `web-orchestration` at
  `ea61410057655d1ef916d3b895d7c0fe5bfbd715`; this metadata snapshot follows
  that Project-package correction without merging the histories.
- The issue-#8/#9 correction is implemented on `developer` through live-evidence
  commit `cb96f4dc094d1b6651bcdcac9b9def84f1e24788`; the minimal Project recovery
  correction is `c241c8da8ffba1e50e2fafa4807621ae9d92babd`. The external standalone
  smoke is superseded by v4, which adds bounded connector refusal recovery and a
  safe durable stale-marker probe. This record snapshot follows those independent
  implementation commits; neither history is merged into the other.

## Current next action

No implementation action remains. The human may run the corrected standalone
smoke in a fresh credentialed GitHub-MCP chat as an external observation, then
independently review and explicitly approve the final exact `developer` handoff
SHA before promotion. Do not run another commissioned reviewer or promote
`main` without that exact-SHA human approval.
