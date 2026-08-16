# Task progress

## Task ID
TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status
In progress

## Task-start developer SHA
80ad63319cd746d6205d67781b25e3c327b230bc

## Review-base developer SHA
80ad63319cd746d6205d67781b25e3c327b230bc

## Original task brief
Implement the narrow developer correction for TEMPLATE-OPENCODE-FAST-COMPLETION-001 from exact guarded developer SHA 80ad63319cd746d6205d67781b25e3c327b230bc. Follow root AGENTS.md and all triggered repository skills. Current defect: after permission.reply/question.reply, a same-session continuation can resume and complete normally before the bridge takes its first post-reply proof; OpenCode removes idle sessions from session.status, so current inactive/unchanged-for-one-second logic can falsely nudge an already-completed task. Fix the logic with the smallest robust design: establish post-reply progress/completion relative to evidence captured before the reply or another exact terminal completion signal. Do not merely lengthen the grace interval. Preserve existing one-shot durable claim-before-delivery, same mapped session and agent, no start replay, no replacement session, no route/scope change, outstanding-interaction block, malformed/unavailable proof fail-closed, and clean/recovered public outcome semantics. Add focused regression coverage for reply -> normal same-session continuation starts and finishes before the first recovery observation -> clean/no nudge, plus keep existing transient-idle, live-activity, stable-stall, outstanding-interaction, duplicate/restart, and no-new-session coverage. Prefer changes only where required in bridge recovery/command/state/tests/docs/task records. Run focused recovery tests, full bridge tests, agent-system validation, bridge validation, repository validation, and git diff --check as proportional. Push every commit, create/push the required developer handoff snapshot, and return exactly the canonical six-field developer response. Do not modify main or web-orchestration.

## Current objective
Correct post-reply recovery proof so a normal same-session continuation that completes before the first recovery observation is recognized as clean, without weakening the existing durable one-shot recovery and safety boundaries.

## Current position
Task record created at the guarded synchronized developer SHA. Existing bridge recovery implementation and its prior correction records are available for focused inspection; no implementation changes have been made yet.

## Observed
- `developer` is checked out and matched `origin/developer` at `80ad63319cd746d6205d67781b25e3c327b230bc`.
- The tracked workflow hooks are active.
- The prior permission-recovery task records document the current bounded grace/recheck logic and its existing regression coverage.

## Interpretation
The current proof likely treats a missing `session.status` entry or unchanged inactive observation as sufficient after the reply. The correction must compare against pre-reply evidence or use an exact terminal completion signal, while preserving the existing mapped-session, interaction, claim, and fail-closed boundaries.

## Attempts
None yet.

## Changed approach
None.

## Checks
- Initial branch synchronization and cleanliness: passed; local `developer` and `origin/developer` resolve to the guarded SHA.
- `./scripts/bootstrap-agent-workflow.sh --check`: passed.

## Blockers / required decisions
None.

## Remaining work
- Inspect the bridge recovery, command, state, and focused tests.
- Implement the smallest robust post-reply progress/completion proof and regression coverage.
- Update AS-BUILT or applicable deviation records if implementation facts change.
- Run the requested checks, push each commit immediately, and create the final handoff snapshot.

## Next action
Trace permission/question reply state and recovery observations, then design the pre-reply evidence comparison around the existing durable recovery claim.

## Relevant durable records
- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/deviations.md`
- `docs/work/current/TEMPLATE-OPENCODE-PERMISSION-RECOVERY-001-opencode-permission-recovery.md`

## Last handoff commit
None
