# Task context: WEB-ORCHESTRATOR-REDESIGN-001

- Continuity schema: agentic-bridge/1
- Task ID: WEB-ORCHESTRATOR-REDESIGN-001
- Status: Human-approved design fully implemented; all four bounded tasks pushed and final review pending
- Design approval: Human confirmed the corrected design in chat on 2026-08-13
- Human goal: Make the web orchestrator extremely fast and efficient while still completing the human's task, applying safety and thoroughness in proportion to the task, and preserving the genuinely different MCP-ON and MCP-OFF operating modes.
- Current orchestration objective: Finish cross-branch deterministic validation and publish synchronized branch candidates without promoting `main`.
- Task-start developer SHA: `6127611113dfdb66f93a0cfd2d355359aa370833`
- Last reviewed developer SHA: `2fb851149d9e2e1f65919a21a63603f049d7456c`
- Current handoff developer SHA: `2fb851149d9e2e1f65919a21a63603f049d7456c`
- Substantive implementation approval SHA: none
- Finalization handoff developer SHA: none
- Human-approved promotion SHA: none
- Human approval date/reference: none
- Verified post-promotion main SHA: none
- Verified post-promotion developer SHA: none
- Relevant repository refs: `developer` candidate `2fb851149d9e2e1f65919a21a63603f049d7456c`; `main` unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; `web-orchestration` integration reconciliation `141b2f49ceb483c68154f6b5e3685711d9bcd453` from design baseline `36adae35552c8e32ce8ee8f446aa586eec20b969` (this metadata-only snapshot follows it)
- Last orchestration mode: not established; this is design capture, not a bridge operation
- Bridge control issue: none
- Bridge control issue state: none
- Last bridge sequence: none
- Last bridge command: none

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

- The concrete trigger/dependency audit consolidates 19 Sources to eight: one
  shared safety/authority Source; separate MCP-ON normal workflow, scouting,
  recovery, finalization, and promotion Sources; and separate MCP-OFF web-only
  workflow and scouting Sources. Review/task-design detail moves into each mode
  because its mechanics differ. Recovery, finalization, and promotion remain
  exceptional rather than loading during routine work.
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

### Source trigger and dependency audit

| Existing group | Implemented Source | Co-trigger/dependency evidence |
| --- | --- | --- |
| shared evidence/authority + human boundaries + public-safe persistence | shared safety and authority | Same evidence honesty, disclosure, and human-authority rules apply in both modes and are consulted together before persistent or consequential action. |
| shared task design/review reasoning + MCP-ON routing, orchestration state, task delegation, remote review, task review/steering | MCP-ON workflow | A normal implementation always designs one task, selects a route, persists state, delegates, interprets a handoff, reviews remotely, and either completes or steers; splitting these caused repeated loading. |
| MCP-ON repository scouting | MCP-ON scouting | Triggered only when broad/local exploration saves time; quick direct GitHub lookup and routine delegation do not require it. |
| MCP-ON delegation recovery + synchronization recovery | MCP-ON recovery | Both trigger on missing, ambiguous, failed, indeterminate, or unsynchronized state and share the stop/reconcile/no-replay boundary. |
| MCP-ON finalization review | MCP-ON finalization | Triggered only when repository durable-record policy requires post-substantive finalization. |
| MCP-ON main promotion | MCP-ON promotion | Triggered only by explicit human approval of one exact reviewed SHA and stays isolated from routine work. |
| MCP-OFF public navigation + remote review + task design without delegation | MCP-OFF workflow | All use the same public-web-only evidence path; review and bounded task preparation are normal outcomes of that mode and cannot perform delegation/state writes. |
| MCP-OFF repository scouting | MCP-OFF scouting | Triggered only when likely areas are unknown and must remain distinct from OpenCode Scout mechanics. |

## Review findings

- The present package is safety-oriented but repeats procedure across permanent instructions and 19 Sources.
- The current bridge already persists and recovers OpenCode streams, so task handoff should reuse that path.
- The current developer five-field response omits an explicit handoff SHA and does not by itself distinguish a valid reviewable completion from every idle state.
- The current task `status` command reports session state, while recovery still lacks exact command-ledger lookup.
- The current single mutating-task model is compatible with unlimited read-only Scouts only if Scout sessions receive a separate non-mutating concurrency path.

## Implementation validation

- Developer bridge/Scout behavior has 56 deterministic tests covering exact
  sequence/nonterminal admission, applying/restart handling, status reads,
  response transport/retry, public projection, task-bound aliases, Scout
  permissions/exact-ref isolation/concurrency, and cross-task result isolation.
- The Project package has nine positive/negative tests and validates exactly
  eight Sources, separate MCP-ON/MCP-OFF workflow and scouting triggers, the
  command/request examples, installation/upgrade consistency, proportional and
  high-stakes review rules, human boundaries, and all seven acceptance examples.
- A developer-owned cross-branch validator compares the supplied independent
  Project candidate to the developer command/request schemas, exact six-field
  response, developer/Scout agents, non-semantic response transport, and public
  lifecycle. It passes against Project-package handoff
  `d89b22a439047558ffccbda32a04b14a376b170a` and developer candidate
  `2fb851149d9e2e1f65919a21a63603f049d7456c`.
- Full repository validation plus cross-branch validation passed on exact Node
  22.13.0: bridge 56/56 and branch initializer 8/8. The Project suite passed
  9/9 and its standalone validator passed on the same runtime.
- No GitHub App private key/native ChatGPT account was available for a live issue
  round trip, and this migration forbids exercising its new Scout on itself.
  Deterministic doubles plus durable event/status recovery cover the complete
  conservative path; every new MCP-ON turn reconciles the bound issue, so
  correctness does not assume autonomous Project wake-up.

## Steering issued

- The earlier idea of one shared orchestration workflow and one shared scouting workflow was rejected. Preserve distinct MCP-ON and MCP-OFF operating procedures while consolidating only genuine shared policy and same-mode co-trigger groups.
- Verification was clarified as proportional to size, complexity, and stakes. High-stakes work with manageable file volume requires direct GitHub inspection by the web orchestrator.
- Completion handling was clarified to reuse the bridge's event subscription plus a stronger OpenCode developer handoff contract; the bridge transports and projects the response while the web orchestrator interprets it.

## Unresolved questions

- None. All approved open implementation questions now have one implemented or
  selected resolution; remaining work is package implementation and integrated
  validation, not design choice.

## Human decisions required

- None before implementation; the corrected redesign is approved for implementation.
- Later approve the exact implementation SHA before any promotion to `main`.

## Migration notes

- The approved design baseline is `web-orchestration` SHA
  `36adae35552c8e32ce8ee8f446aa586eec20b969`. Developer bridge/Scout runtime
  and cross-branch integration Tasks 1, 2, and 4 are pushed through
  `2fb851149d9e2e1f65919a21a63603f049d7456c`; the audited eight-Source Project
  package implementation is pushed at
  `b5504d37d5474e18ff36399f73abbfe08d20eb80` with its prior record snapshot at
  `d89b22a439047558ffccbda32a04b14a376b170a`; final integration reconciliation
  is pushed at `141b2f49ceb483c68154f6b5e3685711d9bcd453` and this metadata-only
  snapshot follows it.

## Current next action

Rerun exact-head validation and run the single final read-only review. Do not
promote to `main` without later exact-SHA approval.
