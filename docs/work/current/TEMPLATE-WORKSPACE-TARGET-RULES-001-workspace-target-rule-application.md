# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-TARGET-RULES-001

## Status

in_progress

## Task-start template-development SHA

2d36d96043a21550b1b4c23ba85678a5d4de5172

## Review-base template-development SHA

141cfac3051a4a420e34b743d69d08df556521f2

## Public-safe task brief

Clarify how Workspace Maintenance must treat the rules of a target branch without
losing its stable instruction authority.

The Workspace Maintenance Agent must remain controlled by the
`template-development` root, its selected Workspace Maintenance agent definition,
the `workspace-maintenance` skill, and the web orchestrator's bounded request.
Reading a target branch's `AGENTS.md`, skills, agent files, or similar rule files
must not transfer instruction authority or automatically trigger the target
branch's agent workflow.

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

Replace the current all-or-nothing wording with one precise rule shared by the
Workspace agents, Workspace skill, template-maintenance procedures, and web
reviewer: stable Workspace authority plus applicable target compatibility/output
constraints.

## Current position

The human explicitly authorized the web orchestrator to implement this task
directly after the small/heavy routing source work became non-mutating.

Exact refs at activation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
- `web-orchestration`: `3b534650f886bcd8b0644bcf8393f5b9ab48b4d2`
- `template-development`: `141cfac3051a4a420e34b743d69d08df556521f2`

No `main` mutation is authorized. Developer branch instructions are target
evidence for this design, not a new developer source-mutation requirement unless
review finds a developer-owned fact that actually must change.

## Source ranges

Task source ranges begin from the activation refs above. Final reviewed heads are
not yet established.

## Observed

- Workspace role isolation is intentional and protects against target branch
  instruction injection/authority transfer.
- Generic template-maintenance wording currently says source work follows each
  source branch's own agent/task lifecycle regardless of execution route.
- Taken literally with the Workspace contract, that creates an ownership loop for
  a Workspace-published `developer` change: Workspace must not inherit developer
  workflow authority, while generic maintenance appears to require it.
- The human confirmed the right model is neither "ignore target rules" nor
  "inherit them strictly". Applicable target rules must be taken into account,
  while Workspace continues under its own authority and the bounded web request.
- Small/heavy routing is now a separate completed source contract and does not
  change this authority distinction.

## Interpretation

The system must distinguish:

1. **Instruction authority** — which role/procedure controls what Workspace does.
2. **Target compatibility/output obligations** — properties the resulting target
   branch state should satisfy when relevant to the requested change.

Workspace keeps the first. It must inspect and normally honor the second.

Applicable target constraints include public safety, `main` authority,
synchronization, file/output placement and format, durable AS-BUILT/deviation
truth, and relevant validation/check requirements. Target agent selection, target
skills as controlling procedure, target task lifecycle, and target handoff shape
do not automatically transfer.

A target record may still need to be created or updated because the produced
branch state requires that durable artifact. Workspace may maintain that artifact
under Workspace authority without pretending to become the target branch's agent.

If the bounded task intentionally changes a target rule itself, Workspace reads
that rule to understand the current behavior and compatibility impact, but the old
rule cannot veto its own authorized modification.

## Attempts

1. Read-only structural stress testing simulated Workspace Maintenance publishing
   a developer change while both roles followed their real instructions.
2. The simulation reached a deterministic ownership loop between Workspace
   authority isolation and generic source-lifecycle wording.
3. The human accepted the issue and supplied the intended distinction plus two
   concrete examples.
4. The prerequisite small/heavy routing task was completed to a non-mutating
   source state before this task was activated.

## Changed approach

This task is now active with the human-approved authority/compatibility
separation as its fixed design direction.

## Checks

Activation refs independently re-read before source mutation.
No implementation check is claimed yet.

## Blockers / required decisions

No human design decision remains. No destructive action or `main` mutation is
authorized.

Portable package generation remains a later networked-maintainer step and does
not block source correction/review.

## Remaining work

1. Update template-development root and both Workspace agent instructions so
   stable Workspace authority is preserved while applicable target constraints
   must be read and applied to output.
2. Update `workspace-maintenance` with the authority/compatibility distinction,
   including both required examples and explicit non-transfer of target
   agent/task/handoff procedures.
3. Update repository-owned and web template-maintenance procedures so generic
   source-branch lifecycle wording is route-sensitive rather than universal.
4. Update durable design/AS-BUILT records where they describe this authority
   contract.
5. Add mechanical regression coverage for missing-file compatibility, authorized
   rule modification, and one Workspace handoff without a second developer-agent
   handoff.
6. Independently review exact changed ranges and reconcile source snapshot.
7. Record source-complete/package-pending state and continue to the next authorized
   task only after this one is non-mutating.

## Next action

Read the current Workspace and template-maintenance authority surfaces together,
then apply the smallest wording/test change that gives them one consistent
ownership model.

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
- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`
- `scripts/validate-template-development.mjs`
- `tests/workspace-maintenance.test.mjs`

## Last handoff commit

None
