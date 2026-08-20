# Template-maintenance task progress

## Task ID

TEMPLATE-ROLE-ROUTING-CONTRACT-001

## Status

queued

## Task-start template-development SHA

448f7a74f14f32a051b60eefd375812664393ed6

## Review-base template-development SHA

Not yet established. This task is queued and must establish a fresh exact remote
`template-development` review base immediately before activation and source
mutation.

## Public-safe task brief

Create one canonical, model-neutral role-selection contract across the web
orchestrator, bridge protocol, concrete OpenCode agent inventory, architecture,
and validators.

The current system has a real cross-branch contradiction: web-orchestration uses
Luna/Sol language for implementation routing and its command example can send
`agent: "luna"`, while the bridge command schema and implementation accept only
`small|heavy`. Workspace heavy routing also maps to a concrete agent name that is
not present in the current tracked template-development agent inventory.

The public routing vocabulary should be model-neutral. Model names are
implementation details/descriptions, not protocol selector values. The web
orchestrator owns route selection; implementation agents do not choose or
recommend their own escalation.

Preferred smallest direction: keep the already-established bridge selector
vocabulary `small|heavy`, make web instructions/examples/task continuity use that
same vocabulary, and make each selector resolve to one exact tracked agent name.
For workspace heavy routing, prefer mapping `heavy` to the existing tracked Sol
workspace agent unless exact runtime/inventory evidence proves a rename is safer.
Do not rename roles merely for cosmetic consistency.

## Current objective

When this queued task is activated, remove selector/agent-name drift and add a
cross-branch regression that fails whenever web instructions, protocol schema,
bridge mapping, or tracked agent inventory disagree.

## Current position

Planning-only task record. No source mutation has been made for this task.

Exact evidence at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: task record created from
  `448f7a74f14f32a051b60eefd375812664393ed6`

Current conflicting evidence includes:

- `web-orchestration-only/chatgpt-project/skill-workflow.md` selects Luna/Sol and
  contains a start example using `agent: "luna"`.
- `web-orchestration-only/validate-package.mjs` validates the web example against
  Luna/Sol rather than the bridge protocol selector vocabulary.
- `contracts/opencode-bridge/command.schema.json` permits only `small|heavy`.
- `tools/opencode-bridge/src/commands.ts` accepts only `small|heavy` and maps
  those selectors to concrete agent names.
- developer concrete agents are `small-developer` and `large-developer`.
- template-development currently tracks `small-workspace-maintainer`,
  `workspace-maintainer`, and `template-maintainer`, while the bridge heavy
  workspace mapping names `heavy-workspace-maintainer`.
- `docs/architecture/agent-system.md` contains role naming that must be reconciled
  with the actual tracked inventory and bridge mapping.

## Source ranges

No task source ranges have started. Establish exact bases at activation.

Planning refs only:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `448f7a74f14f32a051b60eefd375812664393ed6`

## Observed

- The web and bridge currently use different selector vocabularies for the same
  start operation.
- A web-orchestrator command can therefore be valid under the web package's own
  validator and still be rejected by the bridge schema.
- The bridge's heavy workspace mapping names a role that is not present in the
  tracked template-development agent inventory.
- Current validation is mostly branch-local; each branch can validate its own
  representation while the cross-branch contract is broken.
- The repository already has a developer-side cross-branch integration validator,
  but its current assumptions/source discovery must be reviewed against the
  present five-source web package before relying on it as the canonical guard.
- The human confirmed this is a real structural issue.

## Interpretation

Role selection is one cross-branch contract and needs one canonical vocabulary.
A selector should survive this whole path without translation ambiguity:

web route decision -> public command -> bridge schema -> bridge concrete mapping
-> tracked OpenCode agent.

Model/provider names may change without changing the public selector. Concrete
agent filenames may also evolve, but the bridge mapping and validators must point
to roles that actually exist at the exact reviewed refs.

## Attempts

1. A read-only role/handoff stress test compared web instructions, bridge schema,
   bridge runtime mapping, architecture, and current agent inventories.
2. The stress test reproduced deterministic failure for a web command using the
   current `agent: "luna"` example and found the missing heavy workspace target.
3. The human accepted the finding and requested a proper task record before any
   implementation.

## Changed approach

None. This is a newly queued maintenance task.

## Checks

Planning-only evidence review completed against exact remote files/refs.
No implementation checks have run because no task source mutation has started.

## Blockers / required decisions

- No human design decision is currently required.
- This task must remain non-mutating until the currently active template-
  maintenance task is completed/finalized or the human explicitly reprioritizes
  the active task.

## Remaining work

1. Re-establish exact live refs and activate this task with a fresh review base.
2. Define one canonical public selector vocabulary, expected to be `small|heavy`.
3. Reconcile web instructions/examples/continuity, bridge schema/runtime mapping,
   agent inventory, and architecture with that contract.
4. Resolve the heavy workspace concrete agent mapping without unnecessary role
   renaming or compatibility churn.
5. Update or replace the cross-branch integration regression so it validates the
   current web package against the current bridge schema and proves every mapped
   concrete agent exists.
6. Run authoritative branch checks, independently review exact source ranges,
   package the reviewed change, and complete normal maintenance handoff.

## Next action

Remain queued. On activation, first re-read current role inventories and the exact
bridge/web selector contracts before choosing the smallest compatibility-safe
implementation.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/validate-package.mjs`
- `contracts/opencode-bridge/command.schema.json`
- `tools/opencode-bridge/src/commands.ts`
- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/agents/workspace-maintainer.md`
- `docs/architecture/agent-system.md`
- `scripts/validate-web-orchestrator-integration.mjs`
- `docs/deviations.md`

## Last handoff commit

None
