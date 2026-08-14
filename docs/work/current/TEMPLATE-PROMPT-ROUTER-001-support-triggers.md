# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-ROUTER-001

## Status

Completed

## Task-start template-development SHA

861da9eed4c1f6a5b85b5be8f4e2f4391b240b07

## Review-base template-development SHA

861da9eed4c1f6a5b85b5be8f4e2f4391b240b07

## Public-safe task brief

Correct the permanent Project router so prompt creation has explicit support-trigger wiring without turning the destination and mission support Sources into independent user-facing routes. Keep `skill-prompt-creation.md` as the single cross-mode prompt-creation route; when that route is active, require its destination and mission support profiles.

## Current objective

Make the missing support trigger explicit in `developer-instructions.md`, preserve the existing routed-versus-support Source contract, reconcile the exact web source handoff, and validate the template ledger.

## Current position

The permanent router now contains a `Prompt-creation support trigger` section. It states that when the cross-mode prompt-creation route is active, both support Sources required by that Source—the destination profile and mission profile—must be loaded, and that they are not independent user-facing routes. This preserves the core Source as the canonical place that names the support filenames, so the existing package validator remains compatible without changes.

## Source ranges

- `template-development`: `861da9eed4c1f6a5b85b5be8f4e2f4391b240b07..8c2cbc919142192988361ce21f2d92a682f7433b` before this dedicated handoff snapshot.
- `web-orchestration`: `e639548257705553fec81ee6ae07389620dd19d1..951a629e0f37d3014baea7b668059b35bafff4db`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- No open control issue existed at task start.
- The live permanent router already had the user-facing cross-mode row for `skill-prompt-creation.md`, but no permanent statement of when its support profiles should be loaded.
- The prompt core itself names `skill-prompt-destinations.md` and `skill-prompt-missions.md` as mandatory support Sources for every prompt-creation task.
- The existing package validator intentionally requires routed Sources to appear once in permanent instructions and support filenames to remain named only by the core Source.
- The final router therefore expresses the missing dependency trigger semantically without duplicating support filenames in permanent instructions.

## Interpretation

The user-facing trigger and support dependency trigger are different responsibilities. The permanent router should route prompt creation once, then state that the route activates both required support profiles. The core Source remains responsible for resolving the exact support filenames. This makes the trigger relationship visible while avoiding fake standalone routes and preserving the package's anti-duplication contract.

## Attempts

- During this task, issues #18, #19, #20, and #21 were accidentally created as plain unlabeled issues while selecting a file-write action. Each contained no bridge marker or task binding, launched no work, and was immediately rewritten as an accidental orphan and closed `not_planned`. No bridge-control issue or agent mutation route was launched.
- An initial `source-lock.json` update used a non-contents API identity and received a clean HTTP 409 optimistic-concurrency rejection. The exact current blob SHA was then fetched and the update succeeded once. The rejected write had no repository effect.

## Changed approach

- After the accidental issue publications, repository writes used the GitHub contents API only.
- The first router draft named the two support Sources directly in a support table, which would have required changing the validator's deliberate anti-duplication rule. This was simplified: permanent instructions now express the support-trigger condition without repeating support filenames, leaving the core Source as their canonical naming point and avoiding unnecessary validator/test changes.

## Checks

- Exact web compare `e639548257705553fec81ee6ae07389620dd19d1..951a629e0f37d3014baea7b668059b35bafff4db` is linear (`ahead_by=2`, `behind_by=0`) and has a net change to exactly one path: `web-orchestration-only/chatgpt-project/developer-instructions.md`.
- Exact remote readback at `951a629e0f37d3014baea7b668059b35bafff4db` confirms the existing MCP-ON/MCP-OFF/Cross-mode trigger tables plus the new prompt-creation support trigger.
- Exact inspection of the unchanged Project-package validator confirms that routed Source filenames still appear exactly once, support filenames remain absent from permanent instructions, and the Cross-mode routed set remains unchanged; the new semantic support-trigger prose does not create extra trigger-table rows.
- `source-lock.json` now records web handoff `951a629e0f37d3014baea7b668059b35bafff4db` and task `TEMPLATE-PROMPT-ROUTER-001`.
- Push-triggered `Validate template development` run `31835989324` completed successfully for `8c2cbc919142192988361ce21f2d92a682f7433b`; its `validate` job and `./scripts/validate-template-development.sh` step concluded `success`.
- No Scout, bridge command, developer route, `developer` mutation, or `main` promotion occurred.

## Blockers / required decisions

None.

## Remaining work

None for this correction. Discussion of the fourth prompt-craft Source can continue from the corrected trigger architecture.

## Next action

None. The permanent developer instructions now expose the prompt support-trigger relationship while keeping destination and mission Sources dependency-only.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md` at `951a629e0f37d3014baea7b668059b35bafff4db`
- `web-orchestration-only/chatgpt-project/skill-prompt-creation.md`
- `web-orchestration-only/chatgpt-project/skill-prompt-destinations.md`
- `web-orchestration-only/chatgpt-project/skill-prompt-missions.md`
- `web-orchestration-only/validate-package.mjs`
- `source-lock.json`

## Last handoff commit

None
