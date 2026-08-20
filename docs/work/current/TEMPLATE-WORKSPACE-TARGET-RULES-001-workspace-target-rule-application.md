# Template-maintenance task progress

## Task ID

TEMPLATE-WORKSPACE-TARGET-RULES-001

## Status

source complete; package and CI observation pending

## Task-start template-development SHA

2d36d96043a21550b1b4c23ba85678a5d4de5172

## Review-base template-development SHA

141cfac3051a4a420e34b743d69d08df556521f2

## Public-safe task brief

Clarify how Workspace Maintenance must treat the rules of a target branch without
losing its stable instruction authority.

Workspace Maintenance remains controlled by the `template-development` root, its
selected Workspace agent definition, the `workspace-maintenance` skill, and the
bounded web-orchestrator request. Target rules do not transfer controlling
instruction authority, but they are relevant evidence and compatibility/output
constraints when they apply to the branch state being produced.

Applicable target constraints include public safety, `main` authority,
synchronization, file placement/format, durable implementation truth, and relevant
validation. Target agent selection, target skills as procedure, target task
lifecycle, and target handoff shape do not automatically transfer.

If the task intentionally changes a target rule itself, Workspace reads the old
rule to understand existing behavior and impact, but that rule cannot veto its own
authorized modification.

Required examples:

1. **Adding a missing file:** follow applicable target placement, naming, format,
   durable-record, and validation requirements.
2. **Changing the rule for how a file is created:** read the existing rule, then
   make the bounded authorized rule change under Workspace authority; the old rule
   is evidence, not a veto.

## Current objective

Preserve the reviewed route-sensitive Workspace authority contract. No further
source mutation is planned unless later authoritative checks expose a defect.
Portable package generation and exact push-CI observation remain follow-up
evidence work.

## Current position

The authorized direct implementation is complete across `template-development`
and `web-orchestration`. `developer` was inspected as target evidence but did not
need source mutation for this task.

Exact reconciled source heads before this final task-progress snapshot:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833` — unchanged.
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68` — unchanged by this task.
- `web-orchestration`: `d642359993fc1d819517b3fc10e4e704810a03a7`.
- `template-development`: `e23182c7ec92a3413a575f1002ca97d8d9c22fcd` before this snapshot.

Implemented authority contract:

- Workspace keeps its stable template-development-rooted authority.
- Target instructions remain important evidence and applicable branch constraints.
- Workspace applies relevant target safety, main-authority, synchronization,
  file/output, durable-record, and validation requirements.
- Target agent/task/skill/handoff procedures do not automatically transfer.
- A target-specific durable record may be maintained as an output artifact without
  inheriting the target agent workflow.
- An old target rule cannot veto a bounded authorized task whose purpose is to
  change that rule.
- A Workspace-routed task has one Workspace handoff. Publishing a target such as
  `developer` does not require a second developer-agent handoff; the web reviewer
  reviews the exact pushed target SHA and applicable constraints independently.

No `main` mutation occurred.

## Source ranges

- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer`: unchanged by this task at `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`.
- `web-orchestration`: `3b534650f886bcd8b0644bcf8393f5b9ab48b4d2..d642359993fc1d819517b3fc10e4e704810a03a7`.
- `template-development`: `141cfac3051a4a420e34b743d69d08df556521f2..e23182c7ec92a3413a575f1002ca97d8d9c22fcd` before this final progress snapshot.

## Observed

- Workspace role isolation is intentional and protects against target instruction
  injection/authority transfer.
- Generic template-maintenance wording previously said source work followed each
  source branch's agent/task lifecycle regardless of execution route.
- Taken literally with the Workspace contract, that created an ownership loop for
  a Workspace-published `developer` change.
- The human confirmed the correct model is neither "ignore target rules" nor
  "inherit them strictly".
- Root, agent, skill, design, web-review, and validation surfaces now use the same
  stable-authority plus applicable-target-constraints distinction.
- The required missing-file and rule-change examples are present in the canonical
  Workspace procedure and durable design records.
- One Workspace handoff is now explicit in both Workspace and template-maintenance
  procedures.
- A new discovered Node test protects the authority distinction, both examples,
  and the one-handoff behavior.

## Interpretation

The previous deterministic authority conflict is removed. Workspace can now
produce branch-compatible output without allowing target instruction files to take
over its execution context.

This also gives the web reviewer a clear standard: review whether the exact target
state satisfies applicable target constraints, rather than demanding that
Workspace pretend to be the target branch's normal agent.

No developer-side source change was necessary because the defect was in the
Workspace/template-maintenance ownership contract, not in developer's own normal
workflow.

The remaining limitations are evidence/package execution limitations, not source
implementation blockers.

## Attempts

1. Read-only structural stress testing reproduced the ownership loop.
2. The human supplied the intended authority/compatibility distinction and two
   concrete examples.
3. The prerequisite small/heavy routing task was completed to a non-mutating
   source state.
4. Updated template root and both Workspace agents with the route-sensitive
   target-rule contract.
5. Updated `workspace-maintenance` with the canonical distinction, both examples,
   target-record-as-artifact rule, and one-handoff rule.
6. Updated repository-owned template-maintenance procedure so source-branch
   lifecycle rules are route-sensitive rather than universal.
7. Updated the web template-maintenance reviewer with the same route-sensitive
   contract and examples.
8. Updated durable workflow design and template AS-BUILT.
9. Added focused template and web regression coverage.
10. Independently compared exact template and web source ranges and reconciled
    `source-lock.json` from exact remote refs.

## Changed approach

No design change occurred after activation. Implementation stayed narrow: fix the
instruction ownership contract and protect it mechanically, without weakening
public safety, `main` authority, synchronization, durable truth, or validation.

## Checks

- Exact remote template source range
  `141cfac3051a4a420e34b743d69d08df556521f2..d06837b232f1a06313276d2c894a9556f86c0b41`
  independently compared: 10 commits affecting 10 intended files before the
  source-lock reconciliation commit.
- Exact remote web range
  `3b534650f886bcd8b0644bcf8393f5b9ab48b4d2..d642359993fc1d819517b3fc10e4e704810a03a7`
  independently compared: 2 commits affecting only the web template-maintenance
  skill and its Node test.
- `tests/workspace-target-rules.test.mjs` is tracked and is automatically reached
  by the existing `node --test tests/*.test.mjs` template validation command.
- `scripts/validate-template-development.mjs` requires the new test and checks the
  authority/target-rule/one-handoff boundaries.
- Web test coverage checks the same route-sensitive review rule and both examples.
- `source-lock.json` now records developer `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
  and web `d642359993fc1d819517b3fc10e4e704810a03a7` with this task as the last
  reconciled task.
- Canonical branch-push CI for these final exact heads is not observable through
  the currently exposed connected/public run lookup; no CI pass is claimed.
- Portable change-package generation has not run because the tracked generator
  still requires a legitimate networked maintainer execution surface.

## Blockers / required decisions

No human design decision or source correction is required.

Remaining non-source work:

- observe exact canonical push-CI results when an authoritative run view is
  available;
- generate the deterministic portable package when a legitimate networked
  maintainer execution surface is available.

Neither requires keeping this task as the active mutating template-maintenance
task.

## Remaining work

1. Observe canonical push-CI results for the final exact source heads when the run
   evidence is accessible.
2. Generate, validate, and review this task's deterministic change package on an
   authorized networked maintainer execution surface.
3. Finalize/archive the task after required package/evidence review.

## Next action

Treat Task 3 source work as complete and non-mutating. Do not make another source
change unless later authoritative checks expose a concrete defect.

## Relevant durable records

- `AGENTS.md` on `template-development`
- `.opencode/agents/workspace-maintainer.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/skills/workspace-maintenance/SKILL.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `web-orchestration-only/chatgpt-project/skill-template-maintenance.md`
- `web-orchestration-only/validate-package.test.mjs`
- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `scripts/validate-template-development.mjs`
- `tests/workspace-target-rules.test.mjs`
- `source-lock.json`

## Last handoff commit

None
