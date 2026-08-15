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

Implement and independently review the developer-owned bridge/Scout hardening first, then update the web-orchestration contract as required, then harden template-development package provenance/validation and generate the deterministic package.

## Current position

Exact live task-start refs were independently re-established: `main` 6127611113dfdb66f93a0cfd2d355359aa370833, `developer` e2700f586fe8ab634053eb514bb9da487e881a21, `web-orchestration` 2b95a9803115b05283494fb3699b9d34c58a91a5, `template-development` 7dde0897c4b0bc1df304bd43fe61f4eb99fd682f. `source-lock.json` matches the three source refs. The new maintenance record was pushed at template-development f564ab26e8679fbc046fd9f3b6b1e24d35486198. Repository-wide open-issue discovery found no open issues before task creation. Control issue 26 was then created without a control label and has not yet received an executable bridge marker.

## Source ranges

- developer review base: e2700f586fe8ab634053eb514bb9da487e881a21
- web-orchestration review base: 2b95a9803115b05283494fb3699b9d34c58a91a5
- main source lock: 6127611113dfdb66f93a0cfd2d355359aa370833
- template-development review base: 7dde0897c4b0bc1df304bd43fe61f4eb99fd682f

## Observed

- Template-development maintenance contract requires source edits to remain on canonical source branches and reviewed content to move through deterministic change packages.
- Current source-lock canonical repository is `https://github.com/floris3456/agentic-workflow-template.git` and matches live source refs at task start.
- `scripts/create-change-package.mjs` validates exact local commits and ancestry but does not prove the supplied repository or source histories are canonical before stamping `source-lock.json` repository identity into the manifest.
- Template-development validation currently verifies manifest range shapes and patch SHA-256 values but not independently bound provenance evidence.
- Developer `verifyRepositoryIdentity` normalizes `origin` text and accepts configured owner/repository by suffix, without authenticating the remote host.
- `ScoutWorkspaceManager` uses ordinary `git worktree add --detach` from a repository configured for repo-controlled hooks.
- Scout startup calls ordinary OpenCode compatibility, `app.agents`, and `tool.ids` for the inspected workspace before enforcing the post-discovery tool/permission contract.
- The exact ref's `repository-scout` definition is currently the authority checked by the bridge, and the allowed Scout tool set includes `lsp`.
- Scout clients use the same normal loopback OpenCode server with only a different directory, so directory selection alone is not a configuration/process trust boundary.

## Interpretation

The requested work is security-sensitive and cross-cutting. Existing Scout execution cannot be used as an independent evidence boundary because the task itself challenges its startup, configuration, instruction, process, and filesystem isolation. The developer branch requires local repository context, runtime tooling, adversarial tests, and coordinated documentation, so a delegated Sol developer route is proportional. Exact connected GitHub remains the independent review route.

## Attempts

None yet.

## Changed approach

- Selected delegated Sol developer implementation rather than direct GitHub editing because the developer work spans runtime isolation, Git behavior, tests, configuration, and durable architecture records.

## Checks

- Exact remote refs established by authenticated GitHub reads.
- Maintenance contract, task template, and source-lock read at exact template-development base.
- Open issue map checked before task creation: none.
- Prior bridge issue confirms configured control label `agentic-bridge`.
- AWT-001, AWT-002, and material Scout-boundary observations independently confirmed from exact source files.

## Blockers / required decisions

None currently. If the pinned OpenCode runtime cannot satisfy the required Scout isolation without a materially larger dependency, the developer must stop at the genuine architecture decision rather than weaken the contract.

## Remaining work

Launch and absorb the developer route; independently review its exact source range and focused/adversarial checks; update web-orchestration scouting claims if required; harden package provenance and validation on template-development; generate and validate the deterministic change package; reconcile source-lock and durable records; produce a pushed maintenance handoff. Do not promote `main`.

## Next action

After this ledger commit is confirmed remotely, apply the `agentic-bridge` label to issue 26 and publish the exact persisted sequence-1 start envelope.

## Relevant durable records

Developer branch is expected to update the task-progress record plus AS-BUILT/design/deviation/setup/security records justified by implementation. Template-development AS-BUILT/design/deviations and source-lock will be reconciled after source review.

## Issue mapping / active work

- Canonical control issue: https://github.com/floris3456/agentic-workflow-template/issues/26
- Related issues: none.
- Existing OpenCode Scouts: not used for this task.
- Selected developer: Sol.
- Active mutating source route: pending publication of developer start; no source mutation launched yet.
- Highest accepted command sequence: 0.

## Command / request journal

Pending sequence-1 start envelope, to be published byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"start","arguments":{"brief":"Implement the developer-owned portion of TEMPLATE-TRUST-BOUNDARY-001 from exact developer SHA e2700f586fe8ab634053eb514bb9da487e881a21. Independently re-inspect current code before editing. Required outcome: (1) replace suffix-based origin acceptance with fail-closed repository identity that parses supported HTTPS, ssh://, and scp-style SSH remotes; authenticates host plus owner/repository; derives acceptable Git host unambiguously from configured GitHub API/repository identity including supported GitHub Enterprise/custom API bases; and rejects deceptive hosts, suffix tricks, malformed paths, misleading userinfo, or ambiguous configuration; (2) create a genuine independent Scout trust boundary in which inspected-ref checkout/reuse/disposal cannot execute Git hooks, inspected-ref or unrelated global OpenCode config/plugins/tools/skills/instructions cannot execute or control startup, trusted Scout instructions/model/permissions/evidence contract are bridge/runtime-owned rather than ref-owned, repository instructions are evidence only, normal read/search launches no LSP/package installer/ref-controlled process/network download, realpath containment blocks symlink escape, and absent/misconfigured hardened runtime fails clearly; (3) preserve exact requested SHA, clean detached view, concurrent read-only Scout requests, durable correlation/recovery/public-safe projection, concise evidence, and normal developer OpenCode behavior. Remove LSP from every Scout contract/validator/doc if it cannot be proven safe. Add focused positive/adversarial tests for legitimate/forged origins, malicious checkout hooks, repo/global extension contamination, trusted-prompt independence, repository instruction injection, no LSP/process side effects, symlink escape, concurrent/recovery behavior, normal developer behavior, and bootstrap/status misconfiguration. Update the task-progress record and all justified AS-BUILT/design/deviation/SECURITY/setup/architecture/agent-system/validator artifacts in the same source work. Do not use existing Scouts as evidence. Do not modify main or web-orchestration, do not promote, force-push, or rewrite shared history. If the pinned OpenCode runtime cannot meet a required isolation property without a materially larger architectural dependency, implement every safe independent fix and return needs decision with exact evidence rather than weakening the property. Run proportional bridge, agent-system, and repository checks. Return exactly: Status:; Handoff developer SHA:; Files changed:; Checks + perceived results:; Blockers/decisions:; Task record:. Status must be completed, blocked, failed, or needs decision; completed requires an exact pushed 40-character developer SHA." ,"agent":"sol"},"expected":{"developer_sha":"e2700f586fe8ab634053eb514bb9da487e881a21","ref":"developer"}}
```

## Pending publication / connector refusals

- Sequence-1 start envelope is persisted above but not yet published.

## Findings / decisions

- Decision: use connected GitHub as the independent evidence boundary for this task until Scout hardening is implemented and reviewed.
- Decision: use Sol immediately because the developer work has intrinsic security/runtime complexity and interacting changes that make two Luna attempts predictably wasteful.

## Last handoff commit

None
