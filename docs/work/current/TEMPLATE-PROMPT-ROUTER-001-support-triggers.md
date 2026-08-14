# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-ROUTER-001

## Status

In progress

## Task-start template-development SHA

861da9eed4c1f6a5b85b5be8f4e2f4391b240b07

## Review-base template-development SHA

861da9eed4c1f6a5b85b5be8f4e2f4391b240b07

## Public-safe task brief

Correct the permanent Project router so the two prompt-creation support Sources have explicit support triggers in developer instructions without becoming independent user-facing routes. Keep `skill-prompt-creation.md` as the single cross-mode user-facing prompt-creation route; expose `skill-prompt-destinations.md` and `skill-prompt-missions.md` only under the condition that prompt creation is active.

## Current objective

Add explicit support-source trigger wiring to `developer-instructions.md`, update package validation/tests to enforce that dependency shape, reconcile the exact web source handoff, and validate the template ledger.

## Current position

Live `developer-instructions.md` contains the user-facing cross-mode prompt-creation row but does not mention the two support Sources. Their individual files correctly say they load only when prompt creation is active. The permanent router therefore lacks visible support-trigger wiring even though the core Source references them.

## Source ranges

- `template-development`: task start `861da9eed4c1f6a5b85b5be8f4e2f4391b240b07`.
- `web-orchestration`: task start `e639548257705553fec81ee6ae07389620dd19d1`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- No open control issue exists at task start.
- `developer-instructions.md` routes `skill-prompt-creation.md` once under `## Cross-mode`.
- `skill-prompt-destinations.md` and `skill-prompt-missions.md` each declare a support-only trigger, but the permanent router does not expose those dependencies.
- Current package validation explicitly forbids any support Source reference in permanent instructions, so the validator must be refined rather than bypassed.

## Interpretation

The right correction is an explicit support-routing section in permanent instructions, separate from user-facing routed Sources. Each support Source should appear exactly once there with the condition “prompt creation is active”; they must remain excluded from the MCP-ON, MCP-OFF, and Cross-mode user-trigger sets.

## Attempts

- During this task, issues #18, #19, #20, and #21 were accidentally created as plain unlabeled issues while selecting a file-write action. Each contained no bridge marker or task binding, launched no work, and was immediately rewritten as an accidental orphan and closed `not_planned`. No bridge-control issue or mutation route was launched.

## Changed approach

Switched away from issue-create tooling and used the GitHub contents API exclusively for repository file writes after the accidental orphan issues.

## Checks

- Open issue map was empty before mutation.
- Exact live `web-orchestration` and `template-development` heads inspected.
- Exact permanent router and package validator inspected at the web task-start SHA.

## Blockers / required decisions

None.

## Remaining work

Edit developer instructions, validator, and validator tests; review the exact web range; reconcile source lock; validate the template-development handoff; create a dedicated completed snapshot.

## Next action

Add a permanent `## Prompt-creation support` trigger table and teach validation to require exactly those two dependency rows without treating them as user-facing routes.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `source-lock.json`

## Last handoff commit

None
