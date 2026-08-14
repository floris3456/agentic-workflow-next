# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-RECORDING-001

## Status

Completed

## Task-start template-development SHA

bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8

## Review-base template-development SHA

bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8

## Original task brief

Review the workflow template itself for any remaining contradiction in how template-maintenance tasks are recorded. Fix any real issue with the smallest effective change and validate it. Use the template-development workflow and record the task there. Do not promote to main.

## Current objective

Review the reusable template's maintenance-recording contract for internal contradictions, make only the smallest effective correction if a real contradiction remains, and validate the result without promoting to main.

## Current position

A real lifecycle wording contradiction was found and corrected on `template-development` only. The ledger previously described `current/` as active tasks and `archive/` as completed tasks even though the canonical maintainer handoff contract uses `completed` for a successfully finished working cycle that can legitimately remain in `current/` until exact review and durable-record reconciliation allow finalization. The documentation now consistently distinguishes not-yet-finalized records from finalized archived records.

## Source ranges

- `template-development`: `bb3a1179f16b089f1fbb3a0ff9101af59ac0abd8..41de852b750002350b9dbe1fc2cd53b3c405f488` before this progress update.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `web-orchestration`: unchanged at `279631a3e14c6293933852baec98dd662f575277`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion performed.

## Observed

- `source-lock.json` matched the exact live `main`, `developer`, and `web-orchestration` heads before mutation.
- The Project maintenance source correctly defines one template-development maintenance record as the replacement for normal web-orchestration task context while preserving normal source-branch implementation records.
- The contradiction was narrower: template-development documentation used active/completed directory labels that conflicted with the maintainer response meaning of `completed` and with legitimate completed handoff records still present in `current/` pending finalization.
- No reusable `developer` or `web-orchestration` source behavior needed to change.

## Interpretation

`completed` is a handoff-cycle result, not an archival state. `current/` therefore owns every maintenance task until finalization, and `archive/` owns only finalized immutable records. This preserves the existing workflow while removing the semantic contradiction.

## Attempts

- Attempted to clone the exact remote branch in the execution sandbox to run `./scripts/validate-template-development.sh`; the sandbox could not resolve `github.com`, so that local execution path was unavailable. This was an environment/network limitation, not a repository check failure.

## Changed approach

Used connector-backed exact remote readback and commit-range validation after the local execution environment could not reach GitHub.

## Checks

- Remote `template-development` readback confirmed the correction at `41de852b750002350b9dbe1fc2cd53b3c405f488`.
- Exact compare from task start to that head is linear (`ahead_by=4`, `behind_by=0`) and changes only `README.md`, `docs/work/README.md`, `docs/work/current/README.md`, and this task record.
- Remote readback of all three edited lifecycle documents confirms consistent not-yet-finalized/finalized wording and explicitly allows a successful `completed` handoff to remain in `current/` until archival conditions are satisfied.
- No GitHub Actions workflow run exists for the checked commit, so CI provided no additional signal.
- `developer`, `web-orchestration`, and `main` were not modified.

## Blockers / required decisions

None.

## Remaining work

None for this correction. Archival remains subject to the normal exact-review and durable-record reconciliation boundary.

## Next action

Create and push the dedicated template-development handoff snapshot, then return control for independent review.

## Relevant durable records

- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/work/README.md`
- `docs/work/current/README.md`
- `README.md`
- `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` on `web-orchestration`

## Last handoff commit

None
