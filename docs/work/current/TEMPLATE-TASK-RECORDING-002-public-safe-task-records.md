# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-RECORDING-002

## Status

In progress

## Task-start template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Review-base template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Original task brief

@GitHub
Review the workflow template itself for any remaining contradiction in how template-maintenance tasks are recorded. Fix any real issue with the smallest effective change and validate it. Use the template-development workflow and record the task there. Do not promote to main.

## Current objective

Review the reusable template-maintenance recording contract for any remaining contradiction, correct only a real issue with the smallest effective change, and validate it without promotion.

## Current position

Exact remote inspection is in progress on `template-development`. The prior current-versus-archive wording correction remains present. A separate possible contradiction is being checked between the public-safe task-record contract and the validator/task-template behavior.

## Source ranges

- `template-development`: task start `d10dad3bfa9643f55e9ec925aaaee02575abddde`.
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer`: `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `web-orchestration`: `279631a3e14c6293933852baec98dd662f575277`.

## Observed

- The live source refs match `source-lock.json`.
- The Project maintenance Source correctly substitutes this `template-development` record for ordinary web-orchestration task context.
- The ledger documentation already distinguishes not-yet-finalized `current/` records from finalized `archive/` records.
- The structural validator currently exempts both work-record directories from its host-local absolute-path check even though maintenance records are defined as public-safe.

## Interpretation

A validator exemption for the very records that must remain public-safe appears inconsistent with the recording contract. Confirm the scope and any legacy record impact before changing it.

## Attempts

None.

## Changed approach

None.

## Checks

- Exact connected-GitHub readback of the maintenance skill, design, AS-BUILT, task template, work-record READMEs, validator, source lock, and live branch refs.

## Blockers / required decisions

None.

## Remaining work

Confirm the contradiction across existing work records, implement only the minimal contract/validator correction if warranted, then validate the exact remote range.

## Next action

Inspect existing current records for why the validator exemption exists, then make the smallest coherent correction.

## Relevant durable records

- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/work/templates/task-progress-template.md`
- `docs/work/README.md`
- `docs/work/current/README.md`
- `scripts/validate-template-development.mjs`
- `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` at `279631a3e14c6293933852baec98dd662f575277`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issues existed at task start. No bridge issue is currently required for this ledger-only review.

## Active work

- Direct exact GitHub inspection of `template-development` recording rules and validator behavior.

## Pending publication

None.

## Command / Scout / refusal journals

None.

## Findings

Pending confirmation of the public-safe-record validator contradiction.

## Decisions

- Use `TEMPLATE-TASK-RECORDING-002`; do not reuse the earlier historical `TEMPLATE-TASK-RECORDING-001` identity.
- Keep `main`, `developer`, and `web-orchestration` unchanged unless exact evidence shows a source change is required.
