# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-LIFECYCLE-001

## Status

Completed

## Task-start template-development SHA

745c6bb970cbb9b91448dc6a70a116f5d827780b

## Review-base template-development SHA

745c6bb970cbb9b91448dc6a70a116f5d827780b

## Public-safe task brief

Make the template-maintenance record lifecycle consistently distinguish not-yet-finalized records in `current/` from finalized records in `archive/`, while preserving `completed` as a maintainer handoff status that may remain in `current/` until review and reconciliation permit finalization.

## Current objective

Remove the remaining stale active/completed directory semantics with the smallest documentation-only correction and validate the exact `template-development` range.

## Current position

The lifecycle terminology is now explicit and consistent. `current/` is named as not-yet-finalized, `archive/` is named as finalized, and the maintenance skill states that a `completed` handoff ends the working cycle but does not itself finalize or archive the record. The finalization step is explicitly the transition between those lifecycle states.

## Source ranges

- `template-development`: `745c6bb970cbb9b91448dc6a70a116f5d827780b..c1025bbf2628193d2f6760a550126200c05a4b8b` before this dedicated handoff snapshot.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `web-orchestration`: unchanged at `301b37f96b7adae708b199278045feb11c493fdb`.

## Observed

- `source-lock.json` matched the live `main`, `developer`, and `web-orchestration` refs at task start.
- `README.md` and `docs/work/README.md` already carried the correct not-yet-finalized/finalized model and explicitly allowed `completed` to remain in `current/`.
- The remaining stale semantics were narrower: `.opencode/skills/template-maintenance/SKILL.md` still called the record `active`, while the current/archive directory headings did not directly name their lifecycle states.
- The updated maintenance skill now uses `not-yet-finalized task record`, states that `completed` does not itself finalize/archive the task, and identifies finalization as the transition to the finalized state.
- `docs/work/current/README.md` is now headed `Not-yet-finalized template-maintenance tasks (current/)` and still explicitly permits a successful `completed` handoff to remain there pending review and reconciliation.
- `docs/work/archive/README.md` is now headed `Finalized template-maintenance tasks (archive/)` and explicitly says a `completed` handoff alone does not make a record finalized.

## Interpretation

`completed` is a maintainer handoff result; `finalized` is the archival lifecycle state. A task can therefore be completed but not yet finalized, which is why its record can legitimately remain in `current/`.

## Attempts

None.

## Changed approach

The main lifecycle explanation was already correct on the live branch, so the change was narrowed to the remaining stale terminology instead of rewriting already-correct documentation.

## Checks

- Exact compare `745c6bb970cbb9b91448dc6a70a116f5d827780b..c1025bbf2628193d2f6760a550126200c05a4b8b` is linear (`ahead_by=4`, `behind_by=0`) and changes only `.opencode/skills/template-maintenance/SKILL.md`, `docs/work/current/README.md`, `docs/work/archive/README.md`, and this task record.
- Exact remote readback confirmed the intended lifecycle wording in all three edited contract/documentation files at `c1025bbf2628193d2f6760a550126200c05a4b8b`.
- Push-triggered `Validate template development` run `31812732255` completed successfully for `c1025bbf2628193d2f6760a550126200c05a4b8b`; its `validate` job and `./scripts/validate-template-development.sh` step both concluded `success`.
- No source branch changed, so no change package was required.
- No Scout, bridge command, or developer route was launched for this bounded ledger-only correction.

## Blockers / required decisions

None.

## Remaining work

None for this working cycle. The task record remains in `current/` because `completed` is not the same as finalized; archival belongs to the separate finalization boundary.

## Next action

None. Independent review may use the exact template-development range above. No `main` promotion is requested or authorized.

## Relevant durable records

- `README.md`
- `docs/work/README.md`
- `docs/work/current/README.md`
- `docs/work/archive/README.md`
- `.opencode/skills/template-maintenance/SKILL.md`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issue existed at task start, and none was created. No bridge issue was needed for this ledger-only documentation correction.

## Active work

None.

## Pending publication

None. The lifecycle terminology correction is pushed through `c1025bbf2628193d2f6760a550126200c05a4b8b` before this handoff snapshot.

## Command / Scout / refusal journals

None. No Scout, bridge command, developer route, or connector refusal occurred.

## Findings

- Confirmed and fixed: the maintenance skill still used `active` wording even though `completed` records may legitimately remain in `current/`.
- Confirmed and fixed: directory headings did not directly name not-yet-finalized versus finalized lifecycle states.
- Already correct and preserved: the main work-record documentation explicitly distinguishes a successful `completed` working cycle from archival/finalization.

## Decisions

- Preserve `completed` as the maintainer handoff status.
- Reserve `finalized` for the lifecycle state that permits archival.
- Treat `current/` as not-yet-finalized rather than necessarily active.
- Keep `main`, `developer`, and `web-orchestration` unchanged.
