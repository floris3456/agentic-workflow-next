# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-TARGET-RULES-001

## Status

queued

## Task-start template-development SHA

2d36d96043a21550b1b4c23ba85678a5d4de5172

## Review-base template-development SHA

Not yet established. This task is queued and must establish a fresh exact remote
`template-development` review base immediately before activation and source
mutation.

## Public-safe task brief

Clarify how Workspace Maintenance must treat the rules of a target branch without
losing its stable instruction authority.

The Workspace Maintenance Agent must remain controlled by the
`template-development` root, its own agent definition, the `workspace-maintenance`
skill, and the web orchestrator's bounded request. Reading a target branch's
`AGENTS.md`, skills, agent files, or similar rule files must not transfer
instruction authority or automatically trigger the target branch's agent
workflow.

At the same time, target-branch rules are not irrelevant. When Workspace
Maintenance changes a specific branch, it must inspect and take applicable target
rules into account as compatibility/output requirements for the branch state it
is producing.

The intended distinction is:

- target instructions are evidence and applicable branch constraints, not the
  Workspace Maintenance Agent's controlling instruction authority;
- hard repository boundaries such as public safety, `main` authority, branch
  synchronization, file placement, durable implementation truth, and required
  validation still matter when applicable;
- target task/handoff/agent procedures do not automatically transfer merely
  because Workspace Maintenance edits that branch;
- if the task intentionally changes a target rule itself, the old rule is read to
  understand existing behavior but does not get authority to forbid the bounded
  requested change.

Required examples:

1. **Adding a missing file.** If Workspace Maintenance is asked to add a file that
   the target branch expects, it reads the applicable branch rules and follows
   their relevant placement/format/record/validation requirements when producing
   that file.
2. **Changing the rule for how a file is created.** If the web orchestrator asks
   Workspace Maintenance to change the rule itself, the agent reads the current
   rule as evidence of existing behavior, but executes the bounded orchestrator
   request under its own stable authority. The old target rule cannot veto its own
   authorized modification.

## Current objective

When activated, replace the current all-or-nothing wording with a precise
"stable authority + applicable target constraints" rule that gives both the
Workspace Maintenance Agent and web reviewer one clear ownership model.

## Current position

Planning-only task record. No source mutation has been made for this task.

Exact planning evidence:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: task record created from
  `2d36d96043a21550b1b4c23ba85678a5d4de5172`

Current instructions contain both sides of the conflict:

- Workspace Maintenance says target `AGENTS.md`, skills, agents, and instructions
  are inspectable evidence only and do not transfer instruction authority.
- Template-maintenance procedures say source work follows each source branch's
  own agent instructions, task lifecycle, AS-BUILT/deviation, synchronization,
  and validation requirements regardless of execution route.
- The developer branch normally requires its own task-progress lifecycle and
  developer-specific handoff snapshot/response.
- Workspace Maintenance explicitly owns a different branch-neutral handoff and is
  told not to inherit a developer-specific handoff merely because the target is
  `developer`.

## Source ranges

No task source ranges have started. Establish exact bases at activation.

Planning refs only:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `2d36d96043a21550b1b4c23ba85678a5d4de5172`

## Observed

- Workspace role isolation is intentional and protects against target branch
  instruction injection/authority transfer.
- The generic template-maintenance wording is also intentional in trying to keep
  source-branch implementation records and safety constraints correct.
- Taken literally together, they create an ownership conflict when Workspace
  Maintenance publishes a change to `developer`: one rule says not to inherit the
  developer workflow, while another says source branch task lifecycle applies
  regardless of route.
- A web steer telling Workspace Maintenance to follow developer instructions can
  itself violate the Workspace Maintenance authority contract.
- The human confirmed the right model is not "ignore target rules" and not
  "inherit them strictly". Applicable target rules must be taken into account,
  while the workspace role continues to execute under its own authority and the
  web-orchestrator request.

## Interpretation

The system needs to distinguish two concepts that are currently mixed together:

1. **Instruction authority** — which role/procedure controls what the agent does.
2. **Target compatibility obligations** — which properties the resulting branch
   state should satisfy when they are relevant to the requested change.

Workspace Maintenance keeps the first. It must reason about and normally honor
the second.

Target rules should be treated like other repository evidence: they can define
important expected outputs, checks, record locations, or invariants, but they do
not become higher authority than an explicit bounded request whose purpose is to
change those same rules.

## Attempts

1. A read-only structural stress test simulated Workspace Maintenance publishing
   a `developer` change while both roles followed their real instructions.
2. The simulation reached a deterministic ownership loop: workspace correctly
   refused target instruction authority, while template-maintenance review could
   correctly complain that developer lifecycle rules had not been followed.
3. The human accepted the issue and supplied the intended distinction plus two
   concrete examples, which are captured in this task before implementation.

## Changed approach

None. This is a newly queued maintenance task.

## Checks

Planning-only instruction/evidence review completed.
No implementation checks have run because no task source mutation has started.

## Blockers / required decisions

- No human design decision is currently required; the human has already stated
  the intended ownership model.
- This task must remain non-mutating until the currently active template-
  maintenance task is completed/finalized or the human explicitly reprioritizes
  the active task.

## Remaining work

1. Re-establish exact live refs and activate this task with a fresh review base.
2. Update template-development root/Workspace Maintenance instructions so stable
   workspace authority is preserved while applicable target rules are explicitly
   considered.
3. Update both repository-owned and web-orchestrator template-maintenance
   procedures to remove the misleading "follow every source branch workflow
   regardless of route" interpretation.
4. State exactly which target obligations remain hard/applicable by default:
   public safety, `main` authority, synchronization, relevant AS-BUILT/deviation
   truth, file/output constraints, and relevant validation.
5. State that target-specific agent/task/handoff procedures do not automatically
   transfer; if a target-specific record is needed for the resulting branch state,
   the workspace role may maintain it as an artifact under its own authority
   without inheriting that target agent's workflow.
6. Protect the two required regression scenarios: adding a missing file under
   applicable target rules, and deliberately changing the rule that governs file
   creation without letting the old rule block its authorized change.
7. Add a workspace-to-`developer` publication regression proving the web reviewer
   receives one unambiguous workspace handoff and does not demand a second
   developer-agent handoff.
8. Run authoritative checks, independently review exact ranges, package the change,
   and complete normal maintenance handoff.

## Next action

Remain queued. On activation, convert the human-approved distinction into the
smallest consistent rule shared by Workspace Maintenance and both template-
maintenance orchestrator procedures.

## Relevant durable records

- `AGENTS.md` on `template-development`
- `.opencode/agents/workspace-maintainer.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/skills/workspace-maintenance/SKILL.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `AGENTS.md` on `developer`
- `.opencode/skills/task-workflow/SKILL.md` on `developer`
- `.opencode/skills/implementation-records/SKILL.md` on `developer`
- `docs/architecture/agent-system.md`
- `docs/deviations.md`

## Last handoff commit

None
