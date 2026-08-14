# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-LIFECYCLE-001

## Status

In progress

## Task-start template-development SHA

745c6bb970cbb9b91448dc6a70a116f5d827780b

## Review-base template-development SHA

745c6bb970cbb9b91448dc6a70a116f5d827780b

## Public-safe task brief

Make the template-maintenance record lifecycle consistently distinguish not-yet-finalized records in `current/` from finalized records in `archive/`, while preserving `completed` as a maintainer handoff status that may remain in `current/` until review and reconciliation permit finalization.

## Current objective

Remove the remaining stale active/completed directory semantics with the smallest documentation-only correction and validate the exact `template-development` range.

## Current position

Live inspection shows the main work-record README and root ledger README already explain the correct lifecycle, but the maintenance skill still calls the current record `active`, and the current/archive directory headings do not state the finalization distinction directly.

## Source ranges

- `template-development`: task start `745c6bb970cbb9b91448dc6a70a116f5d827780b`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `web-orchestration`: unchanged at `301b37f96b7adae708b199278045feb11c493fdb`.

## Observed

- `source-lock.json` matches the live `main`, `developer`, and `web-orchestration` refs.
- `README.md` already describes `current/` and `archive/` as not-yet-finalized and finalized task records.
- `docs/work/README.md` already states that `completed` means a successful working cycle, not archival.
- `docs/work/current/README.md` already permits a `completed` handoff to remain in `current/` until review and reconciliation.
- `.opencode/skills/template-maintenance/SKILL.md` still refers to the record as `active`, which can reintroduce the old active/completed mental model.
- `docs/work/current/README.md` and `docs/work/archive/README.md` headings do not directly name their lifecycle states.

## Interpretation

`completed` is a handoff result; `finalized` is the archival lifecycle state. `current/` therefore means not yet finalized, not necessarily still actively being worked, and `archive/` means finalized, not merely completed.

## Attempts

None.

## Changed approach

None.

## Checks

- Exact connected-GitHub readback of the live branch, source lock, root/work READMEs, current/archive READMEs, and maintenance skill.

## Blockers / required decisions

None.

## Remaining work

Update the remaining stale lifecycle wording, review the exact range, run the push-triggered template-development validator, and create the dedicated handoff snapshot.

## Next action

Apply the narrow terminology changes on `template-development` only.

## Relevant durable records

- `README.md`
- `docs/work/README.md`
- `docs/work/current/README.md`
- `docs/work/archive/README.md`
- `.opencode/skills/template-maintenance/SKILL.md`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issue existed at task start; no bridge issue is needed for this ledger-only documentation correction.

## Active work

- Direct exact GitHub maintenance of lifecycle terminology on `template-development`.

## Pending publication

None.

## Command / Scout / refusal journals

None. No Scout, bridge command, or developer route was launched.

## Findings

- The primary current/archive lifecycle explanation was already correct.
- Remaining stale terminology is limited to the maintenance skill's `active` wording and directory headings that do not explicitly name finalization state.

## Decisions

- Preserve `completed` as the maintainer handoff status.
- Use `not-yet-finalized` and `finalized` for directory lifecycle semantics.
- Keep `main`, `developer`, and `web-orchestration` unchanged.
