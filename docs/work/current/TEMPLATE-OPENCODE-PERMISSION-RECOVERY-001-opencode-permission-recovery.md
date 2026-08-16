# Task progress

## Task ID
TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001

## Status
In progress

## Task-start developer SHA
29d59fb15bbdd31b59205c691deb4ddd167ade78

## Review-base developer SHA
29d59fb15bbdd31b59205c691deb4ddd167ade78

## Original task brief
Implement the developer-side source work for TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001 from exact guarded developer SHA 29d59fb15bbdd31b59205c691deb4ddd167ade78. Follow root AGENTS.md and all triggered repository skills. Investigate repeat-canary run-03 as evidence, then use the pinned OpenCode 1.18.16 configuration/permission contract rather than guessing syntax. Required outcomes: (1) normal filesystem/shell work inside the exact configured developer repository root is pre-authorized and should not surface unnecessary external_directory approvals; (2) genuine access outside that exact worktree remains approval-gated and visible to the orchestrator, including bridge/local-runtime maintenance when explicitly needed; broad parent-directory access must not be silently allowed; (3) strengthen the small-developer instructions so repository tasks do not walk parent directories to rediscover the repository and do not widen scope when a path is missing; (4) after permission.reply or question.reply, add bounded automatic same-session continuation recovery when the mapped live developer session has no outstanding interactions and remains non-progressing: at most one idempotent continuation nudge per resolved-interaction episode, never replay start, never create a replacement session, never change scope, and publish public-safe recovery evidence so clean versus recovered completion is distinguishable; (5) fail closed if session/interactions/state cannot be proven safe; (6) preserve question/permission semantics, no-replay behavior, Scout isolation, and human-only promotion authority. Add focused tests for contained-path permission behavior, outside-worktree approval preservation, parent-walk guidance/validation as appropriate, one-shot post-interaction recovery, no recovery while interactions remain outstanding, no duplicate nudge, and no new session/start replay. Update protocol/README/AS-BUILT/deviations where material. Run proportional repository checks, push every commit, create/push the dedicated developer handoff snapshot, and return exactly the canonical six-field developer response. Do not modify main or web-orchestration and do not finalize/archive the task record in this working cycle.

## Current objective
Implement the bounded developer-side permission configuration, repository-scope guidance/validation, and same-session post-interaction recovery contract without weakening approval, isolation, replay, or promotion boundaries.

## Current position
Task record created on synchronized `developer` at the guarded task-start SHA. Evidence and pinned OpenCode contract inspection are next.

## Observed
- `developer` and `origin/developer` both resolve to `29d59fb15bbdd31b59205c691deb4ddd167ade78`.
- Tracked workflow hooks pass `./scripts/bootstrap-agent-workflow.sh --check`.
- Existing repeat-canary task records are present under `docs/work/current/`.

## Interpretation
The implementation must be made against the existing bridge/runtime source and its durable records; no branch other than `developer` is part of this local task.

## Attempts
None yet.

## Changed approach
None.

## Checks
- Initial synchronization: clean `developer` worktree at the guarded SHA; remote matches local.
- `./scripts/bootstrap-agent-workflow.sh --check`: passed.

## Blockers / required decisions
None currently.

## Remaining work
- Inspect repeat-canary run-03 evidence and the pinned OpenCode 1.18.16 contract.
- Trace current permission, interaction reply, recovery, scope guidance, tests, and records.
- Implement and document the bounded changes.
- Run focused and proportional checks, review the full diff, and push commits immediately.
- Create and push the dedicated handoff snapshot without archiving/finalizing this task record.

## Next action
Read run-03 evidence, repository architecture/source records, and OpenCode configuration/permission references.

## Relevant durable records
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/deviations.md`
- `docs/work/current/ADAPTER-REPEAT-03-CFFD06DD595E-repeat-canary.md`
- `research/WORKFLOW.md`

## Last handoff commit
None
