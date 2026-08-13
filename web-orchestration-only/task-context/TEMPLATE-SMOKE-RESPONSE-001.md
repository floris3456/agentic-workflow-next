# Task context: TEMPLATE-SMOKE-RESPONSE-001

- Continuity schema: agentic-bridge/1
- Task ID: TEMPLATE-SMOKE-RESPONSE-001
- Human goal: Prevent a resumed web orchestration run from duplicating a task's control issue, and contain any duplicate safely in the bridge.
- Current orchestration objective: Validate and push concise one-task/one-issue discovery and recovery rules that complement the developer-side bridge repair.
- Task-start developer SHA: ccfa12dc2783c7e8fc336abc503e083b69112a71
- Last reviewed developer SHA: ee75d0bda6de1d17f120f8d6a8169906b2830e2b
- Current handoff developer SHA: ee75d0bda6de1d17f120f8d6a8169906b2830e2b
- Substantive implementation approval SHA: none
- Finalization handoff developer SHA: none
- Human-approved promotion SHA: none
- Human approval date/reference: none
- Verified post-promotion main SHA: none
- Verified post-promotion developer SHA: none
- Relevant repository refs: main 6127611113dfdb66f93a0cfd2d355359aa370833; developer ee75d0bda6de1d17f120f8d6a8169906b2830e2b; web-orchestration task start 04e111dd874c2f431805b52b3eb24c6b04de95b8
- Last orchestration mode: MCP-ON
- Bridge control issue: none; source-maintenance task
- Related control issues: disposable issues 14, 15, and 16 closed; issue 15 was the canonical guard and issue 16 was the rejected duplicate
- Bridge control issue state: none
- Highest accepted bridge sequence: none
- Last bridge command: none

## Routing

- Selected developer: none
- Luna substantive-attempt count: 0
- Selection route: none
- Reason: direct source maintenance after exact local and remote diagnosis
- Attempt classifications: none
- Route changes: none
- Result: bridge containment and web prevention implemented; integrated validation pending
- Retrospective: durable task-ID-to-issue identity must be reconstructed before phase state or remembered issue numbers are trusted

## Pending bridge command

- State: none
- Prepared at: none
- Command-comment ref: none
- Result-comment ref: none
- Exact one-line JSON envelope: none

## Bridge command journal

- none

## Scout request journal

- none

## Delegations issued

- none

## Review findings

- Disposable smoke issues 14 and 15 represented the main and original guard tasks; issue 16 repeated the exact guard task ID after its original guard evidence was already terminal.
- The saved checkpoint omitted issue 15, treated issue 16 as authoritative, and reported stale sequence state.
- Developer range ccfa12dc2783c7e8fc336abc503e083b69112a71..ee75d0bda6de1d17f120f8d6a8169906b2830e2b contains the bridge-side containment and regression.
- The permanent router now keeps only the one-task/one-canonical-issue invariant visible; detailed grouping, binding, duplicate cleanup, and sequence reconstruction remain in the MCP-ON workflow/recovery Sources.
- Standalone Project validation passed, and 18 package tests passed with one focused negative case for duplicate-task containment.

## Steering issued

- none

## Unresolved questions

- none

## Human decisions required

- none

## Migration notes

- The disposable smoke was cancelled rather than accepted; all three control issues are closed and no bridge queue remains pending.

## Current next action

Commit and push the web package, then run developer-owned cross-branch validation against its exact SHA.
