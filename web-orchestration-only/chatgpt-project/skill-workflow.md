# Web orchestration workflow

## Trigger

Use for ordinary repository research, task/outcome design, route selection, implementation orchestration, review, steering, and completion.

## Establish the task

Clarify the requested outcome, success evidence, material scope, constraints, and human-owned decisions. Inspect exact remote repository evidence and relevant public sources.

The Orchestrator owns research: research questions/prompts, web investigation, research packages when useful, evidence review, and synthesis. Developer and Template Maintainer may consume research evidence but do not own the research workflow.

Use the smallest evidence set that supports a sound task. For Developer Dual work, understand the problem/outcome/constraints but leave deep implementation reconstruction and concrete implementation architecture to Lead.

For consequential work where durable instruction authority is useful, create or resume one canonical task record. Keep accepted outcome, scope, constraints, required outputs/checks, accepted design constraints, and explicit exceptions there. Tiny one-turn work may omit it. Use separate concise progress only when another session materially benefits from resumable state.

## Select the owner and route

First classify what is being changed:

- **Reusable template structure:** OpenCode config/agents/instructions/skills, template tooling/validation, template architecture/conventions, template-owned docs/file layout, or package/source-lock machinery. This is Template Maintainer-owned in every worktree; load `skill-template-maintenance.md` after human approval.
- **Actual project work:** product/source behavior, project-specific implementation/tests/content, or filling project documentation with current project facts. This is Developer-owned.
- **Direct web/GitHub:** reserve for a tiny exact orchestration/remote-administrative mutation that is neither template maintenance nor project implementation and whose result can be checked simply.

For Developer work, **Dual is the default**. Use a shortcut only when the task itself clearly justifies avoiding Dual:

- `small-developer`: very simple, bounded implementation with little/no meaningful testing or architectural reasoning.
- `heavy-developer`: difficult/subtle/important implementation that is still genuinely bounded enough for one developer to own end-to-end.
- `dual`: all substantive work with interacting edits, meaningful tests, deeper current-state reasoning, architecture, or developer-side review.

Small and Heavy are independent shortcuts, not retries/escalation levels and never Spark substitutes inside Dual. If Dual is unavailable, reconcile existing work and make a fresh task-based decision rather than silently substituting another route.

Before mutation, establish the exact target branch/start SHA and read only the branch-owned instructions/durable records needed to constrain the selected route.

## Template concerns discovered during project work

If a Developer reports a material reusable-template problem/opportunity, do not let the Developer change template-owned structure inside the project task and do not silently reroute the current implementation.

Record a concise pending item in `task-context/template-maintenance-backlog.md`: short title/ID, observed need, useful source/ref evidence, and affected template surface. The backlog is evidence for later human review, not authority to execute.

Let the current project task finish unless the template issue genuinely blocks correctness or safety. After project completion, surface each new pending item to the human and ask whether to start template maintenance. Only human-approved items become Template Maintainer tasks; rejected items are marked rejected rather than executed.

## Execute and review

For direct work, re-read the exact remote ref immediately before writing. Keep the mutation within the known tiny scope and read back the resulting remote ref and changed content/range.

For `small-developer` or `heavy-developer`, give one bounded project outcome, exact useful start state, material constraints, durable-truth obligations, required checks, and expected observable result. Review the exact remote range proportionally because there is no separate Lead reviewer.

For Dual, give Lead the accepted outcome, useful evidence, exact Git start state, material constraints, and relevant durable records. Lead is the developer brain: it owns deep current-state analysis, concrete implementation architecture, exact Spark direction, implementation review, and correction steering. Spark owns source implementation and implementation-level iteration inside Lead's design.

Do not copy/redefine the Lead/Spark internal procedure here. Their repository agent instructions govern that loop. Do not require Spark to paste a full diff as routine evidence; Lead can inspect the repository diff directly.

After Dual reports developer-side completion, independently verify the exact remote result against the accepted outcome, affected system/architecture, relevant check evidence, durable implementation truth, and unresolved risk. Do not routinely duplicate Lead's line-by-line implementation review.

If correction is needed, use the same selected route unless new evidence materially changes task ownership/scope or proves the route unavailable. If any mutation becomes uncertain, stop ordinary routing and use recovery.

## Completion

Verify branch-owned AS-BUILT/deviation records remain truthful where implemented facts changed; do not maintain a second Web copy of their rules. Do not add packaging, archival, snapshots, push-every-commit, or finalization ceremony unless the accepted task requires it.

Completion requires exact evidence for the requested outcome and relevant safety/system conditions, all launched mutating work reconciled, and any material remaining risk/human decision stated clearly. After a project task is complete, surface any new pending template-maintenance backlog items for human decision. `main` promotion remains a separate human-triggered procedure.
