# Task progress

## Task ID

BRIDGE-SCOUT-RECOVERY-001

## Status

In progress

## Task-start developer SHA

`cce2ffa217233c0637d7413f40e3ebdbe0b33bcf`

## Review-base developer SHA

`cce2ffa217233c0637d7413f40e3ebdbe0b33bcf`

## Original task brief

You must fix all of these issues properly. After you are done you will write an exact prompt I will use in another chat to review your work. The chat will also be started in ~/Projects/Active.

## Current objective

Correct live Scout completion transport and recovery without replaying Scout prompts, preserve the bridge's transport-only boundary, reconcile the failed disposable smoke safely, and keep developer/web contracts aligned.

## Current position

The failed main smoke was aborted terminally at sequence 5 and issues #8 and #9 are closed; no labeled control issue remains open. The implementation is pushed at `d19fefae529ad411b6e32bd85e4165038903c980`, deployed, and recovered all five historical Scouts on controlled restart without prompt replay. Focused and full bridge validation passes. Web-package alignment and final integrated validation remain.

## Observed

- `origin/developer` and local `developer` are synchronized at the task-start SHA.
- `origin/main` remains `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `origin/web-orchestration` is `9684e86b2a5965073137e4c66269c7ddeb249009`.
- Canonical `task.status` succeeded on issue #8, so a later connector refusal did not reach or implicate the bridge.
- The pinned runtime exposes completed Scout assistant messages but returns empty v2 per-session history for the legacy-created Scout sessions.
- The bridge's main workspace legacy event stream delivered the developer idle response; Scout worktree sessions have only v2 per-session monitoring and therefore missed terminal delivery.
- A command rejected only because another mutating control issue was open was not durably recorded by UUID/marker; after that issue closed, the stale comment became executable.
- The implemented Scout monitor combines v2 session recovery, exact-workspace legacy SSE, and canonical lifecycle/message reads. Canonical completion requires exact-session completed assistant metadata plus terminal finish/error and never examines response text.
- Poller-level parse-valid rejections now enter the existing `command_rejections` ledger before publication, so rescans return the original rejection and a corrected attempt requires a fresh UUID.

## Interpretation

Scout launch and execution succeeded. The bridge recovery implementation selected an upstream event surface that is empty for the legacy session API used by Scouts and lacks a workspace-scoped legacy/canonical completion fallback. Separately, transient issue-level admission rejection must be made durable so a previously rejected command marker cannot become eligible on a later scan. The connector refusal remains an orchestration-procedure concern.

## Attempts

- Read-only live inspection confirmed all three Scouts produced completed final assistant messages.
- Read-only v2 history checks returned zero events for both Scout and developer legacy sessions.
- Read-only sync-history inspection confirmed versioned work events exist but do not provide the terminal idle event required by the current delivery trigger.
- Issue #8 abort sequence 5 succeeded. Closing it caused issue #9's stale guard marker to be admitted; exact-SHA validation failed it terminally and the ledger confirms zero mapped guard developer sessions.

## Changed approach

The implementation scope now also includes durable suppression/status visibility for transient issue-level admission rejection. This was added from direct live evidence rather than hidden as test cleanup.

## Checks

- GitHub issue #8 comment/authorship/correlation inspection: canonical status and developer idle response verified.
- SQLite ledger inspection: commands 1-4 terminal; three Scouts `starting`, no projected responses.
- Loopback OpenCode read-only inspection: each Scout has a completed final assistant response; v2 history is empty.
- GitHub cleanup: issue #8 abort `a8f77f2b-673c-4b4d-bc85-334d69f1a078` succeeded; issues #8 and #9 closed; no open `agentic-bridge` issue remains.
- Guard safety: stale command terminally failed on SHA mismatch; mapped developer-session count remained `0`.
- `npm run build`: passed.
- Focused recovery/protocol suite: 22/22 passed.
- Full bridge suite first run: 64/65 passed; the sole failure was order-sensitive test output, not behavior. After correcting the assertion to compare the unordered durable-delivery set, the full suite passed 65/65.
- Commit `d19fefae529ad411b6e32bd85e4165038903c980` pushed to `origin/developer`; the hook's proxy failure and one transient GitHub 500 were followed by a successful unchanged push.
- Exact Node 22.13.0 build passed; controlled bridge restart returned `active` and `enabled`.
- Live boot recovery: five Scout mappings became `session.idle`, five projected responses appeared on issues #4/#8/#9, response deliveries pending `0`, outbox pending `0`, canonical-recovery events `5`.
- No-replay check: all five recovered OpenCode sessions contain exactly one user message.

## Blockers / required decisions

None.

## Remaining work

- Coordinate the Project recovery instructions and validators on `web-orchestration`.
- Run exact-runtime full repository and cross-branch validation.
- Push durable evidence and final handoff snapshots.

## Next action

Implement the minimal Project connector-recovery clarification and validator coverage on `web-orchestration`.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/design-record.md`
- `contracts/opencode-bridge/protocol.md`
- `docs/work/current/BRIDGE-FULL-SMOKE-20260813T132120Z-AJW6OL-bridge-full-smoke.md`

## Last handoff commit

`d19fefae529ad411b6e32bd85e4165038903c980`
