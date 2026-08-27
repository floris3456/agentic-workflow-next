# Web orchestration workflow

## Trigger

Use for ordinary repository research, task/outcome design, route selection, implementation orchestration, review, steering, and completion.

## Establish the task

Clarify the requested outcome, success evidence, material scope, constraints, and human-owned decisions. Inspect exact repository evidence and relevant public sources. Use native ChatGPT web research for public external research; use Remote Desktop Commander when local worktree/OpenCode evidence or execution is needed.

The Orchestrator owns research: research questions/prompts, web investigation, research packages when useful, evidence review, and synthesis. Developer and Workspace Maintainer may consume research evidence but do not own the research workflow.

Use the smallest evidence set that supports a sound task. For Developer Dual work, understand the problem/outcome/constraints but leave deep implementation reconstruction and concrete implementation architecture to Lead.

For consequential work where durable instruction authority is useful, create or resume one canonical task record. Keep accepted outcome, scope, constraints, required outputs/checks, accepted design constraints, and explicit exceptions there. Tiny one-turn work may omit it. Use separate concise progress only when another session materially benefits from resumable state.

## Select owner and route

First classify what is being changed:

- **Workspace-level structure:** reusable or intentionally project-specific OpenCode configuration/agents/instructions/skills, orchestration instructions, workspace tooling/validation, repository/document/file layout and conventions, workspace architecture, or maintenance/package/source-lock machinery. This is Workspace Maintainer-owned in every worktree; load `skill-workspace.md` for an explicitly requested or human-approved task.
- **Actual project work:** product/source behavior, project implementation architecture/tests/content, or filling project documentation with current project facts. This is Developer-owned.
- **Direct orchestration/remote administration:** reserve for a tiny exact mutation that belongs to neither Workspace Maintainer nor Developer and can be checked simply.

For Developer work, **Dual is the default**. Use `small-developer` only for very simple bounded implementation with little meaningful testing/architecture; use `heavy-developer` only for difficult but genuinely bounded one-agent implementation; use Dual for all substantive work with interacting edits, meaningful tests, deeper current-state reasoning, architecture, or developer-side review.

Small and Heavy are independent shortcuts, not retry/escalation levels and never Spark substitutes inside Dual. If Dual is unavailable, reconcile existing work and make a fresh task-based decision rather than silently substituting another route.

Before mutation, establish the exact target branch/start SHA and read only the branch-owned instructions/durable records needed to constrain the selected route.

## Workspace concerns discovered during project work

If Developer reports a material workspace-level problem/opportunity, do not let Developer change workspace-owned structure inside the project task and do not silently reroute the current implementation.

Record a concise pending item in `task-context/workspace-backlog.md`: short title/ID, observed need, useful source/ref evidence, affected workspace surface, and whether reuse across projects is an interpretation rather than an established fact. The backlog is evidence for later human review, not authority to execute.

Let the current project task finish unless the workspace issue genuinely blocks correctness or safety. After completion, surface new pending items to the human. Only explicitly requested/approved items become Workspace Maintainer tasks.

## Execute and review

For direct work, re-read exact state immediately before writing, keep the mutation within the known tiny scope, and read back the resulting state.

For `small-developer` or `heavy-developer`, give one bounded project outcome, exact useful start state, material constraints, durable-truth obligations, required checks, and expected observable result. Review the exact result proportionally because there is no separate Lead reviewer.

For Dual, give Lead the accepted outcome, useful evidence, exact Git start state, material constraints, and relevant durable records. Lead is the developer brain: it owns deep current-state analysis, concrete implementation architecture, exact Spark direction, implementation review, and correction steering. Spark owns source implementation and implementation-level iteration inside Lead's design.

Do not copy/redefine the Lead/Spark internal procedure here. Their repository agent instructions govern that loop. Do not require Spark to paste a full diff as routine evidence; Lead can inspect the repository diff directly.

After any Developer route reports completion, independently verify the exact result against the accepted outcome, affected system/architecture, relevant checks, durable implementation truth, and unresolved risk. If correction is needed, keep the same route unless new evidence materially changes ownership/scope or proves it unavailable. If a mutation becomes uncertain, stop ordinary routing and use recovery.

## Completion

Verify branch-owned AS-BUILT/deviation records remain truthful where implemented facts changed; do not maintain a second Orchestrator copy of their rules. Do not add packaging, archival, snapshots, push-every-commit, or finalization ceremony unless the accepted task requires it.

Completion requires exact evidence for the requested outcome and relevant safety/system conditions, all launched mutating work reconciled, and any material remaining risk/human decision stated clearly. After project work completes, surface new pending workspace-backlog items for human decision. `main` promotion remains a separate human-triggered procedure.
