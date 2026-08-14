# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-RECORDING-001

## Status

In progress

## Task-start template-development SHA

bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8

## Review-base template-development SHA

bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8

## Original task brief

Review the workflow template itself for any remaining contradiction in how template-maintenance tasks are recorded. Fix any real issue with the smallest effective change and validate it. Use the template-development workflow and record the task there. Do not promote to main.

## Current objective

Review the reusable template's maintenance-recording contract for internal contradictions, make only the smallest effective correction if a real contradiction remains, and validate the result without promoting to main.

## Current position

Maintenance contract and source refs inspected. The review is focused on the relationship between the template-development ledger record, ordinary source-branch task records, active/current semantics, and finalization/archive semantics. No source change has been made yet.

## Source ranges

- `template-development`: `bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8..HEAD`
- `developer`: review base `e2700f586fe8ab634053eb514bb9da487e881a21`; unchanged so far.
- `web-orchestration`: review base `279631a3e14c6293933852baec98dd662f575277`; unchanged so far.
- `main`: observed only at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion authorized.

## Observed

- `source-lock.json` matches the exact live `main`, `developer`, and `web-orchestration` heads.
- The Project maintenance source says one template-development maintenance record replaces normal web-orchestration task context for the entire template task, while source branches retain their own normal task records.
- Template-development `current/` is documented as active task storage, while finalization moves the exact approved record to `archive/`.
- Existing current records include completed handoff cycles, so status wording and active/archive semantics require consistency review before deciding whether a real contract contradiction remains.

## Interpretation

The intended model appears to be one canonical cross-branch maintenance ledger plus ordinary implementation records on any changed source branch. The remaining review question is whether any document describes those records or completion/archive boundaries incompatibly.

## Attempts

None.

## Changed approach

None.

## Checks

- Exact live source refs read back from GitHub.
- Required template-development contract files read before mutation.

## Blockers / required decisions

None.

## Remaining work

Identify any concrete contradictory wording or invariant, apply the smallest correction if needed, validate affected contracts, and update this record.

## Next action

Compare maintenance ledger status/current/archive semantics and source-record ownership across the canonical maintenance skill, work-record README, design record, and Project maintenance source.

## Relevant durable records

- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/work/README.md`
- `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` on `web-orchestration`

## Last handoff commit

None
