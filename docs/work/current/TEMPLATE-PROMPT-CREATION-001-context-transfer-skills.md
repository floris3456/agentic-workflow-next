# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-CREATION-001

## Status

In progress

## Task-start template-development SHA

a554e61cc8e15d36a5eb7dd92172abccde7d4cd7

## Review-base template-development SHA

a554e61cc8e15d36a5eb7dd92172abccde7d4cd7

## Public-safe task brief

Create the first implementation pass of a destination-aware prompt-creation capability for the web orchestrator using three Project Sources: a small core composition procedure, a destination profile library, and a mission profile library. Preserve the two-dimensional destination-plus-mission design, context-transfer role, observed-versus-interpreted evidence boundary, and omission of receiver-owned protocol. Do not add the later general prompt-craft methodology yet.

## Current objective

Implement and integrate `skill-prompt-creation.md`, `skill-prompt-destinations.md`, and `skill-prompt-missions.md` as one routed core Source plus two support Sources, with the smallest package/validator changes needed to make that structure explicit and durable.

## Current position

Task initialized from exact live source refs. No control issue is open. The Project installation package currently assumes an exact eight-Source inventory and requires every Source to appear directly in the permanent router, so supporting Sources need an explicit dependency model rather than fake user-facing trigger rows.

## Source ranges

- `template-development`: task start `a554e61cc8e15d36a5eb7dd92172abccde7d4cd7`.
- `web-orchestration`: task start `9d1df0d31c9e8b83d00e469e46dfb4cb375e1f92`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- `source-lock.json` matches all exact live source refs at task start.
- The existing Project package installs exactly eight skill Sources and states that the permanent router names every Source.
- Prompt creation spans MCP-ON, MCP-OFF, and direct OpenCode destinations, so it is not naturally an MCP-ON-only or MCP-OFF-only procedure.
- Destination and mission profiles are always composed by the prompt-creation core and are not independent user intents.

## Interpretation

The clean structure is one cross-mode routed `skill-prompt-creation.md` plus two support Sources loaded by that core. The permanent router should expose the user-facing prompt-creation trigger once; package validation should require the support dependency relationship without pretending the two support files are standalone routes.

## Attempts

None.

## Changed approach

None.

## Checks

- Open control-issue map is empty.
- Exact remote branch heads and source lock confirmed.
- Exact installation README and task template inspected.

## Blockers / required decisions

None.

## Remaining work

Inspect the current permanent router, package validator/tests, and installation inventory; implement the three Sources and minimal integration; review exact remote ranges; run available validation; reconcile source lock and durable design/AS-BUILT records; create a dedicated handoff snapshot.

## Next action

Inspect the exact current Project router and validation contract at the web task-start SHA.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md`
- `web-orchestration-only/chatgpt-project/README.md`
- `web-orchestration-only/validate-package.mjs`
- `web-orchestration-only/validate-package.test.mjs`
- `docs/architecture/AS-BUILT.md`
- `source-lock.json`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issue exists at task start. No bridge issue is needed for this bounded direct Project-package/template-ledger maintenance task.

## Active work

- Direct exact GitHub inspection and bounded Project-package authoring on `web-orchestration`.

## Pending publication

None.

## Command / Scout / refusal journals

None. No Scout, bridge command, or developer route has been launched.

## Findings

Pending exact package/router inspection.

## Decisions

- Treat prompt creation as context transfer across an execution boundary, not generic prose generation.
- Preserve two orthogonal dimensions: destination and mission.
- Route only the core prompt-creation Source from permanent instructions; load destination and mission Sources as explicit support dependencies.
- Defer general prompt-craft methodology to a later separately designed Source.
