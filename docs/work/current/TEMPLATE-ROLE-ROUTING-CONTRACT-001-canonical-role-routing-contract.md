# Template-maintenance task progress

## Task ID

TEMPLATE-ROLE-ROUTING-CONTRACT-001

## Status

source complete; package and CI observation pending

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

Every public selector must resolve to one exact tracked agent that exists on the
relevant branch.

## Current objective

Preserve the reviewed small/heavy routing contract. No further source mutation is
planned unless later authoritative checks expose a defect. Portable package
creation and exact push-CI observation remain follow-up evidence work.

## Current position

The authorized direct implementation is complete across all three source
branches.

Exact reconciled source heads:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833` — unchanged.
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68` — final developer task-progress handoff; substantive routing source was complete at `593ce467d7f529978463bbd436b5f36ce040fcf4`.
- `web-orchestration`: `3b534650f886bcd8b0644bcf8393f5b9ab48b4d2`.
- `template-development`: source/ledger state before this progress snapshot is `a20254dfd309d5fb06ccb8fe0453b71ead199708`.

Implemented routing contract:

- public and instructional route names are only `small` and `heavy`;
- developer `small` -> `small-developer`;
- developer `heavy` -> `large-developer`;
- workspace `small` -> `small-workspace-maintainer`;
- workspace `heavy` -> existing `workspace-maintainer`;
- the web orchestrator selects routes; implementation/workspace agents do not
  select or recommend their own escalation;
- runtime configuration fields remain implementation detail and do not define
  routing semantics.

## Source ranges

- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `web-orchestration`: `cc5a521c70f4198947ec0360cf60cb95876dff3b..3b534650f886bcd8b0644bcf8393f5b9ab48b4d2`.
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`.
- `template-development`: `2e68078f542b811540e945ce6094e2d7841ac5f3..a20254dfd309d5fb06ccb8fe0453b71ead199708` before this progress snapshot.

## Observed

- The bridge schema already accepted only `small|heavy`; the web package used a
  conflicting route vocabulary.
- The bridge heavy workspace mapping pointed at a concrete agent name that did
  not exist in the tracked template-development inventory.
- Branch-specific developer and workspace agent prose described route identity
  using runtime/model language instead of the stable small/heavy role contract.
- Web continuity and validators repeated the obsolete vocabulary.
- Direct implementation aligned web instructions, web task continuity, bridge
  mapping, developer/workspace agent prose, architecture, and validators.
- The first developer architecture rewrite changed the right routing facts but
  compressed unrelated technical detail too broadly. Independent review caught
  this before acceptance.
- Corrective developer commits restored the unrelated bridge, recovery,
  projection, version, and security detail while retaining only the intended
  routing changes.
- Template-development now validates both workspace concrete roles and records
  the small/heavy mapping in root instructions and AS-BUILT.
- `source-lock.json` now records the final developer handoff and web routing head.

## Interpretation

The routing defect is corrected. Public selector vocabulary is independent of
runtime/provider implementation, and every route now resolves to a tracked
concrete agent.

The architecture-correction episode did not change the desired design; it fixed
an overly broad documentation edit. Unrelated technical documentation remains
valid and was restored rather than intentionally simplified.

The remaining limitations are evidence/package execution limitations, not source
implementation blockers. They do not require another routing change and do not
prevent the separately authorized Workspace target-rule task from proceeding.

## Attempts

1. Read-only stress testing found the web/bridge selector mismatch and missing
   heavy workspace target.
2. The human approved the issue and tightened the desired contract to
   small/heavy-only instructional language.
3. Web routing/continuity/validation were changed directly.
4. Developer bridge/agent/validator/architecture changes were published directly.
5. Independent developer range review found accidental over-compression of three
   architecture files.
6. The unrelated technical detail was restored in corrective commits while the
   routing changes were retained.
7. Template workspace agents, root routing instructions, validator, and AS-BUILT
   were aligned to the same contract.
8. Source snapshot was reconciled from exact current remote refs.

## Changed approach

The initial direct developer architecture edit was too broad. The correction used
targeted restoration: preserve existing detailed architecture and change only
route/mapping statements. No route-design decision changed.

## Checks

- Exact final remote refs independently re-read for developer, web-orchestration,
  and template-development.
- Developer exact range compared remotely; review caught and corrected the broad
  documentation edit.
- Web package validator source now accepts only `small|heavy`, and its Node test
  suite includes a regression against other route vocabularies.
- Developer validation now checks the small/heavy route contract and concrete
  mapped-agent existence rather than using model/provider names as routing
  semantics.
- Template-development validation now requires both workspace agent files,
  verifies their small/heavy role prose and web-owned route selection, and keeps
  runtime configuration checks separate.
- Final bridge readback maps workspace heavy to `workspace-maintainer`.
- Canonical branch-push CI for these final exact heads is not observable through
  the currently exposed connected workflow-run lookup; no CI pass is claimed.
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

Treat routing source work as non-mutating and activate
`TEMPLATE-WORKSPACE-TARGET-RULES-001` as explicitly authorized by the human.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-workflow.md`
- `web-orchestration-only/task-context/TEMPLATE.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `contracts/opencode-bridge/command.schema.json`
- `tools/opencode-bridge/src/commands.ts`
- `tools/opencode-bridge/src/service.ts`
- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/agents/small-workspace-maintainer.md`
- `.opencode/agents/workspace-maintainer.md`
- `AGENTS.md` on `template-development`
- `docs/architecture/agent-system.md` on `developer`
- `docs/architecture/opencode-bridge.md` on `developer`
- `docs/architecture/AS-BUILT.md` on both source branches
- `scripts/validate-agent-system.mjs`
- `scripts/validate-web-orchestrator-integration.mjs`
- `scripts/validate-template-development.mjs`
- `source-lock.json`

## Last handoff commit

None
