# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

in progress

## Task-start template-development SHA

7dde0897c4b0bc1df304bd43fe61f4eb99fd682f

## Review-base template-development SHA

7dde0897c4b0bc1df304bd43fe61f4eb99fd682f

## Public-safe task brief

Harden reusable-template trust boundaries across package provenance, Git remote repository identity, and independent Scout isolation. Preserve portability, exact-ref review, recovery, deterministic packaging, public safety, normal developer OpenCode behavior, and the human-only `main` promotion boundary. Do not modify or promote `main`. Existing OpenCode Scouts are not accepted as review evidence until the requested isolation hardening is implemented and independently reviewed.

## Current objective

Independently inspect exact remote maintenance contracts, package/source-lock machinery, bridge repository-identity and Scout runtime/workspace behavior, Project scouting claims, tests, and durable architecture records; then implement the smallest complete fail-closed design across the authoritative source branches and deterministic change package.

## Current position

Exact live refs were independently re-established before work: `main` 6127611113dfdb66f93a0cfd2d355359aa370833, `developer` e2700f586fe8ab634053eb514bb9da487e881a21, `web-orchestration` 2b95a9803115b05283494fb3699b9d34c58a91a5, `template-development` 7dde0897c4b0bc1df304bd43fe61f4eb99fd682f. `source-lock.json` matches the three source refs. Repository-wide open-issue discovery found no open issues; there is no existing task-bound control issue to reconcile.

## Source ranges

- developer review base: e2700f586fe8ab634053eb514bb9da487e881a21
- web-orchestration review base: 2b95a9803115b05283494fb3699b9d34c58a91a5
- main source lock: 6127611113dfdb66f93a0cfd2d355359aa370833
- template-development review base: 7dde0897c4b0bc1df304bd43fe61f4eb99fd682f

## Observed

- Template-development maintenance contract requires source edits to remain on canonical source branches and reviewed content to move through deterministic change packages.
- Current source-lock canonical repository is `https://github.com/floris3456/agentic-workflow-template.git` and matches live source refs at task start.
- No open GitHub issues exist at task start.

## Interpretation

The requested work is security-sensitive and cross-cutting. Existing Scout execution cannot be used as an independent evidence boundary because the task itself challenges its startup, configuration, instruction, process, and filesystem isolation. Local-context implementation is likely preferable for the developer branch because coordinated code, adversarial tests, and runtime behavior must be exercised; exact connected GitHub remains the independent review route.

## Attempts

None yet.

## Changed approach

None.

## Checks

- Exact remote refs established by authenticated GitHub reads.
- Maintenance contract and source-lock read at exact template-development base.
- Open issue map checked: none.

## Blockers / required decisions

None currently. If the pinned OpenCode runtime cannot satisfy the required Scout isolation without a materially larger dependency, stop at the genuine architecture decision rather than weakening the contract.

## Remaining work

Inspect affected implementation/tests/docs; select and execute source routes one at a time; review exact remote ranges; update web orchestration claims where required; harden package provenance and validation on template-development; generate and validate the deterministic change package; reconcile source-lock and durable records; produce a pushed maintenance handoff. Do not promote `main`.

## Next action

Inspect exact package generator/validator/source-lock tests and the developer bridge/Scout runtime implementation plus related tests and architecture records.

## Relevant durable records

To be determined from exact source inspection. Maintenance record also owns issue mapping, active-work, command/result, publication, findings, decisions, and next-action continuity for this task.

## Issue mapping / active work

- Canonical control issue: none.
- Related issues: none.
- Existing OpenCode Scouts: not used for this task.
- Active mutating source route: none.

## Command / request journal

None.

## Pending publication / connector refusals

None.

## Findings / decisions

- Decision: use connected GitHub as the independent evidence boundary for this task until Scout hardening is implemented and reviewed.

## Last handoff commit

None
