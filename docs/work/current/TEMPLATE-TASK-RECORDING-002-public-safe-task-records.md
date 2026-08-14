# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-RECORDING-002

## Status

Completed

## Task-start template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Review-base template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Public-safe task brief

Review the reusable template-maintenance task-recording rules, fix any remaining real contradiction with the smallest effective change, validate the result through the template-development workflow, and do not promote to main.

## Current objective

Align the public task-record contract with the permanent GitHub public-safety boundary, migrate the live maintenance records to the corrected form, and validate the exact changes without promotion.

## Current position

A real contradiction was confirmed and corrected. Template-maintenance records now preserve a concise public-safe brief rather than a verbatim/original conversation excerpt. The Project maintenance Source, ledger maintenance skill, task template, current records, validator, and source lock are aligned. The exact `template-development` implementation range through `31f6544fddb1ae9ab7277f31d36a60e28f7c7afd` passed the branch's push-triggered validation workflow.

## Source ranges

- `template-development`: `d10dad3bfa9643f55e9ec925aaaee02575abddde..31f6544fddb1ae9ab7277f31d36a60e28f7c7afd` before this dedicated task-progress handoff snapshot.
- `web-orchestration`: `279631a3e14c6293933852baec98dd662f575277..301b37f96b7adae708b199278045feb11c493fdb`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`; no promotion performed.

## Observed

- Permanent Project instructions and `template-development/AGENTS.md` both treat GitHub persistence as public and prohibit private chat and host-local absolute paths.
- Before this task, the Project maintenance Source and ledger maintenance skill instructed the maintainer to copy the exact request/brief into the public record, while the task template called the field `Original task brief`.
- Existing current records demonstrated that the conflict was operational: older records copied conversational wording and one retained a host-local source location, while a later record had already redacted that location.
- The old structural validator required `Original task brief` and skipped both task-record directories when checking for host-local absolute paths.
- The corrected Project Source and ledger skill require a concise public-safe brief that preserves requested outcome, scope, constraints, and material decisions without reproducing prohibited private values.
- The task template now names the field `Public-safe task brief`; all still-current task records were migrated to that field without rewriting Git history.
- The validator now requires the new heading for current/archive task records, rejects the old heading, and applies its host-local absolute-path check to task records as well.
- `source-lock.json` now records the reviewed web source handoff `301b37f96b7adae708b199278045feb11c493fdb` and this task identity.

## Interpretation

The durable record must preserve actionable task intent and constraints, not the private conversation itself. Making that distinction explicit in the canonical field and enforcing it in validation removes the contradiction without changing the one-record continuity model or the current-versus-archive lifecycle semantics fixed previously.

## Attempts

- Direct local Git transport could not resolve the GitHub host, so the local tracked package-generation route was unavailable in this execution environment. No local-only commit or package was claimed.

## Changed approach

Used connected GitHub exact reads and bounded writes for the one Project Source and the ledger records, then relied on exact remote compare/readback plus the repository's push-triggered `template-development` validator. The task did not require package transfer, and no change package was hand-built when the tracked package route was unavailable.

## Checks

- Exact web compare `279631a3e14c6293933852baec98dd662f575277..301b37f96b7adae708b199278045feb11c493fdb`: linear, one commit, only `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` changed (5 additions, 2 deletions).
- Exact template-development compare `d10dad3bfa9643f55e9ec925aaaee02575abddde..31f6544fddb1ae9ab7277f31d36a60e28f7c7afd`: linear, 11 commits, exactly 10 intended ledger/record-contract paths changed; no unrelated path changed.
- Remote readback confirmed the corrected Project maintenance Source, ledger maintenance skill, task template, validator, migrated current records, and source lock at their exact pushed SHAs.
- Push workflow `Validate template development` run `31800913979` completed successfully for `31f6544fddb1ae9ab7277f31d36a60e28f7c7afd`; its `validate` job and `./scripts/validate-template-development.sh` step both concluded `success` under Node 22.13.0.
- `web-orchestration` exposes no push workflow or commit status for `301b37f96b7adae708b199278045feb11c493fdb`; its verification is the exact one-file remote compare and readback above.
- No Scout or developer route was launched for this bounded maintenance correction.

## Blockers / required decisions

None for the requested fix and validation.

## Remaining work

None for this working cycle. The record remains under `docs/work/current/` until a separate finalization boundary permits archival.

## Next action

None. Independent human review may use the exact source and ledger ranges above. No `main` promotion is requested or authorized.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md` at `279631a3e14c6293933852baec98dd662f575277`
- `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` at `301b37f96b7adae708b199278045feb11c493fdb`
- `AGENTS.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/work/templates/task-progress-template.md`
- `scripts/validate-template-development.mjs`
- `source-lock.json`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issue existed at task start, and none was created. This explicitly commissioned, bounded Project-source write plus ledger-only maintenance correction did not require the bridge.

## Active work

None.

## Pending publication

None. The bounded Project-source publication completed at `301b37f96b7adae708b199278045feb11c493fdb`; the ledger implementation range completed at `31f6544fddb1ae9ab7277f31d36a60e28f7c7afd` before this snapshot.

## Command / Scout / refusal journals

- No bridge command, Scout, or developer route was launched.
- Local Git transport failed before reaching GitHub; it produced no repository effect. Connected GitHub publication and readback succeeded.

## Findings

- Confirmed and fixed: verbatim/original task-brief recording contradicted the permanent public-GitHub prohibition on private chat and host-local absolute paths.
- Confirmed and fixed: the validator exempted the very task-record directories that must remain public-safe.
- No remaining contradiction was found in the not-yet-finalized `current/` versus finalized `archive/` semantics.

## Decisions

- Preserve requested intent through a concise public-safe task brief rather than a verbatim conversation transcript.
- Migrate still-current records prospectively; do not rewrite public Git history.
- Keep `main` and `developer` unchanged.
- Do not hand-build a package when the tracked package-generation route is unavailable and package transfer is not part of the requested outcome.
