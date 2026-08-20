# Template-maintenance task progress

## Task ID

TEMPLATE-ROLE-ROUTING-CONTRACT-001

## Status

in_progress

## Task-start template-development SHA

448f7a74f14f32a051b60eefd375812664393ed6

## Review-base template-development SHA

2e68078f542b811540e945ce6094e2d7841ac5f3

## Public-safe task brief

Create one canonical role-selection contract across the web orchestrator, bridge
protocol, concrete OpenCode agent inventory, branch-specific agent instructions,
architecture, and validators.

All routing language must use only `small` and `heavy`. Do not use model/provider
names as routing vocabulary or explanatory routing labels. Concrete agent files
may retain whatever runtime configuration they need internally, but their
instructional prose and the cross-branch routing contract must describe their
role only as small/heavy.

The web orchestrator owns route selection. Implementation/workspace agents do not
choose or recommend their own escalation.

The bridge protocol already uses `small|heavy`; web instructions, continuity,
validators, and branch-specific agent instructions must align with that contract.
Every selector must resolve to one exact tracked agent that exists on the relevant
branch.

Preferred smallest direction:

- developer `small` -> existing small developer agent;
- developer `heavy` -> existing heavy developer agent;
- workspace `small` -> existing small workspace maintainer agent;
- workspace `heavy` -> existing workspace maintainer agent;
- do not rename agent files merely for cosmetic consistency when a mapping change
  is sufficient and safer.

## Current objective

Remove routing-language drift and make small/heavy the only routing vocabulary
through the full path:

web decision -> public command -> bridge schema -> bridge mapping -> tracked
agent instructions/inventory.

## Current position

The human explicitly authorized the web orchestrator to implement this task
directly after the handoff-reasoning source work became non-mutating.

Exact refs at activation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `cc5a521c70f4198947ec0360cf60cb95876dff3b`
- `template-development`: `2e68078f542b811540e945ce6094e2d7841ac5f3`

Expected source authorities:

- `web-orchestration`: routing prose, command example, task continuity, package
  validator/tests;
- `developer`: bridge concrete mapping, developer agent instruction prose,
  protocol/architecture/integration checks where they encode the contract;
- `template-development`: workspace agent instruction prose, workspace/maintenance
  architecture and validators where they encode the contract.

No `main` mutation is authorized.

## Source ranges

Task source ranges start from the activation refs above. Final reviewed heads are
not yet established.

## Observed

- The bridge command schema uses only `small|heavy`.
- The web workflow still uses a different routing vocabulary and its start command
  example does not match the bridge selector contract.
- The web task-context template and standalone validator repeat the old routing
  vocabulary.
- The bridge heavy workspace mapping points to a concrete agent name that is not
  present in the tracked template-development agent inventory.
- Some branch-specific agent descriptions/prose still describe implementation
  roles through runtime/model specifics instead of the small/heavy role contract.
- Architecture records also contain obsolete routing/model descriptions that can
  confuse future maintenance even when runtime code is correct.
- The human explicitly requires no model-specific routing language for now: only
  small/heavy.

## Interpretation

Role selection is one cross-branch contract. The user-facing and instruction-level
selector vocabulary should remain stable even if runtime implementation details
change later.

Concrete file names do not have to match public selector words if the bridge owns
an explicit, validated mapping. Renaming stable agent files purely for naming
symmetry would add unnecessary compatibility risk.

## Attempts

1. A read-only role/handoff stress test compared web instructions, bridge schema,
   runtime mapping, architecture, and current agent inventories.
2. The test found deterministic selector mismatch and a missing heavy workspace
   mapping target.
3. The human accepted the issue, required small/heavy-only language, and
   authorized direct implementation.

## Changed approach

The earlier planning record allowed model names as descriptions. The human has
now tightened the desired contract: instruction/routing language should use only
small/heavy. Runtime configuration fields may remain internal implementation
configuration where required by OpenCode, but they must not define or explain
routing semantics.

## Checks

Planning evidence reviewed against exact activation refs.
Implementation checks have not yet run.

## Blockers / required decisions

- No human design decision remains for this task.
- No `main` or destructive action is authorized.
- Portable package generation remains a later networked-maintainer step and does
  not block source correction/review.

## Remaining work

1. Change web workflow routing prose and start example to small/heavy only.
2. Change web task continuity and validator/tests to small/heavy only.
3. Change branch-specific developer/workspace agent instructional prose so their
   role identity is small/heavy without model-specific explanation.
4. Fix the bridge heavy workspace mapping to the existing tracked workspace
   maintainer rather than inventing a missing role.
5. Update architecture/protocol/integration validation where they encode obsolete
   role-selection or concrete-mapping facts.
6. Add cross-branch regression coverage proving current web command values are
   schema-valid and every bridge mapping points to an actual tracked agent.
7. Run authoritative branch checks where observable and independently review the
   exact ranges on all changed branches.
8. Mark source work complete/package pending, then activate the authorized
   Workspace target-rule task.

## Next action

Inspect every current small/heavy selector consumer and concrete agent mapping,
then publish the smallest cross-branch correction without renaming stable agents
unless exact evidence makes a rename necessary.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/task-context/TEMPLATE.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `contracts/opencode-bridge/command.schema.json`
- `contracts/opencode-bridge/protocol.md`
- `tools/opencode-bridge/src/commands.ts`
- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/agents/workspace-maintainer.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/AS-BUILT.md` on `template-development`
- `scripts/validate-web-orchestrator-integration.mjs`
- `scripts/validate-template-development.mjs`

## Last handoff commit

None
