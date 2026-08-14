# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-CREATION-001

## Status

Completed

## Task-start template-development SHA

a554e61cc8e15d36a5eb7dd92172abccde7d4cd7

## Review-base template-development SHA

a554e61cc8e15d36a5eb7dd92172abccde7d4cd7

## Public-safe task brief

Create the first implementation pass of a destination-aware prompt-creation capability for the web orchestrator using three Project Sources: a small core composition procedure, a destination profile library, and a mission profile library. Preserve the two-dimensional destination-plus-mission design, context-transfer role, observed-versus-interpreted evidence boundary, and omission of receiver-owned protocol. Do not add the later general prompt-craft methodology yet.

## Current objective

Implement and integrate `skill-prompt-creation.md`, `skill-prompt-destinations.md`, and `skill-prompt-missions.md` as one routed core Source plus two support Sources, with the smallest package/validator changes needed to make that structure explicit and durable.

## Current position

The first prompt-creation architecture is implemented and validated. The Project package now contains one cross-mode routed prompt-creation core plus destination and mission support Sources. The core treats prompt creation as context transfer across an execution boundary, composes destination with mission, preserves Observed versus Interpretation versus Requested outcome, omits receiver-owned protocol, and never lets the future destination change the current chat's effective mode. General prompt-craft methodology remains intentionally deferred.

## Source ranges

- `template-development`: `a554e61cc8e15d36a5eb7dd92172abccde7d4cd7..68b3e276fb9386354dc7942db2e09937b6e20151` before this dedicated handoff snapshot.
- `web-orchestration`: `9d1df0d31c9e8b83d00e469e46dfb4cb375e1f92..e6079712e711096e32362da838ef3930cf7ddf52`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion performed.

## Observed

- The prior Project package installed exactly eight skill Sources and required every Source to appear directly in the permanent router.
- Prompt creation spans MCP-ON, MCP-OFF, and direct OpenCode destinations, so it is not naturally owned by either mode-specific router group.
- Destination and mission profiles are always composed by the prompt-creation core and are not independent user intents.
- The final Project package contains eleven Sources: nine routed Sources and two support Sources.
- `skill-prompt-creation.md` is the single cross-mode user-facing route. It requires the destination and mission support Sources exactly once.
- `skill-prompt-destinations.md` defines fresh MCP-ON, fresh MCP-OFF, and direct OpenCode receiver profiles without changing the current chat's capabilities.
- `skill-prompt-missions.md` defines investigation/research, review, implementation/change, reproduce/test, continue/recover, and template-maintenance transfer missions.
- Template-maintenance transfer preserves the downstream problem as evidence/interpretation, requires independent canonical verification rather than blind upstream patch copying, and supports returning a reviewed canonical fix through the deterministic change-package workflow when needed.
- `docs/design/prompt-creation.md` records the two-axis architecture, Source ownership, evidence boundary, transfer model, and deliberate deferral of prompt craft.
- `docs/architecture/AS-BUILT.md` records the implemented eleven-Source package and cross-mode composition model.
- `source-lock.json` now reconciles the reviewed web source handoff `e6079712e711096e32362da838ef3930cf7ddf52` to this task.

## Interpretation

The clean runtime structure is one routed core plus two support libraries. Destination owns receiver capability/context; mission owns task payload; a later prompt-craft Source may own general communication methodology. This prevents both a monolithic prompt skill and a destination-by-mission combinatorial file explosion while keeping future missions and destinations independently extensible.

## Attempts

- Reconstructed the exact web Project package locally from exact remote/current Source contents and repository files in order to run the real package validator and test suite without relying on a web-branch CI workflow.
- The first validator run exposed two integration issues: explanatory installation prose repeated the new support filenames despite the existing unique-inventory-reference contract, and the existing interaction-before-status regex did not tolerate the current workflow's line wrapping. Both were corrected without weakening the underlying contracts.

## Changed approach

Used the exact reconstructed Project package as executable validation evidence rather than stopping at remote readback. Kept the prompt-support architecture dependency-shaped by teaching the validator to distinguish routed Sources from support Sources instead of forcing fake permanent trigger rows.

## Checks

- Exact web compare `9d1df0d31c9e8b83d00e469e46dfb4cb375e1f92..e6079712e711096e32362da838ef3930cf7ddf52` is linear (`ahead_by=12`, `behind_by=0`) and changes exactly eight intended Project-package paths: root/package README files, permanent router, three new prompt Sources, validator, and validator tests.
- Exact remote readback confirms the final prompt-creation core at `e6079712e711096e32362da838ef3930cf7ddf52` and the intended two-axis/evidence-boundary/current-mode rules.
- The reconstructed exact Project package passed `node web-orchestration-only/validate-package.mjs`.
- The reconstructed exact Project package passed `node --test web-orchestration-only/validate-package.test.mjs`: 26 tests, 26 passed, 0 failed, including routed-versus-support dependency checks and destination/current-mode separation.
- Exact template-development compare `a554e61cc8e15d36a5eb7dd92172abccde7d4cd7..68b3e276fb9386354dc7942db2e09937b6e20151` is linear (`ahead_by=4`, `behind_by=0`) and changes only the task record, prompt-creation design record, integrated AS-BUILT, and source lock.
- Push-triggered `Validate template development` run `31823487496` completed successfully for `68b3e276fb9386354dc7942db2e09937b6e20151`; its `validate` job and `./scripts/validate-template-development.sh` step both concluded `success`.
- No Scout, bridge command, developer route, `developer` mutation, or `main` promotion occurred.

## Blockers / required decisions

None for this first implementation pass.

## Remaining work

None for the requested first three files. General prompt-craft / prompt-optimization methodology is intentionally future work and should be designed separately rather than filled in implicitly here.

## Next action

None. Future discussion can design the prompt-craft Source and then extend or revise these three Sources against that methodology without changing their destination/mission ownership unless evidence warrants it.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-prompt-creation.md` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `web-orchestration-only/chatgpt-project/skill-prompt-destinations.md` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `web-orchestration-only/chatgpt-project/skill-prompt-missions.md` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `web-orchestration-only/chatgpt-project/developer-instructions.md` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `web-orchestration-only/validate-package.mjs` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `web-orchestration-only/validate-package.test.mjs` at `e6079712e711096e32362da838ef3930cf7ddf52`
- `docs/design/prompt-creation.md`
- `docs/architecture/AS-BUILT.md`
- `source-lock.json`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issue existed at task start, and none was created. This bounded direct Project-package plus ledger maintenance task did not require the bridge.

## Active work

None.

## Pending publication

None. The Project-package source is pushed through `e6079712e711096e32362da838ef3930cf7ddf52`; the reconciled ledger implementation is pushed through `68b3e276fb9386354dc7942db2e09937b6e20151` before this handoff snapshot.

## Command / Scout / refusal journals

None. No Scout, bridge command, developer route, or connector refusal occurred.

## Findings

- Confirmed and implemented: prompt creation is a cross-mode context-transfer capability rather than a mode-specific workflow.
- Confirmed and implemented: one routed core plus two support Sources cleanly expresses the dependency structure without fake destination/mission router triggers.
- Confirmed and implemented: destination and mission remain orthogonal and extensible; prompt craft is a separate future concern.
- Confirmed and implemented: Observed, Interpretation, and Requested outcome remain distinct across handoffs.
- Confirmed and implemented: the destination describes only the future receiver and cannot change the current chat's effective mode.
- Confirmed and implemented: template-maintenance transfer carries evidence upstream for independent canonical resolution and can return the reviewed canonical fix through a deterministic package.
- Found and fixed during validation: the interaction-before-status validator needed whitespace-tolerant matching after the prior workflow line wrap; policy semantics were preserved.

## Decisions

- Route only `skill-prompt-creation.md` from permanent instructions.
- Keep `skill-prompt-destinations.md` and `skill-prompt-missions.md` as support dependencies.
- Start with three destination profiles and six mission profiles; add profiles only when a real new execution environment or task requirement appears.
- Do not add a destination-by-mission file matrix.
- Defer prompt-craft methodology to a separate future Source.
- Keep `developer` and `main` unchanged.
