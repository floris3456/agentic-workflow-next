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

Exact live task-start refs were independently re-established: `main` 6127611113dfdb66f93a0cfd2d355359aa370833, `developer` e2700f586fe8ab634053eb514bb9da487e881a21, `web-orchestration` 2b95a9803115b05283494fb3699b9d34c58a91a5, `template-development` 7dde0897c4b0bc1df304bd43fe61f4eb99fd682f. `source-lock.json` matches the three source refs. Control issue 26 is canonical for this task. Sequence-1 Sol start succeeded as session-start transport only. Sequence-2 rejected one unnecessary operator-local `.opencode/*` external-directory read. A second independently aliased request for the same surface was already queued before that rejection landed and must also be rejected. The developer route remains active. No Scout route has been launched.

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
- Exact OpenCode v1.18.16 source confirms the built-in `read` tool resolves repository instructions into a system reminder and asynchronously warms LSP after successful file reads.
- Exact OpenCode v1.18.16 source confirms tool registry initialization dynamically imports project/global custom tool modules and materializes plugin-provided tools; plugin initialization loads external configured plugins and executes their server entrypoints.
- Two projected `external_directory` permission requests targeted the same operator-local `.opencode/*` surface. The first has been rejected; the second remains unmatched until sequence 3 is published.

## Interpretation

The requested work is security-sensitive and cross-cutting. Existing Scout execution cannot be used as an independent evidence boundary because the task itself challenges its startup, configuration, instruction, process, and filesystem isolation. The developer branch requires local repository context, runtime tooling, adversarial tests, and coordinated documentation, so a delegated Sol developer route is proportional. Exact connected GitHub remains the independent review route. Unrelated operator-global OpenCode state should remain unread and uncontaminating; rejecting both external-directory requests preserves that boundary without blocking use of tracked repository or upstream public evidence.

## Attempts

- Sequence-1 Sol start was accepted and successfully created the developer session; implementation result is pending.
- Sequence-2 rejected permission alias `permission-6` for unnecessary operator-local `.opencode/*` access.
- A second permission alias, `permission-7`, for the same external surface must be rejected separately.

## Changed approach

- Selected delegated Sol developer implementation rather than direct GitHub editing because the developer work spans runtime isolation, Git behavior, tests, configuration, and durable architecture records.

## Checks

- Exact remote refs established by authenticated GitHub reads.
- Maintenance contract, task template, and source-lock read at exact template-development base.
- Open issue map checked before task creation: none.
- Prior bridge issue confirms configured control label `agentic-bridge`.
- AWT-001, AWT-002, and material Scout-boundary observations independently confirmed from exact source files.
- OpenCode v1.18.16 `read.ts`, `tool/registry.ts`, and `plugin/index.ts` independently inspected as exact upstream source for instruction, LSP, custom-tool, and plugin execution behavior.
- Sequence-2 command lifecycle independently read from issue 26: accepted -> applying -> succeeded with `permission-6` rejected.

## Blockers / required decisions

None currently. If the pinned OpenCode runtime cannot satisfy the required Scout isolation without a materially larger dependency, the developer must stop at the genuine architecture decision rather than weaken the contract.

## Remaining work

Publish and absorb the second permission rejection; read and absorb the developer handoff; independently review its exact source range and focused/adversarial checks; update web-orchestration scouting claims if required; harden package provenance and validation on template-development; generate and validate the deterministic change package; reconcile source-lock and durable records; produce a pushed maintenance handoff. Do not promote `main`.

## Next action

After this ledger commit is confirmed remotely, publish sequence-3 `permission.reply` rejection for `permission-7` on issue 26.

## Relevant durable records

Developer branch is expected to update the task-progress record plus AS-BUILT/design/deviation/setup/security records justified by implementation. Template-development AS-BUILT/design/deviations and source-lock will be reconciled after source review.

## Issue mapping / active work

- Canonical control issue: https://github.com/floris3456/agentic-workflow-template/issues/26
- Related issues: none.
- Existing OpenCode Scouts: not used for this task.
- Selected developer: Sol.
- Active mutating source route: developer session active, currently waiting on second permission reply.
- Highest accepted command sequence: 2.

## Command / request journal

- Sequence 1 start `b2a4c9d1-4f64-4f64-8a2f-16b3d7e9c001`: accepted -> applying -> succeeded; expected developer e2700f586fe8ab634053eb514bb9da487e881a21/ref `developer`; agent `sol`; session-start transport only.
- Sequence 2 `permission.reply` `c4a7f831-2d64-4a64-9d20-71e3b2c5a102`: accepted -> applying -> succeeded; `permission-6` -> `reject`.
- Pending sequence 3 command, to be published byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","sequence":3,"command_id":"e8f0a6c2-6b95-4f28-8c73-0bd42f1aa103","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"permission.reply","arguments":{"permission":"permission-7","reply":"reject","message":"Same boundary as the prior reply: do not read unrelated operator-local .opencode state. Use tracked repository files and public/upstream source evidence; keep global customization isolated from this task."}}
```

## Pending publication / connector refusals

- Sequence-3 permission rejection is persisted above but not yet published.

## Findings / decisions

- Decision: use connected GitHub as the independent evidence boundary for this task until Scout hardening is implemented and reviewed.
- Decision: use Sol immediately because the developer work has intrinsic security/runtime complexity and interacting changes that make two Luna attempts predictably wasteful.
- Decision: reject both unnecessary external-directory requests targeting operator-local `.opencode/*` state.

## Last handoff commit

None
