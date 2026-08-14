# Template-maintenance task progress

## Task ID

TEMPLATE-TASK-RECORDING-002

## Status

In progress

## Task-start template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Review-base template-development SHA

d10dad3bfa9643f55e9ec925aaaee02575abddde

## Public-safe task brief

Review the reusable template-maintenance task-recording rules, fix any remaining real contradiction with the smallest effective change, validate the result through the template-development workflow, and do not promote to main.

## Current objective

Align the public task-record contract with the permanent GitHub public-safety boundary, migrate the live maintenance records to the corrected form, and validate the exact changes without promotion.

## Current position

Exact remote inspection confirmed a real contradiction. Permanent Project and ledger instructions prohibit persisting private chat and host-local absolute paths, but the template-maintenance Source and task template require an original/exact task brief in the public ledger. Existing current records demonstrate both raw chat copying and one host-local path, while a later record already uses a redacted summary.

## Source ranges

- `template-development`: task start `d10dad3bfa9643f55e9ec925aaaee02575abddde`; task record initialized at `345f2abb54962aebe86e97d88b7dd4e8dbdcb003`.
- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`.
- `developer`: `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `web-orchestration`: review base `279631a3e14c6293933852baec98dd662f575277`.

## Observed

- Live `main`, `developer`, and `web-orchestration` refs match `source-lock.json` at task start.
- `web-orchestration-only/chatgpt-project/developer-instructions.md` says anything persisted to GitHub is public and forbids private chat, personal data, absolute local paths, and raw OpenCode identifiers.
- `AGENTS.md` on `template-development` independently forbids private chat and host-local absolute paths in persisted values.
- `skill-mcp-on-template-maintenance.md` currently says to copy the exact public-safe request into the public maintenance record.
- `.opencode/skills/template-maintenance/SKILL.md` currently says to copy the exact public-safe brief without rewriting it.
- The task-progress template labels that section `Original task brief`.
- The structural validator exempts both `docs/work/current/**` and `docs/work/archive/**` from its host-local absolute-path check.
- Existing current records prove the mismatch is operational, not theoretical: older records quote chat directly and one contains a host-local absolute path, while a later record explicitly omits that path.

## Interpretation

A public maintenance ledger must preserve the human's requested outcome and constraints, not the verbatim private conversation. The smallest coherent repair is to make the canonical field a concise public-safe brief, align both maintenance instructions, migrate the still-current records, and remove the validator exemption that allowed a host-local path inside task records.

## Attempts

- A direct local Git transport check could not resolve `github.com`; the local execution route for repository scripts is unavailable in this environment.

## Changed approach

Use connected GitHub exact reads/writes and remote readback for source mutation and verification. Do not hand-build a change package; if no authorized package-execution route becomes available, record that capability boundary explicitly.

## Checks

- Exact connected-GitHub readback of the permanent Project instructions, maintenance Source, ledger agreement, local maintenance skill, task template, work-record READMEs, current records, validator, source lock, and live branch refs.

## Blockers / required decisions

No human decision is required. Local package/validator execution is unavailable because Git transport cannot resolve the remote host; remote validation will use exact diff/readback and any available GitHub workflow/check evidence.

## Remaining work

Apply the narrow Project-source wording correction, update the ledger contract/template/validator and live current records, reconcile `source-lock.json`, then review the exact remote ranges and available checks.

## Next action

Publish the bounded Project-source correction on `web-orchestration`, then apply the corresponding ledger migration and validator guard on `template-development`.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/developer-instructions.md` at `279631a3e14c6293933852baec98dd662f575277`
- `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` at `279631a3e14c6293933852baec98dd662f575277`
- `AGENTS.md`
- `.opencode/skills/template-maintenance/SKILL.md`
- `docs/work/templates/task-progress-template.md`
- `scripts/validate-template-development.mjs`

## Last handoff commit

None

## Issue mapping

No open `agentic-bridge` control issues existed at task start. No bridge issue is required for this explicitly commissioned, bounded Project-source write plus ledger-only maintenance change.

## Active work

- Direct exact GitHub review and bounded mutation of the Project maintenance Source.
- Direct exact GitHub maintenance of the `template-development` ledger contract and current records.

## Pending publication

- `web-orchestration`: replace only `web-orchestration-only/chatgpt-project/skill-mcp-on-template-maintenance.md` from exact base blob `2336db40065253aa0f6841df016c799c933702b4` on branch head `279631a3e14c6293933852baec98dd662f575277`, changing the record instruction from verbatim request copying to a concise public-safe brief that never reproduces private chat or prohibited private values.

## Command / Scout / refusal journals

- No bridge commands or Scouts launched.
- Local Git transport attempt failed before GitHub because the execution environment could not resolve the remote host; no repository effect occurred.

## Findings

- Confirmed contradiction: verbatim/original task-brief recording conflicts with the permanent public-GitHub prohibition on private chat and absolute local paths.
- Confirmed validator gap: work-record directories are explicitly skipped by the only host-local absolute-path check.

## Decisions

- Fix the contract prospectively and migrate still-current records; do not rewrite Git history.
- Keep `main` and `developer` unchanged.
- Do not hand-build a change package when the tracked package-generation route cannot be executed.
